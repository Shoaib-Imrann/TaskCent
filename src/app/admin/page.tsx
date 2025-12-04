import { Metadata } from 'next';
import AdminClient from './admin-client';

export const metadata: Metadata = {
  title: 'Settings - TaskCent',
  description: 'TaskCent settings and tech stack information',
};

export default function AdminPage() {
  return <AdminClient />;
}
