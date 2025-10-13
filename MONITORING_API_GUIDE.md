# 📊 Monitoring API & Webhooks - Guide Complet

## 🎯 Vue d'ensemble

Le système de monitoring vous permet de suivre en **temps réel** toutes les activités de l'API et des webhooks.

---

## 🚀 Accès au Dashboard

```
http://localhost:3000/super-admin/monitoring-api
```

Ou via la sidebar super-admin : **Monitoring API**

---

## 📈 Fonctionnalités

### 1. **Statistiques en temps réel**

- 📊 **Requêtes API (24h)** : Nombre total d'appels API
- 🪝 **Webhooks envoyés** : Nombre de webhooks déclenchés
- ⏱️ **Temps de réponse moyen** : Performance globale
- ⚠️ **Taux d'erreur** : Pourcentage d'erreurs

### 2. **Auto-refresh**

- ✅ **Activé par défaut** : Actualisation automatique toutes les 5 secondes
- 🔄 **Bouton ON/OFF** : Désactiver si besoin
- 🔃 **Refresh manuel** : Bouton "Actualiser"

### 3. **Filtres**

```
┌─────────────────────────────────────┐
│ Filtres                             │
├─────────────────────────────────────┤
│ ▼ Tous les statuts                  │
│   • Tous les statuts                │
│   • ✅ Succès uniquement            │
│   • ❌ Erreurs uniquement           │
└─────────────────────────────────────┘
```

### 4. **Logs API détaillés**

| Colonne      | Description                   |
| ------------ | ----------------------------- |
| **Heure**    | Timestamp exact de la requête |
| **Clé API**  | Nom de la clé utilisée        |
| **Endpoint** | URL appelée                   |
| **Méthode**  | GET, POST, etc.               |
| **Statut**   | Code HTTP (200, 401, 403...)  |
| **Temps**    | Temps de réponse en ms        |
| **IP**       | Adresse IP du client          |
| **Actions**  | 👁️ Voir les détails           |

### 5. **Logs Webhooks détaillés**

| Colonne       | Description                          |
| ------------- | ------------------------------------ |
| **Heure**     | Timestamp exact de l'envoi           |
| **Webhook**   | Nom du webhook                       |
| **Événement** | Type d'événement (booking.completed) |
| **URL**       | Destination du webhook               |
| **Statut**    | ✅ Succès / ❌ Échec                 |
| **Tentative** | Numéro de tentative (1/3, 2/3, 3/3)  |
| **Temps**     | Temps d'exécution                    |
| **Actions**   | 👁️ Voir payload et réponse           |

---

## 🔍 Détails des logs

### **Pour les API Logs**

Cliquez sur 👁️ pour voir :

```json
{
  "endpoint": "/api/v1/bookings",
  "method": "GET",
  "statusCode": 200,
  "responseTime": 125,
  "ipAddress": "127.0.0.1",
  "userAgent": "curl/7.79.1",
  "timestamp": "2025-10-13T12:34:56.789Z"
}
```

### **Pour les Webhook Logs**

Cliquez sur 👁️ pour voir :

**📤 Payload envoyé :**

```json
{
  "event": "booking.completed",
  "timestamp": "2025-10-13T12:34:56.789Z",
  "data": {
    "id": "clxyz123",
    "bookingNumber": 1234,
    "clientFirstName": "Jean"
    // ... tous les champs
  }
}
```

**📥 Réponse reçue :**

```json
{
  "status": "received",
  "message": "Réservation enregistrée avec succès",
  "benefits": ["Transport gratuit", "Pass musée"]
}
```

**❌ Erreur (si échec) :**

```
Error: connect ECONNREFUSED
```

---

## 🎨 Codes couleurs

### **Badges de statut**

- 🟢 **Vert (200-299)** : Succès
- 🔴 **Rouge (400-499)** : Erreur client (mauvaise requête)
- 🔴 **Rouge (500+)** : Erreur serveur

### **Tentatives de webhook**

- 🟢 **1/3** : Premier essai
- 🟡 **2/3** : Retry automatique
- 🔴 **3/3** : Dernier essai (échec définitif après)

---

## 📊 Cas d'usage pratiques

### **Scénario 1 : Webhook qui échoue**

```
12:34:56 - POST webhook → Police - 500 ❌ (1/3)
12:35:56 - POST webhook → Police - 500 ❌ (2/3)
12:36:56 - POST webhook → Police - 500 ❌ (3/3)
```

**Actions** :

1. Cliquez sur 👁️ pour voir l'erreur exacte
2. Vérifiez l'URL du webhook
3. Contactez la police si leur serveur est down
4. Consultez `responseBody` pour plus d'infos

### **Scénario 2 : Performance dégradée**

```
Temps de réponse moyen : 2500ms (trop lent !)
```

**Actions** :

1. Identifiez les endpoints lents dans les logs
2. Vérifiez si c'est un problème de requête DB
3. Optimisez les queries Prisma

### **Scénario 3 : Attaque détectée**

