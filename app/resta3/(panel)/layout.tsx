// Auth guard de RESTA3: el route group (panel) excluye /resta3/login de esta protección,
// evitando el bucle de redirección que ocurre si el layout protege su propia ruta de login.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'

export default async function Resta3Layout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = jar.get('resta3_session')?.value
  if (!verifySession(session)) redirect('/resta3/login')
  return <>{children}</>
}
