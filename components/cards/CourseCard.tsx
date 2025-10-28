import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  className?: string;
}

export default function CourseCard({ course, onEnroll, className = '' }: CourseCardProps) {
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'cybersecurity':
        return (
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
          </div>
        );
      case 'web_security':
        return (
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'network':
        return (
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'forensics':
        return (
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2-4a2 2 0 114 0 2 2 0 01-4 0zm6 4a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`bg-secondary-bg rounded-lg p-6 flex flex-col h-full ${className}`}>
      {/* Icon */}
      <div className="mb-4">
        {getIconComponent(course.icon)}
      </div>

      {/* Title */}
      <h3 className="text-text-primary font-bold text-lg mb-3">
        {course.title}
      </h3>

      {/* Description */}
      <p className="text-text-primary text-sm opacity-80 leading-relaxed mb-4 flex-1">
        {course.description}
      </p>

      {/* Modules and Enroll Button */}
      <div className="flex justify-between items-center">
        <span className="text-text-primary text-sm">
          {course.modules} Modules
        </span>
        <button
          onClick={() => onEnroll?.(course.id)}
          className="bg-accent-color hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors duration-200 text-sm font-medium"
        >
          Enroll
        </button>
      </div>
    </div>
  );
}
