import { 
  gradeFromScore, 
  gradePointFromScore, 
  calculateQualityPoint, 
  calculateGPA, 
  calculateCGPA, 
  calculateFailedCourses, 
  calculatePassRate 
} from './academicCalculations.js';

console.log('--- Academic Calculations Test ---');

// Test grading logic
const scores = [75, 62, 55, 48, 42, 35];
console.log('Scores mapping:');
scores.forEach(s => {
  console.log(`${s} => Grade: ${gradeFromScore(s)}, Point: ${gradePointFromScore(s)}`);
});

// Test Quality Point
console.log('\nQuality Point for 3 units, Grade A (5 pts):', calculateQualityPoint(3, 5));
console.log('Quality Point for 2 units, Grade C (3 pts):', calculateQualityPoint(2, 3));

// Test GPA/CGPA
const mockCourses = [
  { id: 'c1', creditUnit: 3 },
  { id: 'c2', creditUnit: 2 },
  { id: 'c3', creditUnit: 3 }
];

const mockResults = [
  { courseId: 'c1', gradePoint: 5, qualityPoint: 15, grade: 'A' }, // 3 units * 5 = 15
  { courseId: 'c2', gradePoint: 3, qualityPoint: 6, grade: 'C' },  // 2 units * 3 = 6
  { courseId: 'c3', gradePoint: 0, qualityPoint: 0, grade: 'F' }   // 3 units * 0 = 0
]; // Total QPs: 21. Total Units: 8. GPA = 21 / 8 = 2.625 => 2.63

console.log('\nCalculated GPA:', calculateGPA(mockResults, mockCourses));
console.log('Calculated CGPA:', calculateCGPA(mockResults, mockCourses));
console.log('Failed Courses:', calculateFailedCourses(mockResults));
console.log('Pass Rate:', calculatePassRate(mockResults) + '%');
