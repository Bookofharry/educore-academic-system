export const getGradeInfo = (score) => {
  if (score >= 70) return { grade: 'A', point: 5 };
  if (score >= 60) return { grade: 'B', point: 4 };
  if (score >= 50) return { grade: 'C', point: 3 };
  if (score >= 45) return { grade: 'D', point: 2 };
  if (score >= 40) return { grade: 'E', point: 1 };
  return { grade: 'F', point: 0 };
};

export const gradeFromScore = (score) => {
  return getGradeInfo(score).grade;
};

export const gradePointFromScore = (score) => {
  return getGradeInfo(score).point;
};

export const calculateQualityPoint = (creditUnit, gradePoint) => {
  return creditUnit * gradePoint;
};

/**
 * Calculates GPA for a specific set of results.
 * @param {Array} results - Array of result objects. Needs to include gradePoint and course.creditUnit
 * @param {Array} courses - Array of all course objects to look up credit units
 * @returns {Number} GPA formatted to 2 decimal places
 */
export const calculateGPA = (results, courses) => {
  let totalQualityPoints = 0;
  let totalCreditUnits = 0;

  results.forEach(result => {
    const course = courses.find(c => c.id === result.courseId);
    if (course) {
      totalQualityPoints += result.qualityPoint || calculateQualityPoint(course.creditUnit, result.gradePoint);
      totalCreditUnits += course.creditUnit;
    }
  });

  if (totalCreditUnits === 0) return 0.00;
  return Number((totalQualityPoints / totalCreditUnits).toFixed(2));
};

/**
 * Calculates CGPA for a student across all their results.
 * @param {Array} studentResults - Array of all result objects for the student
 * @param {Array} courses - Array of all course objects
 * @returns {Number} CGPA formatted to 2 decimal places
 */
export const calculateCGPA = (studentResults, courses) => {
  return calculateGPA(studentResults, courses); // The logic is identical, it just takes all results instead of a subset
};

export const calculateFailedCourses = (results) => {
  return results.filter(r => r.grade === 'F').length;
};

export const calculatePassRate = (results) => {
  if (!results || results.length === 0) return 0;
  const passed = results.filter(r => r.grade !== 'F').length;
  return Number(((passed / results.length) * 100).toFixed(1));
};

export const calculateAttendanceRate = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) return 0;
  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  return Number(((presentCount / attendanceRecords.length) * 100).toFixed(1));
};
