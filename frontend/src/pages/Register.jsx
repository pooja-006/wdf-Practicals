import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'

function Register({ onNotify }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await registerUser(form); onNotify('Account created. Please log in.'); navigate('/login') }
    catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }

  return <section className="form-card"><p className="section-label">06 / Join</p><h1>Register</h1><form onSubmit={submit}>
    <label className="form-field">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
    <label className="form-field">Password<input type="password" minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
    {error && <p className="form-message" role="alert">{error}</p>}
    <div className="form-actions"><button className="button" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button><Link to="/login">Already registered?</Link></div>
  </form></section>
}

export default Register
