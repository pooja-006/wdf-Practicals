import { Link } from 'react-router-dom'

function NotFound() {
  return <section className="form-card"><p className="section-label">404 / Lost route</p><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button" to="/">Return home</Link></section>
}

export default NotFound
