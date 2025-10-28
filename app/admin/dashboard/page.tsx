import AdminView from '../components/AdminView';

export const metadata = {
  title: 'Admin Dashboard | CRDF Global',
  description: 'Admin dashboard for CRDF Global CTF platform',
};

export default function AdminDashboardPage() {
  return <AdminView activePage="dashboard" />;
}