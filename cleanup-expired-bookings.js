// Script pour nettoyer les réservations non payées
// Usage: node cleanup-expired-bookings.js

const cleanupExpiredBookings = async () => {
  try {
    console.log("🧹 Début du nettoyage des réservations expirées...");

    // D'abord vérifier quelles réservations sont expirées
    const checkResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cleanup/expired-bookings`
    );
    const checkData = await checkResponse.json();

    console.log(`📊 Trouvé ${checkData.count} réservations expirées`);

    if (checkData.expiredBookings?.length > 0) {
      console.log("📋 Réservations expirées:");
      checkData.expiredBookings.forEach((booking) => {
        console.log(
          `  - ${booking.id}: ${booking.email} (${booking.hotel}/${booking.room}) - Expirée depuis ${booking.expiredMinutes}min`
        );
      });

      // Demander confirmation avant suppression
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question(
        "Voulez-vous supprimer ces réservations expirées ? (y/N): ",
        async (answer) => {
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            console.log("🗑️ Suppression en cours...");

            const cleanupResponse = await fetch(
              `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cleanup/expired-bookings`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${process.env.CLEANUP_API_TOKEN || "cleanup-secret"}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const cleanupData = await cleanupResponse.json();

            if (cleanupData.success) {
              console.log(
                `✅ ${cleanupData.cleanedCount} réservations supprimées avec succès`
              );
            } else {
              console.error(
                "❌ Erreur lors de la suppression:",
                cleanupData.error
              );
            }
          } else {
            console.log("❌ Suppression annulée");
          }

          readline.close();
        }
      );
    } else {
      console.log("✅ Aucune réservation expirée trouvée");
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
};

cleanupExpiredBookings();
