'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) router.push('/dashboard');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Login successful!');
      }
      router.push('/dashboard');
    } catch (error: any) {
      if (!isSignup && (error.message?.includes('Invalid') || error.message?.includes('not found'))) {
        toast.error('Account not found. Please sign up first.');
      } else {
        toast.error(error.message || (isSignup ? 'Signup failed' : 'Login failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">TaskCent</h1>
          </div>
          <p className="text-gray-600 text-sm">Manage your tasks</p>
        </div>

        <div>
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">{isSignup ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <p className="text-sm text-gray-500 text-center">
              {isSignup ? 'Sign up to get started' : 'Sign in to your account'}
            </p>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isSignup && <p className="text-xs text-gray-500">Must be at least 6 characters</p>}
              </div>
              <div>
                <Button 
                  type="submit" 
                  className="w-full h-11 mt-6" 
                  disabled={loading}
                >
                  {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}