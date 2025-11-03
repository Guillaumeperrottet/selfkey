"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelfkeyFooter } from "@/components/public-pages/selfkey-footer";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  company: string;
  project: string;
}

export function SelfkeyContactPage() {
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
        setErrorMessage(
          result.error || "Une erreur est survenue lors de l'envoi du message."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitStatus("error");
      setErrorMessage("Erreur de connexion. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
                SelfKey
              </h1>
            </Link>
          </div>
          <nav className="hidden md:flex gap-2 items-center">
            <Button asChild variant="ghost" size="sm" className="font-normal">
              <Link href="/#features">Fonctionnalités</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="font-normal">
              <Link href="/#benefits">Avantages</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/establishments">Connexion</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>💬</span>
            <span>Nous contacter</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Contactez l&apos;équipe{" "}
            <span
              className="text-blue-600 dark:text-blue-400"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
            >
              SelfKey
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Une question sur notre solution de check-in automatique ? Notre
            équipe est là pour vous aider.
          </p>
        </div>

        {/* Contact direct - En premier */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Contact direct
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-around gap-6 md:gap-8">
              <a
                href="mailto:gp@webbing.ch"
                className="flex items-center gap-3 group w-full md:w-auto"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Email
                  </div>
                  <div className="text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    gp@webbing.ch
                  </div>
                </div>
              </a>

              <div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-800"></div>

              <a
                href="tel:+41793414074"
                className="flex items-center gap-3 group w-full md:w-auto"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Téléphone
                  </div>
                  <div className="text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    +41 79 341 40 74
                  </div>
                </div>
              </a>

              <div className="hidden md:block w-px h-12 bg-gray-200 dark:bg-gray-800"></div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Localisation
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    Rue de Battentin 1
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    1630 Bulle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Envoyez-nous un message
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Décrivez votre projet et nous vous répondrons rapidement
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Messages de statut */}
              {submitStatus === "success" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    Merci pour votre message ! Nous vous répondrons dans les
                    plus brefs délais.
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Jean Dupont"
                    className="border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder="jean@exemple.ch"
                    className="border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Établissement / Entreprise
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Hôtel du Lac, Camping Les Étoiles..."
                  className="border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Décrivez votre projet (optionnel)
                </Label>
                <Textarea
                  id="project"
                  name="project"
                  rows={4}
                  value={formData.project}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Parlez-nous de votre établissement et de vos besoins..."
                  className="border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-semibold text-[15px] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
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

      {/* Footer */}
      <SelfkeyFooter />
    </div>
  );
}
