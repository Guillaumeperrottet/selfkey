import QRCode from "qrcode";

interface QRCodeWithLogoOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logoUrl?: string;
  logoSize?: number;
  borderRadius?: number;
}

export async function generateQRCodeWithLogo(
  text: string,
  options: QRCodeWithLogoOptions = {}
): Promise<string> {
  const {
    width = 256,
    margin = 2,
    color = { dark: "#000000", light: "#FFFFFF" },
    logoUrl = "https://res.cloudinary.com/dafkgjhwt/image/upload/v1756998073/selfcamp_logo_seul_1_kdcjwb.png",
    logoSize = width * 0.2, // 20% de la taille du QR code
    borderRadius = 16,
  } = options;

  try {
    // Générer le QR code de base
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width,
      margin,
      color,
      errorCorrectionLevel: "M", // Niveau de correction d'erreur moyen pour permettre l'ajout du logo
    });

    // Si nous sommes côté serveur, retourner juste le QR code simple
    if (typeof window === "undefined") {
      return qrCodeDataUrl;
    }

    // Créer un canvas pour dessiner le QR code avec le logo
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Impossible de créer le contexte canvas");
    }

    canvas.width = width;
    canvas.height = width;

    // Dessiner le QR code de base
    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrCodeDataUrl;
    });

    // Appliquer les angles arrondis avec un masque
    ctx.save();

    // Créer un chemin avec des angles arrondis
    const radius = borderRadius;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, width - radius);
    ctx.quadraticCurveTo(width, width, width - radius, width);
    ctx.lineTo(radius, width);
    ctx.quadraticCurveTo(0, width, 0, width - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    // Utiliser le chemin comme masque
    ctx.clip();

    // Dessiner le QR code
    ctx.drawImage(qrImage, 0, 0, width, width);

    ctx.restore();

    try {
      // Charger et dessiner le logo au centre
      const logoImage = new Image();
      logoImage.crossOrigin = "anonymous";

      await new Promise<void>((resolve) => {
        logoImage.onload = () => resolve();
        logoImage.onerror = () => {
          // Si le logo ne se charge pas, on continue sans
          resolve();
        };
        logoImage.src = logoUrl;
      });

      // Calculer la position du logo au centre
      const logoX = (width - logoSize) / 2;
      const logoY = (width - logoSize) / 2;

      // Dessiner un fond blanc avec des angles arrondis pour le logo
      const logoRadius = 8;
      const logoPadding = 4;
      const logoBackgroundSize = logoSize + logoPadding * 2;
      const logoBackgroundX = logoX - logoPadding;
      const logoBackgroundY = logoY - logoPadding;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(logoBackgroundX + logoRadius, logoBackgroundY);
      ctx.lineTo(
        logoBackgroundX + logoBackgroundSize - logoRadius,
        logoBackgroundY
      );
      ctx.quadraticCurveTo(
        logoBackgroundX + logoBackgroundSize,
        logoBackgroundY,
        logoBackgroundX + logoBackgroundSize,
        logoBackgroundY + logoRadius
      );
      ctx.lineTo(
        logoBackgroundX + logoBackgroundSize,
        logoBackgroundY + logoBackgroundSize - logoRadius
      );
      ctx.quadraticCurveTo(
        logoBackgroundX + logoBackgroundSize,
        logoBackgroundY + logoBackgroundSize,
        logoBackgroundX + logoBackgroundSize - logoRadius,
        logoBackgroundY + logoBackgroundSize
      );
      ctx.lineTo(
        logoBackgroundX + logoRadius,
        logoBackgroundY + logoBackgroundSize
      );
      ctx.quadraticCurveTo(
        logoBackgroundX,
        logoBackgroundY + logoBackgroundSize,
        logoBackgroundX,
        logoBackgroundY + logoBackgroundSize - logoRadius
      );
      ctx.lineTo(logoBackgroundX, logoBackgroundY + logoRadius);
      ctx.quadraticCurveTo(
        logoBackgroundX,
        logoBackgroundY,
        logoBackgroundX + logoRadius,
        logoBackgroundY
      );
      ctx.closePath();
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      // Dessiner le logo avec des angles arrondis
      if (logoImage.complete && logoImage.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(logoX + logoRadius, logoY);
        ctx.lineTo(logoX + logoSize - logoRadius, logoY);
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY,
          logoX + logoSize,
          logoY + logoRadius
        );
        ctx.lineTo(logoX + logoSize, logoY + logoSize - logoRadius);
        ctx.quadraticCurveTo(
          logoX + logoSize,
          logoY + logoSize,
          logoX + logoSize - logoRadius,
          logoY + logoSize
        );
        ctx.lineTo(logoX + logoRadius, logoY + logoSize);
        ctx.quadraticCurveTo(
          logoX,
          logoY + logoSize,
          logoX,
          logoY + logoSize - logoRadius
        );
        ctx.lineTo(logoX, logoY + logoRadius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + logoRadius, logoY);
        ctx.closePath();
        ctx.clip();

        // Dessiner le logo
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      }
    } catch (logoError) {
      console.warn(
        "Erreur lors du chargement du logo, QR code généré sans logo:",
        logoError
      );
    }

    // Retourner le canvas comme Data URL
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Erreur lors de la génération du QR code avec logo:", error);
    // En cas d'erreur, retourner un QR code simple
    return QRCode.toDataURL(text, { width, margin, color });
  }
}
