import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'

function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.20),_transparent_28%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_40%,#f8fafc_100%)] text-stone-900">
      <div className="relative min-h-screen">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_65%)]" />
        <SiteHeader />

        <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
