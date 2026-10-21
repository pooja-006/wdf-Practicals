import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

function Login({ onNotify, onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { const data = await loginUser(form); localStorage.setItem('token', data.token); onLogin(data.token); onNotify('Welcome back.'); navigate('/tasks') }
    catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }

  return <section className="form-card"><p className="section-label">05 / Access</p><h1>Log in</h1><form onSubmit={submit}>
    <label className="form-field">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
    <label className="form-field">Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
    {error && <p className="form-message" role="alert">{error}</p>}
    <div className="form-actions"><button className="button" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button><Link to="/register">Create account</Link></div>
  </form></section>
}

export default Login
