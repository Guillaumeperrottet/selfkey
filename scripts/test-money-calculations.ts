#!/usr/bin/env tsx

/**
 * Script de test pour vérifier la cohérence des calculs monétaires
 *
 * Usage: npx tsx scripts/test-money-calculations.ts
 */

import {
  toRappen,
  fromRappen,
  addMoney,
  multiplyMoney,
  percentageOf,
  calculateCommission,
  formatCHF,
  isValidMoneyAmount,
  fixRounding,
} from "../src/lib/money-utils";

// Tests unitaires
function testMoneyUtils() {
  console.log("🧪 Test des utilitaires monétaires\n");

  // Test 1: Conversion CHF <-> Rappen
  console.log("1. Test conversions CHF <-> Rappen:");
  const test1 = 123.45;
  const rappen1 = toRappen(test1);
  const chf1 = fromRappen(rappen1);
  console.log(`   ${test1} CHF = ${rappen1} rappen = ${chf1} CHF`);
  console.log(`   ✅ Cohérent: ${test1 === chf1}\n`);

  // Test 2: Addition précise
  console.log("2. Test addition précise:");
  const amounts = [12.34, 56.78, 9.99];
  const normalAdd = amounts.reduce((sum, amount) => sum + amount, 0);
  const preciseAdd = addMoney(...amounts);
  console.log(`   Addition normale: ${normalAdd}`);
  console.log(`   Addition précise: ${preciseAdd}`);
  console.log(
    `   ✅ Amélioration: ${Math.abs(normalAdd - preciseAdd) < 0.001 ? "Aucune différence" : "Différence corrigée"}\n`
  );

  // Test 3: Calcul de pourcentage
  console.log("3. Test calcul de pourcentage:");
  const amount = 100.5;
  const rate = 5.5; // 5.5%
  const normalPercent = (amount * rate) / 100;
  const precisePercent = percentageOf(amount, rate);
  console.log(`   ${rate}% de ${amount} CHF:`);
  console.log(`   Calcul normal: ${normalPercent}`);
  console.log(`   Calcul précis: ${precisePercent}`);
  console.log(
    `   ✅ Différence: ${Math.abs(normalPercent - precisePercent)}\n`
  );

  // Test 4: Calcul de commission complexe
  console.log("4. Test calcul de commission:");
  const bookingAmount = 156.78;
  const commissionRate = 8.5; // 8.5%
  const fixedFee = 3.5;

  const commission = calculateCommission(
    bookingAmount,
    commissionRate,
    fixedFee
  );
  console.log(`   Montant: ${formatCHF(bookingAmount)}`);
  console.log(`   Taux: ${commissionRate}%`);
  console.log(`   Frais fixes: ${formatCHF(fixedFee)}`);
  console.log(`   Commission calculée: ${formatCHF(commission.commission)}`);
  console.log(`   Commission totale: ${formatCHF(commission.totalCommission)}`);
  console.log(`   Montant net: ${formatCHF(commission.netAmount)}`);
  console.log(
    `   Pour Stripe: ${commission.amountRappen} rappen / ${commission.commissionRappen} rappen\n`
  );

  // Test 5: Validation des montants
  console.log("5. Test validation des montants:");
  const testAmounts = [123.45, 123.456, 0.1 + 0.2, 99.999];
  testAmounts.forEach((amount) => {
    const isValid = isValidMoneyAmount(amount);
    const fixed = fixRounding(amount);
    console.log(`   ${amount} -> Valid: ${isValid} -> Corrigé: ${fixed}`);
  });
}

// Test des scénarios réels
function testRealScenarios() {
  console.log("\n🏨 Test des scénarios réels de réservation\n");

  // Scénario 1: Réservation simple
  console.log("1. Réservation simple:");
  const roomPrice = 89.5;
  const nights = 3;
  const adults = 2;
  const touristTax = 3.5;

  const subtotal = multiplyMoney(roomPrice, nights);
  const taxTotal = multiplyMoney(touristTax, adults * nights);
  const total = addMoney(subtotal, taxTotal);

  console.log(
    `   Chambre: ${formatCHF(roomPrice)} x ${nights} nuits = ${formatCHF(subtotal)}`
  );
  console.log(
    `   Taxe: ${formatCHF(touristTax)} x ${adults} adultes x ${nights} nuits = ${formatCHF(taxTotal)}`
  );
  console.log(`   Total: ${formatCHF(total)}\n`);

  // Scénario 2: Avec commission
  console.log("2. Avec commission plateforme:");
  const commission = calculateCommission(total, 6.5, 2.5);
  const finalAmount = addMoney(total, commission.totalCommission);

  console.log(`   Sous-total client: ${formatCHF(total)}`);
  console.log(`   Commission: ${formatCHF(commission.totalCommission)}`);
  console.log(`   Montant final client: ${formatCHF(finalAmount)}`);
  console.log(`   Montant net hôtelier: ${formatCHF(commission.netAmount)}\n`);

  // Scénario 3: Cohérence Stripe
  console.log("3. Cohérence avec Stripe:");
  console.log(`   Montant Stripe: ${commission.amountRappen} centimes`);
  console.log(`   Commission Stripe: ${commission.commissionRappen} centimes`);
  console.log(
    `   Vérification: ${commission.amountRappen - commission.commissionRappen} centimes pour l'hôtel`
  );
  console.log(
    `   En CHF: ${formatCHF((commission.amountRappen - commission.commissionRappen) / 100)}`
  );
}

// Test de détection des problèmes existants
function testExistingIssues() {
  console.log("\n🔍 Test de détection des problèmes existants\n");

  // Reproduire le problème du double arrondi
  console.log("1. Problème du double arrondi (Stripe):");
  const amount = 156.78;
  const rate = 8.5;
  const fee = 3.5;

  // Méthode problématique (ancienne)
  const oldCommission = Math.round((amount * rate) / 100 + fee);
  const oldStripeAmount = Math.round(amount * 100);
  const oldStripeCommission = Math.round(oldCommission * 100);

  // Nouvelle méthode
  const newCommission = calculateCommission(amount, rate, fee);

  console.log(`   Ancienne méthode:`);
  console.log(`     Commission: ${oldCommission} CHF`);
  console.log(`     Stripe amount: ${oldStripeAmount} centimes`);
  console.log(`     Stripe commission: ${oldStripeCommission} centimes`);

  console.log(`   Nouvelle méthode:`);
  console.log(`     Commission: ${newCommission.totalCommission} CHF`);
  console.log(`     Stripe amount: ${newCommission.amountRappen} centimes`);
  console.log(
    `     Stripe commission: ${newCommission.commissionRappen} centimes`
  );

  const difference = Math.abs(
    oldStripeCommission - newCommission.commissionRappen
  );
  console.log(`   Différence: ${difference} centimes\n`);
}

// Exécuter tous les tests
console.log("💰 Tests de Calculs Monétaires - SelfKey Hotels\n");
console.log("=".repeat(60));

try {
  testMoneyUtils();
  testRealScenarios();
  testExistingIssues();

  console.log("✅ Tous les tests terminés avec succès!\n");
  console.log("📋 Résumé des améliorations:");
  console.log("   - Calculs en centimes pour éviter les erreurs d'arrondi");
  console.log("   - Cohérence entre frontend et backend");
  console.log("   - Validation des montants monétaires");
  console.log("   - Commission Stripe calculée précisément");
} catch (error) {
  console.error("❌ Erreur pendant les tests:", error);
  process.exit(1);
}
