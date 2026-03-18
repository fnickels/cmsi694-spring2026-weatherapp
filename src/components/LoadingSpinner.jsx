function LoadingSpinner({ message = 'Loading weather data...' }) {
  return (
    <div className="glass-card p-6 text-center" role="status" aria-live="polite">
      <div className="spinner mx-auto mb-3" />
      <p className="text-sm text-gray-200">{message}</p>
    </div>
  )
}

export default LoadingSpinner
