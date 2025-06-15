import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash, Users, Calendar, Clock, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = 'http://localhost:3000/courses';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    courseId: '',
    creditHours: 3,
    instructor: '',
    department: 'Computer Science',
    schedule: 'Mon/Wed 10:00 AM - 11:30 AM',
    capacity: 30,
    semester: "Spring 2025", 
    enrolled: 0,
    room: ''
  });
  const [currentCourse, setCurrentCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the target semester for filtering and validation
  const TARGET_SEMESTER = "Spring 2025";

  // Sample departments
  const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Arts',
    'Science',
    'Medicine'
  ];

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const responseData = await response.json();
        // Transform the API data and filter for Spring 2025 immediately
        const transformedCourses = responseData.data
          .filter(course => course.semester === TARGET_SEMESTER) // <--- ADDED THIS FILTER HERE
          .map(course => ({
            id: course.courseId,
            name: course.name,
            instructor: course.instructor,
            department: course.department || 'Computer Science', 
            credits: course.creditHours,
            schedule: course.schedule || 'Mon/Wed 10:00 AM - 11:30 AM', 
            capacity: course.capacity || 30, 
            enrolled: course.enrolled || 0, 
            room: course.room || '', 
            semester: course.semester || "Fall 2024" // Will mostly be Spring 2025 due to filter
          }));
        setCourses(transformedCourses);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search term, department, and tab
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || course.department === filterDepartment;
    const matchesTab = 
      activeTab === 'all' ? true : 
      activeTab === 'available' ? course.enrolled < course.capacity : 
      activeTab === 'full' ? course.enrolled >= course.capacity : 
      true;
    
    // The semester filter is now applied directly when fetching data,
    // so no need to add it here again for the display filter.
    return matchesSearch && matchesDepartment && matchesTab;
  });

  const handleAddCourse = async () => {
    if (newCourse.semester !== TARGET_SEMESTER) {
      toast({
        title: "Validation Error",
        description: `New courses must be scheduled for ${TARGET_SEルメSTER}.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add course');
      }

      const addedCourse = await response.json();
      
      const transformedAddedCourse = {
        id: addedCourse.courseId,
        name: addedCourse.name,
        instructor: addedCourse.instructor,
        department: addedCourse.department,
        credits: addedCourse.creditHours,
        schedule: addedCourse.schedule,
        capacity: addedCourse.capacity,
        enrolled: addedCourse.enrolled,
        room: addedCourse.room,
        semester: addedCourse.semester 
      };

      // Only add to state if it's for the target semester
      if (transformedAddedCourse.semester === TARGET_SEMESTER) { // <--- ADDED THIS CHECK
        setCourses([...courses, transformedAddedCourse]);
      }
      
      setNewCourse({
        name: '',
        courseId: '',
        creditHours: 3,
        instructor : '',
        department: 'Computer Science',
        schedule: 'Mon/Wed 10:00 AM - 11:30 AM',
        capacity: 30,
        semester: TARGET_SEMESTER, 
        enrolled: 0,
        room: ''
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Course ${transformedAddedCourse.id} has been added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add course: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEditCourse = async () => {
    // We already have validation that only TARGET_SEMESTER courses can be edited,
    // so currentCourse.semester should be TARGET_SEMESTER if this function is reached.
    if (currentCourse.semester !== TARGET_SEMESTER) {
      toast({
        title: "Validation Error",
        description: `Only courses for ${TARGET_SEMESTER} can be edited.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const courseToUpdate = {
        courseId: currentCourse.id,
        name: currentCourse.name,
        instructor: currentCourse.instructor,
        department: currentCourse.department,
        creditHours: currentCourse.credits,
        schedule: currentCourse.schedule,
        capacity: currentCourse.capacity,
        enrolled: currentCourse.enrolled,
        room: currentCourse.room,
        semester: currentCourse.semester 
      };

      const response = await fetch(`${API_BASE_URL}/${currentCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      
      const transformedCourse = {
        id: updatedCourse.data.courseId,
        name: updatedCourse.data.name,
        instructor: updatedCourse.data.instructor,
        department: updatedCourse.data.department,
        credits: updatedCourse.data.creditHours,
        schedule: updatedCourse.data.schedule,
        capacity: updatedCourse.data.capacity,
        enrolled: updatedCourse.data.enrolled,
        room: updatedCourse.data.room,
        semester: updatedCourse.data.semester 
      };

      // Since we are only displaying Spring 2025 courses,
      // if a course's semester somehow changes to something else,
      // we should remove it from the displayed list.
      setCourses(courses.map(course => 
        course.id === transformedCourse.id ? 
          (transformedCourse.semester === TARGET_SEMESTER ? transformedCourse : null) : // <--- MODIFIED HERE
          course
      ).filter(Boolean)); // <--- Filter out any nulls

      setIsEditDialogOpen(false);
      setCurrentCourse(null);
      
      toast({
        title: "Success",
        description: "Course information updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (id) => {
    const courseToDelete = courses.find(course => course.id === id);
    if (courseToDelete && courseToDelete.semester !== TARGET_SEMESTER) {
      toast({
        title: "Validation Error",
        description: `Only courses for ${TARGET_SEMESTER} can be deleted.`,
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete course');
        }

        setCourses(courses.filter(course => course.id !== id));
        
        toast({
          title: "Success",
          description: "Course has been removed",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete course: ${error.message}`,
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (course) => {
    setCurrentCourse({...course});
    setIsEditDialogOpen(true);
  };

  const getAvailabilityBadge = (course) => {
    const availableSeats = course.capacity - course.enrolled;
    if (availableSeats <= 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Full</Badge>;
    } else if (availableSeats <= 5) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Limited</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Available</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-blue-900">Course Management</h1>
          <p className="text-blue-700 mt-1">Manage university course offerings for {TARGET_SEMESTER}</p> {/* <--- Updated description */}
        </div>
        <div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
              <Input
                placeholder="Search by course name, instructor, or course ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-amber-500" />
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-blue-900 text-xl">Course Directory for {TARGET_SEMESTER}</CardTitle> {/* <--- Updated title */}
              <CardDescription>
                Showing {filteredCourses.length} of {courses.length} total courses for {TARGET_SEMESTER} {/* <--- Updated description */}
              </CardDescription>
            </div>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-blue-50">
                <TabsTrigger value="all">All Courses</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="full">Full</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="font-medium text-blue-900">Course ID</TableHead>
                  <TableHead className="font-medium text-blue-900">Course Name</TableHead>
                  <TableHead className="font-medium text-blue-900">Instructor</TableHead>
                  <TableHead className="font-medium text-blue-900">Department</TableHead>
                  <TableHead className="font-medium text-blue-900">Credits</TableHead>
                  <TableHead className="font-medium text-blue-900">Schedule</TableHead>
                  <TableHead className="font-medium text-blue-900">Enrollment</TableHead>
                  <TableHead className="font-medium text-blue-900">Status</TableHead>
                  <TableHead className="font-medium text-blue-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-blue-50/50">
                      <TableCell className="font-medium text-blue-800">{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          {course.instructor}
                        </div>
                      </TableCell>
                      <TableCell>{course.department}</TableCell>
                      <TableCell className="text-center">{course.credits}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          {course.schedule}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">Room: {course.room}</div>
                        <div className="text-xs text-blue-600 mt-1">Semester: {course.semester}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-amber-500" />
                          <span>{course.enrolled}/{course.capacity}</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-1.5 mt-1.5">
                          <div 
                            className={`${
                              course.enrolled/course.capacity >= 0.9 ? 'bg-red-500' : 
                              course.enrolled/course.capacity >= 0.7 ? 'bg-amber-500' : 'bg-green-500'
                            } h-1.5 rounded-full`} 
                            style={{ width: `${Math.min(100, (course.enrolled/course.capacity) * 100)}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAvailabilityBadge(course)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditDialog(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No courses found matching your search criteria for {TARGET_SEMESTER}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Enter the course information below</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="id" className="text-sm font-medium">Course ID</label>
                  <Input
                    id="id"
                    value={newCourse.courseId}
                    onChange={(e) => setNewCourse({...newCourse, courseId: e.target.value})}
                    placeholder="CS101"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="credits" className="text-sm font-medium">Credits</label>
                  <Input
                    id="credits"
                    type="number"
                    value={newCourse.creditHours}
                    onChange={(e) => setNewCourse({...newCourse, creditHours: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Course Name</label>
                <Input
                  id="name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="Introduction to Computer Science"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="instructor" className="text-sm font-medium">Instructor</label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  placeholder="Prof. Jane Smith"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="department" className="text-sm font-medium">Department</label>
                <Select 
                  value={newCourse.department} 
                  onValueChange={(value) => setNewCourse({...newCourse, department: value})}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="schedule" className="text-sm font-medium">Schedule</label>
                <Input
                  id="schedule"
                  value={newCourse.schedule}
                  onChange={(e) => setNewCourse({...newCourse, schedule: e.target.value})}
                  placeholder="Mon/Wed 10:00 AM - 11:30 AM"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
                <Input
                  id="capacity"
                  type="number"
                  value={newCourse.capacity}
                  onChange={(e) => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="room" className="text-sm font-medium">Room</label>
                <Input
                  id="room"
                  value={newCourse.room}
                  onChange={(e) => setNewCourse({...newCourse, room: e.target.value})}
                  placeholder="SCI-101"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="semester" className="text-sm font-medium">Semester</label>
                <Input
                  id="semester"
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                  placeholder={TARGET_SEMESTER}
                  className={newCourse.semester !== TARGET_SEMESTER ? "border-red-500" : ""}
                />
                {newCourse.semester !== TARGET_SEMESTER && (
                  <p className="text-xs text-red-500">Only {TARGET_SEMESTER} courses can be added.</p>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCourse}
              disabled={!newCourse.courseId || !newCourse.name || !newCourse.instructor || newCourse.semester !== TARGET_SEMESTER}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      {currentCourse && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update course information</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-id" className="text-sm font-medium">Course ID</label>
                    <Input
                      id="edit-id"
                      value={currentCourse.id}
                      disabled
                      className="bg-slate-100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-credits" className="text-sm font-medium">Credits</label>
                    <Input
                      id="edit-credits"
                      type="number"
                      value={currentCourse.credits}
                      onChange={(e) => setCurrentCourse({...currentCourse, credits: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Course Name</label>
                  <Input
                    id="edit-name"
                    value={currentCourse.name}
                    onChange={(e) => setCurrentCourse({...currentCourse, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-instructor" className="text-sm font-medium">Instructor</label>
                  <Input
                    id="edit-instructor"
                    value={currentCourse.instructor}
                    onChange={(e) => setCurrentCourse({...currentCourse, instructor: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-department" className="text-sm font-medium">Department</label>
                  <Select 
                    value={currentCourse.department} 
                    onValueChange={(value) => setCurrentCourse({...currentCourse, department: value})}
                  >
                    <SelectTrigger id="edit-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-schedule" className="text-sm font-medium">Schedule</label>
                  <Input
                    id="edit-schedule"
                    value={currentCourse.schedule}
                    onChange={(e) => setCurrentCourse({...currentCourse, schedule: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-capacity" className="text-sm font-medium">Capacity</label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={currentCourse.capacity}
                      onChange={(e) => setCurrentCourse({...currentCourse, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-enrolled" className="text-sm font-medium">Enrolled</label>
                    <Input
                      id="edit-enrolled"
                      type="number"
                      value={currentCourse.enrolled}
                      onChange={(e) => setCurrentCourse({...currentCourse, enrolled: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-room" className="text-sm font-medium">Room</label>
                  <Input
                    id="edit-room"
                    value={currentCourse.room}
                    onChange={(e) => setCurrentCourse({...currentCourse, room: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-semester" className="text-sm font-medium">Semester</label>
                  <Input
                    id="edit-semester"
                    value={currentCourse.semester || "N/A"}
                    onChange={(e) => setCurrentCourse({ ...currentCourse, semester: e.target.value })}
                    className={currentCourse.semester !== TARGET_SEMESTER ? "border-red-500" : ""}
                  />
                  {currentCourse.semester !== TARGET_SEMESTER && (
                    <p className="text-xs text-red-500">Only {TARGET_SEMESTER} courses can be edited.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditCourse}
                disabled={!currentCourse.name || !currentCourse.instructor || currentCourse.semester !== TARGET_SEMESTER}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Courses;