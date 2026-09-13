import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Search, CheckSquare } from 'lucide-react';
import { storageService, KEYS } from '../../services/storage';
import Modal from '../../components/common/Modal';

const CourseAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = () => {
    setAllocations(storageService.getAll(KEYS.ALLOCATIONS));
    setLecturers(storageService.getAll(KEYS.LECTURERS));
    setCourses(storageService.getAll(KEYS.COURSES));
    
    const sess = storageService.getAll(KEYS.SESSIONS);
    setSessions(sess);
    
    const activeSess = sess.find(s => s.status === 'ACTIVE');
    if (activeSess && !filterSession) {
      setFilterSession(activeSess.id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    reset({ lecturerId: '', courseId: '', sessionId: filterSession, semester: 1 });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = (data) => {
    // Check if this specific course allocation already exists
    const exists = allocations.find(
      a => a.courseId === data.courseId && a.sessionId === data.sessionId
    );
    
    if (exists) {
      alert('This course is already allocated in the selected session. Delete the existing allocation first.');
      return;
    }

    const formattedData = {
      ...data,
      semester: parseInt(data.semester)
    };

    storageService.create(KEYS.ALLOCATIONS, formattedData);
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this course allocation?')) {
      storageService.delete(KEYS.ALLOCATIONS, id);
      loadData();
    }
  };

  const getLecturerName = (id) => {
    const l = lecturers.find(x => x.id === id);
    return l ? `${l.title} ${l.firstName} ${l.lastName}` : 'Unknown';
  };

  const getCourseDetails = (id) => {
    const c = courses.find(x => x.id === id);
    return c ? `${c.code} - ${c.title}` : 'Unknown';
  };

  const getSessionName = (id) => {
    const s = sessions.find(x => x.id === id);
    return s ? s.name : 'Unknown';
  };

  const filteredAllocations = allocations.filter(a => {
    const lecturerName = getLecturerName(a.lecturerId).toLowerCase();
    const courseCode = getCourseDetails(a.courseId).toLowerCase();
    
    const matchesSearch = lecturerName.includes(search.toLowerCase()) || courseCode.includes(search.toLowerCase());
    const matchesSession = filterSession ? a.sessionId === filterSession : true;
    
    return matchesSearch && matchesSession;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            Course Allocation
          </h1>
          <p className="text-sm text-slate-500">Assign lecturers to courses for academic sessions</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Allocate Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by lecturer or course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select 
            value={filterSession} 
            onChange={e => setFilterSession(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Sessions</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3">Course</th>
                <th className="px-4 sm:px-6 py-3">Lecturer</th>
                <th className="px-4 sm:px-6 py-3">Session</th>
                <th className="px-4 sm:px-6 py-3">Semester</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{getCourseDetails(allocation.courseId)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{getLecturerName(allocation.lecturerId)}</td>
                    <td className="px-6 py-4 text-slate-600">{getSessionName(allocation.sessionId)}</td>
                    <td className="px-6 py-4 text-slate-600">{allocation.semester === 1 ? '1st' : '2nd'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => handleDelete(allocation.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Remove Allocation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No course allocations found for the selected filters.
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
        title="Allocate Course to Lecturer"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
            <select 
              {...register('sessionId', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Session...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.sessionId && <span className="text-xs text-red-500 mt-1">{errors.sessionId.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
            <select 
              {...register('semester', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
            <select 
              {...register('courseId', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>
            {errors.courseId && <span className="text-xs text-red-500 mt-1">{errors.courseId.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lecturer</label>
            <select 
              {...register('lecturerId', { required: 'Required' })} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Lecturer...</option>
              {lecturers.map(l => (
                <option key={l.id} value={l.id}>{l.title} {l.firstName} {l.lastName}</option>
              ))}
            </select>
            {errors.lecturerId && <span className="text-xs text-red-500 mt-1">{errors.lecturerId.message}</span>}
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
              Allocate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseAllocation;
