'use client'

import AdminPanelLayout from '@/components/admin-panel/admin-panel-layout'
import { Toaster } from '@/components/ui/sonner'


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminPanelLayout>{children} <Toaster position="bottom-center"/> </AdminPanelLayout>
}
