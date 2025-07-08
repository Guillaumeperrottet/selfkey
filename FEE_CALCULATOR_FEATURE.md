# 💰 Calculateur de Frais et Revenus

## ✅ **Fonctionnalité ajoutée**

Maintenant, quand vous créez ou modifiez un prix dans votre plateforme, vous pouvez **voir immédiatement** :

- Le montant que vous recevrez après déduction des frais
- Le détail des frais appliqués
- Le pourcentage total des frais

## 🎯 **Où la trouver**

### **1. Dans le gestionnaire de prix (PricingOptionsManager)**

- **Simulateur en haut** : Entrez n'importe quel prix pour voir la décomposition
- **Revenus nets sous chaque prix** : Affichage direct du montant net à côté de chaque option

### **2. Comment ça marche**

- Les frais sont **récupérés automatiquement** depuis la base de données pour chaque établissement
- Calcul en **temps réel** quand vous tapez un prix
- **Frais personnalisés** par établissement (gérés dans l'admin)

## 🔧 **Composants créés**

### **FeeBreakdown**

Composant réutilisable qui affiche :

```
Prix affiché: 50.00 CHF
- Commission (1%): -0.50 CHF
- Frais fixes: -0.10 CHF
= Vous recevrez: 49.40 CHF
```

### **useEstablishmentFees**

Hook qui récupère automatiquement les frais configurés pour l'établissement.

### **API /api/establishments/[hotel]/fees**

Endpoint pour récupérer les frais d'un établissement.

## 💡 **Avantages**

✅ **Transparence totale** : Plus de surprises sur les revenus nets  
✅ **Aide à la tarification** : Ajustez vos prix en connaissance de cause  
✅ **Avertissements intelligents** : Alerte si les frais dépassent 5%  
✅ **Calcul dynamique** : Utilise les vrais frais de votre établissement

## 📱 **Utilisation pratique**

1. **Aller dans Admin → Pricing (Options de prix)**
2. **Utiliser le simulateur** en haut pour tester différents prix
3. **Voir les revenus nets** directement sous chaque option de prix que vous créez
4. **Ajuster vos prix** en fonction des revenus souhaités

Les frais affichés sont toujours **à jour** selon la configuration de votre établissement dans la base de données ! 🎉
