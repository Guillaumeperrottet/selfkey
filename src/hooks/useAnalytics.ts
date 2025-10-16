import * as analytics from "@/lib/analytics";

/**
 * Custom hook for easy access to analytics tracking functions
 * Provides a clean API for tracking events throughout the application
 *
 * @example
 * const { trackHomepage, trackMap } = useAnalytics();
 * trackHomepage.ctaAboutClicked();
 */
export function useAnalytics() {
  return {
    // Homepage tracking
    trackHomepage: analytics.trackHomepage,

    // Map page tracking
    trackMap: analytics.trackMap,

    // Establishment page tracking
    trackEstablishment: analytics.trackEstablishment,

    // About page tracking
    trackAbout: analytics.trackAbout,

    // Contact page tracking
    trackContact: analytics.trackContact,

    // Search tracking
    trackSearch: analytics.trackSearch,

    // General engagement tracking
    trackEngagement: analytics.trackEngagement,

    // Business intelligence tracking
    trackBusiness: analytics.trackBusiness,

    // Direct access to raw track function if needed
    trackEvent: analytics.trackEvent,

    // Event names for reference
    events: analytics.AnalyticsEvents,
  };
}
