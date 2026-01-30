import { redirect } from 'next/navigation'
import { validateSession } from '@/lib/actions'
import { getAllEvents } from '@/lib/events'
import { AdminDashboard } from './dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const isValid = await validateSession()

  if (!isValid) {
    redirect('/admin/login')
  }

  const events = await getAllEvents()

  return <AdminDashboard events={events} />
}
