/**
 * Analytics utilities for Vercel Analytics
 * Centralized event tracking system for SelfCamp
 */

import { track } from "@vercel/analytics";

/**
 * Event names - centralized for consistency
 */
export const AnalyticsEvents = {
  // Homepage events
  HOMEPAGE_CTA_ABOUT_CLICKED: "homepage_cta_about_clicked",
  HOMEPAGE_SEARCH_USED: "homepage_search_used",
  HOMEPAGE_MAP_LINK_CLICKED: "homepage_map_link_clicked",
  HOMEPAGE_CONTACT_CLICKED: "homepage_contact_clicked",

  // Map page events
  MAP_ESTABLISHMENT_SELECTED: "map_establishment_selected",
  MAP_SEARCH_PERFORMED: "map_search_performed",
  MAP_ESTABLISHMENT_HOVERED: "map_establishment_hovered",
  MAP_DIRECTIONS_CLICKED: "map_directions_clicked",
  MAP_FILTER_APPLIED: "map_filter_applied",

  // Establishment page events
  ESTABLISHMENT_VIEWED: "establishment_viewed",
  ESTABLISHMENT_DIRECTIONS_CLICKED: "establishment_directions_clicked",
  ESTABLISHMENT_IMAGE_GALLERY_OPENED: "establishment_image_gallery_opened",
  ESTABLISHMENT_CONTACT_CLICKED: "establishment_contact_clicked",
  ESTABLISHMENT_DOCUMENT_DOWNLOADED: "establishment_document_downloaded",
  ESTABLISHMENT_NEARBY_BUSINESS_CLICKED:
    "establishment_nearby_business_clicked",

  // About page events
  ABOUT_CONTACT_CTA_CLICKED: "about_contact_cta_clicked",
  ABOUT_MAP_CTA_CLICKED: "about_map_cta_clicked",
  ABOUT_SECTION_VIEWED: "about_section_viewed",

  // Contact page events
  CONTACT_FORM_STARTED: "contact_form_started",
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  CONTACT_FORM_ERROR: "contact_form_error",
  CONTACT_PHONE_CLICKED: "contact_phone_clicked",
  CONTACT_EMAIL_CLICKED: "contact_email_clicked",

  // Search events
  SEARCH_INITIATED: "search_initiated",
  SEARCH_COMPLETED: "search_completed",
  SEARCH_NO_RESULTS: "search_no_results",
  SEARCH_SUGGESTION_CLICKED: "search_suggestion_clicked",

  // General engagement events
  FOOTER_SOCIAL_CLICKED: "footer_social_clicked",
  FOOTER_LINK_CLICKED: "footer_link_clicked",
  LOGO_CLICKED: "logo_clicked",

  // Business intelligence events
  AVAILABILITY_CHECKED: "availability_checked",
  PRICING_VIEWED: "pricing_viewed",
  AMENITY_FILTER_USED: "amenity_filter_used",
} as const;

/**
 * Type-safe event tracking wrapper
 */
export const trackEvent = (
  event: (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents],
  properties?: Record<string, string | number | boolean | null>
) => {
  try {
    // Only track in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
    ) {
      track(event, properties);
    } else {
      // Log to console in development
      console.log("📊 Analytics Event:", event, properties);
    }
  } catch (error) {
    console.error("Failed to track analytics event:", error);
  }
};

/**
 * Track homepage events
 */
export const trackHomepage = {
  ctaAboutClicked: () => trackEvent(AnalyticsEvents.HOMEPAGE_CTA_ABOUT_CLICKED),
  searchUsed: (query: string) =>
    trackEvent(AnalyticsEvents.HOMEPAGE_SEARCH_USED, { query }),
  mapLinkClicked: () => trackEvent(AnalyticsEvents.HOMEPAGE_MAP_LINK_CLICKED),
  contactClicked: () => trackEvent(AnalyticsEvents.HOMEPAGE_CONTACT_CLICKED),
};

/**
 * Track map page events
 */
export const trackMap = {
  establishmentSelected: (slug: string, name: string) =>
    trackEvent(AnalyticsEvents.MAP_ESTABLISHMENT_SELECTED, { slug, name }),
  searchPerformed: (query: string, resultsCount: number) =>
    trackEvent(AnalyticsEvents.MAP_SEARCH_PERFORMED, { query, resultsCount }),
  establishmentHovered: (slug: string) =>
    trackEvent(AnalyticsEvents.MAP_ESTABLISHMENT_HOVERED, { slug }),
  directionsClicked: (slug: string, name: string) =>
    trackEvent(AnalyticsEvents.MAP_DIRECTIONS_CLICKED, { slug, name }),
  filterApplied: (filterType: string, filterValue: string) =>
    trackEvent(AnalyticsEvents.MAP_FILTER_APPLIED, { filterType, filterValue }),
};

