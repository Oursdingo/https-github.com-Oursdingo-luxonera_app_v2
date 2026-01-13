'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Erreur', {
          description: 'Identifiants invalides',
        })
      } else {
        toast.success('Connexion réussie')
        router.push('/admin')
        router.refresh()
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Une erreur est survenue',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/images/logo/logo.png"
              alt="Luxonera Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h1 className="text-3xl font-logo text-accent-gold">LUXONERA</h1>
          </div>
          <p className="text-neutral-400">Administration</p>
        </div>

        {/* Login Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-display text-white mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-600 rounded-lg focus:outline-none focus:border-accent-gold transition-colors text-white placeholder-neutral-500"
                placeholder="admin@luxonera.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-600 rounded-lg focus:outline-none focus:border-accent-gold transition-colors text-white placeholder-neutral-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-gold hover:bg-accent-gold/90 disabled:bg-neutral-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-500 text-sm mt-6">
          Luxonera Admin Panel v1.0
        </p>
      </div>
    </div>
  )
}
