import { calculateGPA, calculateCGPA, calculateFailedCourses, calculateAttendanceRate } from './academicCalculations.js';

export const analyzeTrend = (gpas) => {
  if (!gpas || gpas.length < 2) return 'STABLE';
  
  // We look at the most recent GPAs (last vs second-to-last)
  const last = gpas[gpas.length - 1];
  const prev = gpas[gpas.length - 2];
  
  const diff = last - prev;
  if (diff >= 0.2) return 'IMPROVING';
  if (diff <= -0.2) return 'DECLINING';
  return 'STABLE';
};

export const calculateRisk = (student, results, courses, attendanceRecords) => {
  let score = 0;
  const factors = [];
  
  // 1. CGPA Risk (Max 35 points)
  const cgpa = calculateCGPA(results, courses);
  let cgpaPoints = 0;
  if (cgpa < 1.0) { cgpaPoints = 35; factors.push("Critical: CGPA is extremely low (below 1.0)"); }
  else if (cgpa < 1.5) { cgpaPoints = 25; factors.push("High Risk: CGPA is below academic probation threshold (1.5)"); }
  else if (cgpa < 2.0) { cgpaPoints = 15; factors.push("Warning: CGPA is below 2.0"); }
  else if (cgpa < 2.5) { cgpaPoints = 5; factors.push("Notice: CGPA is below 2.5"); }
  score += cgpaPoints;

  // 2. Failed Courses Risk (Max 25 points)
  const failedCount = calculateFailedCourses(results);
  let failPoints = 0;
  if (failedCount >= 4) { failPoints = 25; factors.push(`Critical: Student has failed ${failedCount} courses`); }
  else if (failedCount >= 3) { failPoints = 20; factors.push(`High Risk: Student has failed 3 courses`); }
  else if (failedCount >= 2) { failPoints = 10; factors.push(`Warning: Student has failed 2 courses`); }
  else if (failedCount === 1) { failPoints = 5; factors.push(`Notice: Student has failed 1 course`); }
  score += failPoints;

  // 3. Attendance Risk (Max 15 points)
  const attendanceRate = calculateAttendanceRate(attendanceRecords);
  let attPoints = 0;
  // If no attendance records exist yet, we don't penalize.
  if (attendanceRecords.length > 0) {
    if (attendanceRate < 50) { attPoints = 15; factors.push(`Critical: Attendance rate is very poor (${attendanceRate}%)`); }
    else if (attendanceRate < 60) { attPoints = 10; factors.push(`High Risk: Attendance rate is poor (${attendanceRate}%)`); }
    else if (attendanceRate < 75) { attPoints = 5; factors.push(`Warning: Attendance is below mandatory 75% (${attendanceRate}%)`); }
  }
  score += attPoints;

  // 4. Continuous Assessment Performance (Max 10 points)
  // Average CA score across all results. Assuming CA is out of 40.
  let caPoints = 0;
  if (results.length > 0) {
    const totalCa = results.reduce((sum, r) => sum + (r.caScore || 0), 0);
    const avgCa = totalCa / results.length;
    // Less than 10/40 is critical, < 15 is high, < 20 is warning
    if (avgCa < 10) { caPoints = 10; factors.push(`Critical: Very low average Continuous Assessment score (${avgCa.toFixed(1)}/40)`); }
    else if (avgCa < 15) { caPoints = 5; factors.push(`Warning: Low average Continuous Assessment score (${avgCa.toFixed(1)}/40)`); }
  }
  score += caPoints;

  // 5. Declining GPA Trend (Max 15 points)
  // Group results by session+semester to calculate sequential GPAs
  const groups = {};
  results.forEach(res => {
    const key = `${res.sessionId}_${res.semester}`;
    if (!groups[key]) groups[key] = { sessionId: res.sessionId, semester: res.semester, results: [] };
    groups[key].results.push(res);
  });
  
  // Sort chronologically (assuming sorting by session id string and semester works for now)
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.sessionId !== b.sessionId) return a.sessionId.localeCompare(b.sessionId);
    return a.semester - b.semester;
  });
  
  const gpas = sortedGroups.map(g => calculateGPA(g.results, courses));
  const trend = analyzeTrend(gpas);
  let trendPoints = 0;
  
  if (trend === 'DECLINING') {
    trendPoints = 15;
    factors.push("Warning: Declining GPA performance trend in recent semesters");
  }
  score += trendPoints;

  // Determine Level
  let level = 'LOW';
  if (score >= 75) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MODERATE';

  // Construct explanation
  let explanation = "Student is performing well with minimal risk indicators.";
  if (level === 'CRITICAL') explanation = "Immediate intervention required. Student exhibits multiple severe academic risk indicators.";
  else if (level === 'HIGH') explanation = "Student is at high risk of academic probation or failure. Adviser intervention strongly recommended.";
  else if (level === 'MODERATE') explanation = "Student shows some warning signs requiring monitoring and academic support.";

  return {
    score,
    level,
    factors,
    explanation,
    cgpa,
    gpaHistory: gpas,
    trend
  };
};
