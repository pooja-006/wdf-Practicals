import { Link } from 'react-router-dom'

function Footer() {
  return (
    <section className="contact-strip" id="contact-cta">
      <div>
        <p className="section-label">Keep in touch</p>
        <h2>Have a project or opportunity? Let's connect</h2>
      </div>
      <Link className="button" to="/contact">Let's talk <span aria-hidden="true">→</span></Link>
    </section>
  )
}

export default Footer
