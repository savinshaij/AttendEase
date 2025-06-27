// app/admin/page.js - This will be the default route (/admin)
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}