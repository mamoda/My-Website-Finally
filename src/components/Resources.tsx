import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload, Download, BookOpen, Video, FileAudio } from 'lucide-react';
import { apiService } from '../services/api';

interface Resource {
  id: number;
  title: string;
  type: string;
  file_path: string;
  description: string;
  level: string;
  created_at: string;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'document',
    description: '',
    level: 'beginner',
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await apiService.getResources();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const resourceFormData = new FormData();
    resourceFormData.append('title', formData.title);
    resourceFormData.append('type', formData.type);
    resourceFormData.append('description', formData.description);
    resourceFormData.append('level', formData.level);
    
    if (selectedFile) {
      resourceFormData.append('file', selectedFile);
    }

    try {
      await apiService.createResource(resourceFormData);
      await loadResources();
      resetForm();
    } catch (error) {
      console.error('Failed to save resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'document',
      description: '',
      level: 'beginner',
    });
    setSelectedFile(null);
    setShowModal(false);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-purple-500" />;
      case 'worksheet':
        return <BookOpen className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      document: 'مستند',
      video: 'فيديو',
      audio: 'صوتي',
      worksheet: 'ورقة عمل',
    };
    return labels[type] || type;
  };

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

  const handleDownload = (resource: Resource) => {
    if (resource.file_path) {
      // In a real application, this would download the file
      window.open(`http://localhost:3001/${resource.file_path}`, '_blank');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">مكتبة المصادر</h1>
          <p className="text-gray-600">إدارة المواد التعليمية والمصادر</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مصدر جديد
        </button>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد مصادر تعليمية متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    {getResourceIcon(resource.type)}
                    <div className="mr-3">
                      <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{getTypeLabel(resource.type)}</p>
                    </div>
                  </div>
                  
                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
                  {getLevelLabel(resource.level)}
                </span>
                
                {resource.file_path && (
                  <button
                    onClick={() => handleDownload(resource)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500">
                تم الإضافة: {new Date(resource.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة مصدر تعليمي جديد</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان المصدر
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="مثال: كتاب قواعد النحو"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المصدر
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="document">مستند</option>
                  <option value="video">فيديو</option>
                  <option value="audio">صوتي</option>
                  <option value="worksheet">ورقة عمل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستوى
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="وصف موجز للمصدر التعليمي"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رفع الملف (اختياري)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">انقر للرفع</span> أو اسحب الملف هنا
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, MP4, MP3 (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.mp4,.mp3,.wav"
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    تم تحديد الملف: {selectedFile.name}
                  </p>
                )}
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
                  إضافة المصدر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;