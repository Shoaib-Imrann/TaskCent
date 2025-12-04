import { Metadata } from 'next';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard - TaskCent',
  description: 'Manage your tasks efficiently with TaskCent dashboard',
  keywords: ['task management', 'productivity', 'dashboard'],
};

export default function DashboardPage() {
  return <DashboardClient />;
}
