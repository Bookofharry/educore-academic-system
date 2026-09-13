import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { storageService, KEYS } from '../../services/storage';
import { calculateGPA, calculateCGPA } from '../../utils/academicCalculations';
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    gpaDistribution: [],
    trendData: [],
    stats: {
      avgCGPA: 0,
      totalExcellent: 0, // CGPA >= 4.5
      totalProbation: 0 // CGPA < 1.5
    }
  });

  useEffect(() => {
    const students = storageService.getAll(KEYS.STUDENTS);
    const results = storageService.getAll(KEYS.RESULTS);
    const courses = storageService.getAll(KEYS.COURSES);
    const sessions = storageService.getAll(KEYS.SESSIONS);

    // Calculate CGPA for all students
    let totalCGPA = 0;
    let excellentCount = 0;
    let probationCount = 0;
    
    const gpaBins = {
      '4.50 - 5.00': 0,
      '3.50 - 4.49': 0,
      '2.40 - 3.49': 0,
      '1.50 - 2.39': 0,
      '0.00 - 1.49': 0
    };

    students.forEach(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      if (studentResults.length > 0) {
        const cgpa = calculateCGPA(studentResults, courses);
        totalCGPA += cgpa;
        
        if (cgpa >= 4.5) { gpaBins['4.50 - 5.00']++; excellentCount++; }
        else if (cgpa >= 3.5) gpaBins['3.50 - 4.49']++;
        else if (cgpa >= 2.4) gpaBins['2.40 - 3.49']++;
        else if (cgpa >= 1.5) gpaBins['1.50 - 2.39']++;
        else { gpaBins['0.00 - 1.49']++; probationCount++; }
      }
    });

    const gpaDistribution = Object.keys(gpaBins).map(key => ({
      name: key,
      count: gpaBins[key]
    }));

    // Calculate overall semester performance trend (average GPA per semester)
    const groups = {};
    results.forEach(res => {
      const key = `${res.sessionId}_${res.semester}`;
      if (!groups[key]) groups[key] = { sessionId: res.sessionId, semester: res.semester, results: [] };
      groups[key].results.push(res);
    });

    const trendData = [];
    Object.values(groups)
      .sort((a, b) => a.sessionId.localeCompare(b.sessionId) || a.semester - b.semester)
      .forEach(g => {
        const session = sessions.find(s => s.id === g.sessionId);
        // Calculate average GPA for this cohort slice
        // To do this simply, we group by student inside this semester and average their GPAs
        const studentSemResults = {};
        g.results.forEach(r => {
          if(!studentSemResults[r.studentId]) studentSemResults[r.studentId] = [];
          studentSemResults[r.studentId].push(r);
        });
        
        let semTotalGPA = 0;
        let studentCount = 0;
        Object.values(studentSemResults).forEach(studResults => {
          semTotalGPA += calculateGPA(studResults, courses);
          studentCount++;
        });
        
        const avgSemGPA = studentCount > 0 ? (semTotalGPA / studentCount) : 0;
        
        trendData.push({
          name: `${session ? session.name : g.sessionId} S${g.semester}`,
          AverageGPA: Number(avgSemGPA.toFixed(2))
        });
      });

    const studentWithResultsCount = students.filter(s => results.some(r => r.studentId === s.id)).length;
    const avgCGPA = studentWithResultsCount > 0 ? (totalCGPA / studentWithResultsCount) : 0;

    setAnalyticsData({
      gpaDistribution,
      trendData,
      stats: {
        avgCGPA: Number(avgCGPA.toFixed(2)),
        totalExcellent: excellentCount,
        totalProbation: probationCount
      }
    });

  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LineChartIcon className="h-6 w-6 text-blue-600" />
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-500">Institution-wide academic performance trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Institution Avg CGPA</p>
          <p className="text-4xl font-black text-blue-600 mt-2">{analyticsData.stats.avgCGPA}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6 flex flex-col justify-center items-center text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Excellent Standing</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{analyticsData.stats.totalExcellent} Students</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6 flex flex-col justify-center items-center text-center">
          <TrendingDown className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Academic Probation</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{analyticsData.stats.totalProbation} Students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Global CGPA Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.gpaDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Institution Average GPA Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis domain={[0, 5]} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="AverageGPA" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
