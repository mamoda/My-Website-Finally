import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Calendar, TrendingUp, Award } from 'lucide-react';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalLessons: 0,
    pendingAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي الطلاب',
      titleEn: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'الطلاب النشطون',
      titleEn: 'Active Students',
      value: stats.activeStudents,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'إجمالي الدروس',
      titleEn: 'Total Lessons',
      value: stats.totalLessons,
      icon: BookOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'الواجبات المعلقة',
      titleEn: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">مرحباً بك في نظام المُعَلِّم </h1>
            <p className="text-green-100 text-lg">إدارة شاملة لنظام تعليمي متكامل</p>
            <p className="text-green-200 mt-2">
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="hidden lg:block">
            <Award className="h-24 w-24 text-green-200" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-gray-500 text-xs">{card.titleEn}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-right">
            <Users className="h-8 w-8 text-blue-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">إضافة طالب جديد</h3>
              <p className="text-sm text-gray-600">تسجيل طالب جديد في النظام</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-right">
            <BookOpen className="h-8 w-8 text-green-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">إنشاء درس جديد</h3>
              <p className="text-sm text-gray-600">إضافة درس جديد للمنهج</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-right">
            <Calendar className="h-8 w-8 text-purple-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">جدولة حصة</h3>
              <p className="text-sm text-gray-600">إضافة حصة جديدة للجدول</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">النشاط الأخير</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
            <div>
              <p className="text-gray-900 font-medium">تم إضافة طالب جديد</p>
              <p className="text-gray-500 text-sm">منذ دقيقتين</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
            <div>
              <p className="text-gray-900 font-medium">تم إنشاء درس جديد في النحو</p>
              <p className="text-gray-500 text-sm">منذ 15 دقيقة</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full ml-3"></div>
            <div>
              <p className="text-gray-900 font-medium">تم تسليم واجب في البلاغة</p>
              <p className="text-gray-500 text-sm">منذ ساعة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;