```
12:34:00 - GET /bookings - 403 ❌
12:34:01 - GET /bookings - 403 ❌
12:34:02 - GET /bookings - 403 ❌
... (100 fois depuis 192.168.1.100)
```

**Actions** :

1. Identifiez l'IP suspecte
2. Désactivez la clé API utilisée
3. Bloquez l'IP si nécessaire

### **Scénario 4 : Audit de conformité**

```
La police demande : "Avez-vous bien envoyé les données
de la réservation BK-1234 ?"
```

**Actions** :

1. Filtrez par "Succès uniquement"
2. Recherchez la réservation BK-1234 dans les logs webhook
3. Montrez le payload + réponse 200 OK
4. ✅ Preuve d'envoi !

---

## 🧪 Tests automatisés

### **Lancer tous les tests**

```bash
npx ts-node scripts/test-api-complete.ts
```

**Ce qui est testé** :

- ✅ Création de clé API
- ✅ Appel GET /api/v1/bookings
- ✅ Sécurité (sans clé → 401)
- ✅ Création de webhook
- ✅ Déclenchement manuel
- ✅ Logs API enregistrés
- ✅ Logs webhooks enregistrés

**Sortie attendue** :

```
╔══════════════════════════════════════════════════════╗
║   🧪 TEST COMPLET API & WEBHOOKS - SELFKEY         ║
╚══════════════════════════════════════════════════════╝

✅ Création clé API: Clé créée: sk_live_abc123...
✅ GET /api/v1/bookings: Récupéré 5 réservations
✅ Sécurité API: Requête sans clé correctement rejetée (401)
✅ Création webhook: Webhook créé: Test Webhook Auto
✅ Déclenchement webhook: Webhook testé, statut: 200
✅ Logs API: 3 logs enregistrés
✅ Logs Webhooks: 1 logs enregistrés

╔══════════════════════════════════════════════════════╗
║              📊 RÉSUMÉ DES TESTS                    ║
╚══════════════════════════════════════════════════════╝

✅ Tests réussis: 7
❌ Tests échoués: 0
📊 Total: 7

🎉 Tous les tests sont passés ! Votre API est prête !
```

---

## 🔧 Dépannage

### **Problème 1 : Aucun log affiché**

**Causes possibles** :

- Aucune activité API récente
- Base de données vide

**Solution** :

```bash
# Testez manuellement l'API
curl -H "X-API-Key: sk_live_..." "http://localhost:3000/api/v1/bookings"

# Rafraîchissez le dashboard
```

### **Problème 2 : Auto-refresh ne fonctionne pas**

**Solution** :

1. Vérifiez que le bouton "Auto-refresh ON" est actif
2. Rechargez la page
3. Vérifiez la console navigateur pour erreurs

### **Problème 3 : Webhook logs vides**

**Causes possibles** :

- Aucun webhook configuré
- Webhooks désactivés
- Aucune réservation récente

**Solution** :

```bash
# Testez manuellement un webhook
curl -X POST http://localhost:3000/api/super-admin/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"webhookId": "WEBHOOK_ID_ICI"}'
```

---

## 📱 Interface responsive

Le dashboard s'adapte automatiquement :

- 💻 **Desktop** : Toutes les colonnes visibles
- 📱 **Mobile** : Colonnes essentielles uniquement
- 🖥️ **Tablette** : Vue intermédiaire

---

## 🎯 Métriques recommandées

### **Objectifs de performance**

| Métrique               | Objectif   | Alerte si     |
| ---------------------- | ---------- | ------------- |
| Temps de réponse moyen | < 200ms    | > 1000ms      |
| Taux d'erreur API      | < 1%       | > 5%          |
| Taux succès webhooks   | > 95%      | < 90%         |
| Requêtes par jour      | Croissance | Chute brutale |

### **Surveillance quotidienne**

À vérifier **chaque jour** :

- ✅ Aucun webhook en échec répété
- ✅ Temps de réponse stable
- ✅ Pas d'attaque (tentatives 401/403 massives)
- ✅ Logs police (si configurés) sans erreur

---

## 🔐 Sécurité et confidentialité

**Données loggées** :

- ✅ Métadonnées (endpoint, statut, temps)
- ✅ Payload webhooks (utile pour audit)
- ❌ Mots de passe (jamais loggés)
- ❌ Numéros de carte bancaire (jamais loggés)

**Rétention** :

- Logs API : Conservés indéfiniment (ou à définir)
- Logs Webhooks : Conservés indéfiniment

**Accès** :

- 🔒 Uniquement super-admins
- 🔒 Pas d'accès externe

---

## 💡 Améliorations futures

- [ ] Graphiques temps réel (Chart.js/Recharts)
- [ ] Alertes email automatiques
- [ ] Export CSV des logs
- [ ] Filtres avancés (par date, par clé API)
- [ ] Dashboard public (anonymisé) pour la police
- [ ] Agrégation par heure/jour
- [ ] Comparaison période vs période

---

## 📞 Support

Questions ? Bugs ? Contactez le développeur !

---

**Version** : 1.0.0  
**Dernière mise à jour** : 13 Octobre 2025
