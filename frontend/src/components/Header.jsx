import { Link } from 'react-router-dom'
import profilePhoto from '../../profile.jpeg'

function Header({ name = 'Student Developer' }) {
  return (
    <header className="portfolio-hero">
      <div className="profile-frame" aria-label="Pooja Patel profile photo">
        <div className="profile-placeholder"><span>PP</span><small>Your Photo</small></div>
        <img className="profile-photo" src={profilePhoto} alt="Pooja Patel" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Hello, I'm</p>
        <h1>{name}</h1>
        <p className="hero-role">Computer Engineering Student &amp; Aspiring Software Developer</p>
        <p className="hero-lede">5th semester Computer Engineering student passionate about web development, problem solving, and building practical software projects.</p>
        <div className="hero-actions">
          <Link className="button" to="/projects">View Projects</Link>
          <Link className="button outline-button" to="/contact">Contact Me</Link>
        </div>
        <div className="hero-skills" aria-label="Core skills"><span>React</span><span>JavaScript</span><span>C++</span><span>Node.js</span><span>MongoDB</span></div>
      </div>
    </header>
  )
}

export default Header
