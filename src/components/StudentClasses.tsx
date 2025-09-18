import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Class {
  id: number;
  title: string;
  lesson_id: number;
  scheduled_date: string;
  duration: number;
  status: string;
  notes: string;
  lesson_title: string;
}

const StudentClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await apiService.getStudentClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      scheduled: 'مجدولة',
      completed: 'مكتملة',
      cancelled: 'ملغية',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const isToday = (date: string) => {
    const today = new Date();
    const classDate = new Date(date);
    return (
      classDate.getDate() === today.getDate() &&
      classDate.getMonth() === today.getMonth() &&
      classDate.getFullYear() === today.getFullYear()
    );
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const filteredClasses = classes.filter(classItem => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(classItem.scheduled_date);
    if (filter === 'completed') return classItem.status === 'completed';
    if (filter === 'today') return isToday(classItem.scheduled_date);
    return true;
  });

  const groupClassesByDate = (classes: Class[]) => {
    const grouped: { [key: string]: Class[] } = {};
    classes.forEach((cls) => {
      const date = new Date(cls.scheduled_date).toLocaleDateString('ar-SA');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(cls);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedClasses = groupClassesByDate(filteredClasses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">حصصي</h1>
        <p className="text-gray-600">جدول حصصك ومواعيدها</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1 space-x-reverse">
          {[
            { id: 'all', label: 'الكل', count: classes.length },
            { id: 'today', label: 'اليوم', count: classes.filter(c => isToday(c.scheduled_date)).length },
            { id: 'upcoming', label: 'القادمة', count: classes.filter(c => isUpcoming(c.scheduled_date)).length },
            { id: 'completed', label: 'المكتملة', count: classes.filter(c => c.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      {Object.keys(groupedClasses).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد حصص في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClasses)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, dayClasses]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className={`px-6 py-4 border-b border-gray-200 ${isToday(dayClasses[0].scheduled_date) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 ml-2" />
                      <h3 className={`text-lg font-semibold ${isToday(dayClasses[0].scheduled_date) ? 'text-blue-800' : 'text-gray-900'}`}>
                        {date}
                        {isToday(dayClasses[0].scheduled_date) && (
                          <span className="mr-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                            اليوم
                          </span>
                        )}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dayClasses.length} حصة
                    </span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {dayClasses
                    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                    .map((classItem) => (
                      <div 
                        key={classItem.id} 
                        className="p-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedClass(classItem)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-lg font-medium text-gray-900 ml-3">
                                {classItem.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                                {getStatusLabel(classItem.status)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                              {classItem.lesson_title && (
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 ml-1" />
                                  <span>الدرس: {classItem.lesson_title}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 ml-1" />
                                <span>المدة: {classItem.duration} دقيقة</span>
                              </div>
                            </div>
                            
                            {classItem.notes && (
                              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                                <p className="text-sm text-gray-700">{classItem.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right flex items-center">
                            {getStatusIcon(classItem.status)}
                            <div className="mr-3">
                              <div className="text-lg font-semibold text-gray-900">
                                {new Date(classItem.scheduled_date).toLocaleTimeString('ar-SA', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Class Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600 ml-3" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClass.title}</h2>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedClass.status)}`}>
                      {getStatusLabel(selectedClass.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">تفاصيل الحصة</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                        <span>التاريخ: {new Date(selectedClass.scheduled_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span>الوقت: {new Date(selectedClass.scheduled_date).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span>المدة: {selectedClass.duration} دقيقة</span>
                      </div>
                      {selectedClass.lesson_title && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 ml-2" />
                          <span>الدرس: {selectedClass.lesson_title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">الحالة</h4>
                    <div className="flex items-center">
                      {getStatusIcon(selectedClass.status)}
                      <span className="mr-2">{getStatusLabel(selectedClass.status)}</span>
                    </div>
                    {isToday(selectedClass.scheduled_date) && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">حصة اليوم</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedClass.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">ملاحظات</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedClass.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentClasses;