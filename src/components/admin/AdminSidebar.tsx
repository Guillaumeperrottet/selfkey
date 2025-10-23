"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import {
  BarChart3,
  Bed,
  DollarSign,
  MessageSquare,
  Users,
  User,
  Settings,
  QrCode,
  ExternalLink,
  LogOut,
  Menu,
  FileSpreadsheet,
  Car,
  ChevronDown,
  ChevronRight,
  Activity,
  Edit3,
  MapPin,
  Euro,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  group?: string;
  subItems?: NavSubItem[];
}

interface NavSubItem {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  name: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  hotel: string;
  establishmentName: string;
  isStripeConfigured: boolean;
  stripeAccountId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  enableDayParking?: boolean; // Nouveau prop pour l'état du parking jour
}

const baseNavigation = [
  // 📊 TABLEAU DE BORD
  {
    id: "overview",
    name: "Vue d'ensemble",
    icon: BarChart3,
    group: "dashboard",
  },

  // 👥 RÉSERVATIONS
  {
    id: "bookings",
    name: "Réservations",
    icon: Users,
    group: "bookings",
  },

  // 💰 FINANCES
  {
    id: "payment-report",
    name: "Justificatif de paiements",
    icon: Receipt,
    group: "finances",
  },
  {
    id: "tourist-tax",
    name: "Taxes de séjour",
    icon: Euro,
    group: "finances",
  },
  {
    id: "export-excel",
    name: "Export Excel",
    icon: FileSpreadsheet,
    group: "finances",
  },

  // ⚙️ CONFIGURATION
  {
    id: "rooms",
    name: "Places",
    icon: Bed,
    group: "configuration",
  },
  {
    id: "pricing",
    name: "Options de prix",
    icon: DollarSign,
    group: "configuration",
  },
  {
    id: "access-codes",
    name: "Codes d'accès",
    icon: QrCode,
    group: "configuration",
  },
  {
    id: "form-customizer",
    name: "Formulaire de réservation",
    icon: Edit3,
    group: "configuration",
  },
  {
    id: "confirmations",
    name: "Confirmations",
    icon: MessageSquare,
    group: "configuration",
  },
  {
    id: "settings",
    name: "Paramètres",
    icon: Settings,
    group: "configuration",
  },
];

// Navigation parking jour (visible seulement si activé)
const dayParkingNavigation = {
  id: "day-parking",
  name: "Parking Jour",
  icon: Car,
  group: "configuration",
  subItems: [
    {
      id: "day-parking-manager",
      name: "Gestion des tarifs",
      icon: DollarSign,
    },
    {
      id: "day-parking-email",
      name: "Email de confirmation",
      icon: MessageSquare,
    },
    {
      id: "day-parking-control",
      name: "Contrôle parking",
      icon: Activity,
    },
    {
      id: "day-parking-stats",
      name: "Statistiques",
      icon: BarChart3,
    },
  ],
};

