import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

interface Class {
  id: number;
  title: string;
  student_id: number;
  lesson_id: number;
  scheduled_date: string;
  duration: number;
  status: string;
  notes: string;
  student_name: string;
  lesson_title: string;
}

interface Student {
  id: number;
  name: string;
}

interface Lesson {
  id: number;
  title: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    student_id: '',
    lesson_id: '',
    scheduled_date: '',
    duration: 60,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, studentsData, lessonsData] = await Promise.all([
        apiService.getClasses(),
        apiService.getStudents(),
        apiService.getLessons(),
      ]);
      
      setClasses(classesData);
      setStudents(studentsData.filter((s: any) => s.status === 'active'));
      setLessons(lessonsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createClass(formData);
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save class:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      student_id: '',
      lesson_id: '',
      scheduled_date: '',
      duration: 60,
      notes: '',
    });
    setShowModal(false);
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

  const isToday = (date: string) => {
    const today = new Date();
    const classDate = new Date(date);
    return (
      classDate.getDate() === today.getDate() &&
      classDate.getMonth() === today.getMonth() &&
      classDate.getFullYear() === today.getFullYear()
    );
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const groupedClasses = groupClassesByDate(classes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحصص الدراسية</h1>
          <p className="text-gray-600">إدارة جدولة الحصص والمواعيد</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 ml-2" />
          جدولة حصة جديدة
        </button>
      </div>

      {/* Classes List */}
      {Object.keys(groupedClasses).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد حصص مجدولة حالياً</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClasses)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, dayClasses]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className={`px-6 py-4 border-b border-gray-200 ${isToday(dayClasses[0].scheduled_date) ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 ml-2" />
                      <h3 className={`text-lg font-semibold ${isToday(dayClasses[0].scheduled_date) ? 'text-green-800' : 'text-gray-900'}`}>
                        {date}
                        {isToday(dayClasses[0].scheduled_date) && (
                          <span className="mr-2 text-sm bg-green-600 text-white px-2 py-1 rounded-full">
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
                    .map((cls) => (
                      <div key={cls.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-lg font-medium text-gray-900 ml-3">
                                {cls.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
                                {getStatusLabel(cls.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="h-4 w-4 ml-1" />
                                <span>الطالب: {cls.student_name}</span>
                              </div>
                              
                              {cls.lesson_title && (
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 ml-1" />
                                  <span>الدرس: {cls.lesson_title}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 ml-1" />
                                <span>المدة: {cls.duration} دقيقة</span>
                              </div>
                            </div>
                            
                            {cls.notes && (
                              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                                <p className="text-sm text-gray-700">{cls.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {new Date(cls.scheduled_date).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">جدولة حصة جديدة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الحصة
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="مثال: حصة النحو الأسبوعية"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الطالب
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر الطالب</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الدرس المرتبط
                </label>
                <select
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">اختر الدرس (اختياري)</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ ووقت الحصة
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مدة الحصة (بالدقائق)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={30}>30 دقيقة</option>
                  <option value={45}>45 دقيقة</option>
                  <option value={60}>ساعة</option>
                  <option value={90}>ساعة ونصف</option>
                  <option value={120}>ساعتان</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="أي ملاحظات أو تفاصيل إضافية..."
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  جدولة الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;