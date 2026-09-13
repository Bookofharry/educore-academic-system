import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Users, Eye } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import Modal from '../../components/common/Modal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers] = useState([]); // For advisers
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  // risk filter will be implemented in Phase 5 when riskEngine is active
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const loadData = () => {
    setStudents(storageService.getAll(KEYS.STUDENTS));
    setDepartments(storageService.getAll(KEYS.DEPARTMENTS));
    setLecturers(storageService.getAll(KEYS.LECTURERS));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (student = null) => {
    setEditingStudent(student);
    if (student) {
      reset(student);
    } else {
      reset({ 
        firstName: '', lastName: '', matricNumber: '', email: '', 
        phone: '', gender: 'Male', departmentId: '', level: 100, 
        admissionYear: new Date().getFullYear(), adviserId: '', status: 'ACTIVE' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    reset();
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      level: parseInt(data.level),
      admissionYear: parseInt(data.admissionYear)
    };

    if (editingStudent) {
      storageService.update(KEYS.STUDENTS, editingStudent.id, formattedData);
    } else {
      storageService.create(KEYS.STUDENTS, formattedData);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      storageService.delete(KEYS.STUDENTS, id);
      loadData();
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.code : 'N/A';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.firstName.toLowerCase().includes(search.toLowerCase()) || 
                          s.lastName.toLowerCase().includes(search.toLowerCase()) || 
                          s.matricNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept ? s.departmentId === filterDept : true;
    const matchesLevel = filterLevel ? s.level === parseInt(filterLevel) : true;
    
    return matchesSearch && matchesDept && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Students
          </h1>
          <p className="text-sm text-slate-500">Manage student records and profiles</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex justify-center items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              className="flex-1 lg:flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
            
            <select 
              value={filterLevel} 
              onChange={e => setFilterLevel(e.target.value)}
              className="flex-1 lg:flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>

            <select disabled className="flex-1 lg:flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400" title="Available in Phase 5">
              <option>Risk: All</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3">Matric No.</th>
                <th className="px-4 sm:px-6 py-3">Name</th>
                <th className="px-4 sm:px-6 py-3">Dept</th>
                <th className="px-4 sm:px-6 py-3 text-center">Level</th>
                <th className="px-4 sm:px-6 py-3 text-center">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{student.matricNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getDepartmentName(student.departmentId)}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{student.level}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                         {student.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(student)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input 
                {...register('firstName', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input 
                {...register('lastName', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matric Number</label>
              <input 
                {...register('matricNumber', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email"
                {...register('email', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input 
                {...register('phone')} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select 
                {...register('gender')} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                {...register('departmentId', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Dept...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select 
                {...register('level')} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Adviser</label>
              <select 
                {...register('adviserId')} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Adviser...</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.title} {l.firstName} {l.lastName}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                {...register('status')} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editingStudent ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
