const RAINVIEWER_METADATA_URL = 'https://api.rainviewer.com/public/weather-maps.json'
const RAINVIEWER_TILE_HOST = 'https://tilecache.rainviewer.com'
const NASA_GIBS_TILE_HOST = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'
const NASA_GIBS_MATRIX_SET = 'GoogleMapsCompatible_Level9'

export const OVERLAY_CONFIG = {
  precipitation: {
    id: 'precipitation',
    title: 'Precipitation',
    provider: 'RainViewer',
    attribution: 'RainViewer',
    legendTitle: 'Precipitation legend',
    legendItems: [
      { label: 'Light precipitation', color: '#60a5fa', value: '0-30%' },
      { label: 'Moderate precipitation', color: '#2563eb', value: '31-70%' },
      { label: 'Heavy precipitation', color: '#1d4ed8', value: '71-100%' },
    ],
  },
  temperature: {
    id: 'temperature',
    title: 'Temperature',
    provider: 'NASA GIBS',
    layerId: 'MODIS_Terra_Land_Surface_Temp_Daily_Day',
    attribution: 'NASA GIBS',
    legendTitle: 'Temperature legend',
    legendItems: [
      { label: 'Cool', color: '#60a5fa', value: '< 10°C' },
      { label: 'Mild', color: '#facc15', value: '10-24°C' },
      { label: 'Hot', color: '#f97316', value: '25°C+' },
    ],
  },
  'cloud-cover': {
    id: 'cloud-cover',
    title: 'Cloud Cover',
    provider: 'NASA GIBS',
    layerId: 'MODIS_Terra_Cloud_Fraction_Day',
    attribution: 'NASA GIBS',
    legendTitle: 'Cloud cover legend',
    legendItems: [
      { label: 'Low cloud cover', color: '#d1d5db', value: '0-30%' },
      { label: 'Moderate cloud cover', color: '#9ca3af', value: '31-70%' },
      { label: 'Dense cloud cover', color: '#4b5563', value: '71-100%' },
    ],
  },
}

function formatGibsDate(date = new Date()) {
  if (typeof date === 'string' && date.length > 0) return date
  return new Date(date).toISOString().slice(0, 10)
}

export function getOverlayConfig(overlayType) {
  const config = OVERLAY_CONFIG[overlayType]
  if (!config) {
    throw new Error('Unsupported overlay type')
  }

  return config
}

export function buildRainViewerTileUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('A valid RainViewer path is required')
  }

  return `${RAINVIEWER_TILE_HOST}${path}/256/{z}/{x}/{y}/2/1_1.png`
}

export async function fetchRainViewerTilePath() {
  const response = await fetch(RAINVIEWER_METADATA_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`RainViewer API error: ${response.status}`)
  }

  const data = await response.json()
  const latestFrame = data?.radar?.past?.at(-1) ?? data?.radar?.nowcast?.[0]
  if (!latestFrame?.path || typeof latestFrame.path !== 'string') {
    throw new Error('RainViewer metadata did not include a tile path')
  }

  return latestFrame.path
}

export function buildGibsTileUrl(layerId, date = 'default') {
  if (typeof layerId !== 'string' || layerId.length === 0) {
    throw new Error('A valid NASA GIBS layerId is required')
  }

  return `${NASA_GIBS_TILE_HOST}/${layerId}/default/${formatGibsDate(date)}/${NASA_GIBS_MATRIX_SET}/{z}/{y}/{x}.png`
}

export async function resolveOverlayTileUrl(overlayType, options = {}) {
  const config = getOverlayConfig(overlayType)

  if (overlayType === 'precipitation') {
    const path = await fetchRainViewerTilePath()
    return buildRainViewerTileUrl(path)
  }

  return buildGibsTileUrl(config.layerId, options.date)
}