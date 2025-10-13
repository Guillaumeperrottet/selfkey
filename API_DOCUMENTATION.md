# SelfKey API - Guide d'utilisation

## 📚 Vue d'ensemble

L'API SelfKey permet aux partenaires autorisés (notamment les autorités policières) de récupérer automatiquement les informations de réservation pour :

- La déclaration des taxes de séjour
- L'attribution d'avantages aux clients (transports gratuits, pass musées, etc.)

## 🔐 Authentification

Toutes les requêtes API doivent inclure un header `X-API-Key` :

```bash
X-API-Key: sk_live_votre_cle_secrete
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
curl -H "X-API-Key: sk_live_abc123..." \
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
curl -H "X-API-Key: sk_live_abc123..." \
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

## 🔔 Webhooks

Les webhooks permettent de recevoir automatiquement les données de réservation en temps réel.

### Configuration

1. Allez sur `/super-admin/webhooks`
2. Cliquez sur "Nouveau webhook"
3. Remplissez :
   - **Nom** : Police Fribourg - API
   - **Établissement** : Sélectionnez
   - **URL** : `https://api.police.ch/receive-booking`
   - **Format** : JSON (ou CSV)

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
X-Webhook-Signature: <HMAC SHA256 si secret configuré>
```

### Retry automatique

- **3 tentatives** par défaut
- **Délai exponentiel** : 60s, 120s, 180s
- Les échecs sont loggés et visibles dans l'interface

### Sécurité (optionnel)

Vous pouvez configurer un secret pour vérifier l'authenticité des webhooks :

```javascript
const crypto = require("crypto");
const signature = req.headers["x-webhook-signature"];
const body = JSON.stringify(req.body);
const secret = "votre_secret";

const expectedSignature = crypto
  .createHmac("sha256", secret)
  .update(body)
  .digest("hex");

if (signature !== expectedSignature) {
  throw new Error("Invalid signature");
}
```

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
      "X-API-Key": "sk_live_abc123...",
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
            'X-API-Key': 'sk_live_abc123...'
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
