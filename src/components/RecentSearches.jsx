function RecentSearches({ searches = [], onSelect }) {
  if (!searches.length) return null

  return (
    <div className="glass-card p-3" aria-label="Recent searches">
      <p className="text-xs text-gray-300 mb-2">Recent searches</p>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={`${search.id}-${search.displayName}`}
            type="button"
            className="btn-secondary text-sm"
            onClick={() => onSelect(search)}
            aria-label={`Show weather for ${search.displayName}`}
          >
            {search.displayName}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RecentSearches
