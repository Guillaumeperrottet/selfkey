"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Créons ensemble une aire de camping-car dans votre commune
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            Vous êtes une commune suisse confrontée au camping sauvage ou
            souhaitant développer le tourisme local ? SelfCamp propose une
            solution complète pour créer des aires de camping-car légales,
            organisées et rentables.
          </p>
          <div className="bg-[#84994F]/10 border border-[#84994F]/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-[#84994F] font-medium">
              🏛️ Solution spécialement conçue pour les communes suisses
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="border-t-4 border-t-[#84994F]">
              <CardHeader>
                <CardTitle>Demande d&apos;information</CardTitle>
                <CardDescription>
                  Parlez-nous de votre commune et de vos besoins. Nous
                  étudierons ensemble la faisabilité d&apos;une aire de
                  camping-car SelfCamp.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Messages de statut */}
                  {submitStatus === "success" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Message envoyé avec succès ! Nous vous recontacterons
                        rapidement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom et prénom</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Jean Dupont"
                        className="focus:ring-[#84994F]/20 focus:border-[#84994F]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        placeholder="jean.dupont@commune.ch"
                        className="focus:ring-[#84994F]/20 focus:border-[#84994F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Commune</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Nom de votre commune"
                      className="focus:ring-[#84994F]/20 focus:border-[#84994F]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">
                      Votre projet d&apos;aire de camping-car
                    </Label>
                    <Textarea
                      id="project"
                      name="project"
                      rows={4}
                      value={formData.project}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Parlez-nous de votre projet : situation actuelle, objectifs, contraintes..."
                      className="focus:ring-[#84994F]/20 focus:border-[#84994F]"
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      required
                      disabled={isSubmitting}
                      className="mt-1 h-4 w-4"
                    />
                    <Label
                      htmlFor="privacy"
                      className="text-sm leading-relaxed"
                    >
                      J&apos;accepte que mes données soient traitées
                      conformément à la{" "}
                      <Link
                        href="/privacy"
                        className="underline hover:no-underline"
                      >
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#84994F] hover:bg-[#84994F]/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informations de contact */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Équipe SelfCamp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">
                      gp@webbing.ch
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="font-medium">Téléphone</div>
                    <div className="text-sm text-muted-foreground">
                      +41 79 341 40 74
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="font-medium">Région d&apos;activité</div>
                    <div className="text-sm text-muted-foreground">
                      Canton de Fribourg, Suisse
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solution SelfCamp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Nous accompagnons les communes suisses dans la création
                  d&apos;aires de camping-car légales et organisées.
                  Infrastructure, signalétique, système d&apos;enregistrement
                  numérique et conformité réglementaire.
                </p>
                <div className="text-sm font-medium">
                  Étude de faisabilité gratuite
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#84994F]">
              <CardHeader>
                <CardTitle className="text-[#84994F]">
                  Bénéfices pour votre commune
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">
                    Conformité légale et contrôle du camping sauvage
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Nouvelles recettes pour la commune</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">Dynamisation du commerce local</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#84994F] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">
                    Valorisation touristique de votre région
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
