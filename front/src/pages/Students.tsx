import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash, BookOpen, Mail, User, Briefcase, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ContactModal from '@/components/ContactModal';

// Function to fetch departments from the API
const fetchDepartments = async () => {
  try {
    const res = await fetch('http://localhost:3000/dept', {
      credentials: 'include'
    });

    if (res.status === 401) {
      toast({ title: 'Login Required', description: 'You need to log in to access department data.', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
      setTimeout(() => {
        window.location.href = '/Login';
      }, 2000);
      return [];
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch departments');
    }

    const result = await res.json();
    return result; // Assuming the API directly returns the array of departments
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    toast({ title: 'Error', description: error.message || 'Failed to fetch departments.' });
    return [];
  }
};

const fetchStudents = async () => {
  const res = await fetch('http://localhost:3000/api/students', {
    credentials: 'include'
  });
  if (res.status === 401) {
    toast({ title: 'Login', description: 'You need to log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000); // Wait 2 seconds before redirecting
    return [];
  }
  if (!res.ok) throw new Error('Failed to fetch students');
  const result = await res.json();
  return result.data;
};

const deleteStudent = async (id: string) => {
  const res = await fetch(`http://localhost:3000/api/students/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) {
    toast({ title: 'Login', description: 'You need to log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000); // Wait 2 seconds before redirecting
    return [];
  }
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
};

const addStudent = async (student: any) => {
  const res = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(student),
  });
  if (res.status === 401) {
    toast({ title: 'Login', description: 'You need to log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000); // Wait 2 seconds before redirecting
    return [];
  }
  if (!res.ok) throw new Error('Failed to add student');
  return res.json();
};

const updateStudent = async (student: any) => {
  const res = await fetch(`http://localhost:3000/api/students/${student._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(student),
  });
  if (res.status === 401) {
    toast({ title: 'Login', description: 'You need to log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500' });
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000); // Wait 2 seconds before redirecting
    return [];
  }
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
};

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    department: '', // This will hold the department name initially
    phone: '',
    address: '',
    enrollmentDate: '',
    entryDate: '',
    expectedGraduation: '',
    advisor: '',
  });
  const [currentStudent, setCurrentStudent] = useState<any | null>(null);
  const [studentGrades, setStudentGrades] = useState<Record<string, any[]>>({});
  const [studentGPAs, setStudentGPAs] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: students = [], error, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student has been removed",
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete student.' });
    },
  });

  const addMutation = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      toast({ title: 'Success', description: 'New student has been added.' });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddDialogOpen(false);
      setNewStudent({
        name: '',
        email: '',
        department: '',
        phone: '',
        address: '',
        enrollmentDate: '',
        entryDate: '',
        expectedGraduation: '',
        advisor: '',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to add student.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Student information updated.' });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditDialogOpen(false);
      setCurrentStudent(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update student.' });
    },
  });

  const fetchStudentGrades = async (studentId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/grades/${studentId}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        toast({ title: 'Login', description: 'You need to log in to authorize!' });
        setTimeout(() => {
          window.location.href = '/Login';
        }, 2000); // Wait 2 seconds before redirecting
        return [];
      }
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  };

  const calculateGPA = (grades: any[]) => {
    if (!grades || grades.length === 0) return null;

    let totalGradePoints = 0;
    let totalCourses = 0;

    grades.forEach(grade => {
      if (grade.grade !== undefined) {
        totalGradePoints += grade.grade;
        totalCourses++;
      }
    });

    return totalCourses > 0 ? totalGradePoints / totalCourses : null;
  };

  useEffect(() => {
    const fetchAllGradesAndCalculateGPAs = async () => {
      const gradesMap: Record<string, any[]> = {};
      const gpaMap: Record<string, number> = {};

      for (const student of students) {
        const grades = await fetchStudentGrades(student._id);
        gradesMap[student._id] = grades;

        const gpa = calculateGPA(grades);
        if (gpa !== null) {
          gpaMap[student._id] = gpa;
        }
      }

      setStudentGrades(gradesMap);
      setStudentGPAs(gpaMap);
    };

    if (students.length > 0) {
      fetchAllGradesAndCalculateGPAs();
    }
  }, [students]);

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toString().includes(searchTerm.toLowerCase());
    // Filter by department name
    const matchesDepartment =
      filterDepartment === 'all' || student.department?.name === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddStudent = () => {
    // Find the department ID based on the selected department name
    const selectedDepartment = departments.find(
      (dept: any) => dept.name === newStudent.department
    );
    if (selectedDepartment) {
      const studentDataToSend = {
        ...newStudent,
        department: selectedDepartment._id, // Send the department's _id
      };
      addMutation.mutate(studentDataToSend);
    } else {
      toast({ title: 'Error', description: 'Selected department not found.' });
    }
  };

  const handleEditStudent = () => {
    if (currentStudent) {
      // Find the department ID based on the selected department name
      const selectedDepartment = departments.find(
        (dept: any) => dept.name === currentStudent.department
      );
      if (selectedDepartment) {
        const studentDataToSend = {
          ...currentStudent,
          department: selectedDepartment._id, // Send the department's _id
        };
        updateMutation.mutate(studentDataToSend);
      } else {
        toast({ title: 'Error', description: 'Selected department not found.' });
      }
    }
  };

  const openEditDialog = (student: any) => {
    setCurrentStudent({
      ...student,
      // When opening the dialog, display the department name
      department: student.department ? student.department.name : '',
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
      entryDate: student.entryDate ? new Date(student.entryDate).toISOString().split('T')[0] : '',
      expectedGraduation: student.expectedGraduation ? new Date(student.expectedGraduation).toISOString().split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  const openContactModal = (student: any) => {
    setSelectedStudent({
      ...student,
      department: student.department ? student.department.name : 'N/A' // Store just the name
    });
    setIsContactModalOpen(true);
  };

  if (isLoading || isLoadingDepartments) return <p className="p-6 text-blue-800">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load students.</p>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Student Management</h1>
          <p className="text-blue-700 mt-1">Manage and track university students</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-blue-50 pb-2">
          <CardTitle className="text-blue-900 text-xl">Students Directory</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {students.length} total students
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="font-medium text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Name</TableHead>
                  <TableHead className="text-blue-900">Email</TableHead>
                  <TableHead className="text-blue-900">Department</TableHead>
                  <TableHead className="text-blue-900">Courses</TableHead>
                  <TableHead className="text-blue-900">GPA</TableHead>
                  <TableHead className="text-blue-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student: any) => {
                  const grades = studentGrades[student._id] || [];
                  const gpa = studentGPAs[student._id];
                  const hasGrades = grades.length > 0;

                  return (
                    <TableRow key={student._id} className="hover:bg-blue-50/50">
                      <TableCell className="font-medium text-blue-800">{student.studentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          <Link to={`/students/${student._id}`} className="hover:text-blue-600 hover:underline">
                            {student.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-amber-500" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                          {student.department ? student.department.name : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {grades.length > 0 ? (
                            grades.map((grade, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {grade.course?.name || 'Unknown Course'}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500 text-sm italic">No courses</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            hasGrades
                              ? gpa >= 3.5
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : gpa >= 3.0
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : gpa >= 2.0
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                    : 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }
                        >
                          {hasGrades ? gpa?.toFixed(2) : 'N/A'}
                        </Badge>
                        {hasGrades && (
                          <div className="mt-1 text-xs text-gray-500">
                            {grades.length} course{grades.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/students/${student._id}`}>
                            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(student._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => openContactModal(student)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditDialog(student)}
                            disabled={updateMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter the student's information below</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="Enter student's full name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="student@university.edu"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                placeholder="+9627XXXXXXX"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <Select
                value={newStudent.department}
                onValueChange={(value) => setNewStudent({ ...newStudent, department: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="enrollmentDate" className="text-sm font-medium">
                Enrollment Date
              </label>
              <Input
                id="enrollmentDate"
                type="date"
                value={newStudent.enrollmentDate}
                onChange={(e) => setNewStudent({ ...newStudent, enrollmentDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="entryDate" className="text-sm font-medium">
                Entry Date
              </label>
              <Input
                id="entryDate"
                type="date"
                value={newStudent.entryDate}
                onChange={(e) => setNewStudent({ ...newStudent, entryDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="expectedGraduation" className="text-sm font-medium">
                Expected Graduation
              </label>
              <Input
                id="expectedGraduation"
                type="date"
                value={newStudent.expectedGraduation}
                onChange={(e) => setNewStudent({ ...newStudent, expectedGraduation: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="advisor" className="text-sm font-medium">
                Advisor
              </label>
              <Input
                id="advisor"
                value={newStudent.advisor}
                onChange={(e) => setNewStudent({ ...newStudent, advisor: e.target.value })}
                placeholder="Advisor's name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={addMutation.isPending || !newStudent.name || !newStudent.email || !newStudent.department}
            >
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student's information below</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="edit-name"
                value={currentStudent?.name || ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, name: e.target.value })
                }
                placeholder="Enter student's full name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="edit-email"
                type="email"
                value={currentStudent?.email || ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, email: e.target.value })
                }
                placeholder="student@university.edu"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="edit-phone"
                type="tel"
                value={currentStudent?.phone || ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, phone: e.target.value })
                }
                placeholder="+9627XXXXXXX"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="edit-address"
                value={currentStudent?.address || ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, address: e.target.value })
                }
                placeholder="City, Country"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-department" className="text-sm font-medium">
                Department
              </label>
              <Select
                value={currentStudent?.department || ''} // Use the department name for display
                onValueChange={(value) =>
                  setCurrentStudent({ ...currentStudent, department: value }) // Store the selected department name
                }
              >
                <SelectTrigger id="edit-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-enrollmentDate" className="text-sm font-medium">
                Enrollment Date
              </label>
              <Input
                id="edit-enrollmentDate"
                type="date"
                value={currentStudent?.enrollmentDate ? new Date(currentStudent.enrollmentDate).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, enrollmentDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-entryDate" className="text-sm font-medium">
                Entry Date
              </label>
              <Input
                id="edit-entryDate"
                type="date"
                value={currentStudent?.entryDate ? new Date(currentStudent.entryDate).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, entryDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-expectedGraduation" className="text-sm font-medium">
                Expected Graduation
              </label>
              <Input
                id="edit-expectedGraduation"
                type="date"
                value={currentStudent?.expectedGraduation ? new Date(currentStudent.expectedGraduation).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, expectedGraduation: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-advisor" className="text-sm font-medium">
                Advisor
              </label>
              <Input
                id="edit-advisor"
                value={currentStudent?.advisor || ''}
                onChange={(e) =>
                  setCurrentStudent({ ...currentStudent, advisor: e.target.value })
                }
                placeholder="Advisor's name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStudent}
              disabled={updateMutation.isPending || !currentStudent?.name || !currentStudent?.email || !currentStudent?.department}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Contact Modal */}
      <ContactModal
        student={selectedStudent}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
};

export default Students;