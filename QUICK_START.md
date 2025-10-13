# 🚀 Quick Start - Test Complet

## ⚡ Démarrage rapide (5 minutes)

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Se connecter en super-admin

```
URL: http://localhost:3000/super-admin
Email: votre_email_super_admin
Password: votre_mot_de_passe
```

### 3. Créer une clé API

```
1. Sidebar → "Clés API"
2. "Nouvelle clé API"
3. Nom: Test Police
4. Établissement: selfcamp-fribourg
5. Permissions: ✅ read:bookings
6. Créer
7. ⚠️ COPIEZ LA CLÉ MAINTENANT !
```

### 4. Tester l'API

```bash
# Remplacez YOUR_KEY par votre clé copiée
export API_KEY="sk_live_YOUR_KEY_HERE"

curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3000/api/v1/bookings?limit=3"
```

**✅ Succès attendu** : Liste de 3 réservations

### 5. Créer un webhook

```
1. Sidebar → "Webhooks"
2. "Nouveau webhook"
3. Nom: Test Webhook
4. Établissement: selfcamp-fribourg
5. URL: http://localhost:3000/api/sandbox/police-webhook
6. Événements: ✅ booking.completed
7. Format: JSON
8. Créer
```

### 6. Tester le webhook

```
1. Cliquez sur l'icône 🎬 à côté du webhook
2. Regardez votre terminal serveur
3. ✅ Vous devriez voir: "=== WEBHOOK REÇU (Sandbox) ==="
```

### 7. Voir le monitoring

```
1. Sidebar → "Monitoring API"
2. Activez "Auto-refresh ON"
3. ✅ Vous devriez voir vos tests dans les logs
```

### 8. Documentation

```
URL: http://localhost:3000/api-docs

1. Cliquez "🔓 Authorize"
2. Collez votre clé API
3. Testez directement avec "Try it out"
```

---

## 🧪 Tests automatisés

```bash
npx ts-node scripts/test-api-complete.ts
```

**Résultat attendu** :

```
✅ Tests réussis: 7
❌ Tests échoués: 0
🎉 Tous les tests sont passés !
```

---

## 📋 Checklist de validation

- [ ] ✅ Connexion super-admin fonctionne
- [ ] ✅ Création clé API réussie
- [ ] ✅ API retourne des réservations (avec clé)
- [ ] ✅ API rejette sans clé (401)
- [ ] ✅ Webhook créé
- [ ] ✅ Webhook testé avec 🎬 (succès)
- [ ] ✅ Monitoring affiche les logs
- [ ] ✅ Documentation Swagger accessible
- [ ] ✅ Tests automatisés passent

---

## ⚠️ Dépannage rapide

### Problème: "API key required"

```bash
# Vérifiez que vous utilisez le bon header
curl -H "X-API-Key: sk_live_..." "http://localhost:3000/api/v1/bookings"
       ^^^^^^^^^^ Important !
```

### Problème: "Forbidden - Insufficient permissions"

```
→ Retournez sur /super-admin/api-management
→ Vérifiez que "read:bookings" est coché
→ Recréez la clé si besoin
```

### Problème: Webhook ne s'envoie pas

```
→ Vérifiez que le webhook est actif (toggle vert)
→ Vérifiez l'URL (doit être http://localhost:3000/api/sandbox/...)
→ Regardez les logs webhook pour l'erreur exacte
```

### Problème: Monitoring vide

```
→ Faites au moins 1 requête API d'abord
→ Cliquez sur "Actualiser"
→ Vérifiez que le serveur tourne
```

---

## 🎯 Prêt pour la production

Une fois tous les tests validés :

1. **Remplacez l'URL sandbox** par la vraie URL police
2. **Créez une clé API production** (dédiée)
3. **Activez le monitoring quotidien**
4. **Envoyez la documentation** à la police

---

**Tout fonctionne ? Bravo ! 🎉**

Consultez `IMPLEMENTATION_COMPLETE.md` pour les détails complets.
