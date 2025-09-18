import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, FileText, BarChart3, Settings, User, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentAssignments from './components/StudentAssignments';
import StudentLessons from './components/StudentLessons';
import StudentClasses from './components/StudentClasses';
import Students from './components/Students';
import Lessons from './components/Lessons';
import Assignments from './components/Assignments';
import Classes from './components/Classes';
import Resources from './components/Resources';
import Login from './components/Login';
import { authService } from './services/authService';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const studentData = localStorage.getItem('student');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else if (token && studentData) {
      setStudent(JSON.parse(studentData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleStudentLogin = (studentData) => {
    setStudent(studentData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setStudent(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user && !student) {
    return <Login onLogin={handleLogin} onStudentLogin={handleStudentLogin} />;
  }

  // Student Portal
  if (student) {
    const studentMenuItems = [
      { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 },
      { id: 'lessons', label: 'الدروس', labelEn: 'My Lessons', icon: BookOpen },
      { id: 'assignments', label: 'الواجبات', labelEn: 'My Assignments', icon: FileText },
      { id: 'classes', label: 'الحصص', labelEn: 'My Classes', icon: Calendar },
    ];

    const renderStudentPage = () => {
      switch (currentPage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'lessons':
          return <StudentLessons />;
        case 'assignments':
          return <StudentAssignments />;
        case 'classes':
          return <StudentClasses />;
        default:
          return <StudentDashboard />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {/* Student Sidebar */}
        <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg">
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-blue-700 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">بوابة الطالب</h1>
                <p className="text-blue-200 text-sm">Student Portal</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            {studentMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-right hover:bg-blue-700 transition-colors ${
                    currentPage === item.id ? 'bg-blue-700 border-r-4 border-blue-400' : ''
                  }`}
                >
                  <Icon className="h-5 w-5 ml-3" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-blue-200">{item.labelEn}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{student?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                title="تسجيل خروج"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Student Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {studentMenuItems.find(item => item.id === currentPage)?.label || 'لوحة التحكم'}
              </h2>
              <p className="text-gray-600 mt-1">
                {studentMenuItems.find(item => item.id === currentPage)?.labelEn || 'Dashboard'}
              </p>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {renderStudentPage()}
          </main>
        </div>
      </div>
    );
  }

  // Teacher Portal
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'الطلاب', labelEn: 'Students', icon: Users },
    { id: 'lessons', label: 'الدروس', labelEn: 'Lessons', icon: BookOpen },
    { id: 'assignments', label: 'الواجبات', labelEn: 'Assignments', icon: FileText },
    { id: 'classes', label: 'الحصص', labelEn: 'Classes', icon: Calendar },
    { id: 'resources', label: 'المصادر', labelEn: 'Resources', icon: Settings },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'lessons':
        return <Lessons />;
      case 'assignments':
        return <Assignments />;
      case 'classes':
        return <Classes />;
      case 'resources':
        return <Resources />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-lg">
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-green-700 rounded-lg">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">معلم العربية</h1>
              <p className="text-green-200 text-sm">Arabic Teacher Pro</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center px-6 py-3 text-right hover:bg-green-700 transition-colors ${
                  currentPage === item.id ? 'bg-green-700 border-r-4 border-green-400' : ''
                }`}
              >
                <Icon className="h-5 w-5 ml-3" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-green-200">{item.labelEn}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-green-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-green-800 rounded-lg transition-colors"
              title="تسجيل خروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.id === currentPage)?.label || 'لوحة التحكم'}
            </h2>
            <p className="text-gray-600 mt-1">
              {menuItems.find(item => item.id === currentPage)?.labelEn || 'Dashboard'}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;