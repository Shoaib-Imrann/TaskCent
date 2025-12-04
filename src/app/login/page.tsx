import { Metadata } from 'next';
import LoginClient from './login-client';

export const metadata: Metadata = {
  title: 'Login - TaskCent',
  description: 'Sign in to TaskCent to manage your tasks efficiently',
};

export default function LoginPage() {
  return <LoginClient />;
}
