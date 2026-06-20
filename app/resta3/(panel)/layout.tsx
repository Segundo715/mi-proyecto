// Auth guard de RESTA3 + BrandProvider para que Resta3Nav pueda leer logo/nombre/acento del admin.
// La cookie resta3_session es independiente de admin_session y employee_session.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import { getSetting } from '@/lib/settingsDb'
import { getFeatureFlags } from '@/lib/features'
import BrandProvider from '@/app/components/BrandProvider'
import AIChat from '@/app/components/AIChat'
import RightRail from '@/app/components/RightRail'

export const dynamic = 'force-dynamic'

const THEME_INIT = `try{var t=localStorage.getItem('admin_theme')||'dark';document.documentElement.setAttribute('data-admin-theme',t);}catch(e){}`

export default async function Resta3Layout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = jar.get('resta3_session')?.value
  if (!verifySession(session)) redirect('/resta3/login')

  const [name, logo, accent, features] = await Promise.all([
    getSetting('restaurant_name'),
    getSetting('profile_logo'),
    getSetting('sidebar_accent'),
    getFeatureFlags(),
  ])

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      <BrandProvider value={{
        name:    name,
        logo:    logo,
        accent:  accent,
        features,
      }}>
        <RightRail>
          {children}
        </RightRail>
        <AIChat />
      </BrandProvider>
    </>
  )
}
