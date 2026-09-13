import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { storageService, KEYS } from '../../services/storage';
import { calculateRisk } from '../../utils/riskEngine';
import { AlertTriangle, Eye, Search } from 'lucide-react';

const RiskPrediction = () => {
  const navigate = useNavigate();
  const [riskStats, setRiskStats] = useState([]);
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [search, setSearch] = useState('');

  const RISK_COLORS = {
    'CRITICAL': '#ef4444', // red-500
    'HIGH': '#f97316',     // orange-500
    'MODERATE': '#f59e0b', // amber-500
    'LOW': '#10b981'       // emerald-500
  };

  useEffect(() => {
    const students = storageService.getAll(KEYS.STUDENTS);
    const results = storageService.getAll(KEYS.RESULTS);
    const courses = storageService.getAll(KEYS.COURSES);
    const attendance = storageService.getAll(KEYS.ATTENDANCE);
    const departments = storageService.getAll(KEYS.DEPARTMENTS);

    const counts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
    const atRiskList = [];

    students.forEach(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      const studentAtt = attendance.filter(a => a.studentId === student.id);
      
      const riskData = calculateRisk(student, studentResults, courses, studentAtt);
      
      counts[riskData.level]++;
      
      if (['CRITICAL', 'HIGH', 'MODERATE'].includes(riskData.level)) {
        const dept = departments.find(d => d.id === student.departmentId);
        atRiskList.push({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          matricNumber: student.matricNumber,
          department: dept ? dept.code : 'N/A',
          level: student.level,
          riskLevel: riskData.level,
          riskScore: riskData.score,
          factorsCount: riskData.factors.length
        });
      }
    });

    setRiskStats([
      { name: 'Critical Risk', value: counts.CRITICAL, level: 'CRITICAL' },
      { name: 'High Risk', value: counts.HIGH, level: 'HIGH' },
      { name: 'Moderate Risk', value: counts.MODERATE, level: 'MODERATE' },
      { name: 'Low Risk', value: counts.LOW, level: 'LOW' }
    ]);
    
    // Sort at risk list by score descending
    atRiskList.sort((a, b) => b.riskScore - a.riskScore);
    setStudentsAtRisk(atRiskList);

  }, []);

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'MODERATE': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'LOW': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredStudents = studentsAtRisk.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.matricNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            Intelligent Risk Prediction
          </h1>
          <p className="text-sm text-slate-500">Identify students at risk of academic failure based on deterministic algorithms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Risk Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.level]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Students Requiring Attention
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Student</th>
                  <th className="px-4 sm:px-6 py-3 text-center">Dept</th>
                  <th className="px-4 sm:px-6 py-3 text-center">Risk Level</th>
                  <th className="px-4 sm:px-6 py-3 text-center">Risk Score</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-slate-500 text-xs">{student.matricNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">{student.department}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getRiskBadge(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-slate-800">{student.riskScore}</span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No at-risk students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;
