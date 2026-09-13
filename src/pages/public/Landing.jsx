import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  TrendingUp, 
  BarChart4, 
  Users, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-50">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EduCore</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              Portal Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Version 2.0 Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Intelligent Academic <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Management System
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            A comprehensive, role-based platform for modern universities. 
            Manage students, courses, results, and predict academic risks with deterministic analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-0.5"
            >
              Access Portal
              <ChevronRight className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/10 transition-all backdrop-blur-sm"
            >
              Explore Features
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful capabilities for every role</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Designed from the ground up to support Administrators, Lecturers, and Course Advisers with specialized toolsets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default">
              <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Role-Based Access</h3>
              <p className="text-slate-400 leading-relaxed">
                Secure portals tailored for Administrators, Lecturers, and Advisers. Permissions ensure data integrity and privacy across all academic operations.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default">
              <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart4 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Result Management</h3>
              <p className="text-slate-400 leading-relaxed">
                Streamlined entry for CA and Exam scores. Automatic, deterministic calculations for GPA, CGPA, and pass/fail statuses without manual intervention.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default">
              <div className="h-12 w-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Risk Analytics Engine</h3>
              <p className="text-slate-400 leading-relaxed">
                Intelligently analyze student performance histories to detect downward trends and generate academic risk scores (Low, Moderate, High, Critical).
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default">
              <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Student Profiles</h3>
              <p className="text-slate-400 leading-relaxed">
                Comprehensive 360-degree view of every student, compiling their registration data, semester histories, risk levels, and targeted adviser recommendations.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default">
              <div className="h-12 w-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Curriculum Control</h3>
              <p className="text-slate-400 leading-relaxed">
                Full CRUD capabilities for Departments, Sessions, and Courses. Allocate courses to specific lecturers and manage student course registrations easily.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors group cursor-default flex flex-col justify-center items-center text-center">
              <div className="mb-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to explore?</h3>
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 mt-2"
              >
                Access the demo portal
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} EduCore Academic Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
