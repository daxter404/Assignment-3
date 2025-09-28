// Client scripts for examples
import * as cl from './client';
import { StudentID } from '../server/transcriptManager';

async function script1() {
  console.log('Script 1 running');

  const s1 = await cl.addStudent('Aziza');
  console.log(`Added student Aziza with ID ${s1.studentID}`);

  const s2 = await cl.addStudent('Jaxongir');
  console.log(`Added student Jaxongir with ID ${s2.studentID}`);

  await cl.deleteStudent(s2.studentID);
  console.log(`Deleted student with ID ${s2.studentID}`);

  const sIds: StudentID[] = await cl.getStudentIDs('Aziza');
  console.log(`Found ${sIds.length} students named Aziza`);

  const res = await cl.addGrade(s1.studentID, 'CS360', 95);
  console.log(`Added grade for student ID ${s1.studentID} in course CS360: ${res}`);

  const grade = await cl.getGrade(s1.studentID, 'CS360');
  console.log(`Fetched grade for student ID ${s1.studentID} in course CS360: ${grade}`);

  return 'Script 1 complete';
}

script1().then(console.log).catch(console.error);
