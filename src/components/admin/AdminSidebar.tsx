'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  X,
  Layers
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/analytics', label: 'Analytiques', icon: BarChart3 },
]

interface AdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export default function AdminSidebar({ user, isMobileMenuOpen, setIsMobileMenuOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-64 bg-neutral-900 border-r border-neutral-800
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image
              src="/images/logo/logo.png"
              alt="Luxonera Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-logo text-accent-gold">LUXONERA</h1>
            <p className="text-xs text-neutral-500">Admin Panel</p>
          </div>
        </div>

        {/* Close button (mobile only) */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent-gold text-black font-medium'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 text-neutral-300 text-sm">
          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
            <span className="font-medium text-accent-gold">{user.name?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}
