function WeatherLayerLegend({ overlayType, legendItems, unitPreference }) {
  if (!overlayType || !Array.isArray(legendItems) || legendItems.length === 0) {
    return null
  }

  const title = overlayType === 'cloud-cover'
    ? 'Cloud cover legend'
    : `${overlayType.charAt(0).toUpperCase()}${overlayType.slice(1)} legend`

  return (
    <section className="glass-card p-4 space-y-2" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-gray-300">Units: {unitPreference === 'imperial' ? 'imperial display' : 'metric display'}</span>
      </div>
      <ul className="space-y-2">
        {legendItems.map((item) => (
          <li key={`${overlayType}-${item.label}`} className="flex items-center justify-between gap-3 text-sm text-gray-200">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </span>
            <span className="text-xs text-gray-300">{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WeatherLayerLegend