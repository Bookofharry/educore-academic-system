import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, CalendarDays, CheckSquare, Save } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';

const Attendance = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  const [filterSession, setFilterSession] = useState('');
  const [filterSemester, setFilterSemester] = useState('1');
  const [filterCourse, setFilterCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [currentAttendance, setCurrentAttendance] = useState({});

  const loadData = () => {
    setSessions(storageService.getAll(KEYS.SESSIONS));
    setCourses(storageService.getAll(KEYS.COURSES));
    setRegistrations(storageService.getAll(KEYS.REGISTRATIONS));
    setStudents(storageService.getAll(KEYS.STUDENTS));
    setAttendanceRecords(storageService.getAll(KEYS.ATTENDANCE));
    
    const sess = storageService.getAll(KEYS.SESSIONS);
    const activeSess = sess.find(s => s.status === 'ACTIVE');
    if (activeSess && !filterSession) {
      setFilterSession(activeSess.id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When filters change, load the students registered for that course and any existing attendance
  useEffect(() => {
    if (filterSession && filterSemester && filterCourse && attendanceDate) {
      // Find students registered for this course/session/semester
      const courseRegs = registrations.filter(
        r => r.sessionId === filterSession && 
             r.semester === parseInt(filterSemester) && 
             r.courseId === filterCourse
      );
      
      const enrolledStudents = courseRegs.map(reg => {
        return students.find(s => s.id === reg.studentId);
      }).filter(Boolean); // filter out any nulls
      
      setRegisteredStudents(enrolledStudents);

      // Check for existing attendance records for this date
      const existingRecords = attendanceRecords.filter(
        a => a.sessionId === filterSession &&
             a.semester === parseInt(filterSemester) &&
             a.courseId === filterCourse &&
             a.date === attendanceDate
      );

      // Initialize attendance state
      const initialAttendance = {};
      enrolledStudents.forEach(student => {
        const existing = existingRecords.find(r => r.studentId === student.id);
        initialAttendance[student.id] = existing ? existing.status : 'PRESENT'; // Default to present
      });
      
      setCurrentAttendance(initialAttendance);
    } else {
      setRegisteredStudents([]);
      setCurrentAttendance({});
    }
  }, [filterSession, filterSemester, filterCourse, attendanceDate, registrations, students, attendanceRecords]);

  const handleStatusChange = (studentId, status) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (registeredStudents.length === 0) return;

    // Get all records, filter out the ones we are about to overwrite (same session, sem, course, date)
    const existingOtherRecords = attendanceRecords.filter(
      a => !(a.sessionId === filterSession &&
             a.semester === parseInt(filterSemester) &&
             a.courseId === filterCourse &&
             a.date === attendanceDate)
    );

    // Create new records
    const newRecords = registeredStudents.map(student => ({
      id: crypto.randomUUID(),
      studentId: student.id,
      courseId: filterCourse,
      sessionId: filterSession,
      semester: parseInt(filterSemester),
      date: attendanceDate,
      status: currentAttendance[student.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const updatedRecords = [...existingOtherRecords, ...newRecords];
    storageService.set(KEYS.ATTENDANCE, updatedRecords);
    
    // Refresh local state
    setAttendanceRecords(updatedRecords);
    alert('Attendance saved successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'LATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            Class Attendance
          </h1>
          <p className="text-sm text-slate-500">Record daily attendance for courses</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {!filterCourse ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <CalendarDays className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Select a session, semester, course, and date to record attendance.</p>
          </div>
        ) : registeredStudents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
            <p className="text-slate-500 text-sm">No students are registered for this course in the selected session/semester.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Total Students: {registeredStudents.length}</span>
              <button 
                onClick={handleSaveAttendance}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" />
                Save Attendance
              </button>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">Matric No.</th>
                    <th className="px-4 sm:px-6 py-3">Student Name</th>
                    <th className="px-4 sm:px-6 py-3">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registeredStudents.map((student) => {
                    const status = currentAttendance[student.id];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 w-1/4">{student.matricNumber}</td>
                        <td className="px-6 py-4 text-slate-700 w-1/3">{student.firstName} {student.lastName}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(opt => (
                              <button
                                key={opt}
                                onClick={() => handleStatusChange(student.id, opt)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                                  status === opt 
                                    ? getStatusColor(opt) 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
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

export default Attendance;
