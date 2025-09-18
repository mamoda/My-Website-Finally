import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, User, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  student_id: number;
  lesson_id: number;
  due_date: string;
  status: string;
  grade: number;
  feedback: string;
  created_at: string;
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

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    student_id: '',
    lesson_id: '',
    due_date: '',
  });

  const [gradeData, setGradeData] = useState({
    status: 'completed',
    grade: '',
    feedback: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, studentsData, lessonsData] = await Promise.all([
        apiService.getAssignments(),
        apiService.getStudents(),
        apiService.getLessons(),
      ]);
      
      setAssignments(assignmentsData);
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
      await apiService.createAssignment(formData);
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    try {
      await apiService.updateAssignment(selectedAssignment.id, gradeData);
      await loadData();
      resetGradeForm();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      student_id: '',
      lesson_id: '',
      due_date: '',
    });
    setShowModal(false);
  };

  const resetGradeForm = () => {
    setGradeData({
      status: 'completed',
      grade: '',
      feedback: '',
    });
    setSelectedAssignment(null);
    setShowGradeModal(false);
  };

  const handleGrade = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setGradeData({
      status: assignment.status || 'completed',
      grade: assignment.grade?.toString() || '',
      feedback: assignment.feedback || '',
    });
    setShowGradeModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
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
      overdue: 'متأخر',
      graded: 'تم التقييم',
    };
    return labels[status] || status;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الواجبات</h1>
          <p className="text-gray-600">إدارة الواجبات والتقييمات</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة واجب جديد
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {assignments.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد واجبات مُضافة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الواجب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ التسليم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرجة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500">{assignment.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-900">{assignment.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-900">{assignment.lesson_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                        <span className={`text-sm ${isOverdue(assignment.due_date) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(isOverdue(assignment.due_date) && assignment.status === 'pending' ? 'overdue' : assignment.status)}
                        <span className="text-sm text-gray-900 mr-2">
                          {getStatusLabel(isOverdue(assignment.due_date) && assignment.status === 'pending' ? 'overdue' : assignment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.grade !== null ? (
                        <span className="text-sm font-medium text-green-600">
                          {assignment.grade}/100
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">غير مُقيم</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleGrade(assignment)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        تقييم
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة واجب جديد</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الواجب
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="مثال: تمارين النحو"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  وصف الواجب
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="وصف تفصيلي للواجب المطلوب"
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
                  تاريخ التسليم
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
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
                  إضافة الواجب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              تقييم الواجب: {selectedAssignment.title}
            </h2>
            
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  حالة الواجب
                </label>
                <select
                  value={gradeData.status}
                  onChange={(e) => setGradeData({ ...gradeData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pending">معلق</option>
                  <option value="completed">مكتمل</option>
                  <option value="graded">تم التقييم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الدرجة (من 100)
                </label>
                <input
                  type="number"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max="100"
                  placeholder="مثال: 85"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تعليقات وملاحظات
                </label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="اكتب تعليقاتك على أداء الطالب..."
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={resetGradeForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  حفظ التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;