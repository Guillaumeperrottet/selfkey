"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  company: string;
  sector: string;
  companySize: string;
  project: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    sector: "",
    companySize: "",
    project: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        // Reset form
        setFormData({
          name: "",
          email: "",
          company: "",
          sector: "",
          companySize: "",
          project: "",
        });
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitStatus("error");
      setErrorMessage("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Parlons de votre{" "}
            <span className="text-gray-700">projet digital</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est prête à vous accompagner dans la digitalisation de
            votre entreprise. Découvrez comment nos solutions peuvent améliorer
            votre business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire de contact */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Contactez-nous
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages de statut */}
              {submitStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">
                    Message envoyé avec succès ! Nous vous recontacterons
                    rapidement.
                  </span>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{errorMessage}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Jean Forclaz"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="email@exemple.ch"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Entreprise
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sector"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Secteur d&apos;activité
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionnez votre secteur</option>
                    <option value="hotel">Hôtellerie</option>
                    <option value="parking">Parking / Stationnement</option>
                    <option value="camping">Camping / Tourisme</option>
                    <option value="commerce">Commerce</option>
                    <option value="immobilier">Immobilier</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="companySize"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Taille de l&apos;entreprise
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez la taille</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="200+">200+ employés</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Votre projet
                </label>
                <textarea
                  id="project"
                  name="project"
                  rows={4}
                  value={formData.project}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Décrivez vos besoins en digitalisation, vos objectifs de performance, ou toute question sur nos solutions..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:cursor-not-allowed"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  J&apos;accepte que mes données soient traitées conformément à
                  la{" "}
                  <Link
                    href="/privacy"
                    className="text-gray-900 hover:underline"
                  >
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white px-6 py-4 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Discuter de mon projet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Informations de contact */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Contact
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">gp@webbing.ch</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Téléphone</div>
                    <div className="text-gray-600">+41 79 341 40 74</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Site web</div>
                    <a
                      href="https://www.webbing.ch"
                      className="text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      www.webbing.ch
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Localisation
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Fribourg</h4>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                    <div className="text-gray-600">
                      Canton de Fribourg, Suisse
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <Phone className="h-5 w-5 text-gray-600 mt-1" />
                    <div className="text-gray-600">+41 79 341 40 74</div>
                  </div>
                  <div className="flex items-start space-x-3 mt-2">
                    <Mail className="h-5 w-5 text-gray-600 mt-1" />
                    <div className="text-gray-600">gp@webbing.ch</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Solutions digitales sur mesure
              </h3>
              <p className="text-gray-600 mb-4">
                Nous créons des solutions digitales adaptées à vos besoins. De
                SelfKey aux applications web complexes, nous transformons vos
                idées en outils performants.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Réponse garantie sous 24h ouvrées</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
