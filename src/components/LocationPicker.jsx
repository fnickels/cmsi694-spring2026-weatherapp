function LocationPicker({ locations = [], onSelect }) {
  if (!locations.length) return null

  return (
    <div className="glass-card p-4" aria-label="Select a location">
      <h2 className="text-sm font-semibold mb-2">Choose a location</h2>
      <ul className="space-y-2" role="listbox">
        {locations.map((location) => (
          <li key={`${location.id}-${location.displayName}`}>
            <button
              type="button"
              className="w-full text-left btn-secondary"
              onClick={() => onSelect(location)}
            >
              {location.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LocationPicker
