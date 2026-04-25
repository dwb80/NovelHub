import { redirect } from 'next/navigation';

/**
 * /admin 根路径重定向到仪表盘
 */
export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
