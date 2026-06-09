// Server component: misma estructura que admin/layout pero protege con employee_session cookie.
// Lee settings en servidor para BrandProvider sin parpadeo.
import { getSetting } from '@/lib/settingsDb'
import { getFeatureFlags } from '@/lib/features'
import BrandProvider from '@/app/components/BrandProvider'
import FeatureGuard from '@/app/components/FeatureGuard'

export const dynamic = 'force-dynamic'

// Aplica el tema guardado antes de pintar para evitar el "flash" de tema incorrecto.
const THEME_INIT = `try{var t=localStorage.getItem('admin_theme')||'dark';document.documentElement.setAttribute('data-admin-theme',t);}catch(e){}`

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  // Se leen en el servidor para que el nombre/logo/color estén presentes desde el primer render.
  const [name, logo, accent, features] = await Promise.all([
    getSetting('restaurant_name'),
    getSetting('profile_logo'),
    getSetting('sidebar_accent'),
    getFeatureFlags(),
  ])

  // Color del scrollbar = color de acento configurado en el panel de admin.
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
      <BrandProvider value={{ name, logo, accent, features }}>
        {/* FeatureGuard redirige al inicio si el empleado intenta acceder a un módulo desactivado */}
        <FeatureGuard />
        {children}
      </BrandProvider>
    </>
  )
}
