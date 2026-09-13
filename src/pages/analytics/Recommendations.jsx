import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Search, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import { calculateRisk } from '../../utils/riskEngine';
import { generateRecommendations } from '../../utils/recommendationEngine';

const Recommendations = () => {
  const navigate = useNavigate();
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const students = storageService.getAll(KEYS.STUDENTS);
    const results = storageService.getAll(KEYS.RESULTS);
    const courses = storageService.getAll(KEYS.COURSES);
    const attendance = storageService.getAll(KEYS.ATTENDANCE);
    const departments = storageService.getAll(KEYS.DEPARTMENTS);

    const riskList = [];

    students.forEach(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      const studentAtt = attendance.filter(a => a.studentId === student.id);
      
      const riskData = calculateRisk(student, studentResults, courses, studentAtt);
      
      if (['CRITICAL', 'HIGH', 'MODERATE'].includes(riskData.level)) {
        const dept = departments.find(d => d.id === student.departmentId);
        const recommendations = generateRecommendations(riskData);
        
        riskList.push({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          matricNumber: student.matricNumber,
          department: dept ? dept.name : 'Unknown',
          riskLevel: riskData.level,
          topRecommendation: recommendations.length > 0 ? recommendations[0].title : 'Review Required',
          recommendationCount: recommendations.length
        });
      }
    });

    riskList.sort((a, b) => {
      const rank = { 'CRITICAL': 3, 'HIGH': 2, 'MODERATE': 1, 'LOW': 0 };
      return rank[b.riskLevel] - rank[a.riskLevel];
    });
    
    setAtRiskStudents(riskList);
  }, []);

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'MODERATE': return 'bg-amber-100 text-amber-800 border border-amber-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredStudents = atRiskStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.matricNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            Intervention Recommendations
          </h1>
          <p className="text-sm text-slate-500">Auto-generated intervention strategies for at-risk students</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Students Requiring Intervention Plans ({atRiskStudents.length})
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student..." 
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
                <th className="px-4 sm:px-6 py-3 text-center">Risk Level</th>
                <th className="px-4 sm:px-6 py-3">Primary Intervention</th>
                <th className="px-4 sm:px-6 py-3 text-center">Action Items</th>
                <th className="px-4 sm:px-6 py-3 text-right">View Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-slate-500 text-xs">{student.matricNumber} • {student.department}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getRiskBadge(student.riskLevel)}`}>
                        {student.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {student.topRecommendation}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 h-6 w-6 rounded-full font-bold text-xs">
                        {student.recommendationCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button 
                          onClick={() => {
                            // By navigating to StudentDetail and passing a state, we can auto-open the recommendations tab
                            navigate(`/students/${student.id}`, { state: { openTab: 'recommendations' } });
                          }}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center transition-colors"
                          title="View Full Intervention Plan"
                        >
                          <FileText className="h-5 w-5" />
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No students currently require intervention.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
