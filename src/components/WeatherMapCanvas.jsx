import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'

function MapViewUpdater({ center, zoom }) {
  const map = useMap()

  if (center?.[0] !== map.getCenter().lat || center?.[1] !== map.getCenter().lng || zoom !== map.getZoom()) {
    map.setView(center, zoom)
  }

  return null
}

function MapClickHandler({ onInspectPoint }) {
  useMapEvents({
    click(event) {
      onInspectPoint({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      })
    },
  })

  return null
}

function WeatherMapCanvas({ center, zoom, activeOverlay, overlayTileUrl, onReady, onError, onInspectPoint }) {
  if (!Array.isArray(center) || center.length !== 2) {
    onError('Map is unsupported without a valid location center.')
    return null
  }

  return (
    <div className="h-[420px] overflow-hidden rounded-lg" aria-label="Weather map canvas">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom
        whenReady={onReady}
      >
        <MapViewUpdater center={center} zoom={zoom} />
        <MapClickHandler onInspectPoint={onInspectPoint} />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          eventHandlers={{
            tileerror: () => onError('Base map tiles could not be loaded.'),
          }}
        />
        {overlayTileUrl ? (
          <TileLayer
            key={`${activeOverlay}-${overlayTileUrl}`}
            url={overlayTileUrl}
            opacity={0.45}
          />
        ) : null}
        <CircleMarker center={center} radius={10} pathOptions={{ color: '#7dd3fc', weight: 3, fillOpacity: 0.35 }} />
      </MapContainer>
    </div>
  )
}

export default WeatherMapCanvas