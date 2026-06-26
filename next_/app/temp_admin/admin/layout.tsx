import AdminLayout from '@/components/admin/AdminLayout';
import '@/app/admin/css/custom.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
