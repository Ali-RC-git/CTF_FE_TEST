import { Course } from '@/lib/types';
import CourseCard from '@/components/cards/CourseCard';

interface CoursesSectionProps {
  courses: Course[];
  onEnroll?: (courseId: string) => void;
  className?: string;
}

export default function CoursesSection({ courses, onEnroll, className = '' }: CoursesSectionProps) {
  return (
    <div className={`${className}`}>
      {/* Section Title */}
      <h1 className="text-text-primary text-3xl font-bold mb-6">Available Courses</h1>
      
      {/* Description Banner */}
      <div className="bg-secondary-bg rounded-lg p-6 mb-8">
        <p className="text-text-primary text-lg">
          Browse and enroll in available cybersecurity courses.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={onEnroll}
          />
        ))}
      </div>
    </div>
  );
}
