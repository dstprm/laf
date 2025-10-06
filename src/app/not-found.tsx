import Link from 'next/link';
import Header from '@/components/home/header/header';
import { Footer } from '@/components/home/footer/footer';

export default function NotFound() {
  return (
    <>
      {/* Add a sentinel div for the header's sticky behavior */}
      <div id="nav-sentinel" className="absolute top-0 h-px w-full" />

      <Header user={null} />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <div className="-mt-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Página no encontrada</h2>
              <p className="text-gray-600 mb-8">
                Lo sentimos, no pudimos encontrar la página que estás buscando. Puede que haya sido movida o eliminada.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Ir a la página principal
            </Link>

            <Link
              href="/free-valuation"
              className="block w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Crear una valuación
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
