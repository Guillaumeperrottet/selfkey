"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  company: string;
  project: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    project: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    <div className="min-h-screen bg-white">
      {/* Header harmonisé */}
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Desktop header */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 bg-[#84994F]/10 text-[#84994F] px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-[#84994F] rounded-full animate-pulse"></div>
                <span>24H/24 - 7J/7</span>
              </div>
              <Link
                href="/contact"
                className="text-[#84994F] text-sm font-bold tracking-wide uppercase hover:text-[#84994F]/80 transition-colors duration-300"
              >
                CONTACTEZ-NOUS
              </Link>
            </div>

            {/* Mobile header */}
            <div className="flex lg:hidden items-center justify-between w-full">
              <div className="flex items-center space-x-1.5 bg-[#84994F]/10 text-[#84994F] px-2.5 py-1 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-[#84994F] rounded-full animate-pulse"></div>
                <span>24H/24 - 7J/7</span>
              </div>
              <Link
                href="/"
                className="group flex items-center space-x-2 text-gray-600 hover:text-[#84994F] transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm">Accueil</span>
              </Link>
              <Link
                href="/contact"
                className="text-[#84994F] text-xs font-bold tracking-wide uppercase hover:text-[#84994F]/80 transition-colors duration-300"
              >
                CONTACT
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#84994F]/10 text-[#84994F] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>💬</span>
            <span>Parlons de votre projet</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Contactez <span className="text-[#84994F]">SelfCamp</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Une question ? Besoin d&apos;informations ? Nous sommes à votre
            écoute
          </p>
        </div>

        {/* Contact direct - En premier */}
        <div className="mb-10">
          <div className="bg-[#84994F]/3 rounded-2xl border border-[#84994F]/20 p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Contactez-nous directement
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#84994F]/30 p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-8">
                <a
                  href="mailto:perrottet.guillaume.97@gmail.com"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center group-hover:bg-[#84994F] transition-colors flex-shrink-0">
                    <Mail className="h-5 w-5 text-[#84994F] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">
                      Email
                    </div>
                    <div className="text-base text-gray-900 group-hover:text-[#84994F] transition-colors">
                      perrottet.guillaume.97@gmail.com
                    </div>
                  </div>
                </a>

                <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                <a
                  href="tel:+41793414074"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center group-hover:bg-[#84994F] transition-colors flex-shrink-0">
                    <Phone className="h-5 w-5 text-[#84994F] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">
                      Téléphone
                    </div>
                    <div className="text-base text-gray-900 group-hover:text-[#84994F] transition-colors">
                      +41 79 341 40 74
                    </div>
                  </div>
                </a>

                <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#84994F]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">
                      Localisation
                    </div>
                    <div className="text-base text-gray-900">
                      Rue de Battentin 1
                    </div>
                    <div className="text-base text-gray-900">1630 Bulle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Ou écrivez-nous
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Décrivez votre projet, nous vous répondrons rapidement
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Messages de statut */}
              {submitStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    Message envoyé avec succès ! Nous vous recontacterons
                    rapidement.
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">{errorMessage}</div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nom et prénom *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Jean Dupont"
                    className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email *
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="jean.dupont@websud.ch"
                    className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700"
                >
                  Commune / parking / emplacement *
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Nom"
                  className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project"
                  className="text-sm font-medium text-gray-700"
                >
                  Votre projet
                </Label>
                <Textarea
                  id="project"
                  name="project"
                  rows={4}
                  value={formData.project}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Décrivez votre situation : camping sauvage actuel, objectifs, contraintes..."
                  className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#84994F] hover:bg-[#84994F]/90 text-white h-12 rounded-xl font-semibold text-[15px] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
