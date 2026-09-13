import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Search, Users, BookOpen } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import Modal from '../../components/common/Modal';

const Lecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = () => {
    setLecturers(storageService.getAll(KEYS.LECTURERS));
    setDepartments(storageService.getAll(KEYS.DEPARTMENTS));
    setAllocations(storageService.getAll(KEYS.ALLOCATIONS));
    setCourses(storageService.getAll(KEYS.COURSES));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (lecturer = null) => {
    setEditingLecturer(lecturer);
    if (lecturer) {
      reset(lecturer);
    } else {
      reset({ title: 'Mr.', firstName: '', lastName: '', email: '', departmentId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLecturer(null);
    reset();
  };

  const handleOpenCoursesModal = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsCoursesModalOpen(true);
  };

  const handleCloseCoursesModal = () => {
    setIsCoursesModalOpen(false);
    setSelectedLecturer(null);
  };

  const onSubmit = (data) => {
    if (editingLecturer) {
      storageService.update(KEYS.LECTURERS, editingLecturer.id, data);
    } else {
      storageService.create(KEYS.LECTURERS, data);
    }
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lecturer?')) {
      storageService.delete(KEYS.LECTURERS, id);
      loadData();
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  const getLecturerCourses = (lecturerId) => {
    const lecturerAllocations = allocations.filter(a => a.lecturerId === lecturerId);
    return lecturerAllocations.map(alloc => {
      const course = courses.find(c => c.id === alloc.courseId);
      return {
        ...alloc,
        courseCode: course?.code || 'Unknown',
        courseTitle: course?.title || 'Unknown',
        creditUnit: course?.creditUnit || 0
      };
    });
  };

  const filteredLecturers = lecturers.filter(l => 
    l.firstName.toLowerCase().includes(search.toLowerCase()) ||
    l.lastName.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Lecturers
          </h1>
          <p className="text-sm text-slate-500">Manage teaching staff and advisers</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Lecturer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredLecturers.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3">Name</th>
                <th className="px-4 sm:px-6 py-3">Email</th>
                <th className="px-4 sm:px-6 py-3">Department</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLecturers.length > 0 ? (
                filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {lecturer.title} {lecturer.firstName} {lecturer.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{lecturer.email}</td>
                    <td className="px-6 py-4 text-slate-600">{getDepartmentName(lecturer.departmentId)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenCoursesModal(lecturer)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="View Allocated Courses"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(lecturer)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(lecturer.id)}
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
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No lecturers found.
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
        title={editingLecturer ? 'Edit Lecturer' : 'Add Lecturer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <select 
                {...register('title', { required: 'Title required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input 
                {...register('firstName', { required: 'Required' })} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName.message}</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input 
              {...register('lastName', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email"
              {...register('email', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select 
              {...register('departmentId', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.departmentId && <span className="text-xs text-red-500 mt-1">{errors.departmentId.message}</span>}
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
              {editingLecturer ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Courses Modal */}
      <Modal 
        isOpen={isCoursesModalOpen} 
        onClose={handleCloseCoursesModal} 
        title={`Allocated Courses: ${selectedLecturer?.title} ${selectedLecturer?.firstName} ${selectedLecturer?.lastName}`}
        maxWidth="max-w-2xl"
      >
        {selectedLecturer && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-2 border-b border-slate-200">Course Code</th>
                  <th className="px-4 py-2 border-b border-slate-200">Title</th>
                  <th className="px-4 py-2 border-b border-slate-200 text-center">Unit</th>
                  <th className="px-4 py-2 border-b border-slate-200">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getLecturerCourses(selectedLecturer.id).length > 0 ? (
                  getLecturerCourses(selectedLecturer.id).map((course, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{course.courseCode}</td>
                      <td className="px-4 py-3 text-slate-700">{course.courseTitle}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{course.creditUnit}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {course.semester === 1 ? '1st' : '2nd'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-500 italic">
                      No courses allocated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <button 
                onClick={handleCloseCoursesModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Lecturers;
