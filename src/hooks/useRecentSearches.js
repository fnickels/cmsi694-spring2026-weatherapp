/**
 * useRecentSearches Hook
 * Manages recent search history using sessionStorage
 * Maintains up to 5 recent searches, deduplicates automatically
 */

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'weatherapp.recentSearches'
const UNIT_STORAGE_KEY = 'weatherapp.unitPreference'
const MAX_SEARCHES = 5

export function useRecentSearches() {
  const [searches, setSearches] = useState([])
  const [unit, setUnitState] = useState('imperial')

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setSearches(parsed)
        }
      }

      const storedUnit = sessionStorage.getItem(UNIT_STORAGE_KEY)
      if (storedUnit === 'imperial' || storedUnit === 'metric') {
        setUnitState(storedUnit)
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err)
    }
  }, [])

  const addSearch = useCallback((location) => {
    if (!location || !location.displayName) {
      return
    }

    setSearches(prev => {
      // Remove duplicate if it exists (moving it to front)
      const filtered = prev.filter(
        search => search.displayName !== location.displayName
      )

      // Create new search record with timestamp
      const newSearch = {
        id: location.id,
        name: location.name,
        displayName: location.displayName,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        countryCode: location.countryCode,
        admin1: location.admin1,
        timestamp: new Date().toISOString()
      }

      // Add to front and limit to MAX_SEARCHES
      const updated = [newSearch, ...filtered].slice(0, MAX_SEARCHES)

      // Persist to sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('Failed to save recent searches:', err)
      }

      return updated
    })
  }, [])

  const clear = useCallback(() => {
    setSearches([])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear recent searches:', err)
    }
  }, [])

  const setUnit = useCallback((nextUnit) => {
    if (nextUnit !== 'imperial' && nextUnit !== 'metric') return
    setUnitState(nextUnit)
    try {
      sessionStorage.setItem(UNIT_STORAGE_KEY, nextUnit)
    } catch (err) {
      console.error('Failed to save unit preference:', err)
    }
  }, [])

  return {
    searches,
    addSearch,
    clear,
    unit,
    setUnit,
  }
}
