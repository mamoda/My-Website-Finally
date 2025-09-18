import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAssignments: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      averageGrade: 0,
      upcomingClasses: 0,
    },
    recentAssignments: [],
    upcomingClasses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getStudentDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي الواجبات',
      titleEn: 'Total Assignments',
      value: dashboardData.stats.totalAssignments,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'الواجبات المعلقة',
      titleEn: 'Pending Assignments',
      value: dashboardData.stats.pendingAssignments,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'الواجبات المكتملة',
      titleEn: 'Completed Assignments',
      value: dashboardData.stats.completedAssignments,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'متوسط الدرجات',
      titleEn: 'Average Grade',
      value: `${dashboardData.stats.averageGrade}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'معلق',
      completed: 'مكتمل',
      graded: 'تم التقييم',
      overdue: 'متأخر',
    };
    return labels[status] || status;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">مرحباً بك في بوابة الطالب</h1>
            <p className="text-blue-100 text-lg">تابع تقدمك في تعلم اللغة العربية</p>
            <p className="text-blue-200 mt-2">
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="hidden lg:block">
            <BookOpen className="h-24 w-24 text-blue-200" />
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

      {/* Recent Assignments and Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">الواجبات الأخيرة</h2>
          {dashboardData.recentAssignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا يوجد واجبات حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">{assignment.lesson_title}</p>
                    <p className="text-xs text-gray-500">
                      موعد التسليم: {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(isOverdue(assignment.due_date) && assignment.status === 'pending' ? 'overdue' : assignment.status)}
                    <span className="text-sm text-gray-600 mr-2">
                      {getStatusLabel(isOverdue(assignment.due_date) && assignment.status === 'pending' ? 'overdue' : assignment.status)}
                    </span>
                    {assignment.grade && (
                      <span className="text-sm font-medium text-green-600 mr-3">
                        {assignment.grade}/100
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">الحصص القادمة</h2>
          {dashboardData.upcomingClasses.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا يوجد حصص مجدولة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.upcomingClasses.map((classItem: any) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                    <p className="text-sm text-gray-600">{classItem.lesson_title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(classItem.scheduled_date).toLocaleDateString('ar-SA')} - {' '}
                      {new Date(classItem.scheduled_date).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-blue-600 font-medium">
                      {classItem.duration} دقيقة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-right cursor-pointer">
            <BookOpen className="h-8 w-8 text-blue-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">مراجعة الدروس</h3>
              <p className="text-sm text-gray-600">استعرض دروسك المتاحة</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-right cursor-pointer">
            <FileText className="h-8 w-8 text-green-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">الواجبات</h3>
              <p className="text-sm text-gray-600">تابع واجباتك ودرجاتك</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-right cursor-pointer">
            <Calendar className="h-8 w-8 text-purple-600 ml-4" />
            <div>
              <h3 className="font-semibold text-gray-900">جدول الحصص</h3>
              <p className="text-sm text-gray-600">اطلع على مواعيد حصصك</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;