# SelfKey API - Guide d'utilisation

## 📚 Vue d'ensemble

### À quoi sert l'API SelfKey ?

L'API permet à vos partenaires (autorités, prestataires de services) d'**accéder aux données de réservation** de manière autonome et sécurisée. Au lieu de vous demander manuellement les informations, ils peuvent les récupérer automatiquement quand ils en ont besoin.

**Cas d'usage concrets :**

- 🏛️ **Autorités** : Récupérer les données pour les déclarations de taxes de séjour
- 🚍 **Transports publics** : Envoyer des pass gratuits aux clients qui réservent
- 🎫 **Offices de tourisme** : Proposer des avantages aux clients (musées, activités)
- 📊 **Statistiques** : Analyser les flux touristiques dans une région

### Webhooks vs API : Quelle différence ?

**🔍 API (Pull) - "Je demande les infos"**

- Votre partenaire **interroge** votre système quand il le souhaite
- Exemple : "Donne-moi toutes les réservations du mois de janvier"
- **Idéal pour** : Rapports mensuels, synchronisations planifiées, accès à la demande

**🔔 Webhooks (Push) - "Je t'envoie les infos automatiquement"**

- Vous **envoyez** les données automatiquement à chaque nouvelle réservation
- Exemple : Dès qu'un client réserve → envoi immédiat des infos au partenaire
- **Idéal pour** : Actions en temps réel, envoi de SMS/emails, alertes instantanées

**En résumé :** L'API c'est "demander quand on veut", les webhooks c'est "recevoir automatiquement dès que ça arrive".

## 🔐 Authentification

Toutes les requêtes API doivent inclure un header `X-API-Key` :

```bash
X-API-Key: votre_cle_api_secrete
```

### Obtenir une clé API

1. Connectez-vous en tant que super-admin
2. Allez sur `/super-admin/api-management`
3. Cliquez sur "Nouvelle clé API"
4. Donnez un nom (ex: "Police Fribourg")
5. Sélectionnez un établissement (optionnel)
6. **Copiez la clé immédiatement** (elle ne sera plus affichée)

## 📖 Documentation interactive

Accédez à la documentation Swagger complète :

```
https://votre-domaine.com/api-docs
```

## 🔗 Endpoints disponibles

### 1. Liste des réservations

```http
GET /api/v1/bookings
```

**Query Parameters:**

- `establishmentSlug` (string, optionnel si clé limitée) - Filtrer par établissement
- `startDate` (ISO 8601) - Date de début (checkInDate >= startDate)
- `endDate` (ISO 8601) - Date de fin (checkOutDate <= endDate)
- `status` (enum) - Filtrer par statut : `pending`, `succeeded`, `failed`
- `limit` (integer) - Nombre max de résultats (défaut: 100, max: 1000)
- `offset` (integer) - Offset pour pagination (défaut: 0)

**Exemple:**

```bash
curl -H "X-API-Key: votre_cle_api_ici" \
  "https://selfkey.ch/api/v1/bookings?establishmentSlug=selfcamp-fribourg&limit=10"
```

