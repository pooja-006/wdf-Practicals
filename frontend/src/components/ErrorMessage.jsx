function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <strong>Something went wrong.</strong>
      <p>{message}</p>
      {onRetry && <button className="button secondary" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export default ErrorMessage
