import '@testing-library/jest-dom'

globalThis.createGeoSuccessMock = (coords = { latitude: 37.77, longitude: -122.41 }) => {
	return {
		getCurrentPosition: (success) => success({ coords }),
	}
}

globalThis.createGeoErrorMock = (code = 1, message = 'Geolocation error') => {
	return {
		getCurrentPosition: (_success, error) => error({ code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }),
	}
}

globalThis.installNavigatorGeolocationMock = (mockImpl) => {
	Object.defineProperty(global.navigator, 'geolocation', {
		configurable: true,
		value: mockImpl,
	})
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	value: () => ({
		fillRect: () => {},
		clearRect: () => {},
		getImageData: () => ({ data: [] }),
		putImageData: () => {},
		createImageData: () => [],
		setTransform: () => {},
		drawImage: () => {},
		save: () => {},
		fillText: () => {},
		restore: () => {},
		beginPath: () => {},
		moveTo: () => {},
		lineTo: () => {},
		closePath: () => {},
		stroke: () => {},
		translate: () => {},
		scale: () => {},
		rotate: () => {},
		arc: () => {},
		fill: () => {},
		measureText: () => ({ width: 0 }),
		transform: () => {},
		rect: () => {},
		clip: () => {},
	}),
})