**Réponse (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123abc",
      "bookingNumber": 1234,
      "clientFirstName": "Jean",
      "clientLastName": "Dupont",
      "clientEmail": "jean.dupont@example.com",
      "clientPhone": "+41791234567",
      "clientBirthDate": "1985-03-15T00:00:00.000Z",
      "clientAddress": "Rue de la Gare 12",
      "clientCity": "Fribourg",
      "clientIdNumber": "CH-123456789",
      "checkInDate": "2025-10-20T14:00:00.000Z",
      "checkOutDate": "2025-10-22T11:00:00.000Z",
      "guests": 3,
      "amount": 250.0,
      "touristTaxTotal": 9.0,
      "room": {
        "name": "Chambre Double",
        "price": 120.0
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 2. Détails d'une réservation

```http
GET /api/v1/bookings/{bookingId}
```

**Exemple:**

```bash
curl -H "X-API-Key: votre_cle_api_ici" \
  "https://selfkey.ch/api/v1/bookings/clxyz123abc"
```

**Réponse (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "bookingNumber": 1234,
    // ... tous les champs de la réservation
    "room": { ... },
    "establishment": { ... }
  }
}
```

### 3. Liste des établissements

```http
GET /api/v1/establishments
```

**Query Parameters:**

- `city` (string) - Filtrer par ville
- `country` (string) - Filtrer par pays (défaut: Switzerland)
- `isPubliclyVisible` (boolean) - Afficher uniquement les établissements publics
- `limit` (integer) - Nombre max de résultats (défaut: 50, max: 100)
- `offset` (integer) - Offset pour pagination (défaut: 0)

**Exemple:**

```bash
curl -H "X-API-Key: votre_cle_api_ici" \
  "https://selfkey.ch/api/v1/establishments?city=Fribourg&limit=10"
```

**Réponse (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "slug": "selfcamp-fribourg",
      "name": "SelfCamp Fribourg",
      "address": "Route de Beaumont 20",
      "city": "Fribourg",
      "country": "Switzerland",
      "latitude": 46.8,
      "longitude": 7.15,
      "_count": {
        "bookings": 150,
        "rooms": 5
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 4. Détails d'un établissement

```http
GET /api/v1/establishments/{slug}
```

**Exemple:**

```bash
curl -H "X-API-Key: votre_cle_api_ici" \
  "https://selfkey.ch/api/v1/establishments/selfcamp-fribourg"
```

**Réponse (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "slug": "selfcamp-fribourg",
    "name": "SelfCamp Fribourg",
    "rooms": [...],
    "pricingOptions": [...],
    "_count": {
      "bookings": 150
    }
  }
}
```

## 🛡️ Rate Limiting

**Protection automatique contre les abus**

- **Limite par défaut** : 100 requêtes par minute par API key
- **Headers de réponse** :
  - `X-RateLimit-Limit`: Limite maximale
  - `X-RateLimit-Remaining`: Requêtes restantes
  - `X-RateLimit-Reset`: Timestamp de réinitialisation (epoch)
  - `Retry-After`: Secondes à attendre (si limite dépassée)

**Réponse (429 Too Many Requests):**

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds"
}
```

## 🔔 Webhooks

### Pourquoi utiliser les webhooks ?

Les webhooks permettent de **recevoir automatiquement** les données de réservation **en temps réel**, sans avoir à interroger régulièrement l'API.

**Avantages :**

- ⚡ **Instantané** : Dès qu'un client réserve, vous êtes notifié immédiatement
- 🔄 **Automatique** : Pas besoin de planifier des synchronisations
- 💰 **Économique** : Moins de requêtes API = moins de charge serveur
- 🎯 **Événements ciblés** : Recevez uniquement ce qui vous intéresse (réservation complétée, annulée, etc.)

**Exemple concret :**  
Un client réserve à 14h30 → Votre partenaire reçoit instantanément les données → Il peut envoyer un SMS de bienvenue avec un pass transport gratuit dans les 2 minutes.

### Comment ça marche ?

1. **Vous configurez** une URL où vous souhaitez recevoir les données (ex: `https://votre-systeme.com/recevoir-reservations`)
2. **Vous choisissez** les événements à surveiller (`booking.completed`, `booking.cancelled`, etc.)
3. **SelfKey envoie automatiquement** un POST avec les données à chaque événement
4. **Votre système répond** avec un code 200 pour confirmer la réception

### Configuration par établissement

⚠️ **Important** : Les webhooks sont configurés **par établissement**, pas globalement.

- Si vous gérez 3 hôtels, vous pouvez créer 3 webhooks (un par hôtel)
- Chaque webhook peut avoir sa propre URL ou partager la même
- Vous choisissez les événements pour chaque établissement

### Configuration

