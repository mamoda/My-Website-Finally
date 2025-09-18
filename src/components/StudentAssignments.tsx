import React, { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  grade: number;
  feedback: string;
  created_at: string;
  lesson_title: string;
}

const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await apiService.getStudentAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    
    if (isOverdue && status === 'pending') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status) {
      case 'completed':
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    
    if (isOverdue && status === 'pending') {
      return 'متأخر';
    }
    
    const labels: { [key: string]: string } = {
      pending: 'معلق',
      completed: 'مكتمل',
      graded: 'تم التقييم',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    
    if (isOverdue && status === 'pending') {
      return 'bg-red-100 text-red-800';
    }
    
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return assignment.status === 'pending';
    if (filter === 'completed') return assignment.status === 'completed' || assignment.status === 'graded';
    if (filter === 'graded') return assignment.grade !== null;
    return true;
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">واجباتي</h1>
        <p className="text-gray-600">تابع واجباتك ودرجاتك</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1 space-x-reverse">
          {[
            { id: 'all', label: 'الكل', count: assignments.length },
            { id: 'pending', label: 'معلقة', count: assignments.filter(a => a.status === 'pending').length },
            { id: 'completed', label: 'مكتملة', count: assignments.filter(a => a.status === 'completed' || a.status === 'graded').length },
            { id: 'graded', label: 'مُقيمة', count: assignments.filter(a => a.grade !== null).length },
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

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد واجبات في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div 
              key={assignment.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAssignment(assignment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">{assignment.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status, assignment.due_date)}`}>
                      {getStatusLabel(assignment.status, assignment.due_date)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                    {assignment.lesson_title && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 ml-1" />
                        <span>الدرس: {assignment.lesson_title}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 ml-1" />
                      <span>موعد التسليم: {new Date(assignment.due_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    {getStatusIcon(assignment.status, assignment.due_date)}
                  </div>
                  
                  {assignment.grade !== null && (
                    <div className={`text-lg font-bold ${getGradeColor(assignment.grade)}`}>
                      {assignment.grade}/100
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 ml-3" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedAssignment.status, selectedAssignment.due_date)}`}>
                      {getStatusLabel(selectedAssignment.status, selectedAssignment.due_date)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف الواجب</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedAssignment.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">تفاصيل الواجب</h4>
                    <div className="space-y-2 text-sm">
                      {selectedAssignment.lesson_title && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-400 ml-2" />
                          <span>الدرس: {selectedAssignment.lesson_title}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                        <span>موعد التسليم: {new Date(selectedAssignment.due_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                        <span>تم الإنشاء: {new Date(selectedAssignment.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAssignment.grade !== null && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">التقييم</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className={`text-3xl font-bold mb-2 ${getGradeColor(selectedAssignment.grade)}`}>
                          {selectedAssignment.grade}/100
                        </div>
                        {selectedAssignment.feedback && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">تعليقات المعلم:</p>
                            <p className="text-sm text-gray-600">{selectedAssignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedAssignment(null)}
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

export default StudentAssignments;