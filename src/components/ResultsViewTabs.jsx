const VIEW_LABELS = {
  current: 'Current',
  forecast: 'Forecast',
  map: 'Map',
}

function ResultsViewTabs({ activeView, onChange, availableViews }) {
  if (!Array.isArray(availableViews) || availableViews.length === 0) {
    return null
  }

  const activeIndex = availableViews.indexOf(activeView)

  const handleKeyDown = (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()

    if (event.key === 'Home') {
      onChange(availableViews[0])
      return
    }

    if (event.key === 'End') {
      onChange(availableViews[availableViews.length - 1])
      return
    }

    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (activeIndex + direction + availableViews.length) % availableViews.length
    onChange(availableViews[nextIndex])
  }

  return (
    <div className="glass-card p-2" role="tablist" aria-label="Weather result views" onKeyDown={handleKeyDown}>
      <div className="flex flex-wrap gap-2">
        {availableViews.map((viewId) => {
          const isActive = activeView === viewId

          return (
            <button
              key={viewId}
              id={`results-tab-${viewId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`results-panel-${viewId}`}
              tabIndex={isActive ? 0 : -1}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              onClick={() => onChange(viewId)}
            >
              {VIEW_LABELS[viewId] ?? viewId}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ResultsViewTabs