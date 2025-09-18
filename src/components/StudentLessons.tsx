import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Target, Search } from 'lucide-react';
import { apiService } from '../services/api';

interface Lesson {
  id: number;
  title: string;
  description: string;
  level: string;
  content: string;
  duration: number;
  created_at: string;
}

const StudentLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const data = await apiService.getStudentLessons();
      setLessons(data);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">دروسي</h1>
        <p className="text-gray-600">الدروس المتاحة لمستواك الحالي</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="البحث في الدروس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد دروس متاحة لمستواك حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div 
              key={lesson.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedLesson(lesson)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{lesson.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}>
                  {getLevelLabel(lesson.level)}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="h-4 w-4 ml-1" />
                  {lesson.duration} دقيقة
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>تم الإضافة: {new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                <div className="flex items-center">
                  <Target className="h-3 w-3 ml-1" />
                  <span>درس تفاعلي</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 ml-3" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
                    <p className="text-gray-600">{selectedLesson.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedLesson.level)}`}>
                  {getLevelLabel(selectedLesson.level)}
                </span>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 ml-1" />
                  <span>{selectedLesson.duration} دقيقة</span>
                </div>
              </div>

              {selectedLesson.content && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">محتوى الدرس</h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedLesson.content}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedLesson(null)}
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

export default StudentLessons;