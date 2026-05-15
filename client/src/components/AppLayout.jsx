import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'

function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7f4] text-stone-900">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(16,185,129,0.10)_42%,rgba(14,165,233,0.08))]" />
        <SiteHeader />

        <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
