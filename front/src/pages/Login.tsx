import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Login successful (status 200)
        const data = await response.json();
        // You might want to store the token (e.g., in localStorage)
        // localStorage.setItem('authToken', data.token); 

        toast({
          title: "Login Successful",
          description: data.message || "Welcome to UniManage System!", // Use backend message if available
        });
        navigate('/dashboard');
      } else {
        // Login failed (e.g., 401, 400, 500)
        let errorMessage = "Please check your credentials and try again."; // Default error message
        try {
          const errorData = await response.json();
          // If backend provides a message, use it
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          // Fallback if the response is not valid JSON (e.g., plain text error)
          console.error("Error parsing error response:", jsonError);
          errorMessage = `Login failed: ${errorMessage || "Unknown error."}`;
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Network errors (server unreachable, no response)
      console.error("Login network error:", error);
      toast({
        title: "Login Error",
        description: "Could not connect to the server. Please check your internet connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      {/* Background Academic Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 opacity-10">
          <BookOpen className="h-32 w-32 text-white transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-10">
          <GraduationCap className="h-40 w-40 text-white transform -rotate-12" />
        </div>
        <div className="absolute top-1/2 left-10 opacity-5">
          <div className="h-64 w-64 rounded-full border-4 border-white" />
        </div>
        <div className="absolute top-1/4 right-10 opacity-5">
          <div className="h-48 w-48 rounded-full border-4 border-amber-400" />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">UniManage System</CardTitle>
          <CardDescription className="text-blue-700">
            University Management Portal - Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                <Input
                  type="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
            </Button>
          </form>
          {/* You can remove or modify this section once real credentials are in place */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-700">
              Access restricted to university administration staff. Contact IT support for access.
            </p>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;