1. Allez sur `/super-admin/webhooks`
2. Cliquez sur "Nouveau webhook"
3. Remplissez :
   - **Nom** : Police Fribourg - API
   - **Établissement** : Sélectionnez
   - **URL** : `https://api.police.ch/receive-booking`
   - **Format** : JSON (ou CSV)
   - **Secret** : (Optionnel - généré automatiquement si vide)

### Format des données envoyées

**JSON (recommandé):**

```json
{
  "event": "booking.completed",
  "timestamp": "2025-10-13T10:30:00.000Z",
  "data": {
    // Tous les champs de la réservation
  }
}
```

**Headers envoyés:**

```http
Content-Type: application/json
User-Agent: SelfKey-Webhook/1.0
X-Webhook-Event: booking.completed
X-Webhook-Signature: <HMAC SHA256 - TOUJOURS présent>
X-Webhook-Attempt: 1
```

### 🔐 Sécurité HMAC (Automatique)

**⚠️ Important** : Un secret HMAC est **automatiquement généré** pour chaque webhook si vous n'en fournissez pas. Ceci garantit que les données reçues proviennent bien de SelfKey.

**Vérification côté receveur (obligatoire) :**

```javascript
const crypto = require("crypto");
const signature = req.headers["x-webhook-signature"];
const body = JSON.stringify(req.body);
const secret = "whsec_xxxxx"; // Fourni lors de la création

const expectedSignature = crypto
  .createHmac("sha256", secret)
  .update(body)
  .digest("hex");

if (signature !== expectedSignature) {
  throw new Error("Invalid signature - possible tampering");
}
```

### Retry automatique

- **3 tentatives** par défaut (configurable)
- **Délai exponentiel** : 60s, 120s, 180s
- Les échecs sont loggés et visibles dans l'interface

### 🛡️ Désactivation automatique

**Protection contre les webhooks défaillants :**

- Si un webhook échoue **10 fois consécutivement**, il est **automatiquement désactivé**
- Un email d'alerte est envoyé au super-admin
- Vous pouvez le réactiver manuellement après correction du problème
- Vérifiez régulièrement les logs dans `/super-admin/monitoring-api`

## 🧪 Mode Test / Sandbox

### Endpoint Sandbox

Avant d'avoir l'URL réelle de la police, utilisez notre endpoint sandbox :

```
https://votre-domaine.com/api/sandbox/police-webhook
```

**Fonctionnalités:**

- ✅ Accepte les requêtes POST avec JSON ou CSV
- ✅ Simule différents scénarios de réponse
- ✅ Affiche les données reçues dans les logs serveur
- ✅ Retourne une réponse réaliste avec avantages

### Tester un webhook

**Depuis l'interface:**

1. Allez sur `/super-admin/webhooks`
2. Cliquez sur l'icône 🎬 (Play) à côté d'un webhook
3. Les résultats s'affichent dans un toast

**En ligne de commande:**

```bash
curl -X POST https://votre-domaine.com/api/super-admin/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"webhookId": "webhook_id_here"}'
```

### ⚠️ Désactivation automatique

**Protection contre les pannes**

Si un webhook échoue **10 fois consécutivement**, il sera **automatiquement désactivé** pour éviter de surcharger le système.

**Ce qui se passe :**

1. ❌ Le webhook échoue 10 fois de suite
2. 🔴 Le système le désactive automatiquement
3. 📧 Un email d'alerte est envoyé au super-admin
4. 📝 Un log détaillé est conservé pour analyse

**Email d'alerte**

L'email contient :

- Nom et URL du webhook
- Établissement concerné
- Nombre d'échecs consécutifs
- Actions recommandées
- Lien direct vers l'interface

**Pour réactiver un webhook :**

1. Corrigez le problème côté partenaire
2. Allez sur `/super-admin/webhooks`
3. Activez à nouveau le webhook
4. Testez avec le bouton Play 🎬

**Configuration email :**

Ajoutez dans `.env.local` :

```bash
SUPER_ADMIN_EMAIL=votre-email@example.com
RESEND_API_KEY=re_xxxxx
```

