// Templates par défaut pour Unlayer basés sur HTML professionnel
export const defaultUnlayerTemplates = {
  // Template général optimisé pour emails
  general: {
    counters: {
      u_column: 3,
      u_row: 4,
      u_content_text: 4,
      u_content_image: 2,
      u_content_heading: 1,
    },
    body: {
      id: "general-template-pro",
      rows: [
        // Header avec logo
        {
          id: "header-row",
          cells: [1],
          columns: [
            {
              id: "header-column",
              contents: [
                {
                  id: "logo-image",
                  type: "image",
                  values: {
                    src: {
                      url: "/logo.png",
                      width: 200,
                      height: 60,
                    },
                    alt: "Logo",
                    action: {
                      name: "web",
                      values: {
                        href: "",
                        target: "_blank",
                      },
                    },
                    containerPadding: "20px",
                    align: "center",
                  },
                },
              ],
              values: {
                backgroundColor: "#3554c1",
                padding: "20px 0px",
              },
            },
          ],
          values: {
            backgroundColor: "#3554c1",
            padding: "0px",
          },
        },
        // Contenu principal
        {
          id: "main-content-row",
          cells: [1],
          columns: [
            {
              id: "main-content-column",
              contents: [
                {
                  id: "greeting-heading",
                  type: "heading",
                  values: {
                    text: "Confirmation de réservation",
                    headingType: "h1",
                    fontSize: "28px",
                    fontWeight: "700",
                    textAlign: "center",
                    color: "#3554c1",
                    containerPadding: "40px 20px 20px",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
                {
                  id: "main-text",
                  type: "text",
                  values: {
                    text: `
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Bonjour {clientFirstName} {clientLastName},
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Votre réservation n° <strong>{bookingNumber}</strong> à <strong>{establishmentName}</strong> a été confirmée avec succès !
                      </p>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3554c1; margin-top: 0; margin-bottom: 15px;">📋 Détails de votre réservation</h3>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Place :</strong> {roomName}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Arrivée :</strong> {checkInDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Départ :</strong> {checkOutDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Code d'accès :</strong> <span style="background: #3554c1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{accessCode}</span></p>
                      </div>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3554c1; margin-top: 0; margin-bottom: 15px;">📞 Contact</h3>
                        <p style="margin: 8px 0; font-size: 15px;">📧 <strong>Email :</strong> {hotelContactEmail}</p>
                        <p style="margin: 8px 0; font-size: 15px;">� <strong>Téléphone :</strong> {hotelContactPhone}</p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
                        Nous vous remercions pour votre confiance et vous souhaitons un excellent séjour !
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Cordialement,<br/>
                        <strong>L'équipe de {establishmentName}</strong>
                      </p>
                    `,
                    containerPadding: "20px 30px",
                    textAlign: "left",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
        // Séparateur
        {
          id: "separator-row",
          cells: [1],
          columns: [
            {
              id: "separator-column",
              contents: [
                {
                  id: "separator-divider",
                  type: "divider",
                  values: {
                    width: "80%",
                    borderTopWidth: "2px",
                    borderTopStyle: "solid",
                    borderTopColor: "#e9ecef",
                    containerPadding: "20px 30px",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
        // Version allemande
        {
          id: "german-content-row",
          cells: [1],
          columns: [
            {
              id: "german-content-column",
              contents: [
                {
                  id: "german-text",
                  type: "text",
                  values: {
                    text: `
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Guten Tag {clientFirstName} {clientLastName},
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Ihre Reservierung Nr. <strong>{bookingNumber}</strong> im <strong>{establishmentName}</strong> wurde erfolgreich bestätigt!
                      </p>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3554c1; margin-top: 0; margin-bottom: 15px;">📋 Details Ihrer Reservierung</h3>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Platz :</strong> {roomName}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Ankunft :</strong> {checkInDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Abreise :</strong> {checkOutDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Zugangscode :</strong> <span style="background: #3554c1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{accessCode}</span></p>
                      </div>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3554c1; margin-top: 0; margin-bottom: 15px;">📞 Kontakt</h3>
                        <p style="margin: 8px 0; font-size: 15px;">📧 <strong>E-Mail :</strong> {hotelContactEmail}</p>
                        <p style="margin: 8px 0; font-size: 15px;">� <strong>Telefon :</strong> {hotelContactPhone}</p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
                        Wir danken Ihnen für Ihr Vertrauen und wünschen Ihnen einen angenehmen Aufenthalt!
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Mit freundlichen Grüßen,<br/>
                        <strong>Das Team von {establishmentName}</strong>
                      </p>
                    `,
                    containerPadding: "20px 30px 40px",
                    textAlign: "left",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
      ],
      headers: [],
      footers: [],
      values: {
        backgroundColor: "#ecf0f1",
        contentWidth: "600px",
        fontFamily: "Montserrat, sans-serif",
        contentAlign: "center",
      },
    },
  },

  // Template avec chiens - version professionnelle
  withDogs: {
    counters: {
      u_column: 4,
      u_row: 5,
      u_content_text: 5,
      u_content_image: 3,
      u_content_heading: 1,
    },
    body: {
      id: "with-dogs-template-pro",
      rows: [
        // Header avec logo
        {
          id: "header-row-dogs",
          cells: [1],
          columns: [
            {
              id: "header-column-dogs",
              contents: [
                {
                  id: "logo-image-dogs",
                  type: "image",
                  values: {
                    src: {
                      url: "/logo.png",
                      width: 200,
                      height: 60,
                    },
                    alt: "Logo",
                    action: {
                      name: "web",
                      values: {
                        href: "",
                        target: "_blank",
                      },
                    },
                    containerPadding: "20px",
                    align: "center",
                  },
                },
              ],
              values: {
                backgroundColor: "#2d7d32",
                padding: "20px 0px",
              },
            },
          ],
          values: {
            backgroundColor: "#2d7d32",
            padding: "0px",
          },
        },
        // Badge "Accepte les chiens"
        {
          id: "dog-badge-row",
          cells: [1],
          columns: [
            {
              id: "dog-badge-column",
              contents: [
                {
                  id: "dog-badge",
                  type: "text",
                  values: {
                    text: `
                      <div style="background: linear-gradient(135deg, #4caf50, #2d7d32); padding: 15px; text-align: center; margin: 0;">
                        <span style="color: white; font-size: 18px; font-weight: bold;">🐕 EMPLACEMENT ACCEPTANT LES CHIENS 🐕</span>
                      </div>
                    `,
                    containerPadding: "0px",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
        // Contenu principal
        {
          id: "main-content-row-dogs",
          cells: [1],
          columns: [
            {
              id: "main-content-column-dogs",
              contents: [
                {
                  id: "greeting-heading-dogs",
                  type: "heading",
                  values: {
                    text: "Confirmation de réservation",
                    headingType: "h1",
                    fontSize: "28px",
                    fontWeight: "700",
                    textAlign: "center",
                    color: "#2d7d32",
                    containerPadding: "30px 20px 20px",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
                {
                  id: "main-text-dogs",
                  type: "text",
                  values: {
                    text: `
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Bonjour {clientFirstName} {clientLastName},
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Votre réservation n° <strong>{bookingNumber}</strong> à <strong>{establishmentName}</strong> a été confirmée avec succès !
                      </p>
                      
                      <div style="background-color: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                        <h3 style="color: #2d7d32; margin-top: 0; margin-bottom: 15px;">📋 Détails de votre réservation</h3>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Place :</strong> {roomName}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Arrivée :</strong> {checkInDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Départ :</strong> {checkOutDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Code d'accès :</strong> <span style="background: #2d7d32; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{accessCode}</span></p>
                      </div>
                      
                      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                        <h3 style="color: #f57c00; margin-top: 0; margin-bottom: 15px;">🐕 Informations importantes pour votre chien</h3>
                        <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                          <li style="margin: 8px 0;">Veuillez tenir votre chien en laisse dans les zones communes</li>
                          <li style="margin: 8px 0;">Des sacs à déjections sont disponibles à l'accueil</li>
                          <li style="margin: 8px 0;">Merci de respecter les autres clients</li>
                        </ul>
                      </div>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2d7d32; margin-top: 0; margin-bottom: 15px;">📞 Contact</h3>
                        <p style="margin: 8px 0; font-size: 15px;">📧 <strong>Email :</strong> {hotelContactEmail}</p>
                        <p style="margin: 8px 0; font-size: 15px;">� <strong>Téléphone :</strong> {hotelContactPhone}</p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
                        Nous vous remercrons pour votre confiance et vous souhaitons un excellent séjour avec votre compagnon à quatre pattes !
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Cordialement,<br/>
                        <strong>L'équipe de {establishmentName}</strong>
                      </p>
                    `,
                    containerPadding: "20px 30px",
                    textAlign: "left",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
        // Séparateur
        {
          id: "separator-row-dogs",
          cells: [1],
          columns: [
            {
              id: "separator-column-dogs",
              contents: [
                {
                  id: "separator-divider-dogs",
                  type: "divider",
                  values: {
                    width: "80%",
                    borderTopWidth: "2px",
                    borderTopStyle: "solid",
                    borderTopColor: "#e9ecef",
                    containerPadding: "20px 30px",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
        // Version allemande
        {
          id: "german-content-row-dogs",
          cells: [1],
          columns: [
            {
              id: "german-content-column-dogs",
              contents: [
                {
                  id: "german-text-dogs",
                  type: "text",
                  values: {
                    text: `
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Guten Tag {clientFirstName} {clientLastName},
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                        Ihre Reservierung Nr. <strong>{bookingNumber}</strong> im <strong>{establishmentName}</strong> wurde erfolgreich bestätigt!
                      </p>
                      
                      <div style="background-color: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                        <h3 style="color: #2d7d32; margin-top: 0; margin-bottom: 15px;">📋 Details Ihrer Reservierung</h3>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Platz :</strong> {roomName}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Ankunft :</strong> {checkInDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Abreise :</strong> {checkOutDate}</p>
                        <p style="margin: 8px 0; font-size: 15px;"><strong>Zugangscode :</strong> <span style="background: #2d7d32; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{accessCode}</span></p>
                      </div>
                      
                      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                        <h3 style="color: #f57c00; margin-top: 0; margin-bottom: 15px;">🐕 Wichtige Informationen für Ihren Hund</h3>
                        <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                          <li style="margin: 8px 0;">Bitte halten Sie Ihren Hund in den Gemeinschaftsbereichen an der Leine</li>
                          <li style="margin: 8px 0;">Kotbeutel sind an der Rezeption erhältlich</li>
                          <li style="margin: 8px 0;">Bitte respektieren Sie die anderen Gäste</li>
                        </ul>
                      </div>
                      
                      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2d7d32; margin-top: 0; margin-bottom: 15px;">📞 Kontakt</h3>
                        <p style="margin: 8px 0; font-size: 15px;">📧 <strong>E-Mail :</strong> {hotelContactEmail}</p>
                        <p style="margin: 8px 0; font-size: 15px;">� <strong>Telefon :</strong> {hotelContactPhone}</p>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 20px 0;">
                        Wir danken Ihnen für Ihr Vertrauen und wünschen Ihnen einen angenehmen Aufenthalt mit Ihrem Vierbeiner!
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Mit freundlichen Grüßen,<br/>
                        <strong>Das Team von {establishmentName}</strong>
                      </p>
                    `,
                    containerPadding: "20px 30px 40px",
                    textAlign: "left",
                    fontFamily: "Montserrat, sans-serif",
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
            padding: "0px",
          },
        },
      ],
      headers: [],
      footers: [],
      values: {
        backgroundColor: "#ecf0f1",
        contentWidth: "600px",
        fontFamily: "Montserrat, sans-serif",
        contentAlign: "center",
      },
    },
  },
};

export type TemplateType = "general" | "withDogs";

export function getDefaultTemplate(type: TemplateType) {
  return defaultUnlayerTemplates[type] || defaultUnlayerTemplates.general;
}
