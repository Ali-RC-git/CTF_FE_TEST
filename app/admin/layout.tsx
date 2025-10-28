import { ReactNode } from 'react';
import { Metadata } from 'next';
import AdminLayoutClient from './components/AdminLayoutClient';
import AdminRouteGuard from '@/components/auth/AdminRouteGuard';

export const metadata: Metadata = {
  title: 'CRDF Global - Admin Dashboard',
  description: 'Admin dashboard for CRDF Global CTF platform',
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRouteGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminRouteGuard>
  );
}