export function AdminSidebar({
  hotel,
  establishmentName,
  isStripeConfigured,
  stripeAccountId,
  activeTab,
  onTabChange,
  enableDayParking = false, // Par défaut désactivé
}: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dayParkingExpanded, setDayParkingExpanded] = useState(false);
  const [quickLinksExpanded, setQuickLinksExpanded] = useState(false);
  const quickLinksRef = useRef<HTMLDivElement>(null);

  // États pour les groupes collapsibles (tous ouverts par défaut)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      dashboard: true,
      bookings: true,
      finances: true,
      configuration: true,
    }
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Fermer les liens rapides quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickLinksRef.current &&
        !quickLinksRef.current.contains(event.target as Node)
      ) {
        setQuickLinksExpanded(false);
      }
    };

    if (quickLinksExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [quickLinksExpanded]);

  // Construire la navigation dynamiquement selon l'état du parking jour
  const getNavigation = (): NavItem[] => {
    const navigation: NavItem[] = [...baseNavigation];

    // Insérer le parking jour après "Options de prix" si activé
    if (enableDayParking) {
      const pricingIndex = navigation.findIndex(
        (item) => item.id === "pricing"
      );
      navigation.splice(pricingIndex + 1, 0, dayParkingNavigation);
    }

    return navigation;
  };

  // Grouper les items par catégorie
  const getGroupedNavigation = (): NavGroup[] => {
    const navigation = getNavigation();
    const groups: NavGroup[] = [
      { id: "dashboard", name: "TABLEAU DE BORD", items: [] },
      { id: "bookings", name: "RÉSERVATIONS", items: [] },
      { id: "finances", name: "FINANCES", items: [] },
      { id: "configuration", name: "CONFIGURATION", items: [] },
    ];

    navigation.forEach((item) => {
      const group = groups.find((g) => g.id === item.group);
      if (group) {
        group.items.push(item);
      }
    });

    return groups.filter((group) => group.items.length > 0);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col" data-tutorial="admin-sidebar">
      {/* Logo et nom */}
      <div className="flex h-16 items-center border-b px-4">
        <Image
          src="/logo.png"
          alt="SelfKey Logo"
          width={24}
          height={24}
          className="rounded"
        />
        <span className="ml-2 text-lg font-semibold truncate">
          {establishmentName}
        </span>
      </div>

      {/* Liens rapides (collapsible en overlay) */}
      <div className="p-2 border-b relative" ref={quickLinksRef}>
        <Button
          variant="ghost"
          className="w-full justify-between h-9 px-3"
          onClick={() => setQuickLinksExpanded(!quickLinksExpanded)}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Liens rapides
          </span>
          {quickLinksExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          )}
        </Button>

        {quickLinksExpanded && (
          <div className="absolute left-2 right-2 top-11 z-50 bg-white border rounded-md shadow-lg p-2 space-y-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm"
              asChild
              data-tutorial="qr-code-link"
            >
              <Link href={`/admin/${hotel}/qr-code`}>
                <QrCode className="mr-2 h-3.5 w-3.5" />
                Gestion du code QR
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm"
              asChild
            >
              <Link href={`/${hotel}`} target="_blank">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Voir page réservation
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm"
              asChild
              data-tutorial="location-link"
            >
              <Link href={`/admin/${hotel}/location`}>
                <MapPin className="mr-2 h-3.5 w-3.5" />
                Informations publique
              </Link>
            </Button>

            {isStripeConfigured && stripeAccountId && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-sm"
                asChild
                data-tutorial="stripe-dashboard"
              >
                <a
                  href={`https://dashboard.stripe.com/connect/accounts/${stripeAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Mon compte Stripe
                </a>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm"
              asChild
              data-tutorial="back-to-establishments"
            >
              <Link href="/establishments">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Mes établissements
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-sm"
              asChild
            >
              <Link href="/profile">
                <User className="mr-2 h-3.5 w-3.5" />
                Mon Profil
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 p-2 pt-4 overflow-y-auto">
        {getGroupedNavigation().map((group, groupIndex) => (
          <div key={group.id}>
            {/* Titre du groupe (cliquable pour collapse) */}
            <Button
              variant="ghost"
              className="w-full justify-between h-8 px-3 mb-1"
              onClick={() => toggleGroup(group.id)}
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.name}
              </h3>
              {expandedGroups[group.id] ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              )}
            </Button>

            {/* Items du groupe */}
            {expandedGroups[group.id] && (
              <div className="space-y-1">
                {group.items.map((item: NavItem) => (
                  <div key={item.id}>
                    {/* Élément principal */}
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        activeTab === item.id && "bg-muted font-medium"
                      )}
                      onClick={() => {
                        if (item.subItems) {
                          // Si c'est le parking jour, toggle l'expansion
                          if (item.id === "day-parking") {
                            setDayParkingExpanded(!dayParkingExpanded);
                          }
                        } else {
                          onTabChange(item.id);
                        }
                      }}
                      data-tutorial={`nav-${item.id}`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      {item.subItems && (
                        <span className="ml-auto">
                          {dayParkingExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </Button>

                    {/* Sous-éléments pour parking jour */}
                    {item.subItems && dayParkingExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem: NavSubItem) => (
                          <Button
                            key={subItem.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start",
                              activeTab === subItem.id && "bg-muted font-medium"
                            )}
                            onClick={() => onTabChange(subItem.id)}
                          >
                            <subItem.icon className="mr-2 h-3 w-3" />
                            {subItem.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Séparateur entre les groupes (sauf le dernier) */}
            {groupIndex < getGroupedNavigation().length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}
      </nav>

      {/* Actions utilisateur en bas */}
      <div className="p-3 border-t space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Mon Profil
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={async () => {
            try {
              // Essayer d'abord avec signOut()
              const result = await signOut();
              console.log("Déconnexion réussie:", result);
              window.location.href = "/";
            } catch (error) {
              console.error(
                "Erreur avec signOut(), tentative manuelle:",
                error
              );

              // Fallback : requête directe à l'API
              try {
                const response = await fetch("/api/auth/sign-out", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                });

                if (response.ok) {
                  console.log("Déconnexion manuelle réussie");
                  window.location.href = "/";
                } else {
                  throw new Error(`HTTP ${response.status}`);
                }
              } catch (manualError) {
                console.error("Erreur déconnexion manuelle:", manualError);
                // Fallback final : effacer les cookies et rediriger
                document.cookie =
                  "better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie =
                  "__Secure-better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
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
