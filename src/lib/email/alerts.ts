/**
 * 📧 Système d'alertes email pour les super-admins
 *
 * Envoie des notifications critiques concernant :
 * - Webhooks désactivés automatiquement
 * - Erreurs système
 * - Alertes de sécurité
 */

import { sendEmail } from "./client";

/**
 * Email de l'expéditeur (doit être vérifié dans Resend)
 */
function getFromEmail(): string {
  // En développement, utiliser l'email de test Resend
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.RESEND_FROM_EMAIL
  ) {
    return "onboarding@resend.dev";
  }
  return process.env.RESEND_FROM_EMAIL;
}

/**
 * Récupère l'email du super-admin depuis la configuration
 */
async function getSuperAdminEmail(): Promise<string | null> {
  // Lecture directe de process.env (lazy) pour supporter dotenv dans les scripts
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (superAdminEmail) {
    return superAdminEmail;
  }

  // Sinon, utiliser un email par défaut pour la production
  // (à configurer via la variable d'environnement SUPER_ADMIN_EMAIL)
  console.warn(
    "⚠️ SUPER_ADMIN_EMAIL n'est pas défini dans les variables d'environnement"
  );
  return null;
}

/**
 * Envoie un email d'alerte quand un webhook est désactivé automatiquement
 */
export async function sendWebhookDisabledAlert(
  webhookId: string,
  webhookName: string,
  webhookUrl: string,
  establishmentSlug: string,
  failureCount: number
): Promise<void> {
  try {
    const adminEmail = await getSuperAdminEmail();

    if (!adminEmail) {
      console.warn(
        "⚠️ Impossible d'envoyer l'email d'alerte : aucun super-admin trouvé"
      );
      return;
    }

    const subject = `🚨 Alerte : Webhook désactivé automatiquement - ${webhookName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .alert-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-title {
      color: #856404;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .details {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .detail-row {
      margin: 8px 0;
    }
    .label {
      font-weight: 600;
      color: #495057;
    }
    .value {
      color: #212529;
      word-break: break-all;
    }
    .action-button {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      font-size: 12px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="alert-box">
    <div class="alert-title">🚨 Webhook désactivé automatiquement</div>
    <p>Un webhook a été désactivé automatiquement suite à ${failureCount} échecs consécutifs.</p>
  </div>

  <div class="details">
    <div class="detail-row">
      <span class="label">Nom du webhook :</span>
      <span class="value">${webhookName}</span>
    </div>
    <div class="detail-row">
      <span class="label">URL :</span>
      <span class="value">${webhookUrl}</span>
    </div>
    <div class="detail-row">
      <span class="label">Établissement :</span>
      <span class="value">${establishmentSlug}</span>
    </div>
    <div class="detail-row">
      <span class="label">ID du webhook :</span>
      <span class="value">${webhookId}</span>
    </div>
    <div class="detail-row">
      <span class="label">Échecs consécutifs :</span>
      <span class="value">${failureCount}</span>
    </div>
  </div>

  <p><strong>Actions recommandées :</strong></p>
  <ul>
    <li>Vérifiez que l'URL du webhook est accessible</li>
    <li>Consultez les logs pour identifier la cause des échecs</li>
    <li>Corrigez le problème côté partenaire</li>
    <li>Réactivez le webhook une fois le problème résolu</li>
  </ul>

  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://selfkey.app"}/super-admin/webhooks" class="action-button">
    Voir les détails du webhook
  </a>

  <div class="footer">
    <p>
      Cet email a été envoyé automatiquement par le système de monitoring de SelfKey.<br>
      Pour toute question, consultez les logs système ou contactez le support technique.
    </p>
  </div>
</body>
</html>
    `.trim();

    const result = await sendEmail({
      to: adminEmail,
      from: getFromEmail(),
      subject,
      html,
    });

    if (result.success) {
      console.log(
        `✅ Email d'alerte envoyé à ${adminEmail} pour le webhook ${webhookId}`
      );
    } else {
      console.error(
        `❌ Échec de l'envoi de l'email d'alerte : ${result.error}`
      );
    }
  } catch (error) {
    console.error(
      `Error sending webhook disabled alert for ${webhookId}:`,
      error
    );
  }
}

/**
 * Envoie un email d'alerte générique pour les super-admins
 */
export async function sendAdminAlert(
  subject: string,
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const adminEmail = await getSuperAdminEmail();

    if (!adminEmail) {
      console.warn(
        "⚠️ Impossible d'envoyer l'email d'alerte : aucun super-admin trouvé"
      );
      return;
    }

    const detailsHtml = details
      ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(details, null, 2)}</pre>
      </div>
    `
      : "";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h2>🔔 Alerte système</h2>
  <p>${message}</p>
  ${detailsHtml}
  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
    Email automatique - SelfKey
  </p>
</body>
</html>
    `.trim();

    await sendEmail({
      to: adminEmail,
      from: getFromEmail(),
      subject: `🔔 ${subject}`,
      html,
    });
  } catch (error) {
    console.error("Error sending admin alert:", error);
  }
}
