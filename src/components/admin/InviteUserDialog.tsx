"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Copy, CheckCircle, Loader2 } from "lucide-react";
import { toastUtils } from "@/lib/toast-utils";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInviteUrl("");

    try {
      const response = await fetch("/api/admin/generate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setInviteUrl(data.inviteUrl);
      toastUtils.success("Lien d'invitation généré avec succès !");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMsg);
      toastUtils.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toastUtils.success("Lien copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setInviteUrl("");
    setError("");
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Inviter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Générez un lien d&apos;invitation sécurisé pour permettre à un
            nouvel utilisateur de créer son compte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!inviteUrl ? (
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utilisateur@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  L&apos;invitation sera liée à cette adresse email
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Générer le lien
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Lien d&apos;invitation créé avec succès pour{" "}
                  <strong>{email}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Lien d&apos;invitation</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Ce lien est valide pendant 7 jours et ne peut être utilisé
                  qu&apos;une seule fois.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Conseil :</strong> Envoyez ce lien directement à
                  l&apos;utilisateur par email ou message sécurisé. Ne le
                  partagez pas publiquement.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={handleClose}>Terminer</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
