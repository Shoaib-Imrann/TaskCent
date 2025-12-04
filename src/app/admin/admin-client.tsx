'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminClient() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Next.js 14 (React Framework)</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Zustand (State Management)</li>
                    <li>• Radix UI (Component Library)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Backend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Node.js with Express</li>
                    <li>• Sequelize (ORM)</li>
                    <li>• PostgreSQL (Database)</li>
                    <li>• JWT (Authentication)</li>
                    <li>• bcryptjs (Password Hashing)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/dashboard">
                    <Button>
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
