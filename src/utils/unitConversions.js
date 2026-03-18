/**
 * Unit Conversion Functions
 * Handles conversions between imperial and metric units
 */

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9
}

/**
 * Convert kilometers per hour to miles per hour
 * @param {number} kmh - Speed in km/h
 * @returns {number} Speed in mph
 */
export function kmhToMph(kmh) {
  return kmh * 0.621371
}

/**
 * Convert miles per hour to kilometers per hour
 * @param {number} mph - Speed in mph
 * @returns {number} Speed in km/h
 */
export function mphToKmh(mph) {
  return mph * 1.60934
}

/**
 * Convert metres to miles
 * @param {number} metres - Distance in metres
 * @returns {number} Distance in miles
 */
export function metresToMiles(metres) {
  return metres * 0.000621371
}

/**
 * Convert metres to kilometres
 * @param {number} metres - Distance in metres
 * @returns {number} Distance in kilometres
 */
export function metresToKilometers(metres) {
  return metres / 1000
}

/**
 * Get cardinal wind direction label from bearing degrees
 * @param {number} degrees - Wind direction in degrees (0-360, meteorological)
 * @returns {string} Cardinal direction label (N, NE, E, SE, S, SW, W, NW)
 */
export function getWindDirectionLabel(degrees) {
  // Normalize to 0-360 range
  const normalized = ((degrees % 360) + 360) % 360
  
  // Cardinal directions with 22.5° ranges
  // N: 337.5-22.5, NE: 22.5-67.5, E: 67.5-112.5, SE: 112.5-157.5,
  // S: 157.5-202.5, SW: 202.5-247.5, W: 247.5-292.5, NW: 292.5-337.5
  
  if (normalized >= 337.5 || normalized < 22.5) return 'N'
  if (normalized >= 22.5 && normalized < 67.5) return 'NE'
  if (normalized >= 67.5 && normalized < 112.5) return 'E'
  if (normalized >= 112.5 && normalized < 157.5) return 'SE'
  if (normalized >= 157.5 && normalized < 202.5) return 'S'
  if (normalized >= 202.5 && normalized < 247.5) return 'SW'
  if (normalized >= 247.5 && normalized < 292.5) return 'W'
  if (normalized >= 292.5 && normalized < 337.5) return 'NW'
  
  // Fallback (should not reach)
  return 'N'
}
