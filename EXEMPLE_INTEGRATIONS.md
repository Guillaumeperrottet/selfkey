# Exemple d'utilisation - Module d'Intégrations

## Cas d'usage concret : Hôtel Paradise

### Situation initiale

L'Hôtel Paradise utilise actuellement :

- Booking.com pour 60% de ses réservations
- Airbnb pour 25% de ses réservations
- Réservations directes via SelfKey pour 15%
- Un ancien PMS (Opera) pour la gestion interne

### Problèmes rencontrés

- Saisie manuelle des réservations externes dans le système
- Risques d'overbooking par manque de synchronisation
- Temps perdu en gestion administrative
- Données clients dispersées

### Solution avec le Module d'Intégrations

#### 1. Configuration Booking.com

```typescript
// Configuration automatique
const bookingConfig = {
  apiKey: "bcom_api_key_xyz",
  hotelId: "12345",
  syncFrequency: 15, // minutes
  enabled: true,
};

// Résultat : Import automatique de toutes les réservations Booking.com
// Synchronisation toutes les 15 minutes
// Mise à jour automatique des disponibilités
```

#### 2. Configuration Airbnb

```typescript
const airbnbConfig = {
  clientId: "airbnb_client_123",
  clientSecret: "airbnb_secret_xyz",
  syncFrequency: 30,
  enabled: true,
};

// Résultat : Récupération des réservations Airbnb
// Gestion centralisée du calendrier
```

#### 3. Intégration PMS Opera

```typescript
const pmsConfig = {
  baseUrl: "https://opera.hotel-paradise.com/api",
  username: "selfkey_user",
  password: "secure_password",
  endpoints: {
    reservations: "/reservations",
    guests: "/guests",
    rooms: "/rooms",
  },
};

// Résultat : Synchronisation bidirectionnelle avec Opera
// Export des réservations SelfKey vers Opera
// Import des données clients existantes
```

#### 4. Webhook pour système de caisse

```typescript
// URL webhook générée automatiquement
const webhookUrl =
  "https://selfkey.hotel-paradise.com/api/webhooks/integrations/paradise/cash-system";

// Configuration côté système de caisse
const cashSystemConfig = {
  webhookUrl: webhookUrl,
  secretKey: "shared_secret_123",
  events: ["payment_received", "refund_processed"],
};

// Résultat : Notification automatique des paiements
// Mise à jour en temps réel du statut des réservations
```

### Bénéfices obtenus

#### Gains de temps

- **Avant** : 2h/jour de saisie manuelle
- **Après** : 10 minutes/jour de vérification
- **Économie** : 1h50/jour = 9h25/semaine

#### Réduction des erreurs

- **Avant** : 5-8 erreurs de saisie par semaine
- **Après** : 0-1 erreur par mois
- **Amélioration** : 95% de réduction des erreurs

#### Taux d'occupation optimisé

- **Avant** : 2-3 situations d'overbooking par mois
- **Après** : 0 overbooking depuis la mise en place
- **Gain** : Amélioration satisfaction client

### Configuration étape par étape

#### Étape 1 : Accès au module

1. Se connecter à l'interface admin SelfKey
2. Aller dans l'onglet "Intégrations"
3. Cliquer sur "Ajouter une intégration"

#### Étape 2 : Configuration Booking.com

```bash
# 1. Sélectionner "Booking.com"
# 2. Saisir la clé API Booking.com
# 3. Saisir l'ID de l'hôtel
# 4. Définir la fréquence de synchronisation
# 5. Tester la connexion
# 6. Activer l'intégration
```

#### Étape 3 : Première synchronisation

```bash
# La première synchronisation peut prendre quelques minutes
# Vérifier les logs pour s'assurer du bon fonctionnement
# Contrôler que les réservations apparaissent bien dans SelfKey
```

#### Étape 4 : Monitoring

```bash
# Surveiller les logs d'intégration
# Vérifier les synchronisations automatiques
# Configurer les alertes en cas d'erreur
```

### Code exemple - Webhook personnalisé

```typescript
// webhook-handler.ts
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("x-signature");

    // Vérification de la signature
    if (!verifySignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Traitement selon le type d'événement
    switch (payload.event_type) {
      case "new_reservation":
        await createReservationFromWebhook(payload.data);
        break;
      case "cancelled_reservation":
        await cancelReservationFromWebhook(payload.data);
        break;
      case "modified_reservation":
        await updateReservationFromWebhook(payload.data);
        break;
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function createReservationFromWebhook(data: any) {
  // Créer une réservation dans SelfKey
  const reservation = await prisma.booking.create({
    data: {
      hotelSlug: data.hotel_id,
      roomId: await findOrCreateRoom(data.room_type),
      clientFirstName: data.guest.first_name,
      clientLastName: data.guest.last_name,
      clientEmail: data.guest.email,
      clientPhone: data.guest.phone,
      checkInDate: new Date(data.check_in),
      checkOutDate: new Date(data.check_out),
      amount: data.total_amount,
      guests: data.guest_count,
      // ... autres champs
    },
  });

  // Enregistrer dans les logs
  await prisma.integrationLog.create({
    data: {
      integrationId: data.integration_id,
      action: "webhook_received",
      status: "success",
      message: `Nouvelle réservation créée: ${reservation.id}`,
      data: { reservationId: reservation.id },
    },
  });
}
```

### Exemple de monitoring

```typescript
// Dashboard de monitoring des intégrations
const IntegrationMonitoring = () => {
  const [stats, setStats] = useState({
    totalIntegrations: 0,
    activeIntegrations: 0,
    todaySync: 0,
    errors: 0
  });

  useEffect(() => {
    // Charger les statistiques
    loadIntegrationStats();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent>
          <h3>Intégrations actives</h3>
          <p className="text-2xl font-bold">{stats.activeIntegrations}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3>Syncs aujourd'hui</h3>
          <p className="text-2xl font-bold">{stats.todaySync}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3>Erreurs détectées</h3>
          <p className="text-2xl font-bold text-red-500">{stats.errors}</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

Ce module d'intégrations transforme complètement la gestion des réservations pour l'Hôtel Paradise, en automatisant les tâches répétitives et en centralisant toutes les données dans SelfKey.
