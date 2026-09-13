import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Building2, 
  CalendarDays, 
  CheckSquare, 
  GraduationCap, 
  LineChart, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Settings,
  ClipboardList,
  LogOut
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'Main',
      allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'],
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'] }
      ]
    },
    {
      title: 'Academic Management',
      allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'],
      items: [
        { name: 'Students', icon: Users, path: '/students', allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'] },
        { name: 'Lecturers', icon: Users, path: '/lecturers', allowedRoles: ['ADMIN'] },
        { name: 'Departments', icon: Building2, path: '/departments', allowedRoles: ['ADMIN'] },
        { name: 'Courses', icon: BookOpen, path: '/courses', allowedRoles: ['ADMIN'] },
        { name: 'Course Allocation', icon: CheckSquare, path: '/allocation', allowedRoles: ['ADMIN'] },
        { name: 'Academic Sessions', icon: CalendarDays, path: '/sessions', allowedRoles: ['ADMIN'] },
        { name: 'Course Registration', icon: ClipboardList, path: '/registration', allowedRoles: ['ADMIN'] }
      ]
    },
    {
      title: 'Academic Records',
      allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'],
      items: [
        { name: 'Attendance', icon: CheckSquare, path: '/attendance', allowedRoles: ['ADMIN', 'LECTURER'] },
        { name: 'Enter Results', icon: GraduationCap, path: '/results/enter', allowedRoles: ['ADMIN', 'LECTURER'] },
        { name: 'View Results', icon: FileText, path: '/results/view', allowedRoles: ['ADMIN', 'LECTURER', 'ADVISER'] },
        { name: 'Academic Records', icon: BookOpen, path: '/records', allowedRoles: ['ADMIN', 'ADVISER'] }
      ]
    },
    {
      title: 'Intelligent Analytics',
      allowedRoles: ['ADMIN', 'ADVISER'],
      items: [
        { name: 'Student Performance', icon: LineChart, path: '/analytics/performance', allowedRoles: ['ADMIN', 'ADVISER'] },
        { name: 'Risk Prediction', icon: AlertTriangle, path: '/analytics/risk', allowedRoles: ['ADMIN', 'ADVISER'] },
        { name: 'Recommendations', icon: Lightbulb, path: '/analytics/recommendations', allowedRoles: ['ADMIN', 'ADVISER'] }
      ]
    },
    {
      title: 'System',
      allowedRoles: ['ADMIN'],
      items: [
        { name: 'Reports', icon: FileText, path: '/reports', allowedRoles: ['ADMIN'] },
        { name: 'Settings', icon: Settings, path: '/settings', allowedRoles: ['ADMIN'] }
      ]
    }
  ];

  if (!user) return null;

  return (
    <aside 
      className={`
        w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="p-4 bg-slate-950 flex items-center space-x-3 sticky top-0 z-10 shrink-0">
        <GraduationCap className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Intelligent SMS</h1>
          <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()} Portal</p>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        {menuSections
          .filter(section => section.allowedRoles.includes(user.role))
          .map((section, idx) => {
            const visibleItems = section.items.filter(item => item.allowedRoles.includes(user.role));
            
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="mb-6">
                <h2 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h2>
                <nav className="space-y-1">
                  {visibleItems.map((item, itemIdx) => (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
