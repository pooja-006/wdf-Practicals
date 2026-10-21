import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

function NavBar({ darkMode, onToggleTheme, token, onLogout }) {
  const linkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link'
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return
    const section = document.getElementById(location.hash.slice(1))
    if (section) window.requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [location.pathname, location.hash])

  return (
    <nav className="nav-bar">
      <Link className="brand" to="/">PP</Link>
      <div className="nav-links">
        <NavLink className={linkClass} to="/">Home</NavLink>
        <Link className="nav-link" to="/#about">About</Link>
        <Link className="nav-link" to="/#skills">Skills</Link>
        <NavLink className={linkClass} to="/projects">Projects</NavLink>
        <NavLink className={linkClass} to="/contact">Contact</NavLink>
        <NavLink className={linkClass} to="/tasks">Tasks</NavLink>
        {token ? <button className="text-button" onClick={onLogout}>Log out</button> : <NavLink className={linkClass} to="/login">Log in</NavLink>}
      </div>
      <button className="theme-button" onClick={onToggleTheme} aria-label="Toggle dark and light mode">{darkMode ? 'Light' : 'Dark'}</button>
    </nav>
  )
}

export default NavBar
