import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { storageService, KEYS } from '../../services/storage';
import { calculateGPA, calculateCGPA, calculateFailedCourses, calculateAttendanceRate } from '../../utils/academicCalculations';
import { calculateRisk } from '../../utils/riskEngine';
import { generateRecommendations } from '../../utils/recommendationEngine';
import { ArrowLeft, User, BookOpen, FileText, CheckSquare, LineChart as LineChartIcon, AlertTriangle, Lightbulb, Printer, Info } from 'lucide-react';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [department, setDepartment] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.openTab || 'overview');
  
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (location.state?.openTab) {
      setActiveTab(location.state.openTab);
    }
  }, [location.state]);

  useEffect(() => {
    const data = storageService.findById(KEYS.STUDENTS, id);
    if (data) {
      setStudent(data);
      const dept = storageService.findById(KEYS.DEPARTMENTS, data.departmentId);
      setDepartment(dept);
      
      const allResults = storageService.getAll(KEYS.RESULTS).filter(r => r.studentId === data.id);
      const allCourses = storageService.getAll(KEYS.COURSES);
      const allAttendance = storageService.getAll(KEYS.ATTENDANCE).filter(a => a.studentId === data.id);
      const allSessions = storageService.getAll(KEYS.SESSIONS);
      
      const riskData = calculateRisk(data, allResults, allCourses, allAttendance);
      const recs = generateRecommendations(riskData);
      setRecommendations(recs);
      
      const chartData = [];
      const groups = {};
      allResults.forEach(res => {
        const key = `${res.sessionId}_${res.semester}`;
        if (!groups[key]) groups[key] = { sessionId: res.sessionId, semester: res.semester, results: [] };
        groups[key].results.push(res);
      });
      
      Object.values(groups)
        .sort((a, b) => a.sessionId.localeCompare(b.sessionId) || a.semester - b.semester)
        .forEach((g) => {
          const session = allSessions.find(s => s.id === g.sessionId);
          chartData.push({
            name: `${session ? session.name : g.sessionId} S${g.semester}`,
            GPA: calculateGPA(g.results, allCourses)
          });
        });

      setAnalytics({ riskData, chartData });
    }
  }, [id]);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-500">
        Student not found.
        <button onClick={() => navigate('/students')} className="text-blue-600 block mx-auto mt-4">Go Back</button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'performance', name: 'Performance', icon: LineChartIcon },
    { id: 'risk', name: 'Risk Analysis', icon: AlertTriangle },
    { id: 'recommendations', name: 'Recommendations', icon: Lightbulb },
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRecIconColor = (type) => {
    switch(type) {
      case 'URGENT': return 'bg-red-100 text-red-600';
      case 'POLICY': return 'bg-purple-100 text-purple-600';
      case 'ACADEMIC': return 'bg-blue-100 text-blue-600';
      case 'BEHAVIORAL': return 'bg-amber-100 text-amber-600';
      case 'SUCCESS': return 'bg-green-100 text-green-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden w-full">
        <button 
          onClick={() => navigate('/students')}
          className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{student.firstName} {student.lastName}</h1>
          <p className="text-sm text-slate-500 truncate">{student.matricNumber} • {department?.name || 'Unknown Department'}</p>
        </div>
      </div>
      
      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-800">
        <h1 className="text-3xl font-black mb-2">Intervention Plan</h1>
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-lg">{student.firstName} {student.lastName}</p>
            <p className="text-slate-600">{student.matricNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{department?.name}</p>
            <p className="text-slate-600">Risk Level: {analytics?.riskData?.level}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        <div className="border-b border-slate-200 overflow-x-auto print:hidden">
          <nav className="flex space-x-6 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 print:p-0">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">Full Name</dt>
                    <dd className="text-sm text-slate-900 col-span-2">{student.firstName} {student.lastName}</dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">Matric Number</dt>
                    <dd className="text-sm text-slate-900 col-span-2">{student.matricNumber}</dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">Email</dt>
                    <dd className="text-sm text-slate-900 col-span-2">{student.email}</dd>
                  </div>
                </dl>
              </div>
              <div className="print:mt-8">
                <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Academic Profile</h3>
                <dl className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">Department</dt>
                    <dd className="text-sm text-slate-900 col-span-2">{department?.name}</dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">CGPA</dt>
                    <dd className="text-sm font-bold text-blue-600 col-span-2">{analytics?.riskData?.cgpa?.toFixed(2) || '0.00'}</dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-slate-500">Risk Level</dt>
                    <dd className="col-span-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border print:border-none print:px-0 ${getRiskColor(analytics?.riskData?.level)}`}>
                        {analytics?.riskData?.level || 'UNKNOWN'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'performance' && analytics && (
            <div className="print:block">
              <h3 className="text-lg font-medium text-slate-900 mb-6 border-b border-slate-100 pb-2">Semester Performance Trend</h3>
              {analytics.chartData.length > 0 ? (
                <div className="h-80 w-full mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis domain={[0, 5]} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="GPA" stroke="#2563eb" strokeWidth={3} dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-12">Not enough data to display a performance trend.</p>
              )}
            </div>
          )}

          {activeTab === 'risk' && analytics && (
            <div className="space-y-8 print:block">
              <div className={`p-6 rounded-xl border print:border-none print:p-0 ${getRiskColor(analytics.riskData.level)}`}>
                <div className="flex items-center gap-4 mb-2">
                  <AlertTriangle className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Academic Risk: {analytics.riskData.level}</h3>
                </div>
                <p className="text-sm font-medium mt-2">{analytics.riskData.explanation}</p>
                <div className="mt-4 pt-4 border-t border-black/10 print:hidden">
                  <p className="text-sm font-bold opacity-80 uppercase tracking-wide">Risk Score Engine</p>
                  <p className="text-3xl font-black">{analytics.riskData.score} / 100</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Contributing Risk Factors</h4>
                {analytics.riskData.factors.length > 0 ? (
                  <ul className="space-y-3">
                    {analytics.riskData.factors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-white border border-slate-200 print:border-none print:pl-0 p-4 rounded-lg shadow-sm print:shadow-none">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 print:hidden" />
                        <span className="text-slate-700 font-medium print:text-black print:list-disc">• {factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 font-medium flex items-center gap-2 print:border-none print:bg-white print:p-0">
                    <CheckSquare className="h-5 w-5" /> No significant risk factors detected.
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print:hidden">
                 <h4 className="font-semibold text-slate-800 mb-2">Mathematical Explanation</h4>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   The risk score is calculated deterministically from stored academic records. 
                   Points are assigned based on CGPA thresholds (up to 35pts), failed course count (up to 25pts), 
                   attendance rate (up to 15pts), continuous assessment average (up to 10pts), and performance trend 
                   across semesters (up to 15pts). The final score maps to: 0-24 (LOW), 25-49 (MODERATE), 
                   50-74 (HIGH), and 75-100 (CRITICAL).
                 </p>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="print:block">
              <div className="flex justify-between items-center mb-6 print:hidden">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-100 pb-2 w-full">Intervention Plan</h3>
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap ml-4"
                >
                  <Printer className="h-4 w-4" />
                  Print Plan
                </button>
              </div>

              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm print:border-b print:shadow-none print:px-0">
                      <div className={`p-3 rounded-lg shrink-0 print:hidden ${getRecIconColor(rec.type)}`}>
                        <Info className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900 print:text-black">{rec.title}</h4>
                          <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 print:hidden">
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-slate-600 print:text-slate-800 leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-12 print:text-left print:py-4">No specific recommendations available.</p>
                )}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-200 hidden print:block">
                <div className="flex justify-between px-8">
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2"></div>
                    <p className="text-sm font-bold">Academic Adviser Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-400 mb-2"></div>
                    <p className="text-sm font-bold">Student Signature</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
