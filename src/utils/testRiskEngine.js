import { calculateRisk, analyzeTrend } from './riskEngine.js';

console.log('--- Academic Risk Engine Test ---');

// Mock data
const mockCourses = [
  { id: 'c1', creditUnit: 3 },
  { id: 'c2', creditUnit: 3 },
  { id: 'c3', creditUnit: 3 },
  { id: 'c4', creditUnit: 3 }
];

const mockStudent = { id: 's1', name: 'Test Student' };

const createResults = (grades, caScores, sessionSemesters) => {
  return grades.map((grade, idx) => {
    let point = 0;
    if (grade === 'A') point = 5;
    else if (grade === 'B') point = 4;
    else if (grade === 'C') point = 3;
    else if (grade === 'D') point = 2;
    else if (grade === 'E') point = 1;
    else if (grade === 'F') point = 0;
    
    return {
      courseId: `c${(idx % 4) + 1}`,
      grade,
      gradePoint: point,
      qualityPoint: point * 3, // assuming all 3 units
      caScore: caScores[idx] || 20,
      sessionId: sessionSemesters[idx].session,
      semester: sessionSemesters[idx].semester
    };
  });
};

const createAttendance = (count, presentRate) => {
  const records = [];
  for(let i=0; i<count; i++) {
    records.push({ status: Math.random() < presentRate ? 'PRESENT' : 'ABSENT' });
  }
  return records;
};

// 1. Low Risk Student (A and B grades, high CA, good attendance, improving trend)
const lowRiskResults = createResults(
  ['A', 'B', 'B', 'A'],
  [30, 25, 28, 35],
  [{session:'s1', semester:1}, {session:'s1', semester:1}, {session:'s1', semester:2}, {session:'s1', semester:2}]
);
const lowRiskAtt = createAttendance(20, 0.9);
const lowRisk = calculateRisk(mockStudent, lowRiskResults, mockCourses, lowRiskAtt);
console.log('\n[LOW RISK STUDENT]');
console.log(`Score: ${lowRisk.score}, Level: ${lowRisk.level}`);
console.log(`CGPA: ${lowRisk.cgpa}, Trend: ${lowRisk.trend}`);
console.log('Factors:', lowRisk.factors);

// 2. Moderate Risk Student (C and D grades, 1 fail, average CA, decent attendance, declining trend)
const modRiskResults = createResults(
  ['C', 'C', 'D', 'F'],
  [15, 18, 12, 8],
  [{session:'s1', semester:1}, {session:'s1', semester:1}, {session:'s1', semester:2}, {session:'s1', semester:2}]
);
// Sem 1: C, C => 3,3 (Avg 3.0). Sem 2: D, F => 2,0 (Avg 1.0). Declining trend. 1 fail. CGPA = 2.0.
const modRiskAtt = createAttendance(20, 0.7); // 70% attendance
const modRisk = calculateRisk(mockStudent, modRiskResults, mockCourses, modRiskAtt);
console.log('\n[MODERATE RISK STUDENT]');
console.log(`Score: ${modRisk.score}, Level: ${modRisk.level}`);
console.log(`CGPA: ${modRisk.cgpa}, Trend: ${modRisk.trend}`);
console.log('Factors:', modRisk.factors);

// 3. High Risk Student (D, E, F grades, 2 fails, poor CA, poor attendance)
const highRiskResults = createResults(
  ['E', 'D', 'F', 'F'],
  [10, 12, 5, 4],
  [{session:'s1', semester:1}, {session:'s1', semester:1}, {session:'s1', semester:2}, {session:'s1', semester:2}]
);
// Sem 1: E(1), D(2) -> Avg 1.5. Sem 2: F(0), F(0) -> Avg 0. CGPA = 0.75. 2 fails. 
const highRiskAtt = createAttendance(20, 0.55); // 55% attendance
const highRisk = calculateRisk(mockStudent, highRiskResults, mockCourses, highRiskAtt);
console.log('\n[HIGH RISK STUDENT]');
console.log(`Score: ${highRisk.score}, Level: ${highRisk.level}`);
console.log(`CGPA: ${highRisk.cgpa}, Trend: ${highRisk.trend}`);
console.log('Factors:', highRisk.factors);

// 4. Critical Risk Student (All Fs, terrible CA, terrible attendance)
const critRiskResults = createResults(
  ['F', 'F', 'F', 'F'],
  [2, 3, 1, 0],
  [{session:'s1', semester:1}, {session:'s1', semester:1}, {session:'s1', semester:2}, {session:'s1', semester:2}]
);
// CGPA = 0. 4 fails. CA avg = 1.5. Attendance 30%.
const critRiskAtt = createAttendance(20, 0.3);
const critRisk = calculateRisk(mockStudent, critRiskResults, mockCourses, critRiskAtt);
console.log('\n[CRITICAL RISK STUDENT]');
console.log(`Score: ${critRisk.score}, Level: ${critRisk.level}`);
console.log(`CGPA: ${critRisk.cgpa}, Trend: ${critRisk.trend}`);
console.log('Factors:', critRisk.factors);

