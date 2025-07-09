# Impact du Type de Système d'Accès sur les Emails de Confirmation

## 🔑 **Les 3 Types de Systèmes d'Accès**

Quand vous choisissez un type de système d'accès dans la **Gestion des codes d'accès**, cela détermine comment les variables `{accessCode}` et `{accessInstructions}` sont remplies dans vos emails de confirmation.

### **1. 🏠 Code par place (Recommandé)**

```
Type: "room"
```

**Ce qui se passe dans l'email :**

- `{accessCode}` = Le code spécifique à la chambre réservée
- `{accessInstructions}` = Texte par défaut ou instructions générales

**Exemple dans l'email :**

```
- Code d'accès : 1234
```

**Avantages :**

- ✅ Sécurité maximale (chaque chambre a son propre code)
- ✅ Facilité de gestion (changement d'un code = 1 seule chambre affectée)
- ✅ Traçabilité (on sait qui a quel code)

---

### **2. 🌐 Code général**

```
Type: "general"
```

**Ce qui se passe dans l'email :**

- `{accessCode}` = Le code général de l'établissement
- `{accessInstructions}` = Texte par défaut ou instructions générales

**Exemple dans l'email :**

```
- Code d'accès : 5678
```

**Avantages :**

- ✅ Simple à gérer (un seul code pour tout)
- ✅ Facile à retenir pour les clients
- ❌ Moins sécurisé (même code pour tous)

---

### **3. 📝 Instructions personnalisées**

```
Type: "custom"
```

**Ce qui se passe dans l'email :**

- `{accessCode}` = "Voir instructions ci-dessous"
- `{accessInstructions}` = **VOS INSTRUCTIONS PERSONNALISÉES** (HTML autorisé)

**Exemple dans l'email :**

```
- Code d'accès : Voir instructions ci-dessous

Récupérez votre carte à la réception automatique située à l'entrée principale.
Utilisez le code 0000# pour ouvrir la machine.
Votre carte sera dans le casier portant votre nom.
```

**Avantages :**

- ✅ Flexibilité totale (vous écrivez exactement ce que vous voulez)
- ✅ Peut inclure du HTML pour la mise en forme
- ✅ Idéal pour les systèmes complexes (boîte à clés, réception automatique, etc.)
- ✅ Peut inclure des instructions step-by-step détaillées

---

## 🎯 **Dans le Template d'Email**

Voici comment ces variables apparaissent dans votre template :

```text
Détails de votre réservation :
- Chambre : {roomName}
- Arrivée : {checkInDate}
- Départ : {checkOutDate}
- Code d'accès : {accessCode}

{accessInstructions}
```

## 📧 **Résultat Final dans l'Email**

### **Avec "Code par place" :**

```
- Code d'accès : 1234

Contactez-nous pour plus d'informations
```

### **Avec "Code général" :**

```
- Code d'accès : 5678

Contactez-nous pour plus d'informations
```

### **Avec "Instructions personnalisées" :**

```
- Code d'accès : Voir instructions ci-dessous

Récupérez votre carte à la réception automatique située à l'entrée principale.
Utilisez le code 0000# pour ouvrir la machine.
Votre carte sera dans le casier portant votre nom.
L'entrée se trouve côté parking, suivez les panneaux "Self Check-in".

En cas de problème, appelez le +41 XX XXX XX XX
```

## ⚙️ **Configuration Technique**

Quand vous changez le type dans **Gestion des codes d'accès**, l'API met à jour :

1. `establishment.accessCodeType` (détermine la logique)
2. `establishment.generalAccessCode` (si type = "general")
3. `establishment.accessInstructions` (si type = "custom")

Puis, lors de l'envoi d'un email de confirmation, le système :

1. Lit le type configuré
2. Détermine le bon code d'accès selon la logique
3. Remplace les variables dans votre template
4. Envoie l'email avec le contenu final

## 💡 **Recommandations**

**Utilisez "Instructions personnalisées" quand :**

- ❌ Vous n'avez pas de codes numériques
- ✅ Vous avez une boîte à clés complexe
- ✅ Vous avez une réception automatique
- ✅ Vous voulez donner des instructions step-by-step
- ✅ Vous voulez inclure des horaires ou contacts d'urgence
- ✅ Vous voulez formater avec du HTML

**Exemple d'instructions HTML :**

```html
<strong>Instructions d'accès :</strong><br />
1. <em>Dirigez-vous vers la réception automatique</em><br />
2. Tapez le code <strong>0000#</strong><br />
3. Récupérez votre carte dans le casier<br />
<br />
🕐 <u>Disponible 24h/24</u><br />
📞 <strong>Urgence : +41 XX XXX XX XX</strong>
```

Cela vous donne un contrôle total sur le message que reçoivent vos clients ! 🎯
