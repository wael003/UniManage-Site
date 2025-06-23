import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  BookOpen,
  GraduationCap,
  Bell,
  Calendar,
  Clock,
  Book,
  Award,
  UserCheck,
  TrendingUp,
  ListOrdered // New icon for grades list
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [prevSemesterTotalCourses, setPrevSemesterTotalCourses] = useState(0); // New state for previous semester courses
  const [averageGpa, setAverageGpa] = useState(0);
  const [prevSemesterAverageGpa, setPrevSemesterAverageGpa] = useState(0); // New state for previous semester GPA
  const [attendanceRate, setAttendanceRate] = useState(89); // Assuming this remains static or is calculated differently
  const [studentsByDepartment, setStudentsByDepartment] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [displayCount, setDisplayCount] = useState(4); // State to control the number of notifications displayed
  const [semesterGradesData, setSemesterGradesData] = useState([]); // New state for semester-specific grades

  const TARGET_SEMESTER = 'Spring 2025'; // Define the target semester here
  const PREVIOUS_SEMESTER = 'Fall 2024'; // Define the previous semester here

  // Sample data for events (can be fetched from API if available)
  const upcomingEvents = [
    {
      id: 1,
      title: 'End of Semester',
      date: 'May 30, 2025',
      type: 'academic'
    },
    {
      id: 2,
      title: 'Faculty Meeting',
      date: 'May 15, 2025',
      type: 'meeting'
    },
    {
      id: 3,
      title: 'Final Exams Week',
      date: 'May 20-27, 2025',
      type: 'exam'
    },
    {
      id: 4,
      title: 'Summer Registration',
      date: 'June 5, 2025',
      type: 'registration'
    }
  ];

  console.log(document.cookie)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/students/', {
          credentials: 'include',
        });
        if (response.status === 401) {
          toast({ title: 'Login', description: 'You need log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500', });
          setTimeout(() => {
            window.location.href = '/Login';
          }, 2000); // Wait 2 seconds before redirecting
          return [];
        }

        const data = await response.json();
        setTotalStudents(data.data.length);

        // Calculate students by department, now accessing student.department.name
        const departmentCounts = data.data.reduce((acc, student) => {
          const departmentName = student.department ? student.department.name : 'Unknown';
          acc[departmentName] = (acc[departmentName] || 0) + 1;
          return acc;
        }, {});
        setStudentsByDepartment(
          Object.entries(departmentCounts).map(([name, value]) => ({ name, value }))
        );

        // Calculate enrollment trends (example: by month of enrollment)
        const enrollmentByMonth = data.data.reduce((acc, student) => {
          const month = new Date(student.enrollmentDate).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});
        setEnrollmentTrends(
          Object.entries(enrollmentByMonth).map(([month, students]) => ({ month, students }))
        );

      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:3000/courses/', {
          credentials: 'include',
        });
        if (response.status === 401) {
          toast({ title: 'Login', description: 'You need log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500', });
          setTimeout(() => {
            window.location.href = '/Login';
          }, 2000); // Wait 2 seconds before redirecting
          return [];
        }
        const data = await response.json();

        // Filter courses for the TARGET_SEMESTER
        const filteredCoursesCurrent = data.data.filter(
          (course) => course.semester === TARGET_SEMESTER
        );
        setTotalCourses(filteredCoursesCurrent.length);

        // Filter courses for the PREVIOUS_SEMESTER
        const filteredCoursesPrevious = data.data.filter(
          (course) => course.semester === PREVIOUS_SEMESTER
        );
        setPrevSemesterTotalCourses(filteredCoursesPrevious.length);

      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchGrades = async () => {
      try {
        const response = await fetch('http://localhost:3000/grades/', {
          credentials: 'include',
        });
        if (response.status === 401) {
          toast({ title: 'Login', description: 'You need log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500', });
          setTimeout(() => {
            window.location.href = '/Login';
          }, 2000); // Wait 2 seconds before redirecting
          return [];
        }
        const data = await response.json();

        // Filter grades for the TARGET_SEMESTER
        const filteredGradesForCurrentSemester = data.data.filter(
          (gradeEntry) => gradeEntry.course && gradeEntry.course.semester === TARGET_SEMESTER
        );

        // Filter grades for the PREVIOUS_SEMESTER
        const filteredGradesForPreviousSemester = data.data.filter(
          (gradeEntry) => gradeEntry.course && gradeEntry.course.semester === PREVIOUS_SEMESTER
        );

        // Populate semesterGradesData for the current semester
        const formattedSemesterGrades = filteredGradesForCurrentSemester.map(gradeEntry => ({
          studentName: gradeEntry.student ? gradeEntry.student.name : 'Unknown Student',
          courseName: gradeEntry.course ? gradeEntry.course.name : 'Unknown Course',
          grade: gradeEntry.grade,
        }));
        setSemesterGradesData(formattedSemesterGrades);

        // Calculate grade distribution (using current semester filtered data)
        const gradeCounts = filteredGradesForCurrentSemester.reduce((acc, gradeEntry) => {
          let gradeCategory;
          if (gradeEntry.grade >= 4.0) gradeCategory = 'A';
          else if (gradeEntry.grade >= 3.0) gradeCategory = 'B';
          else if (gradeEntry.grade >= 2.0) gradeCategory = 'C';
          else if (gradeEntry.grade >= 1.0) gradeCategory = 'D';
          else gradeCategory = 'F';

          acc[gradeCategory] = (acc[gradeCategory] || 0) + 1;
          return acc;
        }, {});

        const gradeDist = [
          { name: 'A', count: gradeCounts['A'] || 0, color: '#4ade80' },
          { name: 'B', count: gradeCounts['B'] || 0, color: '#60a5fa' },
          { name: 'C', count: gradeCounts['C'] || 0, color: '#facc15' },
          { name: 'D', count: gradeCounts['D'] || 0, color: '#fb923c' },
          { name: 'F', count: gradeCounts['F'] || 0, color: '#f87171' }
        ];
        setGradeDistribution(gradeDist);

        // Calculate average GPA for current semester
        const totalGPACurrent = filteredGradesForCurrentSemester.reduce((sum, gradeEntry) => sum + gradeEntry.grade, 0);
        setAverageGpa(filteredGradesForCurrentSemester.length > 0 ? (totalGPACurrent / filteredGradesForCurrentSemester.length).toFixed(1) : 'N/A');

        // Calculate average GPA for previous semester
        const totalGPAPrevious = filteredGradesForPreviousSemester.reduce((sum, gradeEntry) => sum + gradeEntry.grade, 0);
        setPrevSemesterAverageGpa(filteredGradesForPreviousSemester.length > 0 ? (totalGPAPrevious / filteredGradesForPreviousSemester.length).toFixed(1) : 'N/A');

      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:3000/notify', {
          credentials: 'include',
        });
        if (response.status === 401) {
          toast({ title: 'Login', description: 'You need log in to authorize!', className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500', });
          setTimeout(() => {
            window.location.href = '/Login';
          }, 2000); // Wait 2 seconds before redirecting
          return [];
        }
        const data = await response.json();
        const sortedNotifications = data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const formattedNotifications = sortedNotifications.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.description,
          time: new Date(notification.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: false
        }));
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };


    fetchStudents();
    fetchCourses();
    fetchGrades();
    fetchNotifications();
  }, []);

  // Calculate percentage changes
  const courseChange = prevSemesterTotalCourses !== 0
    ? (((totalCourses - prevSemesterTotalCourses) / prevSemesterTotalCourses) * 100).toFixed(1)
    : 'N/A';
  const courseChangeType = courseChange !== 'N/A' && parseFloat(courseChange) > 0 ? 'increase' : 'decrease';

  const gpaChange = prevSemesterAverageGpa !== 0 && averageGpa !== 'N/A' && prevSemesterAverageGpa !== 'N/A'
    ? (((parseFloat(averageGpa) - parseFloat(prevSemesterAverageGpa)) / parseFloat(prevSemesterAverageGpa)) * 100).toFixed(1)
    : 'N/A';
  const gpaChangeType = gpaChange !== 'N/A' && parseFloat(gpaChange) > 0 ? 'increase' : 'decrease';


  const handleViewAllNotifications = (e) => {
    e.preventDefault();
    setDisplayCount(prevCount => prevCount === 4 ? 10 : 4); // Toggle between 4 and 10
  };

  const notificationsToDisplay = notifications.slice(-displayCount);


  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header and Welcome */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-blue-900">Welcome, Admin</h1>
        <p className="text-blue-700">University Management System Dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium text-blue-800">Total Students</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalStudents}</div>
            <p className="text-xs text-blue-600 mt-1">
              <span className="text-green-600">↑ 12%</span> from last semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium text-blue-800">Total Courses ({TARGET_SEMESTER})</CardTitle>
            <BookOpen className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalCourses}</div>
            <p className="text-xs text-blue-600 mt-1">
              {courseChange !== 'N/A' ? (
                <span className={courseChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {courseChangeType === 'increase' ? '↑' : '↓'} {Math.abs(parseFloat(courseChange))}%
                </span>
              ) : (
                'N/A'
              )} from last semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium text-blue-800">Average GPA ({TARGET_SEMESTER})</CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{averageGpa}</div>
            <p className="text-xs text-blue-600 mt-1">
              {gpaChange !== 'N/A' ? (
                <span className={gpaChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {gpaChangeType === 'increase' ? '↑' : '↓'} {Math.abs(parseFloat(gpaChange))}%
                </span>
              ) : (
                'N/A'
              )} from last semester
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium text-blue-800">Attendance Rate</CardTitle>
            <UserCheck className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{attendanceRate}%</div>
            <p className="text-xs text-blue-600 mt-1">
              <span className="text-green-600">↑ 3%</span> from last semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grades">
                <TabsList>
                  <TabsTrigger value="grades" className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Grade Distribution ({TARGET_SEMESTER})
                  </TabsTrigger>
                  <TabsTrigger value="departments" className="flex items-center gap-2">
                    <Book className="h-4 w-4" /> Department Enrollment
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Enrollment Trends
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="grades">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Students" fill="#3b82f6">
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="departments">
                  <div className="h-80 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentsByDepartment}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {studentsByDepartment.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={[
                                '#3b82f6', '#0ea5e9', '#8b5cf6',
                                '#f59e0b', '#10b981', '#ef4444'
                              ][index % 6]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [`${value} Students`, 'Enrollment']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="trends">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enrollmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" name="Total Students" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>




          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Calendar className="h-5 w-5 text-amber-500" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Academic calendar and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center
                      ${event.type === 'academic' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'exam' ? 'bg-amber-100 text-amber-700' :
                          event.type === 'meeting' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'}`}>
                      {event.type === 'academic' ? <BookOpen className="h-5 w-5" /> :
                        event.type === 'exam' ? <GraduationCap className="h-5 w-5" /> :
                          event.type === 'meeting' ? <Users className="h-5 w-5" /> :
                            <Calendar className="h-5 w-5" />}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-blue-900">{event.title}</h4>
                      <div className="flex items-center text-sm text-blue-700 mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Bell className="h-5 w-5 text-amber-500" />
                Notifications
              </CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsToDisplay.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${notification.read ? 'bg-slate-50' : 'bg-blue-50'} border ${notification.read ? 'border-slate-100' : 'border-blue-100'}`}
                >
                  <h4 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-blue-900'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm mt-1 text-blue-700">{notification.message}</p>
                  <div className="flex items-center text-xs text-blue-600 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{notification.time}</span>
                  </div>
                </div>
              ))}
              {/* Only show "View all notifications" if there are more notifications than currently displayed and displayCount is less than total notifications */}
              {notifications.length > 4 && (
                <div className="text-center">
                  {displayCount <= 4 ? (
                    <a href="#" onClick={handleViewAllNotifications} className="text-blue-600 text-sm hover:underline">
                      View all notifications
                    </a>
                  ) : (
                    <a href="#" onClick={handleViewAllNotifications} className="text-blue-600 text-sm hover:underline">
                      Show less
                    </a>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Award className="h-5 w-5 text-amber-500" />
                Quick Stats
              </CardTitle>
              <CardDescription>At a glance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Graduation Rate</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-900">92%</span>
                    <span className="ml-2 text-xs text-green-600">↑ 2%</span>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-blue-700">Student Satisfaction</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-900">88%</span>
                    <span className="ml-2 text-xs text-green-600">↑ 5%</span>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-blue-700">Course Completion</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-900">95%</span>
                    <span className="ml-2 text-xs text-green-600">↑ 1%</span>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;