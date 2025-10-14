const fs = require('fs');
const path = require('path');

// Mapping des anciens chemins vers les nouveaux
const importMapping = {
  // Booking components
  '@/components/BookingFormModern': '@/components/booking/BookingFormModern',
  '@/components/BookingCart': '@/components/booking/BookingCart',
  '@/components/CompactBookingCart': '@/components/booking/CompactBookingCart',
  '@/components/BookingSteps': '@/components/booking/BookingSteps',
  '@/components/BookingSummary': '@/components/booking/BookingSummary',
  '@/components/DateSelector': '@/components/booking/DateSelector',
  '@/components/RoomSelector': '@/components/booking/RoomSelector',
  '@/components/BookingsTable': '@/components/booking/BookingsTable',
  
  // Payment components
  '@/components/PaymentForm': '@/components/payment/PaymentForm',
  '@/components/PaymentFormMultiple': '@/components/payment/PaymentFormMultiple',
  '@/components/DayParkingPaymentForm': '@/components/payment/DayParkingPaymentForm',
  '@/components/ClassicBookingPaymentForm': '@/components/payment/ClassicBookingPaymentForm',
  
  // Admin Dashboard
  '@/components/AdminDashboard': '@/components/admin/dashboard/AdminDashboard',
  '@/components/DashboardCharts': '@/components/admin/dashboard/DashboardCharts',
  '@/components/CommissionsDashboard': '@/components/admin/dashboard/CommissionsDashboard',
  '@/components/CommissionsTable': '@/components/admin/dashboard/CommissionsTable',
  '@/components/TouristTaxDashboard': '@/components/admin/dashboard/TouristTaxDashboard',
  '@/components/DashboardPublicAccess': '@/components/admin/dashboard/DashboardPublicAccess',
  '@/components/ExcelExportManager': '@/components/admin/dashboard/ExcelExportManager',
  
  // Admin Settings
  '@/components/SettingsManager': '@/components/admin/settings/SettingsManager',
  '@/components/AccessCodeManager': '@/components/admin/settings/AccessCodeManager',
  '@/components/RoomManagement': '@/components/admin/settings/RoomManagement',
  '@/components/PricingOptionsManager': '@/components/admin/settings/PricingOptionsManager',
  '@/components/PricingOptionsSelector': '@/components/admin/settings/PricingOptionsSelector',
  '@/components/ConfirmationManager': '@/components/admin/settings/ConfirmationManager',
  '@/components/TutorialManager': '@/components/admin/settings/TutorialManager',
  
  // Admin Email
  '@/components/EmailEditor': '@/components/admin/email/EmailEditor',
  '@/components/DayParkingEmailManager': '@/components/admin/email/DayParkingEmailManager',
  
  // Admin Integrations
  '@/components/IntegrationManager': '@/components/admin/integrations/IntegrationManager',
  '@/components/IntegrationConfigurator': '@/components/admin/integrations/IntegrationConfigurator',
  '@/components/StripeOnboarding': '@/components/admin/integrations/StripeOnboarding',
  '@/components/StripeDashboard': '@/components/admin/integrations/StripeDashboard',
  '@/components/EmbeddedStripeDashboard': '@/components/admin/integrations/EmbeddedStripeDashboard',
  
  // Admin Sidebar
  '@/components/AdminSidebar': '@/components/admin/AdminSidebar',
  
  // Super Admin
  '@/components/SuperAdminLayout': '@/components/super-admin/SuperAdminLayout',
  '@/components/SuperAdminUsers': '@/components/super-admin/SuperAdminUsers',
  '@/components/SuperAdminEstablishments': '@/components/super-admin/SuperAdminEstablishments',
  '@/components/SuperAdminCommissions': '@/components/super-admin/SuperAdminCommissions',
  '@/components/SuperAdminCommissionsNew': '@/components/super-admin/SuperAdminCommissionsNew',
  '@/components/SuperAdminDayParkingCommissions': '@/components/super-admin/SuperAdminDayParkingCommissions',
  '@/components/SuperAdminTouristTax': '@/components/super-admin/SuperAdminTouristTax',
  '@/components/EditCommissionModal': '@/components/super-admin/EditCommissionModal',
  
  // Parking
  '@/components/DayParkingForm': '@/components/parking/DayParkingForm',
  '@/components/DayParkingManager': '@/components/parking/DayParkingManager',
  '@/components/DayParkingControlTable': '@/components/parking/DayParkingControlTable',
  '@/components/DayParkingDurationSelector': '@/components/parking/DayParkingDurationSelector',
  '@/components/ParkingControlAccess': '@/components/parking/ParkingControlAccess',
  '@/components/DayParkingSetupModal': '@/components/parking/DayParkingSetupModal',
  '@/components/ParkingTypeSelector': '@/components/parking/ParkingTypeSelector',
  
  // Invoice
  '@/components/InvoiceDownload': '@/components/invoice/InvoiceDownload',
  '@/components/InvoicePDF': '@/components/invoice/InvoicePDF',
  '@/components/SendInvoiceLink': '@/components/invoice/SendInvoiceLink',
  
  // Confirmation
  '@/components/ConfirmationChoice': '@/components/confirmation/ConfirmationChoice',
  '@/components/ConfirmationDetails': '@/components/confirmation/ConfirmationDetails',
  '@/components/AutoEmailConfirmation': '@/components/confirmation/AutoEmailConfirmation',
  
  // Public Pages
  '@/components/selfcamp-homepage': '@/components/public-pages/selfcamp-homepage',
  '@/components/selfkey-homepage': '@/components/public-pages/selfkey-homepage',
  '@/components/selfcamp-about-page': '@/components/public-pages/selfcamp-about-page',
  '@/components/selfcamp-footer': '@/components/public-pages/selfcamp-footer',
  '@/components/selfkey-footer': '@/components/public-pages/selfkey-footer',
  '@/components/HotelLanding': '@/components/public-pages/HotelLanding',
  '@/components/ClosedPage': '@/components/public-pages/ClosedPage',
  
  // Shared
  '@/components/LanguageSelector': '@/components/shared/LanguageSelector',
  '@/components/ImageUploader': '@/components/shared/ImageUploader',
  '@/components/QRCodeGenerator': '@/components/shared/QRCodeGenerator',
  '@/components/QRCodePreview': '@/components/shared/QRCodePreview',
  '@/components/QRCodeWithLogo': '@/components/shared/QRCodeWithLogo',
  '@/components/FeeBreakdown': '@/components/shared/FeeBreakdown',
  '@/components/TutorialGuide': '@/components/shared/TutorialGuide',
  '@/components/TutorialMenu': '@/components/shared/TutorialMenu',
  '@/components/domain-router': '@/components/shared/domain-router',
  '@/components/structured-data': '@/components/shared/structured-data',
  '@/components/availability-display': '@/components/shared/availability-display',
  '@/components/ChartColorSelector': '@/components/shared/ChartColorSelector',
  '@/components/EstablishmentTransfer': '@/components/shared/EstablishmentTransfer',
  '@/components/EstablishmentTransferHistory': '@/components/shared/EstablishmentTransferHistory',
  '@/components/DebugButtons': '@/components/shared/DebugButtons',
  
  // Forms
  '@/components/BookingFormDetails': '@/components/forms/BookingFormDetails',
  '@/components/CheckinForm': '@/components/forms/CheckinForm',
  '@/components/FormCustomizer': '@/components/forms/FormCustomizer',
};

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pour chaque mapping, remplacer les imports
    for (const [oldPath, newPath] of Object.entries(importMapping)) {
      // Regex pour matcher différents formats d'import
      const patterns = [
        // import { Component } from "oldPath"
        new RegExp(`from ["']${oldPath.replace(/\//g, '\\/')}["']`, 'g'),
        // import Component from "oldPath"
        new RegExp(`from ["']${oldPath.replace(/\//g, '\\/')}["']`, 'g'),
        // require("oldPath")
        new RegExp(`require\\(["']${oldPath.replace(/\//g, '\\/')}["']\\)`, 'g'),
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match) => {
            modified = true;
            return match.replace(oldPath, newPath);
          });
        }
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log('🔍 Scanning for files to update...\n');

const srcDir = path.join(__dirname, 'src');
const files = walkDirectory(srcDir);

console.log(`📁 Found ${files.length} TypeScript/JavaScript files\n`);
console.log('🔄 Updating imports...\n');

let updatedCount = 0;
files.forEach(file => {
  if (updateImportsInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Done! Updated ${updatedCount} files.`);
console.log('\n💡 Next steps:');
console.log('1. Run: npm run dev (or your build command)');
console.log('2. Check for any TypeScript errors');
console.log('3. Test the application');
console.log('4. If everything works: git add . && git commit -m "refactor: reorganize components structure"');
