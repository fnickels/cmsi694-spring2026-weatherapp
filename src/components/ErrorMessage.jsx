function ErrorMessage({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="glass-card border-red-300/40 p-4" role="alert" aria-live="assertive">
      <p className="text-error text-sm">{message}</p>
      {onDismiss && (
        <button type="button" className="btn-secondary mt-3" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
