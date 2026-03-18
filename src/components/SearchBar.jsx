import { useState } from 'react'

function SearchBar({ onSearch, onUseMyLocation, isLoading, geolocationLoading, helperMessage }) {
  const [query, setQuery] = useState('')
  const [localHelper, setLocalHelper] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!query.trim()) {
      setLocalHelper('Enter a city or town to search.')
      return
    }
    setLocalHelper('')
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3" aria-label="Search weather by location">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
          placeholder="Search city or town"
          aria-label="Location search"
          disabled={isLoading || geolocationLoading}
        />
        <button type="submit" className="btn-primary" disabled={isLoading || geolocationLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <button
          type="button"
          className="btn-secondary"
          onClick={onUseMyLocation}
          disabled={isLoading || geolocationLoading}
        >
          {geolocationLoading ? 'Locating...' : 'Use My Location'}
        </button>
        {localHelper ? <p className="text-xs text-orange-200">{localHelper}</p> : null}
        {!localHelper && helperMessage ? <p className="text-xs text-gray-300">{helperMessage}</p> : null}
      </div>
    </form>
  )
}

export default SearchBar
