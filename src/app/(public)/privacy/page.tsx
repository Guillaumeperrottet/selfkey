/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Campings Potentille",
  description: "Politique de confidentialité et protection des données",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

      <div className="prose max-w-none">
        <p className="text-lg mb-8">
          La protection de vos données personnelles est une priorité pour
          Campings Potentille. Cette politique explique comment nous collectons,
          utilisons et protégeons vos informations.
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Responsable du traitement
          </h2>
          <div className="bg-gray-50 p-4 rounded">
            <p>
              <strong>Campings Potentille SA</strong>
            </p>
            <p>L'Etrey 81, 1643 Gumefens, Suisse</p>
            <p>IDE: CHE-217.3.535.254-7</p>
            <p>Email: info@potentille.ch</p>
            <p>Téléphone: +41 (0)79 695 45 22</p>
          </div>
        </section>{" "}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Données collectées</h2>
          <p className="mb-4">
            Nous collectons les données suivantes lors de votre réservation:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Données d'identification:</strong> nom, prénom, date et
              lieu de naissance
            </li>
            <li>
              <strong>Coordonnées:</strong> email, téléphone, adresse postale
            </li>
            <li>
              <strong>Informations de séjour:</strong> dates, nombre de
              personnes, véhicule
            </li>
            <li>
              <strong>Données de paiement:</strong> traitées de manière
              sécurisée par Stripe
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Finalités du traitement
          </h2>
          <p className="mb-4">Vos données sont utilisées pour:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gérer votre réservation et votre séjour</li>
            <li>Traiter votre paiement de manière sécurisée</li>
            <li>Vous envoyer des confirmations et informations importantes</li>
            <li>Respecter nos obligations légales (tenue de registre)</li>
            <li>Améliorer nos services</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Base légale</h2>
          <p>Le traitement de vos données repose sur:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Contrat:</strong> nécessaire à l'exécution de votre
              réservation
            </li>
            <li>
              <strong>Obligation légale:</strong> conservation des données
              fiscales et comptables
            </li>
            <li>
              <strong>Consentement:</strong> pour les communications marketing
              (optionnel)
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Partage des données
          </h2>
          <p className="mb-4">Nous partageons vos données uniquement avec:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Stripe:</strong> notre prestataire de paiement sécurisé
              (certifié PCI-DSS)
            </li>
            <li>
              <strong>Autorités:</strong> sur demande légale (fiscale, police,
              etc.)
            </li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <p className="font-semibold">
              Nous ne vendons jamais vos données à des tiers.
            </p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Durée de conservation
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Données de réservation:</strong> 10 ans (obligation
              comptable)
            </li>
            <li>
              <strong>Données marketing:</strong> jusqu'à votre désinscription
            </li>
            <li>
              <strong>Données de paiement:</strong> conservées par Stripe selon
              leurs règles
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Vos droits</h2>
          <p className="mb-4">
            Conformément à la LPD (Suisse) et au RGPD, vous disposez des droits
            suivants:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Droit d'accès:</strong> obtenir une copie de vos données
            </li>
            <li>
              <strong>Droit de rectification:</strong> corriger vos données
              inexactes
            </li>
            <li>
              <strong>Droit à l'effacement:</strong> demander la suppression de
              vos données
            </li>
            <li>
              <strong>Droit d'opposition:</strong> vous opposer au traitement
            </li>
            <li>
              <strong>Droit à la portabilité:</strong> recevoir vos données dans
              un format structuré
            </li>
          </ul>
          <div className="bg-gray-50 p-4 rounded mt-4">
            <p className="font-semibold mb-2">Pour exercer vos droits:</p>
            <p>
              Email:{" "}
              <a
                href="mailto:info@potentille.ch"
                className="text-blue-600 hover:underline"
              >
                info@potentille.ch
              </a>
            </p>
            <p>Nous répondrons dans un délai de 30 jours maximum.</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Sécurité</h2>
          <p className="mb-4">
            Nous mettons en œuvre des mesures de sécurité appropriées:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Chiffrement SSL/TLS pour toutes les communications</li>
            <li>Stockage sécurisé des données</li>
            <li>Paiements traités par Stripe (certifié PCI-DSS niveau 1)</li>
            <li>Accès limité aux données aux seules personnes autorisées</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
          <p className="mb-4">
            Notre site utilise des cookies essentiels pour:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintenir votre session de réservation</li>
            <li>Sécuriser vos transactions</li>
            <li>Améliorer l'expérience utilisateur</li>
          </ul>
          <p className="mt-4">
            Vous pouvez désactiver les cookies dans votre navigateur, mais cela
            peut affecter certaines fonctionnalités.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier cette politique. Les
            modifications seront publiées sur cette page avec la date de mise à
            jour.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            11. Contact et réclamations
          </h2>
          <p className="mb-4">
            Pour toute question ou réclamation concernant vos données:
          </p>
          <div className="bg-gray-50 p-4 rounded">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@potentille.ch"
                className="text-blue-600 hover:underline"
              >
                info@potentille.ch
              </a>
            </p>
            <p>
              <strong>Téléphone:</strong> +41 (0)79 695 45 22
            </p>
          </div>
          <p className="mt-4">
            Vous avez également le droit de déposer une plainte auprès du
            <strong>
              {" "}
              Préposé fédéral à la protection des données et à la transparence
              (PFPDT)
            </strong>
            .
          </p>
        </section>
        <div className="border-t pt-6 mt-12 text-sm text-gray-600">
          <p>
            <strong>Dernière mise à jour:</strong> Octobre 2025
          </p>
          <p>
            <strong>Version:</strong> 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
