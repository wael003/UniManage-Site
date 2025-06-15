
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  grade: string;
  points: number;
  semester: string;
  instructor: string;
}

interface GradesContextType {
  grades: Grade[];
  updateGrade: (gradeId: string, newGrade: string, newPoints: number) => void;
}

const GradesContext = createContext<GradesContextType | undefined>(undefined);

const initialGrades: Grade[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'John Smith',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    grade: 'A',
    points: 4.0,
    semester: 'Fall 2024',
    instructor: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    studentId: 'STU001',
    studentName: 'John Smith',
    courseId: 'MATH201',
    courseName: 'Calculus II',
    grade: 'B+',
    points: 3.3,
    semester: 'Fall 2024',
    instructor: 'Prof. Michael Brown'
  },
  {
    id: '3',
    studentId: 'STU002',
    studentName: 'Emma Johnson',
    courseId: 'BUS301',
    courseName: 'Business Strategy',
    grade: 'A-',
    points: 3.7,
    semester: 'Fall 2024',
    instructor: 'Dr. Emma Wilson'
  },
  {
    id: '4',
    studentId: 'STU003',
    studentName: 'Michael Davis',
    courseId: 'PHY201',
    courseName: 'Physics for Engineers',
    grade: 'B',
    points: 3.0,
    semester: 'Fall 2024',
    instructor: 'Dr. James Davis'
  },
  {
    id: '5',
    studentId: 'STU002',
    studentName: 'Emma Johnson',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    grade: 'A',
    points: 4.0,
    semester: 'Fall 2024',
    instructor: 'Dr. Sarah Johnson'
  }
];

export const GradesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);

  const updateGrade = (gradeId: string, newGrade: string, newPoints: number) => {
    setGrades(prev => prev.map(grade => 
      grade.id === gradeId 
        ? { ...grade, grade: newGrade, points: newPoints }
        : grade
    ));
  };

  return (
    <GradesContext.Provider value={{ grades, updateGrade }}>
      {children}
    </GradesContext.Provider>
  );
};

export const useGrades = () => {
  const context = useContext(GradesContext);
  if (context === undefined) {
    throw new Error('useGrades must be used within a GradesProvider');
  }
  return context;
};
