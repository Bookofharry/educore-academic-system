import React, { useState, useEffect } from 'react';
import { FileDown, FileText, Download, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { storageService, KEYS } from '../../services/storage';
import { calculateRisk } from '../../utils/riskEngine';
import { calculateGPA } from '../../utils/academicCalculations';

const Reports = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [filterSession, setFilterSession] = useState('');
  const [filterSemester, setFilterSemester] = useState('1');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    const sess = storageService.getAll(KEYS.SESSIONS);
    setSessions(sess);
    setCourses(storageService.getAll(KEYS.COURSES));
    setDepartments(storageService.getAll(KEYS.DEPARTMENTS));
    
    const activeSess = sess.find(s => s.status === 'ACTIVE');
    if (activeSess) {
      setFilterSession(activeSess.id);
    }
  }, []);

  const getInstitutionHeader = (doc) => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSITY ADMINISTRATION SYSTEM', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Office of the Academic Registrar', doc.internal.pageSize.width / 2, 26, { align: 'center' });
    
    doc.line(14, 32, doc.internal.pageSize.width - 14, 32);
  };

  const generateMasterResultSheet = () => {
    if (!filterSession || !filterCourse || !filterSemester) {
      alert("Please select Session, Semester, and Course to generate the result sheet.");
      return;
    }

    const students = storageService.getAll(KEYS.STUDENTS);
    const results = storageService.getAll(KEYS.RESULTS);
    const sessionObj = sessions.find(s => s.id === filterSession);
    const courseObj = courses.find(c => c.id === filterCourse);

    const courseResults = results.filter(
      r => r.sessionId === filterSession &&
           r.semester === parseInt(filterSemester) &&
           r.courseId === filterCourse
    );

    if (courseResults.length === 0) {
      alert("No results found for the selected criteria.");
      return;
    }

    const enrichedResults = courseResults.map(r => {
      const student = students.find(s => s.id === r.studentId);
      return {
        ...r,
        matric: student?.matricNumber || 'N/A',
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      };
    }).sort((a, b) => a.matric.localeCompare(b.matric));

    const doc = new jsPDF();
    getInstitutionHeader(doc);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MASTER RESULT SHEET', doc.internal.pageSize.width / 2, 42, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Course: ${courseObj?.code} - ${courseObj?.title}`, 14, 52);
    doc.text(`Session: ${sessionObj?.name}`, 14, 58);
    doc.text(`Semester: ${filterSemester === '1' ? 'First' : 'Second'}`, 120, 58);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 120, 52);

    const tableData = enrichedResults.map((r, idx) => [
      idx + 1,
      r.matric,
      r.name,
      r.caScore,
      r.examScore,
      r.totalScore,
      r.grade,
      r.gradePoint
    ]);

    doc.autoTable({
      startY: 65,
      head: [['S/N', 'Matric Number', 'Student Name', 'CA', 'Exam', 'Total', 'Grade', 'GP']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' }
      }
    });

    // Summary at the bottom
    const passCount = courseResults.filter(r => r.grade !== 'F').length;
    const failCount = courseResults.length - passCount;
    const finalY = doc.lastAutoTable.finalY || 65;

    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 14, finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Registered: ${courseResults.length}`, 14, finalY + 22);
    doc.text(`Total Passed: ${passCount}`, 14, finalY + 28);
    doc.text(`Total Failed: ${failCount}`, 14, finalY + 34);
    doc.text(`Pass Rate: ${((passCount/courseResults.length)*100).toFixed(1)}%`, 14, finalY + 40);

    doc.save(`Result_Sheet_${courseObj?.code}_${sessionObj?.name.replace('/','-')}.pdf`);
  };

  const generateRiskSummaryReport = () => {
    if (!filterDept) {
      alert("Please select a Department to generate the risk summary.");
      return;
    }

    const students = storageService.getAll(KEYS.STUDENTS).filter(s => s.departmentId === filterDept);
    const results = storageService.getAll(KEYS.RESULTS);
    const allCourses = storageService.getAll(KEYS.COURSES);
    const allAttendance = storageService.getAll(KEYS.ATTENDANCE);
    const deptObj = departments.find(d => d.id === filterDept);

    if (students.length === 0) {
      alert("No students found in the selected department.");
      return;
    }

    const riskDataList = [];
    students.forEach(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      const studentAtt = allAttendance.filter(a => a.studentId === student.id);
      const riskData = calculateRisk(student, studentResults, allCourses, studentAtt);
      
      if (['CRITICAL', 'HIGH', 'MODERATE'].includes(riskData.level)) {
        riskDataList.push({
          matric: student.matricNumber,
          name: `${student.firstName} ${student.lastName}`,
          cgpa: calculateGPA(studentResults, allCourses).toFixed(2),
          level: riskData.level,
          score: riskData.score
        });
      }
    });

    riskDataList.sort((a, b) => b.score - a.score);

    const doc = new jsPDF();
    getInstitutionHeader(doc);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC RISK SUMMARY REPORT', doc.internal.pageSize.width / 2, 42, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Department: ${deptObj?.name}`, 14, 52);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 58);
    doc.text(`Total At-Risk Students: ${riskDataList.length}`, 120, 52);

    const tableData = riskDataList.map((r, idx) => [
      idx + 1,
      r.matric,
      r.name,
      r.cgpa,
      r.level,
      r.score
    ]);

    doc.autoTable({
      startY: 65,
      head: [['S/N', 'Matric Number', 'Student Name', 'CGPA', 'Risk Level', 'Risk Score']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: 255 }, // Red header for risk
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' },
        5: { halign: 'center' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
          if (val === 'HIGH') data.cell.styles.textColor = [234, 88, 12];
          if (val === 'MODERATE') data.cell.styles.textColor = [217, 119, 6];
        }
      }
    });

    doc.save(`Risk_Summary_${deptObj?.code}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="h-6 w-6 text-blue-600" />
            Report Generation
          </h1>
          <p className="text-sm text-slate-500">Generate printable PDF reports for academic administration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Result Sheet */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Master Result Sheet</h3>
                <p className="text-sm text-slate-500">Comprehensive course result compilation</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
              <select 
                value={filterSession} 
                onChange={e => setFilterSession(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-4">
              <button
                onClick={generateMasterResultSheet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
              >
                <Download className="h-5 w-5" />
                Download Result Sheet (PDF)
              </button>
            </div>
          </div>
        </div>

        {/* Risk Summary Report */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Risk Summary Report</h3>
                <p className="text-sm text-slate-500">Departmental breakdown of at-risk students</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                value={filterDept} 
                onChange={e => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
              <p className="text-sm text-slate-600">
                This report generates a prioritized list of all students in the selected department 
                who are classified as Critical, High, or Moderate risk, including their current CGPA and risk score.
              </p>
            </div>
            
            <div className="pt-4 mt-auto">
              <button
                onClick={generateRiskSummaryReport}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
              >
                <Download className="h-5 w-5" />
                Download Risk Summary (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
