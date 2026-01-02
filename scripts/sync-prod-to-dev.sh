#!/bin/bash

###############################################################################
# 🔄 SYNC PRODUCTION → DEV
# Synchronise les données d'Exoscale (Production) vers Neon (Dev)
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs des bases de données (lues depuis les variables d'environnement)
PROD_URL="${EXOSCALE_DATABASE_URL:-}"
DEV_URL="${NEON_DATABASE_URL:-}"

# Vérifier que les variables sont définies
if [ -z "$PROD_URL" ]; then
    log_error "Variable EXOSCALE_DATABASE_URL non définie !"
    echo ""
    echo "Définissez-la avec :"
    echo "export EXOSCALE_DATABASE_URL='postgres://avnadmin:PASSWORD@...'"
    exit 1
fi

if [ -z "$DEV_URL" ]; then
    log_error "Variable NEON_DATABASE_URL non définie !"
    echo ""
    echo "Définissez-la avec :"
    echo "export NEON_DATABASE_URL='postgresql://user:PASSWORD@...'"
    exit 1
fi

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo ""
echo "========================================================================"
echo "🔄 SYNCHRONISATION PRODUCTION → DEV"
echo "========================================================================"
echo ""
log_warning "Cette opération va remplacer TOUTES les données de votre base DEV (Neon)"
log_warning "par les données de PRODUCTION (Exoscale)."
echo ""
log_info "Source : Exoscale (Production - Suisse)"
log_info "Destination : Neon (Dev - USA)"
echo ""

# Demander confirmation
read -p "Voulez-vous continuer ? (tapez 'oui' pour confirmer) : " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
    log_warning "Synchronisation annulée."
    exit 0
fi

echo ""
log_info "Étape 1/5 : Vérification des connexions..."

# Vérifier que PostgreSQL client est installé
if ! command -v pg_dump &> /dev/null; then
    log_error "pg_dump n'est pas installé. Installez-le avec : brew install postgresql@16"
    exit 1
fi

# Tester la connexion à Production
if ! psql "$PROD_URL" -c "SELECT 1" > /dev/null 2>&1; then
    log_error "Impossible de se connecter à la base PRODUCTION (Exoscale)"
    exit 1
fi
log_success "Connexion PRODUCTION (Exoscale) OK"

# Tester la connexion à Dev
if ! psql "$DEV_URL" -c "SELECT 1" > /dev/null 2>&1; then
    log_error "Impossible de se connecter à la base DEV (Neon)"
    exit 1
fi
log_success "Connexion DEV (Neon) OK"

echo ""
log_info "Étape 2/5 : Comptage des données en PRODUCTION..."

# Compter les données en production
PROD_USERS=$(psql "$PROD_URL" -tAc "SELECT COUNT(*) FROM \"user\"" 2>/dev/null || echo "0")
PROD_ESTABLISHMENTS=$(psql "$PROD_URL" -tAc "SELECT COUNT(*) FROM \"establishments\"" 2>/dev/null || echo "0")
PROD_BOOKINGS=$(psql "$PROD_URL" -tAc "SELECT COUNT(*) FROM \"bookings\"" 2>/dev/null || echo "0")
PROD_ROOMS=$(psql "$PROD_URL" -tAc "SELECT COUNT(*) FROM \"rooms\"" 2>/dev/null || echo "0")

echo ""
echo "📊 Données en PRODUCTION (Exoscale) :"
echo "   - Users: $PROD_USERS"
echo "   - Establishments: $PROD_ESTABLISHMENTS"
echo "   - Bookings: $PROD_BOOKINGS"
echo "   - Rooms: $PROD_ROOMS"

echo ""
log_info "Étape 3/5 : Backup de la PRODUCTION..."

# Créer le répertoire de backups s'il n'existe pas
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/backup_prod_to_dev_$(date +%Y%m%d_%H%M%S).sql"

# Faire le dump de production
pg_dump "$PROD_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  --column-inserts \
  --exclude-table=_prisma_migrations \
  --exclude-table=session \
  --exclude-table=api_logs \
  --exclude-table=webhook_logs \
  > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_success "Backup créé : $BACKUP_FILE ($BACKUP_SIZE)"

echo ""
log_info "Étape 4/5 : Nettoyage de la base DEV (Neon)..."

# Supprimer toutes les données de dev (mais garder le schéma)
psql "$DEV_URL" <<EOF
-- Désactiver les foreign keys temporairement
SET session_replication_role = 'replica';

-- Supprimer les données de toutes les tables
TRUNCATE TABLE "user", "account", "session", "verification", "invite_token", 
               "UserEstablishment", "establishments", "rooms", "bookings", 
               "pricing_options", "pricing_option_values", "integrations", 
               "integration_logs", "excel_export_history", "establishment_transfers", 
               "email_images", "invoices", "api_keys", "api_logs", "webhooks", 
               "webhook_logs", "dashboard_preferences" 
CASCADE;

-- Réactiver les foreign keys
SET session_replication_role = 'origin';
EOF

log_success "Base DEV nettoyée"

echo ""
log_info "Étape 5/5 : Import des données de PRODUCTION vers DEV..."

# Restaurer le backup dans dev
psql "$DEV_URL" < "$BACKUP_FILE" 2>&1 | grep -v "^$" || true

log_success "Import terminé"

echo ""
log_info "Vérification finale..."

# Vérifier les données importées
DEV_USERS=$(psql "$DEV_URL" -tAc "SELECT COUNT(*) FROM \"user\"" 2>/dev/null || echo "0")
DEV_ESTABLISHMENTS=$(psql "$DEV_URL" -tAc "SELECT COUNT(*) FROM \"establishments\"" 2>/dev/null || echo "0")
DEV_BOOKINGS=$(psql "$DEV_URL" -tAc "SELECT COUNT(*) FROM \"bookings\"" 2>/dev/null || echo "0")
DEV_ROOMS=$(psql "$DEV_URL" -tAc "SELECT COUNT(*) FROM \"rooms\"" 2>/dev/null || echo "0")

echo ""
echo "📊 Données en DEV (Neon) après synchronisation :"
echo "   - Users: $DEV_USERS (prod: $PROD_USERS)"
echo "   - Establishments: $DEV_ESTABLISHMENTS (prod: $PROD_ESTABLISHMENTS)"
echo "   - Bookings: $DEV_BOOKINGS (prod: $PROD_BOOKINGS)"
echo "   - Rooms: $DEV_ROOMS (prod: $PROD_ROOMS)"

echo ""
echo "========================================================================"
log_success "🎉 SYNCHRONISATION TERMINÉE AVEC SUCCÈS !"
echo "========================================================================"
echo ""
log_info "Backup sauvegardé dans : $BACKUP_FILE"
log_info "Vous pouvez supprimer les anciens backups dans le dossier : $BACKUP_DIR"
echo ""
log_warning "Note : Les IDs des tables avec auto-increment (ex: bookings) peuvent avoir changé."
log_warning "Si vous créez de nouvelles données en DEV, les IDs continueront à partir du dernier ID de prod."
echo ""
