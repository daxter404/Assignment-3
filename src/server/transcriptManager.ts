// manage the transcript database
export type StudentID = number;
export type Student = { studentID: number; studentName: string };
export type Course = string;
export type CourseGrade = { course: Course; grade: number };
export type Transcript = { student: Student; grades: CourseGrade[] };

// the database of transcript
let allTranscripts: Transcript[] = [];

export function initialize(): void {
  allTranscripts = [];
  addStudent('Sardor', [
    { course: 'CS360', grade: 100 },
    { course: 'CS411', grade: 100 },
  ]);
  addStudent('Jasur', [{ course: 'CS360', grade: 80 }]);
  addStudent('Jasur', [
    { course: 'CS360', grade: 85 },
    { course: 'CS360', grade: 40 },
  ]);
  addStudent('Nigora', [{ course: 'CS360', grade: 100 }]);
}

export function getAll(): Transcript[] {
  return allTranscripts;
}

// manages the student IDs (class follows the singleton pattern)
class StudentIDManager {
  private static lastUsedID = 0;

  public static newID(): number {
    this.lastUsedID++;
    return this.lastUsedID;
  }
}

// relies on freshness of studentIDs.
export function addStudent(name: string, grades: CourseGrade[] = []): StudentID {
  if (name === null) throw new Error("Name can't be null");
  if (name.length === 0) throw new Error("Name can't be empty");

  const newID = StudentIDManager.newID();
  const newStudent = { studentID: newID, studentName: name };
  allTranscripts.push({ student: newStudent, grades });
  return newID;
}

// gets transcript for given ID.  Returns undefined if missing
export function getTranscript(studentID: number): Transcript {
  return allTranscripts.find(transcript => transcript.student.studentID == studentID);
}

// gets studentIDs matching a given name
export function getStudentIDs(studentName: string): StudentID[] {
  return allTranscripts
    .filter(transcript => transcript.student.studentName == studentName)
    .map(transcript => transcript.student.studentID);
}

// deletes student with the given ID from the database.
// throws exception if no such student.  (Is this the best idea?)
export function deleteStudent(studentID: StudentID): void {
  const index = allTranscripts.findIndex(t => t.student.studentID == studentID);
  if (index == -1) {
    throw new Error(`no student with ID = ${studentID}`);
  }
  allTranscripts.splice(index, 1);
}

export function addGrade(studentID: StudentID, course: Course, grade: number): void {
  const tIndex = allTranscripts.findIndex(t => t.student.studentID == studentID);
  if (tIndex == -1) {
    throw new Error(`no student with ID = ${studentID}`);
  }
  const theTranscript = allTranscripts[tIndex];
  try {
    allTranscripts[tIndex] = addGradeToTranscript(theTranscript, course, grade);
  } catch (e) {
    throw new Error(`student ${studentID} already has a grade in course ${course}`);
  }
}

// returns transcript like the original, but with the new grade added.
// throws an error if the course is already on the transcript
function addGradeToTranscript(
  theTranscript: Transcript,
  course: Course,
  grade: number,
): Transcript {
  const { grades } = theTranscript;
  if (grades.findIndex(entry => entry.course === course) != -1) {
    throw new Error();
  }
  return { student: theTranscript.student, grades: grades.concat({ course, grade }) };
}

// returns the grade for the given student in the given course.
// throws an error if no such student or no such course for that student
export function getGrade(studentID: StudentID, course: Course): number {
  const theTranscript = allTranscripts.find(t => t.student.studentID == studentID);
  const theGrade = theTranscript.grades.find(g => g.course == course);
  if (theGrade === undefined) {
    throw new Error(`no grade for student ${studentID} in course ${course}`);
  }

  return theGrade.grade;
}
