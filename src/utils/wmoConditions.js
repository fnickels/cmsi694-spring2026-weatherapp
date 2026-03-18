/**
 * WMO Weather Interpretation Codes
 * Maps WMO codes to human-readable labels and icon identifiers
 * Based on: https://open-meteo.com/en/docs
 */

const WMO_CODES = {
  // Clear sky
  0: { label: 'Clear Sky', icon: 'clear-day' },
  1: { label: 'Mainly Clear', icon: 'mostly-clear-day' },
  2: { label: 'Partly Cloudy', icon: 'partly-cloudy-day' },
  3: { label: 'Overcast', icon: 'overcast' },
  
  // Depositing rime or rime fog
  45: { label: 'Foggy', icon: 'fog' },
  48: { label: 'Frosty', icon: 'fog' },
  
  // Drizzle
  51: { label: 'Light Drizzle', icon: 'drizzle' },
  53: { label: 'Moderate Drizzle', icon: 'drizzle' },
  55: { label: 'Dense Drizzle', icon: 'drizzle' },
  
  // Freezing Drizzle
  56: { label: 'Light Freezing Drizzle', icon: 'sleet' },
  57: { label: 'Dense Freezing Drizzle', icon: 'sleet' },
  
  // Rain
  61: { label: 'Slight Rain', icon: 'rain' },
  63: { label: 'Moderate Rain', icon: 'rain' },
  65: { label: 'Heavy Rain', icon: 'rain' },

  // Snow fall
  71: { label: 'Slight Snowfall', icon: 'snow' },
  73: { label: 'Moderate Snowfall', icon: 'snow' },
  75: { label: 'Heavy Snowfall', icon: 'snow' },
  77: { label: 'Snow Grains', icon: 'snow' },
  
  // Freezing Rain
  66: { label: 'Light Freezing Rain', icon: 'sleet' },
  67: { label: 'Heavy Freezing Rain', icon: 'sleet' },
  
  // Rain or snow showers
  80: { label: 'Slight Shower', icon: 'rain' },
  81: { label: 'Moderate Shower', icon: 'rain' },
  82: { label: 'Violent Shower', icon: 'rain' },
  
  // Snow showers
  85: { label: 'Light Snow Showers', icon: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'snow' },
  
  // Thunderstorm
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail', icon: 'thunderstorm' },
  99: { label: 'Thunderstorm with Snow', icon: 'thunderstorm' },
}

/**
 * Get WMO condition information (label and icon) for a given code
 * @param {number} code - WMO weather code
 * @returns {{label: string, icon: string}} Object with label and icon ID
 */
export function getWmoInfo(code) {
  if (code in WMO_CODES) {
    return WMO_CODES[code]
  }
  // Fallback for unknown codes
  return {
    label: 'Unknown',
    icon: 'unknown'
  }
}

/**
 * Get all WMO codes that are supported
 * @returns {number[]} Array of supported WMO codes
 */
export function getSupportedWmoCodes() {
  return Object.keys(WMO_CODES).map(Number)
}
