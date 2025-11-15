import React, { useState } from 'react';
import { BookOpen, User, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onLogin: (user: User | null) => void;
  onStudentLogin: (student: Student | null) => void;
}

interface User {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface Student {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  level?: string;
  enrollment_date?: string;
  status?: string;
  notes?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onStudentLogin }) => {
  const [email, setEmail] = useState('admin@arabicteacher.com');
  const [password, setPassword] = useState('admin123');
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isStudentLogin) {
        const student = await authService.studentLogin(email, password);
        onStudentLogin(student);
      } else {
        const user = await authService.login(email, password);
        onLogin(user);
      }
    } catch (error) {
      console.error(error);
      setError('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const switchLoginType = () => {
    setIsStudentLogin(!isStudentLogin);
    setError('');
    if (isStudentLogin) {
      setEmail('admin@arabicteacher.com');
      setPassword('admin123');
    } else {
      setEmail('student@example.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${isStudentLogin ? 'from-blue-600 to-blue-700' : 'from-green-600 to-emerald-600'} rounded-2xl flex items-center justify-center mb-4`}>
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isStudentLogin ? 'بوابة الطالب' : ' المُعَلِّم'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isStudentLogin ? 'Student Portal' : 'Arabic Teacher Pro'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isStudentLogin ? 'بوابة الطلاب لمتابعة الدروس والواجبات' : 'نظام إدارة العملية التعليمية  '}
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => !isStudentLogin && switchLoginType()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isStudentLogin 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              معلم
            </button>
            <button
              type="button"
              onClick={() => isStudentLogin && switchLoginType()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isStudentLogin 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              طالب
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 ml-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder={isStudentLogin ? "student@example.com" : "admin@arabicteacher.com"}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" dir="rtl">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${isStudentLogin ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-200' : 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-200'} text-white py-3 px-4 rounded-lg font-medium focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            نظام إدارة العملية التعليمية للمعلمين في جمهورية مصر العربية والمملكة العربية السعودية
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;