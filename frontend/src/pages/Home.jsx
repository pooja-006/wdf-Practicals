import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import About from '../components/About'
import Skills from '../components/Skills'
import Footer from '../components/Footer'

const GITHUB_USERNAME = 'pooja-006'

function Home() {
  const skills = ['React', 'JavaScript', 'Express', 'MongoDB', 'UI Design']
  const [githubProjects, setGithubProjects] = useState([])
  const [githubLoading, setGithubLoading] = useState(true)
  const [githubError, setGithubError] = useState('')

  useEffect(() => {
    const loadGithubProjects = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`)
        if (!response.ok) throw new Error('GitHub projects are temporarily unavailable.')
        setGithubProjects(await response.json())
      } catch (requestError) {
        setGithubError(requestError.message)
      } finally {
        setGithubLoading(false)
      }
    }

    loadGithubProjects()
  }, [])

  return (
    <>
      <Header name="Pooja Patel" />
      <div className="home-grid"><About /><Skills skillList={skills} /></div>
      <section className="featured-section">
        <div className="section-title-row"><div><p className="section-label">03 / Selected work</p><h2>Featured projects</h2></div><Link to="/projects" className="text-link">See all projects →</Link></div>
        <p className="project-source-label">GitHub projects · {GITHUB_USERNAME}</p>
        {githubLoading && <p className="project-status">Loading latest GitHub projects...</p>}
        {githubError && <p className="project-status">{githubError} <Link to="/projects" className="text-link">View all projects →</Link></p>}
        {!githubLoading && !githubError && <div className="featured-grid">{githubProjects.map((project, index) => <article className="featured-card github-card" key={project.id}><span className="project-number">GH 0{index + 1}</span><h3>{project.name}</h3><p>{project.description || 'A project from my GitHub workspace.'}</p><small>{project.language || 'JavaScript'} · ★ {project.stargazers_count}</small><a href={project.html_url} target="_blank" rel="noreferrer" className="text-link">View on GitHub →</a></article>)}</div>}
      </section>
      <Footer />
    </>
  )
}

export default Home
