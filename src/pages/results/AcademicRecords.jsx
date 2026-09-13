import React, { useState, useEffect } from 'react';
import { BookOpen, Search, GraduationCap } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import { calculateGPA, calculateCGPA, calculateFailedCourses } from '../../utils/academicCalculations';

const AcademicRecords = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = () => {
    setStudents(storageService.getAll(KEYS.STUDENTS));
    setCourses(storageService.getAll(KEYS.COURSES));
    setResults(storageService.getAll(KEYS.RESULTS));
    setSessions(storageService.getAll(KEYS.SESSIONS));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    const student = students.find(
      s => s.matricNumber.toLowerCase() === search.toLowerCase() ||
           `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    setSelectedStudent(student || null);
  };

  const getStudentRecords = () => {
    if (!selectedStudent) return null;
    
    // Get all results for this student
    const studentResults = results.filter(r => r.studentId === selectedStudent.id);
    const cgpa = calculateCGPA(studentResults, courses);
    const failedCourses = calculateFailedCourses(studentResults);

    // Group by session and semester
    const grouped = {};
    studentResults.forEach(res => {
      const key = `${res.sessionId}_${res.semester}`;
      if (!grouped[key]) {
        grouped[key] = {
          sessionId: res.sessionId,
          semester: res.semester,
          results: []
        };
      }
      // enrich with course details
      const course = courses.find(c => c.id === res.courseId);
      grouped[key].results.push({
        ...res,
        courseCode: course?.code || 'N/A',
        courseTitle: course?.title || 'Unknown',
        creditUnit: course?.creditUnit || 0
      });
    });

    // Calculate GPA per semester
    Object.values(grouped).forEach(group => {
      group.gpa = calculateGPA(group.results, courses);
      const sessionObj = sessions.find(s => s.id === group.sessionId);
      group.sessionName = sessionObj?.name || 'Unknown';
    });

    return {
      cgpa,
      failedCourses,
      semesters: Object.values(grouped).sort((a, b) => {
        // Simple sort by session name then semester
        if (a.sessionName !== b.sessionName) return b.sessionName.localeCompare(a.sessionName);
        return b.semester - a.semester;
      })
    };
  };

  const records = getStudentRecords();

  const getGradeColor = (grade) => {
    if (['A', 'B'].includes(grade)) return 'text-green-600 bg-green-50';
    if (['C', 'D'].includes(grade)) return 'text-blue-600 bg-blue-50';
    if (grade === 'E') return 'text-amber-600 bg-amber-50';
    if (grade === 'F') return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Academic Records
          </h1>
          <p className="text-sm text-slate-500">View complete academic history, GPA, and CGPA</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Enter Student Name or Matric Number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Find Record
          </button>
        </form>

        {!selectedStudent && search && (
          <div className="text-slate-500 text-sm p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-center">
            No student found matching that search.
          </div>
        )}

        {selectedStudent && records && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-slate-900 truncate">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                    <p className="text-slate-500 font-medium truncate">{selectedStudent.matricNumber}</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="text-center px-6 border-r border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CGPA</p>
                    <p className="text-3xl font-bold text-blue-600">{records.cgpa.toFixed(2)}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Failed Courses</p>
                    <p className={`text-3xl font-bold ${records.failedCourses > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {records.failedCourses}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Semester Results History</h3>
              
              {records.semesters.length === 0 ? (
                <p className="text-slate-500">No results found for this student.</p>
              ) : (
                records.semesters.map((sem, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-800">
                        {sem.sessionName} — Semester {sem.semester}
                      </h4>
                      <div className="bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200 text-sm font-bold text-slate-700">
                        GPA: <span className={sem.gpa < 1.5 ? 'text-red-600' : 'text-blue-600'}>{sem.gpa.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2">Course Code</th>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2 text-center">Unit</th>
                            <th className="px-4 py-2 text-center">Score</th>
                            <th className="px-4 py-2 text-center">Grade</th>
                            <th className="px-4 py-2 text-center">QP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sem.results.map(res => (
                            <tr key={res.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{res.courseCode}</td>
                              <td className="px-4 py-3 text-slate-600">{res.courseTitle}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{res.creditUnit}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-700">{res.totalScore}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(res.grade)}`}>
                                  {res.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-medium text-slate-600">{res.qualityPoint}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicRecords;
