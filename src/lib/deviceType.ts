export type DeviceType = 'computer' | 'mobile' | 'tv' | 'unknown'
type NavigatorWithUserAgentData = Navigator & { userAgentData?: { platform?: string } }

export const getDeviceType = (): DeviceType => {
  const ua = navigator.userAgent.toLowerCase()
  const userAgentData = (navigator as NavigatorWithUserAgentData).userAgentData
  const platform = userAgentData?.platform?.toLowerCase() || navigator.platform.toLowerCase()
  const hasCoarsePointer = window.matchMedia('(any-pointer: coarse)').matches
  const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches
  const isTouchOnly = hasCoarsePointer && !hasFinePointer
  const isTablet =
    /ipad|tablet|kindle|silk/.test(ua) ||
    (/android/.test(ua) && !/mobi/.test(ua)) ||
    (platform === 'macintel' && navigator.maxTouchPoints > 1) ||
    (/win/.test(platform) && isTouchOnly)

  if (/smart-tv|smarttv|hbbtv|appletv|google tv|googletv|tizen|webos|netcast|viera|aquos|bravia|roku|aftt|aftm|fire tv/.test(ua)) {
    return 'tv'
  }

  if (isTablet || /mobi|iphone|ipod|android/.test(ua)) {
    return 'mobile'
  }

  if (/win|mac|linux|cros|x11/.test(platform) && !isTouchOnly) {
    return 'computer'
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !hasCoarsePointer) {
    return 'computer'
  }

  return 'unknown'
}
