
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, BarChart3, LogOut, User } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Grades', href: '/grades', icon: GraduationCap },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <GraduationCap className="h-8 w-8 text-amber-400" />
                <span className="ml-2 text-xl font-bold text-white">UniManage</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'border-amber-400 text-white bg-blue-800'
                          : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                      } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200 rounded-t-lg`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-blue-100">
                <User className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Admin User</span>
              </div>
              <Link
                to="/"
                className="flex items-center text-blue-100 hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
