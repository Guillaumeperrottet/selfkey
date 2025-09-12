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
  quality?: "low" | "medium" | "high" | "print"; // Nouveau paramètre de qualité
  scale?: number; // Facteur de mise à l'échelle pour la haute définition
  transparent?: boolean; // Option pour fond transparent
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
    logoSize = width * 0.2,
    borderRadius = 16,
    quality = "medium",
    scale = quality === "print" ? 4 : quality === "high" ? 2 : 1, // Facteur de mise à l'échelle basé sur la qualité
    transparent = false,
  } = options;

  // Calculer les dimensions finales
  const finalWidth = width * scale;
  const finalLogoSize = logoSize * scale;
  const finalBorderRadius = borderRadius * scale;

  // Ajuster la couleur de fond si transparent
  const backgroundColorOptions = transparent
    ? { dark: color.dark || "#000000", light: "#00000000" }
    : color;

  try {
    // Générer le QR code de base avec une résolution plus élevée
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: finalWidth,
      margin,
      color: backgroundColorOptions,
      errorCorrectionLevel:
        quality === "print" ? "H" : quality === "high" ? "M" : "L", // Correction d'erreur adaptative
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

    canvas.width = finalWidth;
    canvas.height = finalWidth;

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

    // Créer un chemin avec des angles arrondis (utiliser les dimensions finales)
    const radius = finalBorderRadius;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(finalWidth - radius, 0);
    ctx.quadraticCurveTo(finalWidth, 0, finalWidth, radius);
    ctx.lineTo(finalWidth, finalWidth - radius);
    ctx.quadraticCurveTo(
      finalWidth,
      finalWidth,
      finalWidth - radius,
      finalWidth
    );
    ctx.lineTo(radius, finalWidth);
    ctx.quadraticCurveTo(0, finalWidth, 0, finalWidth - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    // Utiliser le chemin comme masque
    ctx.clip();

    // Dessiner le QR code avec la haute résolution
    ctx.drawImage(qrImage, 0, 0, finalWidth, finalWidth);

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

      // Calculer la position du logo au centre (avec les dimensions finales)
      const logoX = (finalWidth - finalLogoSize) / 2;
      const logoY = (finalWidth - finalLogoSize) / 2;

      // Dessiner un fond blanc avec des angles arrondis pour le logo (adapté à la résolution)
      // SEULEMENT si ce n'est pas une version transparente
      if (!transparent) {
        const logoRadius = 8 * scale;
        const logoPadding = 4 * scale;
        const logoBackgroundSize = finalLogoSize + logoPadding * 2;
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
      }

      // Dessiner le logo avec des angles arrondis (utiliser les dimensions finales)
      if (logoImage.complete && logoImage.naturalWidth > 0) {
        const logoRadius = 8 * scale;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(logoX + logoRadius, logoY);
        ctx.lineTo(logoX + finalLogoSize - logoRadius, logoY);
        ctx.quadraticCurveTo(
          logoX + finalLogoSize,
          logoY,
          logoX + finalLogoSize,
          logoY + logoRadius
        );
        ctx.lineTo(logoX + finalLogoSize, logoY + finalLogoSize - logoRadius);
        ctx.quadraticCurveTo(
          logoX + finalLogoSize,
          logoY + finalLogoSize,
          logoX + finalLogoSize - logoRadius,
          logoY + finalLogoSize
        );
        ctx.lineTo(logoX + logoRadius, logoY + finalLogoSize);
        ctx.quadraticCurveTo(
          logoX,
          logoY + finalLogoSize,
          logoX,
          logoY + finalLogoSize - logoRadius
        );
        ctx.lineTo(logoX, logoY + logoRadius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + logoRadius, logoY);
        ctx.closePath();
        ctx.clip();

        // Dessiner le logo avec la taille finale haute résolution
        ctx.drawImage(logoImage, logoX, logoY, finalLogoSize, finalLogoSize);
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
    return QRCode.toDataURL(text, { width: finalWidth, margin, color });
  }
}

// Fonction helper pour générer un QR code haute qualité pour téléchargement
export async function generateHighQualityQRCode(
  text: string,
  options: Omit<QRCodeWithLogoOptions, "quality"> = {}
): Promise<string> {
  return generateQRCodeWithLogo(text, { ...options, quality: "print" });
}

// Fonction helper pour télécharger un QR code
export function downloadQRCode(
  dataUrl: string,
  filename: string = "qr-code.png"
) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
