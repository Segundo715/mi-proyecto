import { getSetting } from '@/lib/settingsDb'
import { getFeatureFlags } from '@/lib/features'
import BrandProvider from '@/app/components/BrandProvider'

export const dynamic = 'force-dynamic'

const THEME_INIT = `try{var t=localStorage.getItem('admin_theme')||'dark';document.documentElement.setAttribute('data-admin-theme',t);}catch(e){}`

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [name, logo, accent, features] = await Promise.all([
    getSetting('restaurant_name'),
    getSetting('profile_logo'),
    getSetting('sidebar_accent'),
    getFeatureFlags(),
  ])

  const scroll = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#00e676'
  const SCROLL_CSS = `
    html { scrollbar-color: ${scroll} transparent; scrollbar-width: thin; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${scroll}; border-radius: 999px; }
  `

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      <style dangerouslySetInnerHTML={{ __html: SCROLL_CSS }} />
      <BrandProvider value={{ name, logo, accent, features }}>{children}</BrandProvider>
    </>
  )
}
