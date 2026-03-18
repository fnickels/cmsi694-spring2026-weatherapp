function UnitToggle({ unit, onToggle }) {
  const isImperial = unit === 'imperial'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="btn-secondary"
      aria-label="Toggle temperature units"
    >
      {isImperial ? '°F' : '°C'}
    </button>
  )
}

export default UnitToggle
