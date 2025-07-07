import { useCallback } from "react";

interface UsePrintOptions {
  title?: string;
  styles?: string;
  removeAfterPrint?: boolean;
}

export const usePrint = () => {
  const print = useCallback(
    (element: HTMLElement | string, options: UsePrintOptions = {}) => {
      const {
        title = "Impression",
        styles = "",
        removeAfterPrint = true,
      } = options;

      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        console.error("Impossible d'ouvrir la fenêtre d'impression");
        return;
      }

      // Obtenir le contenu à imprimer
      const content = typeof element === "string" ? element : element.outerHTML;

      // Styles CSS pour l'impression
      const printStyles = `
      <style>
        /* Reset et styles de base */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          line-height: 1.2;
          color: #000;
          background: white;
          padding: 15px;
          margin: 0;
        }
        
        /* Styles pour les tableaux */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        /* Styles pour les cartes */
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          background: white;
        }
        
        .card-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        
        .card-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        /* Styles pour les badges */
        .badge {
          display: inline-block;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: bold;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        /* Styles pour les icônes - les cacher à l'impression */
        .lucide, svg {
          display: none;
        }
        
        /* Styles pour les boutons - les cacher à l'impression */
        button {
          display: none;
        }
        
        /* Styles pour les éléments à ne pas imprimer */
        .no-print {
          display: none !important;
        }
        
        /* Styles pour les titres */
        h1, h2, h3 {
          margin-bottom: 12px;
          color: #000;
        }
        
        h1 {
          font-size: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }
        
        h2 {
          font-size: 16px;
        }
        
        h3 {
          font-size: 14px;
        }
        
        /* Styles pour les listes */
        ul, ol {
          margin-left: 20px;
          margin-bottom: 12px;
        }
        
        /* Styles pour les séparateurs */
        .separator {
          border-top: 1px solid #ddd;
          margin: 16px 0;
        }
        
        /* Styles pour les grilles */
        .grid {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        /* Styles pour flexbox */
        .flex {
          display: flex;
          gap: 8px;
        }
        
        .flex-col {
          flex-direction: column;
        }
        
        .items-center {
          align-items: center;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        /* Styles pour les espacements */
        .space-y-2 > * + * {
          margin-top: 8px;
        }
        
        .space-y-4 > * + * {
          margin-top: 16px;
        }
        
        /* Styles pour les couleurs de fond */
        .bg-muted {
          background-color: #f8f9fa;
        }
        
        /* Styles pour les textes */
        .text-sm {
          font-size: 11px;
        }
        
        .text-lg {
          font-size: 14px;
        }
        
        .font-medium {
          font-weight: 500;
        }
        
        .font-semibold {
          font-weight: 600;
        }
        
        .text-muted-foreground {
          color: #666;
        }
        
        /* Styles pour optimiser l'impression sur une page */
        @media print {
          body {
            padding: 10px !important;
            font-size: 10px !important;
          }
          
          .booking-details {
            font-size: 10px;
          }
          
          .booking-info .card {
            padding: 8px;
            margin-bottom: 8px;
          }
          
          .booking-info .card-header {
            margin-bottom: 6px;
            padding-bottom: 3px;
          }
          
          .booking-info .card-header h2 {
            font-size: 12px;
          }
          
          .booking-info .grid {
            gap: 3px;
          }
          
          .booking-info .flex {
            padding: 1px 0;
          }
          
          .print-header {
            margin-bottom: 12px;
            padding-bottom: 8px;
          }
          
          .print-header h1 {
            font-size: 16px !important;
            margin-bottom: 3px;
          }
          
          .print-header p {
            font-size: 9px !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
        }
        
        /* Styles personnalisés */
        ${styles}
        
        /* Styles pour l'impression */
        @media print {
          body {
            padding: 0;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
        }
        
        /* Styles spécifiques pour les détails de réservation - Optimisé pour 1 page */
        .booking-details {
          max-width: 100%;
          margin: 0;
          font-size: 11px;
          line-height: 1.3;
        }
        
        .booking-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        
        .booking-info .card {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          background: #f9f9f9;
          page-break-inside: avoid;
        }
        
        .booking-info .card-header {
          border-bottom: 1px solid #ddd;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        
        .booking-info .card-header h2 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
        }
        
        .booking-info .grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .booking-info .flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 0;
        }
        
        .booking-info .font-medium {
          font-weight: 500;
        }
        
        .booking-info .font-semibold {
          font-weight: 600;
        }
        
        .booking-info .text-lg {
          font-size: 13px;
        }
        
        .booking-info .badge {
          background: #e5e7eb;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
        }
        
        /* Styles pour l'en-tête d'impression - Plus compact */
        .print-header {
          text-align: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #000;
        }
        
        .print-header h1 {
          font-size: 18px;
          margin-bottom: 4px;
          border: none;
          padding: 0;
        }
        
        .print-header p {
          font-size: 10px;
          color: #666;
          margin: 0;
        }
      </style>
    `;

      // Construire le HTML complet
      const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-container">
            ${content}
          </div>
        </body>
      </html>
    `;

      // Écrire le contenu dans la fenêtre d'impression
      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          if (removeAfterPrint) {
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }
        }, 100);
      };
    },
    []
  );

  const printTable = useCallback(
    <T extends Record<string, unknown>>(
      data: T[],
      columns: {
        key: keyof T;
        label: string;
        render?: (value: T[keyof T], row: T) => string;
      }[],
      title: string = "Tableau"
    ) => {
      const tableHTML = `
      <div class="print-header">
        <h1>${title}</h1>
        <p>Généré le ${new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${columns
                .map(
                  (col) => `
                <td>${col.render ? col.render(row[col.key], row) : row[col.key] || ""}</td>
              `
                )
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="print-footer">
        <p>Total : ${data.length} entrée${data.length !== 1 ? "s" : ""}</p>
      </div>
    `;

      print(tableHTML, { title });
    },
    [print]
  );

  return { print, printTable };
};
