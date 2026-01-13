import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-neutral-900 text-white px-6">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-display mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-display mb-6">Page non trouvée</h2>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  )
}
