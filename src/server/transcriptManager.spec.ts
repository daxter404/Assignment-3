import * as db from './transcriptManager';

describe('Part 1: Unit tests for transcriptManager.ts', () => {
  beforeEach(() => {
    // hermetic setup
    db.initialize();
  });

  test('1) addStudent() returns numeric ID and stores the student; empty grades by default', () => {
    const id = db.addStudent('Aziza');
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);

    const ids = db.getStudentIDs('Aziza');
    expect(ids).toContain(id);

    const t = db.getTranscript(id);
    expect(t).toBeDefined();
    expect(t!.grades).toEqual([]);
  });

  test('2) Different students get different IDs, even with same name', () => {
    const s1 = db.addStudent('Aziza');
    const s2 = db.addStudent('Aziza');
    expect(s2).not.toBe(s1);

    const ids = db.getStudentIDs('Aziza');
    expect(ids).toEqual(expect.arrayContaining([s1, s2]));
  });

  test('3) getTranscript() returns undefined for missing ID', () => {
    const t = db.getTranscript(999999);
    expect(t).toBeUndefined();
  });

  test('4) deleteStudent() removes only the requested student and throws for missing', () => {
    const id1 = db.addStudent('A');
    const id2 = db.addStudent('B');

    db.deleteStudent(id1);

    const idsA = db.getStudentIDs('A');
    expect(idsA).not.toContain(id1);

    const idsB = db.getStudentIDs('B');
    expect(idsB).toContain(id2);

    expect(() => db.deleteStudent(id1)).toThrow();
  });

  test('5) addGrade() happy path and duplicate course rejection', () => {
    const id = db.addStudent('X');

    // add grades; verify via getTranscript()
    db.addGrade(id, 'CS360', 95);
    let t = db.getTranscript(id)!;
    expect(t.grades).toEqual(expect.arrayContaining([{ course: 'CS360', grade: 95 }]));

    db.addGrade(id, 'CS411', 85);
    t = db.getTranscript(id)!;
    expect(t.grades).toEqual(
      expect.arrayContaining([
        { course: 'CS360', grade: 95 },
        { course: 'CS411', grade: 85 },
      ]),
    );

    // duplicate course should throw
    expect(() => db.addGrade(id, 'CS360', 90)).toThrow();
  });

  test('6) getGrade() returns correct grade; errors for missing student/course', () => {
    const id = db.addStudent('Y');
    db.addGrade(id, 'CS360', 77);
    expect(db.getGrade(id, 'CS360')).toBe(77);

    // missing course
    expect(() => db.getGrade(id, 'CS411')).toThrow();

    // missing student
    expect(() => db.getGrade(424242, 'CS360')).toThrow();
  });
});
