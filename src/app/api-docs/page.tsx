"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import "swagger-ui-react/swagger-ui.css";

// Import dynamique pour éviter le SSR (Swagger UI utilise window)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  // Améliorer les champs date-time après le chargement de Swagger UI
  useEffect(() => {
    const enhanceDateTimeInputs = () => {
      // Attendre que Swagger UI soit chargé
      setTimeout(() => {
        const dateInputs = document.querySelectorAll(
          'input[placeholder*="date-time"]'
        );

        dateInputs.forEach((input: Element) => {
          const htmlInput = input as HTMLInputElement;

          // Changer le type en datetime-local pour avoir un picker natif
          if (htmlInput.type === "text") {
            htmlInput.type = "datetime-local";

            // Si une valeur existe, la convertir au format datetime-local
            if (htmlInput.value) {
              try {
                const date = new Date(htmlInput.value);
                // Format: YYYY-MM-DDThh:mm
                const localDateTime = new Date(
                  date.getTime() - date.getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16);
                htmlInput.value = localDateTime;
              } catch (e) {
                console.error("Erreur conversion date:", e);
              }
            }

            // Convertir la valeur au format ISO lors du changement
            const originalOnChange = htmlInput.onchange;
            htmlInput.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.value) {
                try {
                  // Convertir datetime-local en ISO 8601
                  const date = new Date(target.value);
                  const isoString = date.toISOString();

                  // Créer un événement pour mettre à jour Swagger UI
                  const event = new Event("input", { bubbles: true });
                  target.value = isoString;
                  target.dispatchEvent(event);
                } catch (e) {
                  console.error("Erreur conversion date:", e);
                }
              }
              if (originalOnChange) {
                originalOnChange.call(htmlInput, e);
              }
            };

            // Style amélioré pour le date picker
            htmlInput.style.cursor = "pointer";
            htmlInput.style.minWidth = "280px";
          }
        });
      }, 1000);
    };

    enhanceDateTimeInputs();

    // Observer pour réappliquer quand Swagger UI met à jour le DOM
    const observer = new MutationObserver(enhanceDateTimeInputs);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
  // Spécification OpenAPI de notre API
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "SelfKey API",
      version: "1.0.0",
      description: `
API REST pour accéder aux données de réservation de la plateforme SelfKey.

Cette API permet aux partenaires autorisés 
de récupérer automatiquement les informations de réservation pour la déclaration 
des taxes de séjour.

## Authentification

Toutes les requêtes doivent inclure un header \`X-API-Key\` avec votre clé API.

\`\`\`
X-API-Key: sk_live_votre_cle_secrete
\`\`\`

## Webhooks

En plus des endpoints REST, vous pouvez configurer des webhooks pour recevoir 
automatiquement les données après chaque réservation.

## Rate Limiting

Aucune limitation de requêtes n'est appliquée actuellement pour permettre 
les intégrations temps réel.
      `,
      contact: {
        name: "Support SelfKey",
        email: "gp@webbing.ch",
      },
    },
    servers: [
      {
        url: typeof window !== "undefined" ? window.location.origin : "",
        description: "Serveur actuel (auto-détecté)",
      },
      {
        url: "http://localhost:3000",
        description: "Développement local",
      },
      {
        url: "https://selfkey.ch",
        description: "Production",
      },
    ],
    tags: [
      {
        name: "Bookings",
        description: "Endpoints pour récupérer les réservations",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Clé API fournie par l'administrateur SelfKey",
        },
      },
      schemas: {
        Booking: {
          type: "object",
          properties: {
            // Identifiants
            id: {
              type: "string",
              description: "ID unique de la réservation",
              example: "clxyz123abc",
            },
            bookingNumber: {
              type: "integer",
              description: "Numéro séquentiel de réservation",
              example: 1234,
            },
            hotelSlug: {
              type: "string",
              description: "Identifiant de l'établissement",
              example: "selfcamp-fribourg",
            },
            roomId: {
              type: "string",
              nullable: true,
              description: "ID de la chambre (null pour parking jour)",
              example: "clxyz456def",
            },

            // Client - Informations personnelles
            clientFirstName: {
              type: "string",
              description: "Prénom du client",
              example: "Jean",
            },
            clientLastName: {
              type: "string",
              description: "Nom du client",
              example: "Dupont",
            },
            clientEmail: {
              type: "string",
              format: "email",
              description: "Email du client",
              example: "jean.dupont@example.com",
            },
            clientPhone: {
              type: "string",
              description: "Téléphone du client",
              example: "+41791234567",
            },
            clientBirthDate: {
              type: "string",
              format: "date-time",
              description: "Date de naissance",
              example: "1985-03-15T00:00:00.000Z",
            },
            clientBirthPlace: {
              type: "string",
              nullable: true,
              description: "Lieu de naissance",
              example: "Fribourg",
            },
            clientAddress: {
              type: "string",
              description: "Adresse complète",
              example: "Rue de la Gare 12",
            },
            clientPostalCode: {
              type: "string",
              description: "Code postal",
              example: "1700",
            },
            clientCity: {
              type: "string",
              description: "Ville",
              example: "Fribourg",
            },
            clientCountry: {
              type: "string",
              description: "Pays",
              example: "Switzerland",
            },
            clientIdNumber: {
              type: "string",
              description: "Numéro de pièce d'identité",
              example: "CH-123456789",
            },
            clientIdType: {
              type: "string",
              nullable: true,
              description: "Type de pièce d'identité",
              example: "Carte d'identité",
            },
            clientVehicleNumber: {
              type: "string",
              nullable: true,
              description: "Plaque d'immatriculation",
              example: "FR-123-AB",
            },

            // Séjour
            checkInDate: {
              type: "string",
              format: "date-time",
              description: "Date d'arrivée",
              example: "2025-10-20T14:00:00.000Z",
            },
            checkOutDate: {
              type: "string",
              format: "date-time",
              description: "Date de départ",
              example: "2025-10-22T11:00:00.000Z",
            },
            bookingDate: {
              type: "string",
              format: "date-time",
              description: "Date de création de la réservation",
              example: "2025-10-13T10:30:00.000Z",
            },
            adults: {
              type: "integer",
              description: "Nombre d'adultes",
              example: 2,
            },
            children: {
              type: "integer",
              description: "Nombre d'enfants",
              example: 1,
            },
            guests: {
              type: "integer",
              description: "Nombre total de personnes",
              example: 3,
            },
            hasDog: {
              type: "boolean",
              nullable: true,
              description: "Client avec chien",
              example: false,
            },

            // Financier
            amount: {
              type: "number",
              format: "float",
              description: "Montant total payé (CHF)",
              example: 250.0,
            },
            currency: {
              type: "string",
              description: "Devise",
              example: "CHF",
            },
            platformCommission: {
              type: "number",
              format: "float",
              description: "Commission plateforme",
              example: 15.5,
            },
            ownerAmount: {
              type: "number",
              format: "float",
              description: "Montant reçu par l'établissement",
              example: 234.5,
            },
            pricingOptionsTotal: {
              type: "number",
              format: "float",
              description: "Total des options supplémentaires",
              example: 30.0,
            },
            touristTaxTotal: {
              type: "number",
              format: "float",
              description: "Total taxe de séjour",
              example: 9.0,
            },
            selectedPricingOptions: {
              type: "object",
              nullable: true,
              description: "Options sélectionnées",
              example: { breakfast: "included", parking: "yes" },
            },
            paymentStatus: {
              type: "string",
              description: "Statut du paiement",
              example: "succeeded",
              enum: ["pending", "succeeded", "failed"],
            },

            // Type de réservation
            bookingType: {
              type: "string",
              description: "Type de réservation",
              example: "night",
              enum: [
                "night",
                "day",
                "classic_booking",
                "day_parking",
                "night_parking",
              ],
            },
            bookingLocale: {
              type: "string",
              description: "Langue choisie",
              example: "fr",
              enum: ["fr", "en", "de"],
            },

            // Parking jour (optionnel)
            dayParkingDuration: {
              type: "string",
              nullable: true,
              description: "Durée parking jour",
              example: "4h",
            },
            dayParkingStartTime: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Heure de début parking",
            },
            dayParkingEndTime: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Heure de fin parking",
            },

            // Confirmation
            confirmationSent: {
              type: "boolean",
              description: "Email de confirmation envoyé",
              example: true,
            },
            confirmationSentAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Date d'envoi de la confirmation",
            },
            confirmationMethod: {
              type: "string",
              nullable: true,
              description: "Méthode de confirmation",
              example: "email",
            },

            // Relations
            room: {
              type: "object",
              nullable: true,
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                price: { type: "number" },
                accessCode: { type: "string", nullable: true },
                allowDogs: { type: "boolean" },
              },
            },
            establishment: {
              type: "object",
              properties: {
                id: { type: "string" },
                slug: { type: "string" },
                name: { type: "string" },
                address: { type: "string", nullable: true },
                city: { type: "string", nullable: true },
                postalCode: { type: "string", nullable: true },
                country: { type: "string", nullable: true },
                hotelContactEmail: { type: "string", nullable: true },
                hotelContactPhone: { type: "string", nullable: true },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Message d'erreur",
              example: "Unauthorized - Invalid or missing API key",
            },
          },
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    paths: {
      "/api/v1/bookings": {
        get: {
          tags: ["Bookings"],
          summary: "Liste des réservations",
          description: `
Récupère la liste des réservations **confirmées et payées** avec filtres optionnels.

⚠️ **Important:** Seules les réservations avec un paiement réussi (status: succeeded) sont retournées.
Les réservations en attente ou échouées ne sont pas incluses.

**Note sur establishmentSlug:**
- Si votre clé API est **limitée à un établissement spécifique**, laissez ce champ **vide** (filtrage automatique)
- Si votre clé API a **accès à tous les établissements**, laissez vide pour tout récupérer OU spécifiez un slug pour filtrer un établissement précis
          `,
          parameters: [
            {
              name: "establishmentSlug",
              in: "query",
              description:
                "Identifiant de l'établissement (ex: selfcamp-fribourg). Laisser vide pour tous les établissements accessibles.",
              required: false,
              schema: {
                type: "string",
                example: "",
              },
            },
            {
              name: "startDate",
              in: "query",
              description: "Date de début (checkInDate >= startDate)",
              required: false,
              schema: {
                type: "string",
                format: "date-time",
                example: "2025-10-01T00:00:00.000Z",
              },
            },
            {
              name: "endDate",
              in: "query",
              description: "Date de fin (checkOutDate <= endDate)",
              required: false,
              schema: {
                type: "string",
                format: "date-time",
                example: "2025-10-31T23:59:59.000Z",
              },
            },
            {
              name: "limit",
              in: "query",
              description: "Nombre max de résultats (défaut: 100, max: 1000)",
              required: false,
              schema: {
                type: "integer",
                default: 100,
                maximum: 1000,
              },
            },
            {
              name: "offset",
              in: "query",
              description: "Offset pour pagination (défaut: 0)",
              required: false,
              schema: {
                type: "integer",
                default: 0,
              },
            },
          ],
          responses: {
            "200": {
              description: "Liste des réservations récupérée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Booking",
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: {
                            type: "integer",
                            description: "Nombre total de réservations",
                            example: 150,
                          },
                          limit: {
                            type: "integer",
                            example: 100,
                          },
                          offset: {
                            type: "integer",
                            example: 0,
                          },
                          hasMore: {
                            type: "boolean",
                            description: "Y a-t-il plus de résultats ?",
                            example: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description:
                "❌ Clé API invalide ou manquante - Vérifiez votre header X-API-Key",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                  example: {
                    error: "Unauthorized - Invalid or missing API key",
                  },
                },
              },
            },
            "403": {
              description:
                "🚫 Accès refusé - Votre clé API n'a pas accès à cet établissement",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                  example: {
                    error:
                      "Forbidden - Your API key does not have access to this establishment",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/bookings/{bookingId}": {
        get: {
          tags: ["Bookings"],
          summary: "Détails d'une réservation",
          description: `
Récupère tous les détails d'une réservation spécifique par son ID.

Retourne **TOUS** les champs de la réservation, incluant les informations client,
les dates, les montants, et les relations (chambre, établissement).
          `,
          parameters: [
            {
              name: "bookingId",
              in: "path",
              description: "ID unique de la réservation",
              required: true,
              schema: {
                type: "string",
                example: "clxyz123abc",
              },
            },
          ],
          responses: {
            "200": {
              description: "Réservation récupérée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Booking",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description:
                "❌ Clé API invalide - Vérifiez que votre clé est correcte",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                  example: {
                    error: "Unauthorized - Invalid API key",
                  },
                },
              },
            },
            "403": {
              description:
                "🚫 Accès refusé - Cette réservation appartient à un établissement auquel vous n'avez pas accès",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                  example: {
                    error:
                      "Forbidden - You don't have access to this booking's establishment",
                  },
                },
              },
            },
            "404": {
              description: "Réservation non trouvée",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">SelfKey API Documentation</h1>
          <p className="text-muted-foreground">
            Documentation interactive de l&apos;API REST pour partenaires
            autorisés
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI
            spec={spec}
            defaultModelsExpandDepth={-1}
            docExpansion="list"
          />
          <style jsx global>{`
            /* Style amélioré pour les date pickers */
            input[type="datetime-local"] {
              padding: 8px 12px !important;
              border-radius: 6px !important;
              border: 1px solid #e5e7eb !important;
              font-size: 14px !important;
              transition: all 0.2s !important;
            }

            input[type="datetime-local"]:hover {
              border-color: #9ca3af !important;
            }

            input[type="datetime-local"]:focus {
              outline: none !important;
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }

            /* Style du calendrier natif (selon le navigateur) */
            input[type="datetime-local"]::-webkit-calendar-picker-indicator {
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: background-color 0.2s;
            }

            input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
              background-color: #f3f4f6;
            }

            /* Mode sombre */
            @media (prefers-color-scheme: dark) {
              input[type="datetime-local"] {
                background-color: #1f2937 !important;
                border-color: #374151 !important;
                color: #f9fafb !important;
              }

              input[type="datetime-local"]:hover {
                border-color: #4b5563 !important;
              }

              input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                filter: invert(1);
              }

              input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
                background-color: #374151;
              }
            }
          `}</style>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⚠️ Authentification requise
            </h2>
            <p className="mb-4">
              Pour tester les endpoints, vous devez d&apos;abord vous
              authentifier :
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>
                Cliquez sur le bouton{" "}
                <strong className="text-green-600 dark:text-green-400">
                  🔓 Authorize
                </strong>{" "}
                en haut à droite de la documentation Swagger
              </li>
              <li>
                Entrez votre clé API dans le champ{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  X-API-Key
                </code>
              </li>
              <li>Cliquez sur &quot;Authorize&quot; puis &quot;Close&quot;</li>
              <li>
                Vous pouvez maintenant utiliser{" "}
                <strong>&quot;Try it out&quot;</strong> sur les endpoints
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              🔑 Obtenir une clé API
            </h2>
            <p className="mb-4">
              Pour obtenir une clé API de production, contactez
              l&apos;administrateur via le support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
