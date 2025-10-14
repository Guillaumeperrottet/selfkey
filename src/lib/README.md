# Structure du dossier /lib

Cette structure organise les utilitaires et services par domaine fonctionnel.

## 📁 Organisation

- **auth/** - Authentification (Better Auth, sessions, vérifications)
- **payment/** - Paiements (Stripe, configuration, Connect)
- **booking/** - Réservations (disponibilité, traductions)
- **email/** - Emails (envoi, templates, traductions)
- **pricing/** - Tarification (calculs de frais, options de prix)
- **security/** - Sécurité (codes d'accès, tokens, rate limiting)
- **database/** - Base de données (Prisma client)
- **config/** - Configuration (domaines, hôtels)
- **management/** - Gestion (chambres, transferts d'établissements)
- **utils/** - Utilitaires généraux (temps, images, slugs, etc.)
- **api/** - Clients API externes

## 🔄 Migration Progressive

Les anciens fichiers à la racine de `/lib` ont été conservés pour la rétrocompatibilité.
Ils ré-exportent simplement les nouveaux modules.

### Ancien code (fonctionne toujours) :
```typescript
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
```

### Nouveau code (recommandé) :
```typescript
import { prisma } from "@/lib/database/prisma"
import { auth } from "@/lib/auth/server"
```

### Avec barrel exports :
```typescript
import { prisma } from "@/lib/database"
import { auth, authClient, checkAuth } from "@/lib/auth"
```

## 📋 TODO

- [ ] Migrer progressivement les imports vers la nouvelle structure
- [ ] Supprimer les fichiers .backup une fois validé
- [ ] Supprimer les fichiers de rétrocompatibilité une fois la migration terminée