Voir [WEBHOOK_EMAIL_ALERTS.md](../features/WEBHOOK_EMAIL_ALERTS.md) pour plus de détails.

### Scénarios de test

Ajoutez `?scenario=XXX` à l'URL sandbox :

**Succès (défaut):**

```
/api/sandbox/police-webhook?scenario=success
```

Retourne : `200 OK` avec données de confirmation

**Erreur serveur:**

```
/api/sandbox/police-webhook?scenario=error
```

Retourne : `500 Internal Server Error`

**Validation échouée:**

```
/api/sandbox/police-webhook?scenario=invalid
```

Retourne : `400 Bad Request`

**Timeout:**

```
/api/sandbox/police-webhook?scenario=timeout
```

Attend 35 secondes avant de répondre (pour tester le retry)

### Documentation sandbox

```bash
curl https://votre-domaine.com/api/sandbox/police-webhook
```

Retourne la documentation JSON complète du sandbox.

## 📊 Codes d'erreur

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Succès                                  |
| 400  | Requête invalide (paramètres manquants) |
| 401  | Clé API invalide ou manquante           |
| 403  | Permissions insuffisantes               |
| 404  | Ressource non trouvée                   |
| 500  | Erreur serveur                          |

## 🔍 Logs et monitoring

### Via l'interface

**Logs API:**

- `/super-admin/api-management` - Voir l'historique d'utilisation des clés

**Logs Webhooks:**

- `/super-admin/webhooks` - Cliquez sur le nombre d'envois pour voir les détails

### Informations disponibles

- Date et heure de la requête
- Endpoint appelé
- Code de réponse HTTP
- Temps d'exécution
- Adresse IP (pour API)
- Payload envoyé (pour webhooks)

## 💡 Exemples d'intégration

### Node.js

```javascript
const axios = require("axios");

// Récupérer les réservations
async function getBookings() {
  const response = await axios.get("https://selfkey.ch/api/v1/bookings", {
    headers: {
      "X-API-Key": "votre_cle_api_ici",
    },
    params: {
      establishmentSlug: "selfcamp-fribourg",
      startDate: "2025-10-01T00:00:00.000Z",
      limit: 100,
    },
  });

  return response.data;
}

// Recevoir un webhook
app.post("/receive-booking", (req, res) => {
  const { event, timestamp, data } = req.body;

  console.log("Nouvelle réservation:", data.bookingNumber);
  console.log("Client:", data.clientFirstName, data.clientLastName);

  // Traiter la réservation...
  // Envoyer SMS avec avantages...

  res.json({
    status: "received",
    message: "Réservation enregistrée avec succès",
  });
});
```

### Python

```python
import requests

# Récupérer les réservations
def get_bookings():
    response = requests.get(
        'https://selfkey.ch/api/v1/bookings',
        headers={
            'X-API-Key': 'votre_cle_api_ici'
        },
        params={
            'establishmentSlug': 'selfcamp-fribourg',
            'startDate': '2025-10-01T00:00:00.000Z',
            'limit': 100
        }
    )
    return response.json()

# Webhook Flask
from flask import Flask, request

@app.route('/receive-booking', methods=['POST'])
def receive_booking():
    data = request.json
    print(f"Nouvelle réservation: {data['data']['bookingNumber']}")

    # Traiter la réservation...

    return {
        'status': 'received',
        'message': 'Réservation enregistrée avec succès'
    }
```

## 🆘 Support

Pour toute question ou problème :

- Email : support@selfkey.ch
- Documentation : https://selfkey.ch/api-docs
- Interface admin : https://selfkey.ch/super-admin

## 📝 Changelog

### Version 1.0.0 (Octobre 2025)

- ✅ Endpoints REST GET /bookings
- ✅ Authentification par clé API
- ✅ Webhooks automatiques (JSON/CSV)
- ✅ Mode sandbox pour tests
- ✅ Documentation Swagger interactive
- ✅ Logs et monitoring complets
