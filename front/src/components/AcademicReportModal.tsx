
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Calendar, GraduationCap, User, Printer, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface AcademicReportProps {
  student: {
    id: string;
    name: string;
    department: string;
    gpa: number;
    yearLevel: string;
    totalCredits : number;
    advisor: string;
    entryDate: string;
  } | null;
  enrollmentHistory: SemesterData[];
  isOpen: boolean;
  onClose: () => void;
}

const AcademicReportModal: React.FC<AcademicReportProps> = ({
  student,
  enrollmentHistory,
  isOpen,
  onClose,
}) => {
  if (!student) return null;

  const calculateGPA = (courses: Course[]) => {
    if (!courses || courses.length === 0) return '0.00'; // Return string for consistency

    // Define grade points for letter grades (as before)
    const gradeLetterPoints: Record<string, number> = {
      'A+': 4.0, // Assuming A+ is also 4.0 for GPA calculation
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    };

    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach(course => {
      totalCredits += course.credits;

      // Check if the grade is a number (points) or a string (letter grade)
      const numericGrade = parseFloat(course.grade); // Try to parse as a number

      if (!isNaN(numericGrade)) {
        // If it's a valid number, use it directly as points
        totalPoints += course.credits * numericGrade;
      } else if (gradeLetterPoints[course.grade]) {
        // If it's a letter grade, use the predefined grade points
        totalPoints += course.credits * gradeLetterPoints[course.grade];
      } else {
        // Handle unknown or invalid grade gracefully, e.g., treat as 0 points
        console.warn(`Unknown or invalid grade encountered: ${course.grade} for course ${course.id}`);
        // Optionally, you might choose to throw an error or skip this course
      }
    });

    if (totalCredits === 0) {
      return '0.00';
    }

    return (totalPoints / totalCredits).toFixed(2);
  };

  const getGradeColor = (grade: string) => {
    if (['A', 'A-'].includes(grade)) return 'bg-green-100 text-green-800 border-green-300';
    if (['B+', 'B', 'B-'].includes(grade)) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (['C+', 'C', 'C-'].includes(grade)) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (['D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Calculate total credits
  const totalCredits = enrollmentHistory.reduce((acc, semester) => {
    return acc + semester.courses.reduce((semAcc, course) => semAcc + course.credits, 0);
  }, 0);

  // Calculate cumulative GPA
  const allCourses = enrollmentHistory.flatMap(semester => semester.courses);
  const cumulativeGPA = calculateGPA(allCourses);

  // Current date for report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white">
        <DialogHeader className="p-6 bg-blue-900 text-white">
          <DialogTitle className="text-2xl">Academic Transcript</DialogTitle>
          <DialogDescription className="text-blue-100">
            Official academic report for {student.name} ({student.id})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] p-6">
          <div className="space-y-6 pb-6">
            {/* Report header with university logo/name */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-blue-900">University Name</h1>
              <p className="text-sm text-gray-500">Office of the Registrar</p>
              <p className="text-sm text-gray-500">Academic Transcript</p>
              <p className="text-sm text-gray-500">Generated on: {currentDate}</p>
            </div>
            
            {/* Student Information */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Student:</span>
                      <span className="ml-2">{student.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Student ID:</span>
                      <span className="ml-2">{student.id}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Department:</span>
                      <span className="ml-2">{student.department}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Entry Date:</span>
                      <span className="ml-2">{student.entryDate}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Year Level:</span>
                      <span className="ml-2">{student.yearLevel}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Academic Advisor:</span>
                      <span className="ml-2">{student.advisor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <div>
                    <span className="text-sm font-medium">Cumulative GPA:</span>
                    <span className="ml-2 text-lg font-bold text-blue-900">{student.gpa}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Total Credits:</span>
                    <span className="ml-2 text-lg font-bold text-blue-900">{student.totalCredits}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Academic History */}
           
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-blue-900">Academic History</h2>
              
              {enrollmentHistory.map((semester, index) => (
                
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-between">
                      <h3 className="text-lg font-semibold text-blue-800">{semester.semester}</h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Semester GPA</div>
                        <div className="font-bold">{calculateGPA(semester.courses)}</div>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader className="bg-blue-50">
                        <TableRow>
                          <TableHead className="w-[100px]">Course ID</TableHead>
                          <TableHead>Course Title</TableHead>
                          <TableHead className="w-[80px] text-center">Credits</TableHead>
                          <TableHead className="w-[80px] text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semester.courses.map((course, courseIndex) => (
                          <TableRow key={courseIndex}>
                            <TableCell className="font-medium">{course.id}</TableCell>
                            <TableCell>{course.name}</TableCell>
                            <TableCell className="text-center">{course.credits}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={getGradeColor(course.grade)}>
                                {course.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-50/50">
                          <TableCell colSpan={2} className="text-right font-medium">
                            Semester Credits:
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {semester.courses.reduce((acc, course) => acc + course.credits, 0)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Official signature section */}
            <div className="mt-12 border-t pt-8 text-center">
              <p className="text-sm text-gray-500 mb-6">
                This is an official transcript of the academic record.
                Not valid without university seal and registrar signature.
              </p>
              <div className="flex justify-center">
                <div className="w-64 border-t border-gray-400 pt-2">
                  <p className="text-sm">University Registrar</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="bg-gray-50 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicReportModal;
