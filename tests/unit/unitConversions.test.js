import { describe, it, expect } from 'vitest'
import { 
  celsiusToFahrenheit, 
  fahrenheitToCelsius, 
  kmhToMph, 
  mphToKmh, 
  metresToMiles, 
  metresToKilometers,
  getWindDirectionLabel 
} from '../../src/utils/unitConversions'

describe('unitConversions', () => {
  describe('celsiusToFahrenheit', () => {
    it('converts 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBeCloseTo(32, 1)
    })
    
    it('converts 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBeCloseTo(212, 1)
    })
    
    it('converts -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBeCloseTo(-40, 1)
    })
    
    it('converts 20°C to 68°F', () => {
      expect(celsiusToFahrenheit(20)).toBeCloseTo(68, 1)
    })

    it('returns number', () => {
      expect(typeof celsiusToFahrenheit(25)).toBe('number')
    })
  })

  describe('fahrenheitToCelsius', () => {
    it('converts 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBeCloseTo(0, 1)
    })
    
    it('converts 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBeCloseTo(100, 1)
    })
    
    it('converts 68°F to 20°C', () => {
      expect(fahrenheitToCelsius(68)).toBeCloseTo(20, 1)
    })

    it('returns number', () => {
      expect(typeof fahrenheitToCelsius(72)).toBe('number')
    })
  })

  describe('kmhToMph', () => {
    it('converts 0 km/h to 0 mph', () => {
      expect(kmhToMph(0)).toBeCloseTo(0, 1)
    })
    
    it('converts 100 km/h to ~62.14 mph', () => {
      expect(kmhToMph(100)).toBeCloseTo(62.14, 1)
    })
    
    it('converts 10 km/h to ~6.21 mph', () => {
      expect(kmhToMph(10)).toBeCloseTo(6.21, 1)
    })

    it('returns number', () => {
      expect(typeof kmhToMph(50)).toBe('number')
    })
  })

  describe('mphToKmh', () => {
    it('converts 0 mph to 0 km/h', () => {
      expect(mphToKmh(0)).toBeCloseTo(0, 1)
    })
    
    it('converts 62.14 mph to ~100 km/h', () => {
      expect(mphToKmh(62.14)).toBeCloseTo(100, 1)
    })
    
    it('converts 60 mph to ~96.56 km/h', () => {
      expect(mphToKmh(60)).toBeCloseTo(96.56, 1)
    })

    it('returns number', () => {
      expect(typeof mphToKmh(30)).toBe('number')
    })
  })

  describe('metresToMiles', () => {
    it('converts 0 metres to 0 miles', () => {
      expect(metresToMiles(0)).toBeCloseTo(0, 1)
    })
    
    it('converts 1609.34 metres to 1 mile', () => {
      expect(metresToMiles(1609.34)).toBeCloseTo(1, 2)
    })
    
    it('converts 1000 metres to ~0.62 miles', () => {
      expect(metresToMiles(1000)).toBeCloseTo(0.62, 2)
    })

    it('returns number', () => {
      expect(typeof metresToMiles(500)).toBe('number')
    })
  })

  describe('metresToKilometers', () => {
    it('converts 0 metres to 0 kilometres', () => {
      expect(metresToKilometers(0)).toBeCloseTo(0, 1)
    })
    
    it('converts 1000 metres to 1 kilometre', () => {
      expect(metresToKilometers(1000)).toBeCloseTo(1, 2)
    })
    
    it('converts 10000 metres to 10 kilometres', () => {
      expect(metresToKilometers(10000)).toBeCloseTo(10, 2)
    })

    it('returns number', () => {
      expect(typeof metresToKilometers(5000)).toBe('number')
    })
  })

  describe('getWindDirectionLabel', () => {
    it('0° returns N', () => {
      expect(getWindDirectionLabel(0)).toBe('N')
    })
    
    it('45° returns NE', () => {
      expect(getWindDirectionLabel(45)).toBe('NE')
    })
    
    it('90° returns E', () => {
      expect(getWindDirectionLabel(90)).toBe('E')
    })
    
    it('135° returns SE', () => {
      expect(getWindDirectionLabel(135)).toBe('SE')
    })
    
    it('180° returns S', () => {
      expect(getWindDirectionLabel(180)).toBe('S')
    })
    
    it('225° returns SW', () => {
      expect(getWindDirectionLabel(225)).toBe('SW')
    })
    
    it('270° returns W', () => {
      expect(getWindDirectionLabel(270)).toBe('W')
    })
    
    it('315° returns NW', () => {
      expect(getWindDirectionLabel(315)).toBe('NW')
    })
    
    it('360° returns N', () => {
      expect(getWindDirectionLabel(360)).toBe('N')
    })

    // Edge cases
    it('22.4° returns N', () => {
      expect(getWindDirectionLabel(22.4)).toBe('N')
    })
    
    it('22.5° returns NE', () => {
      expect(getWindDirectionLabel(22.5)).toBe('NE')
    })
    
    it('337.5° returns N', () => {
      expect(getWindDirectionLabel(337.5)).toBe('N')
    })

    it('returns string', () => {
      expect(typeof getWindDirectionLabel(45)).toBe('string')
    })

    it('returns one of 8 cardinal directions', () => {
      const validLabels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
      for (let deg = 0; deg < 360; deg += 15) {
        expect(validLabels).toContain(getWindDirectionLabel(deg))
      }
    })
  })

  describe('round-trip conversions', () => {
    it('C → F → C round trip', () => {
      const original = 20
      const roundTrip = fahrenheitToCelsius(celsiusToFahrenheit(original))
      expect(roundTrip).toBeCloseTo(original, 1)
    })

    it('km/h → mph → km/h round trip', () => {
      const original = 100
      const roundTrip = mphToKmh(kmhToMph(original))
      expect(roundTrip).toBeCloseTo(original, 1)
    })
  })
})
