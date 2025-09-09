// Templates par défaut pour Unlayer
export const defaultUnlayerTemplates = {
  // Template général simple
  general: {
    counters: {
      u_column: 1,
      u_row: 1,
      u_content_text: 1,
    },
    body: {
      id: "general-template",
      rows: [
        {
          id: "row-1",
          cells: [1],
          columns: [
            {
              id: "column-1",
              contents: [
                {
                  id: "text-1",
                  type: "text",
                  values: {
                    text: `
                      <p>Bonjour {clientFirstName} {clientLastName},</p>
                      <p>Votre réservation n° {bookingNumber} à {establishmentName} a été confirmée avec succès !</p>
                      
                      <p><strong>Détails de votre réservation :</strong></p>
                      <p>- Chambre : {roomName}<br/>
                      - Arrivée : {checkInDate}<br/>
                      - Départ : {checkOutDate}<br/>
                      - Accès : {accessCode} -</p>
                      
                      <p>Pour toute question, vous pouvez nous contacter :</p>
                      <p>📧 Email : {hotelContactEmail}<br/>
                      📞 Téléphone : {hotelContactPhone}</p>
                      
                      <p>Nous vous remerçions et vous souhaitons un excellent séjour !</p>
                      
                      <p>Cordialement,<br/>
                      L'équipe du {establishmentName}</p>
                      
                      <hr/>
                      
                      <p>Guten Tag {clientFirstName} {clientLastName},</p>
                      <p>Ihre Reservierung im {establishmentName} wurde erfolgreich bestätigt!</p>
                      
                      <p><strong>Details Ihrer Reservierung:</strong></p>
                      <p>- Zimmer: {roomName}<br/>
                      - Ankunft: {checkInDate}<br/>
                      - Abreise: {checkOutDate}<br/>
                      - Zugangscode: {accessCode}</p>
                      
                      <p>Bei Fragen können Sie uns gerne kontaktieren:</p>
                      <p>📧 E-Mail: {hotelContactEmail}<br/>
                      📞 Telefon: {hotelContactPhone}</p>
                      
                      <p>Wir wünschen Ihnen einen angenehmen Aufenthalt!</p>
                      
                      <p>Mit freundlichen Grüßen,<br/>
                      Das Team von {establishmentName}</p>
                    `,
                    containerPadding: "20px",
                    backgroundColor: "#ffffff",
                    textAlign: "left",
                    lineHeight: "1.6",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
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
        backgroundColor: "#ffffff",
        contentWidth: "600px",
        fontFamily: "Arial, sans-serif",
      },
    },
  },

  // Template avec chiens
  withDogs: {
    counters: {
      u_column: 1,
      u_row: 1,
      u_content_text: 1,
    },
    body: {
      id: "with-dogs-template",
      rows: [
        {
          id: "row-1",
          cells: [1],
          columns: [
            {
              id: "column-1",
              contents: [
                {
                  id: "text-1",
                  type: "text",
                  values: {
                    text: `
                      <p>Bonjour {clientFirstName} {clientLastName},</p>
                      <p>Votre réservation n° {bookingNumber} à {establishmentName} a été confirmée avec succès !</p>
                      
                      <p><strong>Détails de votre réservation :</strong></p>
                      <p>- Chambre : {roomName}<br/>
                      - Arrivée : {checkInDate}<br/>
                      - Départ : {checkOutDate}<br/>
                      - Accès : {accessCode} -</p>
                      
                      <p>Pour toute question, vous pouvez nous contacter :</p>
                      <p>📧 Email : {hotelContactEmail}<br/>
                      📞 Téléphone : {hotelContactPhone}</p>
                      
                      <p>Nous vous remerçions et vous souhaitons un excellent séjour !</p>
                      
                      <p>Cordialement,<br/>
                      L'équipe du {establishmentName}</p>
                      
                      <hr/>
                      
                      <p>Guten Tag {clientFirstName} {clientLastName},</p>
                      <p>Ihre Reservierung im {establishmentName} wurde erfolgreich bestätigt!</p>
                      
                      <p><strong>Details Ihrer Reservierung:</strong></p>
                      <p>- Zimmer: {roomName}<br/>
                      - Ankunft: {checkInDate}<br/>
                      - Abreise: {checkOutDate}<br/>
                      - Zugangscode: {accessCode}</p>
                      
                      <p>Bei Fragen können Sie uns gerne kontaktieren:</p>
                      <p>📧 E-Mail: {hotelContactEmail}<br/>
                      📞 Telefon: {hotelContactPhone}</p>
                      
                      <p>Wir wünschen Ihnen einen angenehmen Aufenthalt!</p>
                      
                      <p>Mit freundlichen Grüßen,<br/>
                      Das Team von {establishmentName}</p>
                    `,
                    containerPadding: "20px",
                    backgroundColor: "#ffffff",
                    textAlign: "left",
                    lineHeight: "1.6",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
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
        backgroundColor: "#ffffff",
        contentWidth: "600px",
        fontFamily: "Arial, sans-serif",
      },
    },
  },
};

export type TemplateType = "general" | "withDogs";

export function getDefaultTemplate(type: TemplateType) {
  return defaultUnlayerTemplates[type] || defaultUnlayerTemplates.general;
}
