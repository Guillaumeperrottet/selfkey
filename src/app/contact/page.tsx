"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelfcampFooter } from "@/components/public-pages/selfcamp-footer";
import { SelfcampLanguageSelector } from "@/components/ui/selfcamp-language-selector";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

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

export default function ContactPage() {
  const { t } = useSelfcampTranslation();

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
  const [formStarted, setFormStarted] = useState(false);

  // Analytics hook
  const { trackContact } = useAnalytics();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Track form started on first input
    if (!formStarted && value.length > 0) {
      setFormStarted(true);
      trackContact.formStarted();
    }

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
        // Track successful submission
        trackContact.formSubmitted(true);

        // Reset form
        setFormData({
          name: "",
          email: "",
          company: "",
          project: "",
        });
        setFormStarted(false);
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || t.contactPage.errorMessage);
        // Track form error
        trackContact.formError(result.error || "submission_failed");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setSubmitStatus("error");
      setErrorMessage(t.contactPage.connectionError);
      // Track connection error
      trackContact.formError("connection_error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec logo noir compact - identique à About */}
      <header className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Logo à gauche */}
            <div className="flex items-center">
              <Link
                href="/"
                onClick={() => trackContact.formError("logo_desktop_click")}
              >
                <Image
                  src="/logo.png"
                  alt="SelfCamp Logo"
                  width={140}
                  height={70}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Navigation à droite */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                onClick={() =>
                  trackContact.formError("home_menu_desktop_click")
                }
                className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
              >
                {t.map.home}
              </Link>
              <Link
                href="/map"
                className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
              >
                Map
              </Link>
              <Link
                href="/about"
                className="text-gray-900 font-bold text-base hover:text-gray-700 transition-colors"
              >
                {t.map.about}
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <SelfcampLanguageSelector variant="compact" theme="dark" />
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="flex lg:hidden items-center justify-between w-full">
            {/* Logo à gauche */}
            <div className="flex items-center">
              <Link
                href="/"
                onClick={() => trackContact.formError("logo_mobile_click")}
              >
                <Image
                  src="/logo.png"
                  alt="SelfCamp Logo"
                  width={90}
                  height={45}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Navigation à droite */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                onClick={() => trackContact.formError("home_menu_mobile_click")}
                className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
              >
                {t.map.home}
              </Link>
              <Link
                href="/map"
                className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
              >
                Map
              </Link>
              <Link
                href="/about"
                className="text-gray-900 font-bold uppercase tracking-wide text-[10px] hover:text-gray-700 transition-colors"
              >
                About
              </Link>
              <div className="border-l border-gray-300 pl-2">
                <SelfcampLanguageSelector variant="minimal" theme="dark" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#84994F]/10 text-[#84994F] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>💬</span>
            <span>{t.contactPage.badge}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t.contactPage.title}{" "}
            <span className="text-[#84994F]">{t.contactPage.titleBrand}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {t.contactPage.subtitle}
          </p>
        </div>

        {/* Contact direct - En premier */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {t.contactPage.directContactTitle}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-around gap-6 md:gap-8">
              <a
                href="mailto:perrottet.guillaume.97@gmail.com"
                className="flex items-center gap-3 group w-full md:w-auto"
              >
                <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center group-hover:bg-[#84994F] transition-colors flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#84994F] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">
                    {t.contactPage.email}
                  </div>
                  <div className="text-base text-gray-900 group-hover:text-[#84994F] transition-colors">
                    perrottet.guillaume.97@gmail.com
                  </div>
                </div>
              </a>

              <div className="hidden md:block w-px h-12 bg-gray-200"></div>

              <a
                href="tel:+41793414074"
                className="flex items-center gap-3 group w-full md:w-auto"
              >
                <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center group-hover:bg-[#84994F] transition-colors flex-shrink-0">
                  <Phone className="h-5 w-5 text-[#84994F] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">
                    {t.contactPage.phone}
                  </div>
                  <div className="text-base text-gray-900 group-hover:text-[#84994F] transition-colors">
                    +41 79 341 40 74
                  </div>
                </div>
              </a>

              <div className="hidden md:block w-px h-12 bg-gray-200"></div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-[#84994F]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-[#84994F]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">
                    {t.contactPage.location}
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

        {/* Formulaire de contact */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {t.contactPage.formTitle}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {t.contactPage.formSubtitle}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Messages de statut */}
              {submitStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    {t.contactPage.successMessage}
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
                    {t.contactPage.nameLabel}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder={t.contactPage.namePlaceholder}
                    className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t.contactPage.emailLabel}
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder={t.contactPage.emailPlaceholder}
                    className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700"
                >
                  {t.contactPage.companyLabel}
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  placeholder={t.contactPage.companyPlaceholder}
                  className="border-gray-200 focus:ring-[#84994F]/20 focus:border-[#84994F] h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project"
                  className="text-sm font-medium text-gray-700"
                >
                  {t.contactPage.projectLabel}
                </Label>
                <Textarea
                  id="project"
                  name="project"
                  rows={4}
                  value={formData.project}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder={t.contactPage.projectPlaceholder}
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
                    {t.contactPage.sending}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t.contactPage.sendButton}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SelfcampFooter />
    </div>
  );
}
