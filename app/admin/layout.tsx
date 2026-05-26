// Aplica el tema guardado (data-admin-theme) antes de pintar, para evitar
// el "flash" de tema incorrecto al cargar cualquier vista de /admin.
const THEME_INIT = `try{var t=localStorage.getItem('admin_theme')||'dark';document.documentElement.setAttribute('data-admin-theme',t);}catch(e){}`

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      {children}
    </>
  )
}
