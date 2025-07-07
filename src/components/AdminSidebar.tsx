"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Hotel,
  BarChart3,
  Bed,
  DollarSign,
  MessageSquare,
  KeyRound,
  Users,
  Zap,
  Settings,
  QrCode,
  ExternalLink,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminSidebarProps {
  hotel: string;
  establishmentName: string;
  isStripeConfigured: boolean;
  stripeAccountId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  {
    id: "overview",
    name: "Vue d'ensemble",
    icon: BarChart3,
  },
  {
    id: "bookings",
    name: "Réservations",
    icon: Users,
  },
  {
    id: "rooms",
    name: "Chambres",
    icon: Bed,
  },
  {
    id: "pricing",
    name: "Options de prix",
    icon: DollarSign,
  },
  {
    id: "confirmations",
    name: "Confirmations",
    icon: MessageSquare,
  },
  {
    id: "access-codes",
    name: "Codes d'accès",
    icon: KeyRound,
  },
  {
    id: "integrations",
    name: "Intégrations",
    icon: Zap,
  },
  {
    id: "settings",
    name: "Paramètres",
    icon: Settings,
  },
];

export function AdminSidebar({
  hotel,
  establishmentName,
  isStripeConfigured,
  stripeAccountId,
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col" data-tutorial="admin-sidebar">
      {/* Logo et nom */}
      <div className="flex h-16 items-center border-b px-4">
        <Hotel className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold truncate">
          {establishmentName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 pt-4">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === item.id && "bg-muted font-medium"
            )}
            onClick={() => onTabChange(item.id)}
            data-tutorial={`nav-${item.id}`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>

      <Separator />

      {/* Actions rapides */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
          data-tutorial="qr-code-link"
        >
          <Link href={`/admin/${hotel}/qr-code`}>
            <QrCode className="mr-2 h-4 w-4" />
            Code QR
          </Link>
        </Button>

        {isStripeConfigured && stripeAccountId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            asChild
            data-tutorial="stripe-dashboard"
          >
            <a
              href={`https://dashboard.stripe.com/connect/accounts/${stripeAccountId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
          data-tutorial="back-to-establishments"
        >
          <Link href="/establishments">
            <LogOut className="mr-2 h-4 w-4" />
            Retour aux établissements
          </Link>
        </Button>
      </div>

      {/* Statut Stripe */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Paiements</span>
          <Badge variant={isStripeConfigured ? "default" : "secondary"}>
            {isStripeConfigured ? "Activé" : "Configuration requise"}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
