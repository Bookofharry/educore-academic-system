import React, { useState, useEffect } from 'react';
import { Search, FileText, Save, Calculator } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import { getGradeInfo } from '../../utils/academicCalculations';

const EnterResults = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  
  const [filterSession, setFilterSession] = useState('');
  const [filterSemester, setFilterSemester] = useState('1');
  const [filterCourse, setFilterCourse] = useState('');
  
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [currentResults, setCurrentResults] = useState({});

  const loadData = () => {
    setSessions(storageService.getAll(KEYS.SESSIONS));
    setCourses(storageService.getAll(KEYS.COURSES));
    setRegistrations(storageService.getAll(KEYS.REGISTRATIONS));
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
      const courseRegs = registrations.filter(
        r => r.sessionId === filterSession && 
             r.semester === parseInt(filterSemester) && 
             r.courseId === filterCourse
      );
      
      const enrolledStudents = courseRegs.map(reg => {
        return students.find(s => s.id === reg.studentId);
      }).filter(Boolean);
      
      setRegisteredStudents(enrolledStudents);

      const existingRecords = results.filter(
        a => a.sessionId === filterSession &&
             a.semester === parseInt(filterSemester) &&
             a.courseId === filterCourse
      );

      const initialResults = {};
      enrolledStudents.forEach(student => {
        const existing = existingRecords.find(r => r.studentId === student.id);
        if (existing) {
          initialResults[student.id] = {
            caScore: existing.caScore || 0,
            examScore: existing.examScore || 0
          };
        } else {
          initialResults[student.id] = { caScore: '', examScore: '' };
        }
      });
      
      setCurrentResults(initialResults);
    } else {
      setRegisteredStudents([]);
      setCurrentResults({});
    }
  }, [filterSession, filterSemester, filterCourse, registrations, students, results]);

  const handleScoreChange = (studentId, field, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    // basic constraint
    if (field === 'caScore' && numValue > 40) return; // Assuming CA max is 40
    if (field === 'examScore' && numValue > 70) return; // Assuming Exam max is 70
    if (field === 'caScore' && numValue > 100) return; 

    setCurrentResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue
      }
    }));
  };

  const calculateRow = (ca, exam) => {
    const c = parseInt(ca) || 0;
    const e = parseInt(exam) || 0;
    const total = c + e;
    const { grade, point } = getGradeInfo(total);
    return { total, grade, point };
  };

  const handleSaveResults = () => {
    if (registeredStudents.length === 0) return;

    const courseObj = courses.find(c => c.id === filterCourse);
    if (!courseObj) return;

    // Filter out existing records for this specific cohort
    const existingOtherRecords = results.filter(
      r => !(r.sessionId === filterSession &&
             r.semester === parseInt(filterSemester) &&
             r.courseId === filterCourse)
    );

    const newRecords = registeredStudents.map(student => {
      const { caScore, examScore } = currentResults[student.id];
      const ca = parseInt(caScore) || 0;
      const ex = parseInt(examScore) || 0;
      const total = ca + ex;
      const { grade, point } = getGradeInfo(total);

      // Check if we are updating an existing one to keep its ID, or creating a new one
      const existing = results.find(
        r => r.sessionId === filterSession &&
             r.semester === parseInt(filterSemester) &&
             r.courseId === filterCourse &&
             r.studentId === student.id
      );

      return {
        id: existing ? existing.id : crypto.randomUUID(),
        studentId: student.id,
        courseId: filterCourse,
        sessionId: filterSession,
        semester: parseInt(filterSemester),
        caScore: ca,
        examScore: ex,
        totalScore: total,
        grade,
        gradePoint: point,
        qualityPoint: point * courseObj.creditUnit,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const updatedRecords = [...existingOtherRecords, ...newRecords];
    storageService.set(KEYS.RESULTS, updatedRecords);
    setResults(updatedRecords);
    
    alert('Results saved successfully!');
  };

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
            <Calculator className="h-6 w-6 text-blue-600" />
            Enter Results
          </h1>
          <p className="text-sm text-slate-500">Record CA and Exam scores for students</p>
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
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Select a session, semester, and course to enter results.</p>
          </div>
        ) : registeredStudents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <p className="text-slate-500 text-sm">No students are registered for this course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Enrolled Students: {registeredStudents.length}</span>
              <button 
                onClick={handleSaveResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" />
                Save Results
              </button>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Matric No.</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 w-24">CA Score</th>
                    <th className="px-4 py-3 w-24">Exam Score</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registeredStudents.map((student) => {
                    const data = currentResults[student.id] || { caScore: '', examScore: '' };
                    const { total, grade, point } = calculateRow(data.caScore, data.examScore);
                    const isPassed = grade !== 'F' && grade !== '';
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{student.matricNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{student.firstName} {student.lastName}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            max="40"
                            value={data.caScore}
                            onChange={(e) => handleScoreChange(student.id, 'caScore', e.target.value)}
                            className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0-40"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="0"
                            max="70"
                            value={data.examScore}
                            onChange={(e) => handleScoreChange(student.id, 'examScore', e.target.value)}
                            className="w-20 px-2 py-1.5 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0-60/70"
                          />
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">{total}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(grade)}`}>
                            {grade || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-600">{point}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterResults;
