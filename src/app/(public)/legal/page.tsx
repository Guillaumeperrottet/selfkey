/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales - Campings Potentille",
  description: "Mentions légales et conditions générales des Campings Potentille",
};

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>
      
      {/* Informations légales */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Informations légales</h2>
        <div className="bg-gray-50 p-6 rounded-lg space-y-2">
          <p><strong>Raison sociale :</strong> Campings Potentille SA</p>
          <p><strong>Siège social :</strong> [Votre adresse complète]</p>
          <p><strong>Numéro IDE :</strong> CHE-XXX.XXX.XXX</p>
          <p><strong>Email :</strong> <a href="mailto:info@potentille.ch" className="text-blue-600 hover:underline">info@potentille.ch</a></p>
          <p><strong>Téléphone :</strong> <a href="tel:+41796954522" className="text-blue-600 hover:underline">+41 (0)79 695 45 22</a></p>
          <p><strong>Site web :</strong> <a href="https://www.potentille.ch" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.potentille.ch</a></p>
        </div>
      </section>

      {/* Droit de rétractation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Droit de rétractation</h2>
        <div className="prose max-w-none">
          <p className="mb-4">
            Conformément à la législation suisse sur le commerce électronique (LCEl), 
            vous disposez d'un droit de rétractation de <strong>14 jours</strong> à compter 
            de la confirmation de votre réservation.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Comment exercer votre droit de rétractation :</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Par email à : <a href="mailto:info@potentille.ch" className="text-blue-600 hover:underline">info@potentille.ch</a></li>
            <li>Par téléphone au : <a href="tel:+41796954522" className="text-blue-600 hover:underline">+41 (0)79 695 45 22</a></li>
            <li>Par courrier à l'adresse indiquée ci-dessus</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold mb-2">Conditions de remboursement :</p>
            <p>
              En cas de rétractation dans le délai légal, nous vous rembourserons 
              l'intégralité des sommes versées dans un délai de <strong>14 jours</strong> suivant 
              la réception de votre demande de rétractation.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3">Exceptions :</h3>
          <p className="mb-4">
            Le droit de rétractation ne s'applique pas aux réservations dont la date 
            d'arrivée est prévue dans un délai inférieur à 14 jours. Dans ce cas, 
            nos conditions d'annulation standard s'appliquent.
          </p>
        </div>
      </section>

      {/* Conditions générales */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Conditions Générales de Vente</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">1. Réservations</h3>
            <p>
              Les réservations sont confirmées dès réception du paiement complet. 
              Une confirmation vous sera envoyée par email avec tous les détails de votre séjour.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2. Moyens de paiement acceptés</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cartes de crédit et débit (Visa, Mastercard)</li>
              <li>TWINT (paiement mobile suisse)</li>
              <li>Autres moyens de paiement selon disponibilité</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">3. Politique d'annulation</h3>
            <p className="mb-2">
              En dehors du délai de rétractation légal de 14 jours :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Annulation gratuite jusqu'à 7 jours avant l'arrivée</li>
              <li>Entre 7 et 3 jours : remboursement de 50%</li>
              <li>Moins de 3 jours : aucun remboursement</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">4. Protection des données</h3>
            <p>
              Vos données personnelles sont traitées conformément à la Loi fédérale 
              sur la protection des données (LPD) et au Règlement général sur la 
              protection des données (RGPD). Pour plus d'informations, consultez
              notre <Link href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</Link>.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">5. Règlement du camping</h3>
            <p>
              Les campeurs s'engagent à respecter le règlement intérieur du camping 
              qui leur sera communiqué lors de l'arrivée.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="mb-4">
          Pour toute question concernant nos conditions générales ou l'exercice 
          de vos droits, n'hésitez pas à nous contacter :
        </p>
        <div className="space-y-2">
          <p><strong>Email :</strong> <a href="mailto:info@potentille.ch" className="text-blue-600 hover:underline">info@potentille.ch</a></p>
          <p><strong>Téléphone :</strong> <a href="tel:+41796954522" className="text-blue-600 hover:underline">+41 (0)79 695 45 22</a></p>
          <p><strong>Site web :</strong> <a href="https://www.potentille.ch" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.potentille.ch</a></p>
        </div>
      </section>

      {/* Dernière mise à jour */}
      <section className="text-sm text-gray-600 border-t pt-6">
        <p>Dernière mise à jour : Octobre 2025</p>
        <p>Version : 1.0</p>
      </section>
    </div>
  );
}
