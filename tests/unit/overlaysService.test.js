import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildGibsTileUrl,
  buildRainViewerTileUrl,
  fetchRainViewerTilePath,
  getOverlayConfig,
  resolveOverlayTileUrl,
} from '../../src/services/overlays'

describe('overlays service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns pinned NASA GIBS layer configuration', () => {
    expect(getOverlayConfig('temperature').layerId).toBe('MODIS_Terra_Land_Surface_Temp_Daily_Day')
    expect(getOverlayConfig('cloud-cover').layerId).toBe('MODIS_Terra_Cloud_Fraction_Day')
  })

  it('builds a RainViewer tile template from a metadata path', () => {
    expect(buildRainViewerTileUrl('/v2/radar/12345')).toBe(
      'https://tilecache.rainviewer.com/v2/radar/12345/256/{z}/{x}/{y}/2/1_1.png'
    )
  })

  it('parses the latest RainViewer metadata path', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        radar: {
          past: [{ path: '/v2/radar/111' }, { path: '/v2/radar/222' }],
        },
      }),
    }))

    await expect(fetchRainViewerTilePath()).resolves.toBe('/v2/radar/222')
  })

  it('builds NASA GIBS web mercator tile URLs', () => {
    expect(buildGibsTileUrl('MODIS_Terra_Cloud_Fraction_Day', '2026-03-24')).toBe(
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Cloud_Fraction_Day/default/2026-03-24/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png'
    )
  })

  it('resolves a precipitation overlay tile URL from RainViewer metadata', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        radar: {
          nowcast: [{ path: '/v2/radar/333' }],
        },
      }),
    }))

    await expect(resolveOverlayTileUrl('precipitation')).resolves.toContain('/v2/radar/333/')
  })
})