import { redirect } from 'next/navigation'

export const metadata = {
  title: 'WML 1.0 archive - White Mirror Lab',
  description: 'Archived WML 1.0 profile links now point to the results archive.',
}

export default function PublicProfileRedirect() {
  redirect('/wml-1-0')
}
