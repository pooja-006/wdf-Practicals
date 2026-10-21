import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import NotFound from './pages/NotFound'
import Spinner from './components/Spinner'


const Projects = lazy(() => import('./pages/Projects'))
const Contact = lazy(() => import('./pages/Contact'))

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [notice, setNotice] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    document.title = darkMode ? 'Student Portfolio | Dark' : 'Student Portfolio Lab'
  }, [darkMode])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    showNotice('You have been logged out.')
    navigate('/login')
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <NavBar darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} token={token} onLogout={logout} />
      {notice && <div className="notice" role="status">{notice}</div>}
      
      <main className="page-shell">
        {/* Highlight: Suspense provides a meaningful fallback UI (Spinner) while the lazy chunk is downloading */}
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact onNotify={showNotice} />} />
            <Route path="/login" element={<Login onNotify={showNotice} onLogin={setToken} />} />
            <Route path="/register" element={<Register onNotify={showNotice} />} />
            <Route path="/tasks" element={<Tasks onNotify={showNotice} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      
      <footer className="site-footer">
        <Link to="/contact">Start a conversation</Link>
      </footer>
    </div>
  )
}

export default App