import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              SelfKey
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#about"
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
            >
              À propos
            </Link>
            <Link
              href="/admin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Administration
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Check-in autonome
            <span className="block text-indigo-600 dark:text-indigo-400">
              24h/24
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            La solution parfaite pour les arrivées tardives quand la réception
            est fermée. Vos clients peuvent s&apos;enregistrer et accéder à leur
            chambre à toute heure grâce à notre système de check-in automatisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/admin"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Accéder à l&apos;administration
            </Link>
            <Link
              href="#features"
              className="border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-200"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌙</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Arrivées tardives
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Plus besoin d&apos;attendre la réception ! Vos clients arrivent
              quand ils veulent, même après 22h ou le weekend.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Paiements Stripe
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Intégration complète avec Stripe Connect pour des paiements
              sécurisés et automatisés.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">�</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Check-in automatique
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan du QR code, paiement en ligne sécurisé et réception d&apos;un
              email avec le code d&apos;accès. Aucun accès n&apos;est donné tant
              que le paiement n&apos;est pas validé.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="mt-24 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Réception fermée ? Pas de problème !
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              SelfKey permet aux clients de s&apos;enregistrer automatiquement,
              même quand votre équipe n&apos;est pas présente. Après paiement
              validé, ils reçoivent un email de confirmation avec leur code
              d&apos;accès ou les instructions pour récupérer leur carte.
              Parfait pour les hôtels, chambres d&apos;hôtes et locations
              saisonnières.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 mt-24 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🔑</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SelfKey
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Solution de check-in autonome pour arrivées tardives
          </p>
        </div>
      </footer>
    </div>
  );
}
