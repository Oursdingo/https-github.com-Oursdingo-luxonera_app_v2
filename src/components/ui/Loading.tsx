export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-display text-neutral-800">Luxonera</h2>
        <p className="text-sm text-neutral-500 mt-2">Chargement...</p>
      </div>
    </div>
  )
}
