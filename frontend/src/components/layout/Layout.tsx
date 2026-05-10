import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          HomeBase &copy; {new Date().getFullYear()} — Toronto Housing Intelligence
        </div>
      </footer>
    </div>
  )
}
