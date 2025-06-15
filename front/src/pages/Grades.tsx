import React, { useState, useEffect } from 'react';
import { Search, Edit, Save, Award, TrendingUp, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch'; // Assuming you have a Switch component for toggling

const API_BASE_URL = 'http://localhost:3000/grades';
const TARGET_SEMESTER = 'Spring 2025'; // Define the target semester here

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [gpaCache, setGpaCache] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [displayNumericalGrade, setDisplayNumericalGrade] = useState(false); // Default to letter grade

  const gradeOptions = [
    { grade: 'A+', points: 4.00 },
    { grade: 'A', points: 3.75 },
    { grade: 'A-', points: 3.50 },
    { grade: 'B+', points: 3.25 },
    { grade: 'B', points: 3.00 },
    { grade: 'B-', points: 2.75 },
    { grade: 'C+', points: 2.50 },
    { grade: 'C', points: 2.25 },
    { grade: 'C-', points: 2.00 },
    { grade: 'D+', points: 1.50 },
    { grade: 'D', points: 1.00 },
    { grade: 'F', points: 0.00 }
  ];

  const pointsToGrade = (points: number) => {
    const closestOption = gradeOptions.reduce((prev, curr) => {
      return (Math.abs(curr.points - points) < Math.abs(prev.points - points) ? curr : prev);
    });
    return closestOption ? closestOption.grade : 'Unknown';
  };

  // Fetch grades on component mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }
        const responseData = await response.json();
        
        // --- VALIDATION: Filter grades to only include TARGET_SEMESTER ---
        const filteredAndTransformedGrades = responseData.data
          .filter((grade: any) => grade.course?.semester === TARGET_SEMESTER) // Filter here!
          .map((grade: any) => ({
            id: grade._id,
            studentMongoId: grade.student ? grade.student._id : 'Unknown',
            studentId: grade.student ? grade.student.studentId : 'Unknown',
            studentName: grade.student ? grade.student.name : 'Unknown Student',
            courseId: grade.course ? grade.course.courseId : 'Unknown',
            courseName: grade.course ? grade.course.name : 'Unknown Course',
            instructor: grade.course?.instructor || 'Unknown Instructor',
            grade: pointsToGrade(grade.grade), // Convert points to letter grade for display
            points: grade.grade // Keep original points for numerical display and saving
          }));
        setGrades(filteredAndTransformedGrades);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load grades",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Fetch GPA for all students using their MongoDB _id
  useEffect(() => {
    const fetchAllGPAs = async () => {
      const studentMongoIds = [...new Set(grades.map(grade => grade.studentMongoId))];
      const newGpaCache: Record<string, string> = {};

      for (const mongoId of studentMongoIds) {
        if (mongoId === 'Unknown') continue;
        try {
          // It's crucial here that your backend GPA calculation API can handle
          // calculating GPA for a specific student regardless of semester.
          // If GPA calculation on the backend is semester-specific, this
          // might still fetch overall GPA.
          const response = await fetch(`${API_BASE_URL}/gpa/${mongoId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch GPA for student ${mongoId}`);
          }
          const data = await response.json();
          newGpaCache[mongoId] = parseFloat(data.GPA).toFixed(2);
        } catch (error) {
          console.error(error);
          newGpaCache[mongoId] = 'N/A';
        }
      }

      setGpaCache(newGpaCache);
    };

    if (grades.length > 0) {
      fetchAllGPAs();
    }
  }, [grades]);

  // Update grade via API
  const updateGrade = async (gradeId: string, letterGrade: string, points: number) => {
    // Optional: Re-validate here, though filtering on fetch makes this less critical
    const gradeToUpdate = grades.find(g => g.id === gradeId);
    if (!gradeToUpdate) {
        toast({
            title: "Error",
            description: "Grade not found for update.",
            variant: "destructive"
        });
        return;
    }
    // Assuming you stored semester info on the grade object.
    // If not, you might need to fetch the course detail before updating.
    // For now, given the initial fetch filters, this check might be redundant if the UI only shows Fall 2024 grades.
    // However, it's good practice for robustness.
    // You would need to store `semester` in the `transformedGrades` if you want to check it here.
    /*
    if (gradeToUpdate.semester !== TARGET_SEMESTER) {
        toast({
            title: "Error",
            description: `Only grades for ${TARGET_SEMESTER} can be updated.`,
            variant: "destructive"
        });
        return;
    }
    */


    try {
      const response = await fetch(`${API_BASE_URL}/${gradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade: points }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      setGrades(grades.map(grade =>
        grade.id === gradeId
          ? { ...grade, grade: letterGrade, points }
          : grade
      ));

      // Invalidate GPA cache for the student using studentMongoId
      const studentMongoId = grades.find(g => g.id === gradeId)?.studentMongoId;
      if (studentMongoId) {
        setGpaCache(prev => {
          const newCache = { ...prev };
          delete newCache[studentMongoId];
          return newCache;
        });
      }

      toast({
        title: "Success",
        description: "Grade updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grade",
        variant: "destructive"
      });
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grade.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grade.studentId.toString().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || grade.courseId === filterCourse;
    const matchesStudent = filterStudent === 'all' || grade.studentId === filterStudent;
    return matchesSearch && matchesCourse && matchesStudent;
  });

  // Ensure uniqueCourses and uniqueStudents are derived ONLY from the filtered grades
  const uniqueCourses = [...new Set(grades.map(grade => ({ id: grade.courseId, name: grade.courseName })))];
  const uniqueStudents = [...new Set(grades.map(grade => ({ id: grade.studentId, name: grade.studentName })))];

  const handleEditGrade = (gradeId: string, currentGrade: string) => {
    setEditingGrade(gradeId);
    setTempGrade(currentGrade);
  };

  const handleSaveGrade = (gradeId: string) => {
    const selectedGradeOption = gradeOptions.find(option => option.grade === tempGrade);
    if (!selectedGradeOption) {
      toast({
        title: "Error",
        description: "Please select a valid grade",
        variant: "destructive",
      });
      return;
    }

    updateGrade(gradeId, selectedGradeOption.grade, selectedGradeOption.points);
    setEditingGrade(null);
    setTempGrade('');
  };

  const handleCancelEdit = () => {
    setEditingGrade(null);
    setTempGrade('');
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'bg-green-100 text-green-800 border-green-300';
    if (['B+', 'B', 'B-'].includes(grade)) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (['C+', 'C', 'C-'].includes(grade)) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (['D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Grades Management</h1>
          <p className="text-blue-700 mt-1">Viewing and managing grades exclusively for <span className="font-semibold text-amber-600">{TARGET_SEMESTER}</span></p>
        </div>
        <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
          <Award className="h-5 w-5" />
          <span className="text-sm font-medium">{TARGET_SEMESTER} Semester</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
              <Input
                placeholder="Search by student name, course, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.id} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-amber-500" />
                <Select value={filterStudent} onValueChange={setFilterStudent}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {uniqueStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* New: Toggle for Numerical/Letter Grade Display */}
          <div className="flex items-center justify-end mt-4 pt-4 border-t border-amber-100">
            <span className="mr-2 text-sm text-blue-700">Display Numerical Grade:</span>
            <Switch
              checked={displayNumericalGrade}
              onCheckedChange={setDisplayNumericalGrade}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades List */}
      <div className="space-y-4">
        {filteredGrades.map((grade) => (
          <Card key={grade.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-blue-900">{grade.studentName}</h3>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {grade.studentId}
                    </Badge>
                    <span className="text-sm text-blue-600">
                      GPA: {gpaCache[grade.studentMongoId] || 'Loading...'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-700">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{grade.courseName}</span>
                      <span className="ml-2 text-sm text-blue-600">({grade.courseId})</span>
                    </div>
                  </div>

                  <div className="text-sm text-blue-600">
                    <span className="font-medium">Instructor:</span> {grade.instructor}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xs text-blue-600 mb-1">Current Grade</div>
                    {editingGrade === grade.id ? (
                      <div className="flex items-center space-x-2">
                        <Select value={tempGrade} onValueChange={setTempGrade}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map(option => (
                              <SelectItem key={option.grade} value={option.grade}>
                                {option.grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleSaveGrade(grade.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="border-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {displayNumericalGrade ? (
                          <Badge className={`${getGradeColor(grade.grade)} text-lg font-bold px-3 py-1`}>
                            {grade.points.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge className={`${getGradeColor(grade.grade)} text-lg font-bold px-3 py-1`}>
                            {grade.grade}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGrade(grade.id, grade.grade)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* This section now always shows Grade Points in #.# format,
                      regardless of the displayNumericalGrade toggle.
                      You can remove this if you only want one unified display. */}
                  <div className="text-center">
                    <div className="text-xs text-blue-600 mb-1">Grade Points</div>
                    <div className="text-lg font-bold text-blue-900">
                      {grade.points.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGrades.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="text-amber-300 mb-4">
              <Award className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">No grades found for {TARGET_SEMESTER}</h3>
            <p className="text-blue-700">Try adjusting your search criteria or filters, or ensure grades for this semester exist.</p>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution Summary */}
      {filteredGrades.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
              Grade Distribution Summary
            </CardTitle>
            <CardDescription>Overview of grades in current filter for {TARGET_SEMESTER}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {gradeOptions.slice(0, 6).map(gradeOption => {
                const count = filteredGrades.filter(grade => grade.grade === gradeOption.grade).length;
                const percentage = filteredGrades.length > 0 ? ((count / filteredGrades.length) * 100).toFixed(1) : '0';

                return (
                  <div key={gradeOption.grade} className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${getGradeColor(gradeOption.grade)}`}>
                      {displayNumericalGrade ? gradeOption.points.toFixed(2) : gradeOption.grade}
                    </div>
                    <div className="text-lg font-bold text-blue-900">{count}</div>
                    <div className="text-xs text-blue-600">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Grades;