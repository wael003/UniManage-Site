import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, GraduationCap, Mail, Phone, Calendar, MapPin, Award,
  BookOpen, TrendingUp, FileText, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AcademicReportModal from '@/components/AcademicReportModal';

type GPAType = {
  student: string;
  studentId: number;
  GPA: string;
};

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

interface SemesterData {
  semester: string;
  courses: Course[];
}

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [gpa, setGPA] = useState<GPAType | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [structuredEnrollmentHistory, setStructuredEnrollmentHistory] = useState<SemesterData[]>([]);

  // Define the target semester for current enrollment and specific counts
  const CURRENT_TARGET_SEMESTER = 'Spring 2025';

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/students/${id}`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const result = await res.json();
        setStudent(result.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudent(null);
      }
    };

    const fetchGrades = async () => {
      try {
        const res = await fetch(`http://localhost:3000/grades/${id}`);
        if (!res.ok) throw new Error("Failed to fetch grades");
        const json = await res.json();

        if (Array.isArray(json.data)) {
          setGrades(json.data);
        } else {
          setGrades([]);
          console.error("Expected json.data to be an array:", json);
        }
      } catch (error) {
        console.error("Error fetching grades data:", error);
        setGrades([]);
      }
    };

    const fetchGPA = async () => {
      try {
        const res = await fetch(`http://localhost:3000/grades/gpa/${id}`);
        if (!res.ok) throw new Error("Failed to fetch GPA");
        const result = await res.json();
        setGPA(result);
      } catch (error) {
        console.error("Error fetching GPA data:", error);
        setGPA(null);
      }
    };

    fetchStudent();
    fetchGrades();
    fetchGPA();
  }, [id]);

  useEffect(() => {
    if (grades.length > 0) {
      const semestersMap = new Map<string, Course[]>();

      grades.forEach(grade => {
        const semesterName = grade.course.semester;
        if (!semestersMap.has(semesterName)) {
          semestersMap.set(semesterName, []);
        }
        semestersMap.get(semesterName)?.push({
          id: grade.course.courseId,
          name: grade.course.name,
          grade: String(grade.grade),
          credits: grade.credits || 3,
        });
      });

      const sortedSemesters = Array.from(semestersMap.entries())
        .map(([semester, courses]) => ({ semester, courses }))
        .sort((a, b) => {
          // Simple string comparison for semester sorting
          if (a.semester < b.semester) return -1;
          if (a.semester > b.semester) return 1;
          return 0;
        });

      setStructuredEnrollmentHistory(sortedSemesters);
    } else {
      setStructuredEnrollmentHistory([]);
    }
  }, [grades]);

  if (!student) return <div className="p-6">Loading student data...</div>;

  // Filter grades specifically for the current target semester (Spring 2025)
  const currentSemesterGrades = grades.filter(
    grade => grade.course.semester === CURRENT_TARGET_SEMESTER
  );

  const displayGPA = gpa ? gpa.GPA : '...';

  // Calculate total credits considering only courses with a grade of 1.0 or higher
  const calculatedTotalCredits = grades.reduce((acc, grade) => {
    const gradeValue = typeof grade.grade === 'number' ? grade.grade : parseFloat(String(grade.grade));
    return acc + (gradeValue >= 1.0 ? (grade.credits || 0) : 0);
  }, 0);

  // Calculate the count of courses completed *in the CURRENT_TARGET_SEMESTER*
  // A course is considered "completed" if its numeric grade is 1.0 or higher,
  // AND it's not an 'F' character grade.
  const completedCoursesCount = currentSemesterGrades.filter(grade => {
    const gradeValue = typeof grade.grade === 'number' ? grade.grade : parseFloat(String(grade.grade));
    const gradeChar = typeof grade.grade === 'string' ? grade.grade.toUpperCase() : '';

    return gradeValue >= 1.0 && gradeChar !== 'F';
  }).length;

  const studentProfile = {
    id: student.studentId,
    name: student.name,
    department: student.department,
    gpa: gpa ? gpa.GPA : '...',
    yearLevel: student.yearLevel,
    totalCredits: student.totalCredits || calculatedTotalCredits,
    advisor: student.advisor,
    entryDate: student.entryDate,
  };

  // Helper function to determine badge color based on grade value
  const getGradeColor = (grade: string | number) => {
    const gradeValue = typeof grade === 'number' ? grade : parseFloat(String(grade));

    if (gradeValue >= 3.7) return 'bg-green-100 text-green-800 border-green-300';
    if (gradeValue >= 3.0) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (gradeValue >= 2.0) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (gradeValue >= 1.0) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" asChild className="border-blue-300 text-blue-700 hover:bg-blue-50">
          <Link to="/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-blue-900">{student.name}</h1>
          <p className="text-blue-700">Student ID: {student.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="flex items-center text-blue-900">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="h-20 w-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900">{student.name}</h3>
                <p className="text-blue-600">{student.department}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-amber-500" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-amber-500" />
                  <span className="text-sm">{student.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-amber-500" />
                  <span className="text-sm">{student.address || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-amber-500" />
                  <span className="text-sm">Entry: {student.entryDate || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-3 text-amber-500" />
                  <span className="text-sm">Expected Graduation: {student.expectedGraduation || "N/A"}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Year Level:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {student.yearLevel || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Academic Advisor:</span>
                  <span className="text-sm text-blue-600">{student.advisor || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Overview Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cumulative GPA Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {displayGPA}
                </div>
                <p className="text-sm text-blue-600">Cumulative GPA</p>
              </CardContent>
            </Card>

            {/* Total Credits Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{studentProfile.totalCredits}</div>
                <p className="text-sm text-blue-600">Total Credits Earned</p>
              </CardContent>
            </Card>

            {/* Courses Completed (Spring 2025) Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{completedCoursesCount}</div>
                <p className="text-sm text-blue-600">Courses Completed ({CURRENT_TARGET_SEMESTER})</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Enrollment (Spring 2025) Details Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-blue-50 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-900">Current Enrollment - {CURRENT_TARGET_SEMESTER}</CardTitle>
                <Button
                  onClick={() => setIsReportOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Academic Report
                </Button>
              </div>
              <CardDescription>Currently enrolled courses and their grades for {CURRENT_TARGET_SEMESTER}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {currentSemesterGrades.length > 0 ? (
                  currentSemesterGrades.map((grade, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-900">{grade.course.name}</div>
                        <div className="text-sm text-blue-600">{grade.course.courseId} • {grade.course.instructor}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getGradeColor(String(grade.grade))} mb-1`}>
                          {grade.grade}
                        </Badge>
                        <div className="text-xs text-blue-600">{grade.credits || 3} Credits</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-blue-600">No courses currently enrolled for {CURRENT_TARGET_SEMESTER}.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Academic Report Modal */}
      <AcademicReportModal
        student={studentProfile}
        enrollmentHistory={structuredEnrollmentHistory}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default StudentProfile;