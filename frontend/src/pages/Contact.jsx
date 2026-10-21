import { useState } from 'react'

function Contact({ onNotify }) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
    onNotify('Message captured for this practical demo.')
  }

  return (
    <section className="form-card">
      <p className="section-label">04 / Contact</p>
      <h1>Say hello</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-field">Your message<textarea value={message} onChange={(event) => { setMessage(event.target.value); setSent(false) }} placeholder="Tell me what you are building..." required /></label>
        <p aria-live="polite">{message ? `Preview: ${message}` : 'Your message preview appears here.'}</p>
        <div className="form-actions"><button className="button" type="submit">Send message</button>{sent && <span className="form-message">Thanks for reaching out.</span>}</div>
      </form>
    </section>
  )
}

export default Contact
