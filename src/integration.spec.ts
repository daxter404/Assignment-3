import * as client from './client/client';
import Express from 'express';
import * as http from 'http';
import transcriptServer from './server/transcriptServer';
import { AddressInfo } from 'net';
import { setBaseURL } from './client/remoteService';
import * as db from './server/transcriptManager';

describe('Part 2: Integration tests via Express + client.ts', () => {
  let server: http.Server;

  beforeAll(done => {
    const app = Express();
    transcriptServer(app);
    server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      setBaseURL(`http://127.0.0.1:${port}`);
      done();
    });
  });

  afterAll(done => {
    server.close(done);
  });

  beforeEach(() => {
    db.initialize();
  });

  test('1) POST /transcripts returns 201 and an ID for valid name', async () => {
    const created = await client.addStudent('Aziza');
    expect(created.studentID).toBeGreaterThan(0);
    const ids = await client.getStudentIDs('Aziza');
    expect(ids).toContain(created.studentID);
  });

  test('2) POST /transcripts returns 400 when name missing or empty', async () => {
    await expect(client.addStudent('')).rejects.toThrow();
  });

  test('3) GET /transcripts/:id returns 200 for valid ID and error for missing', async () => {
    const created = await client.addStudent('Bob');
    const t = await client.getTranscript(created.studentID);
    expect(t?.student.studentID).toBe(created.studentID);
    expect(t?.student.studentName).toBe('Bob');

    await expect(client.getTranscript(999999)).rejects.toThrow();
  });

  test('4) GET /studentids?name=… returns all IDs for the name', async () => {
    const s1 = await client.addStudent('Aziza');
    const s2 = await client.addStudent('Aziza');
    const ids = await client.getStudentIDs('Aziza');
    expect(ids).toEqual(expect.arrayContaining([s1.studentID, s2.studentID]));
  });

  test('5) DELETE /transcripts/:id returns 204 and actually deletes', async () => {
    const s = await client.addStudent('Temp');
    await client.deleteStudent(s.studentID);
    const ids = await client.getStudentIDs('Temp');
    expect(ids).not.toContain(s.studentID);
    await expect(client.getTranscript(s.studentID)).rejects.toThrow();
  });

  test('6) POST /transcripts/:studentID/:course succeeds; duplicate or bad grade fails', async () => {
    const s = await client.addStudent('Grader');

    // valid grade
    await client.addGrade(s.studentID, 'CS360', 90);
    // verify via GET /:id/:course
    const gradeObj: any = await client.getGrade(s.studentID, 'CS360');
    expect(gradeObj).toMatchObject({ studentID: s.studentID, course: 'CS360', grade: 90 });

    // duplicate course
    await expect(client.addGrade(s.studentID, 'CS360', 95)).rejects.toThrow();

    // bad grade (non-numeric)
    // @ts-ignore
    await expect(client.addGrade(s.studentID, 'CS500', '')).rejects.toThrow();
  });

  test('7) GET /transcripts returns seeded + newly created students', async () => {
    const before = await client.getAllTranscripts();
    const created = await client.addStudent('Newbie');
    const after = await client.getAllTranscripts();
    expect(after.length).toBe(before.length + 1);

    const idsForNewbie = await client.getStudentIDs('Newbie');
    expect(idsForNewbie).toContain(created.studentID);
  });
});
