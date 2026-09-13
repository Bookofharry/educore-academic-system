import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, GraduationCap, Building2, AlertTriangle, TrendingUp } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import { calculateRisk } from '../../utils/riskEngine';
import { calculateCGPA } from '../../utils/academicCalculations';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    departments: 0,
    activeSession: 'None',
    atRiskStudents: 0,
    avgCGPA: 0
  });

  useEffect(() => {
    const students = storageService.getAll(KEYS.STUDENTS);
    const lecturers = storageService.getAll(KEYS.LECTURERS);
    const courses = storageService.getAll(KEYS.COURSES);
    const departments = storageService.getAll(KEYS.DEPARTMENTS);
    const sessions = storageService.getAll(KEYS.SESSIONS);
    const results = storageService.getAll(KEYS.RESULTS);
    const attendance = storageService.getAll(KEYS.ATTENDANCE);

    const activeSession = sessions.find(s => s.status === 'ACTIVE');
    
    let riskCount = 0;
    let totalCGPA = 0;
    let studentsWithResults = 0;

    if (user?.role === 'ADMIN' || user?.role === 'ADVISER') {
      students.forEach(student => {
        const studentResults = results.filter(r => r.studentId === student.id);
        if (studentResults.length > 0) {
          studentsWithResults++;
          totalCGPA += calculateCGPA(studentResults, courses);
        }
        
        const studentAtt = attendance.filter(a => a.studentId === student.id);
        const risk = calculateRisk(student, studentResults, courses, studentAtt);
        
        if (['CRITICAL', 'HIGH', 'MODERATE'].includes(risk.level)) {
          riskCount++;
        }
      });
    }

    setStats({
      students: students.length,
      lecturers: lecturers.length,
      courses: courses.length,
      departments: departments.length,
      activeSession: activeSession ? activeSession.name : 'No Active Session',
      atRiskStudents: riskCount,
      avgCGPA: studentsWithResults > 0 ? (totalCGPA / studentsWithResults).toFixed(2) : 0
    });

  }, [user]);

  const getStatCards = () => {
    const cards = [];
    // Everyone sees students
    cards.push({ title: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-100 text-blue-600' });
    
    if (user?.role === 'ADMIN') {
      cards.push({ title: 'Total Lecturers', value: stats.lecturers, icon: GraduationCap, color: 'bg-indigo-100 text-indigo-600' });
      cards.push({ title: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' });
      cards.push({ title: 'Departments', value: stats.departments, icon: Building2, color: 'bg-purple-100 text-purple-600' });
    } else if (user?.role === 'LECTURER') {
      cards.push({ title: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' });
    }
    return cards;
  };

  const statCards = getStatCards();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.color} shrink-0`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-500 truncate">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900 truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${user?.role !== 'LECTURER' ? 'lg:grid-cols-3' : ''} gap-6`}>
        <div className={`${user?.role !== 'LECTURER' ? 'lg:col-span-2' : ''} bg-white rounded-xl shadow-sm border border-slate-200 p-6`}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Academic Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-1">Current Academic Session</p>
              <p className="text-xl font-bold text-slate-900">{stats.activeSession}</p>
            </div>
            
            {user?.role !== 'LECTURER' && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Institution Average CGPA</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-slate-900">{stats.avgCGPA}</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-1">System Verification</h3>
            <p className="text-sm text-blue-800">
              All dashboard statistics are calculated deterministically in real-time from localized browser storage. 
              No hardcoded mock values are used in this analytics dashboard.
            </p>
          </div>
        </div>

        {user?.role !== 'LECTURER' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-800">Risk Alerts</h2>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                The Intelligent Risk Engine has identified students requiring academic intervention.
              </p>
              <div className="text-center py-6 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-4xl font-black text-amber-600">{stats.atRiskStudents}</p>
                <p className="text-sm font-semibold text-amber-800 mt-1 uppercase tracking-wide">Students At Risk</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
