import CORS from 'cors';
import express from 'express';
import { Express, Request, Response } from 'express';
import * as db from './transcriptManager';

export default function addTranscriptServerRoutes(app: Express) {
  // allow requests from any port or source.
  app.use(CORS());

  // for parsing application/json
  app.use(express.json());

  // GET /transcripts
  app.get('/transcripts', (req: Request, res: Response) => {
    const data = db.getAll();
    console.log(data);
    res.status(200).send(data);
  });

  // POST /transcripts
  // adds a new student to the database,
  // returns an ID for this student.
  // Requires a post parameter 'name'
  app.post('/transcripts', (req: Request, res: Response) => {
    // use req.body.name to get the value of the post parameter (in the body)
    // don't know what happens if the info is missing.  We should fail gracefully
    const studentName: string = req.body.name;
    if (!studentName) {
      res.status(400).send('No student name specified');
      return;
    }
    const studentID = db.addStudent(studentName);
    // sending a number makes the server think the number
    // is the response status.
    res.status(201).send({ studentID });
  });

  // GET  /transcripts/:id           --
  // returns transcript for student with given ID.
  // Fails with a 404 if no such student
  // req.params will look like {"id": 301}
  app.get('/transcripts/:id', (req: Request, res: Response) => {
    // req.params to get components of the path
    const { id } = req.params;
    const theTranscript = db.getTranscript(parseInt(id));
    if (theTranscript === undefined) {
      res.status(404).send(`No student with id = ${id}`);
    }
    {
      res.status(200).send(theTranscript);
    }
  });

  // GET  /studentids?name=string
  // returns list of IDs for student with the given name
  // returns empty list if none
  app.get('/studentids', (req: Request, res: Response) => {
    // use req.query to get value of the parameter
    const studentName = req.query.name as string;
    const ids = db.getStudentIDs(studentName);
    res.status(200).send(ids);
  });

  // DELETE /transcripts/:ID
  // deletes transcript for student with the given ID,
  // fails with 404 if no such student
  app.delete('/transcripts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      db.deleteStudent(id);
      res.sendStatus(204);
    } catch (e) {
      res.status(404).send(e);
    }
  });

  // POST /transcripts/:studentID/:courseNumber
  // adds an entry in this student's transcript with given name and course.
  // Requires a post parameter 'grade'.
  // Fails with 400 (Bad Request) if there is already an entry for this course
  //  in the student's transcript
  app.post('/transcripts/:studentID/:course', (req: Request, res: Response) => {
    try {
      const studentID = parseInt(req.params.studentID);
      const course = req.params.course as string;
      const grade = parseInt(req.body.grade as string);
      if (!grade) {
        res.status(400).send(`Invalid grade, must be a number. Got ${req.body.grade}`);
        return;
      }
      db.addGrade(studentID, course, grade);
      res.sendStatus(201);
    } catch (e) {
      console.trace(e);
      res.status(400).send(e);
    }
  });

  // GET /transcripts/:studentID/:course
  // returns the student's grade in the specified course.
  // Fails if student or course is missing.
  // uses function getGrade(studentID:StudentID, course:Course) : number
  app.get('/transcripts/:studentID/:course', (req: Request, res: Response) => {
    try {
      const studentID = parseInt(req.params.studentID);
      const { course } = req.params;
      const grade = db.getGrade(studentID, course);
      res.status(200).send({ studentID, course, grade });
    } catch (e) {
      res.status(400).send(e);
    }
  });
}