/**
 * Track establishment page events
 */
export const trackEstablishment = {
  viewed: (slug: string, name: string) =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_VIEWED, { slug, name }),
  directionsClicked: (slug: string, name: string) =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_DIRECTIONS_CLICKED, {
      slug,
      name,
    }),
  imageGalleryOpened: (slug: string, imageIndex: number) =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_IMAGE_GALLERY_OPENED, {
      slug,
      imageIndex,
    }),
  contactClicked: (slug: string, contactType: "email" | "phone" | "website") =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_CONTACT_CLICKED, {
      slug,
      contactType,
    }),
  documentDownloaded: (slug: string, documentName: string) =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_DOCUMENT_DOWNLOADED, {
      slug,
      documentName,
    }),
  nearbyBusinessClicked: (
    slug: string,
    businessName: string,
    businessType: string
  ) =>
    trackEvent(AnalyticsEvents.ESTABLISHMENT_NEARBY_BUSINESS_CLICKED, {
      slug,
      businessName,
      businessType,
    }),
};

/**
 * Track about page events
 */
export const trackAbout = {
  contactCtaClicked: (ctaLocation: string) =>
    trackEvent(AnalyticsEvents.ABOUT_CONTACT_CTA_CLICKED, { ctaLocation }),
  mapCtaClicked: (ctaLocation: string) =>
    trackEvent(AnalyticsEvents.ABOUT_MAP_CTA_CLICKED, { ctaLocation }),
  sectionViewed: (sectionName: string) =>
    trackEvent(AnalyticsEvents.ABOUT_SECTION_VIEWED, { sectionName }),
};

/**
 * Track contact page events
 */
export const trackContact = {
  formStarted: () => trackEvent(AnalyticsEvents.CONTACT_FORM_STARTED),
  formSubmitted: (success: boolean) =>
    trackEvent(AnalyticsEvents.CONTACT_FORM_SUBMITTED, { success }),
  formError: (errorType: string) =>
    trackEvent(AnalyticsEvents.CONTACT_FORM_ERROR, { errorType }),
  phoneClicked: () => trackEvent(AnalyticsEvents.CONTACT_PHONE_CLICKED),
  emailClicked: () => trackEvent(AnalyticsEvents.CONTACT_EMAIL_CLICKED),
};

/**
 * Track search events
 */
export const trackSearch = {
  initiated: (query: string, location: string) =>
    trackEvent(AnalyticsEvents.SEARCH_INITIATED, { query, location }),
  completed: (query: string, resultsCount: number) =>
    trackEvent(AnalyticsEvents.SEARCH_COMPLETED, { query, resultsCount }),
  noResults: (query: string) =>
    trackEvent(AnalyticsEvents.SEARCH_NO_RESULTS, { query }),
  suggestionClicked: (suggestion: string) =>
    trackEvent(AnalyticsEvents.SEARCH_SUGGESTION_CLICKED, { suggestion }),
};

/**
 * Track general engagement events
 */
export const trackEngagement = {
  footerSocialClicked: (platform: string) =>
    trackEvent(AnalyticsEvents.FOOTER_SOCIAL_CLICKED, { platform }),
  footerLinkClicked: (linkText: string, destination: string) =>
    trackEvent(AnalyticsEvents.FOOTER_LINK_CLICKED, { linkText, destination }),
  logoClicked: (currentPage: string) =>
    trackEvent(AnalyticsEvents.LOGO_CLICKED, { currentPage }),
};

/**
 * Track business intelligence events
 */
export const trackBusiness = {
  availabilityChecked: (slug: string, isAvailable: boolean) =>
    trackEvent(AnalyticsEvents.AVAILABILITY_CHECKED, { slug, isAvailable }),
  pricingViewed: (slug: string, price: number) =>
    trackEvent(AnalyticsEvents.PRICING_VIEWED, { slug, price }),
  amenityFilterUsed: (amenity: string) =>
    trackEvent(AnalyticsEvents.AMENITY_FILTER_USED, { amenity }),
};
