/**
 * Device detection utilities for mobile/desktop differentiation
 */

/**
 * Detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile'
  ];
  
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check screen size (mobile typically < 768px width)
  const isMobileScreen = window.innerWidth < 768;
  
  // Check touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Consider it mobile if UA suggests mobile OR (small screen AND touch support)
  return isMobileUA || (isMobileScreen && hasTouch);
}

/**
 * Detect if the user is on a tablet device
 */
export function isTabletDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTabletUA = userAgent.includes('ipad') || 
                     (userAgent.includes('android') && !userAgent.includes('mobile'));
  
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return isTabletUA || isTabletScreen;
}

/**
 * Get device type as a string
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobileDevice() && !isTabletDevice()) {
    return 'mobile';
  }
  if (isTabletDevice()) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Check if user came from a scanned QR code (has packet in URL)
 */
export function isScannedRoute(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('packet');
}
