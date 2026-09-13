import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';

const ViewResults = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  
  const [filterSession, setFilterSession] = useState('');
  const [filterSemester, setFilterSemester] = useState('1');
  const [filterCourse, setFilterCourse] = useState('');
  
  const [courseResults, setCourseResults] = useState([]);

  const loadData = () => {
    setSessions(storageService.getAll(KEYS.SESSIONS));
    setCourses(storageService.getAll(KEYS.COURSES));
    setStudents(storageService.getAll(KEYS.STUDENTS));
    setResults(storageService.getAll(KEYS.RESULTS));
    
    const sess = storageService.getAll(KEYS.SESSIONS);
    const activeSess = sess.find(s => s.status === 'ACTIVE');
    if (activeSess && !filterSession) {
      setFilterSession(activeSess.id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterSession && filterSemester && filterCourse) {
      const records = results.filter(
        r => r.sessionId === filterSession &&
             r.semester === parseInt(filterSemester) &&
             r.courseId === filterCourse
      );
      
      const enrichedRecords = records.map(r => {
        const student = students.find(s => s.id === r.studentId);
        return {
          ...r,
          matricNumber: student?.matricNumber || 'Unknown',
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown'
        };
      });

      // Sort by matric number
      enrichedRecords.sort((a, b) => a.matricNumber.localeCompare(b.matricNumber));
      setCourseResults(enrichedRecords);
    } else {
      setCourseResults([]);
    }
  }, [filterSession, filterSemester, filterCourse, results, students]);

  const getGradeColor = (grade) => {
    if (['A', 'B'].includes(grade)) return 'text-green-600 bg-green-50';
    if (['C', 'D'].includes(grade)) return 'text-blue-600 bg-blue-50';
    if (grade === 'E') return 'text-amber-600 bg-amber-50';
    if (grade === 'F') return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getPassFailSummary = () => {
    if (courseResults.length === 0) return { pass: 0, fail: 0, rate: 0 };
    const pass = courseResults.filter(r => r.grade !== 'F' && r.grade !== '').length;
    const fail = courseResults.length - pass;
    const rate = ((pass / courseResults.length) * 100).toFixed(1);
    return { pass, fail, rate };
  };

  const summary = getPassFailSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            View Results
          </h1>
          <p className="text-sm text-slate-500">Review entered results and course performance</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
            <select 
              value={filterSession} 
              onChange={e => setFilterSession(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Session...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
            <select 
              value={filterSemester} 
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
            <select 
              value={filterCourse} 
              onChange={e => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {!filterCourse ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Select a session, semester, and course to view results.</p>
          </div>
        ) : courseResults.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <p className="text-slate-500 text-sm">No results found for this course. Please enter them first.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500 truncate">Total Entries</p>
                  <p className="text-xl font-bold text-slate-900 truncate">{courseResults.length}</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600 shrink-0">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-700 truncate">Passed ({summary.rate}%)</p>
                  <p className="text-xl font-bold text-green-900 truncate">{summary.pass}</p>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-red-700 truncate">Failed</p>
                  <p className="text-xl font-bold text-red-900 truncate">{summary.fail}</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Matric No.</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-center">CA</th>
                    <th className="px-4 py-3 text-center">Exam</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courseResults.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{res.matricNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{res.studentName}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{res.caScore}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{res.examScore}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">{res.totalScore}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(res.grade)}`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {res.grade === 'F' ? (
                          <span className="text-red-600 font-semibold text-xs">FAIL</span>
                        ) : (
                          <span className="text-green-600 font-semibold text-xs">PASS</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResults;
