import { useEffect, useMemo, useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import RepoList from '../components/RepoList'
import Spinner from '../components/Spinner'

const GITHUB_USERNAME = 'pooja-006'

function Projects() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchRepos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`)
      if (!response.ok) throw new Error('GitHub could not return the repositories.')
      setRepos(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRepos() }, [])

  const filteredRepos = useMemo(() => repos.filter((repo) => repo.name.toLowerCase().includes(search.toLowerCase())), [repos, search])

  return (
    <section className="page-section">
      <div className="section-heading"><div><p className="section-label">03 / Open source</p><h1>Projects in motion</h1></div><span className="count-label">{repos.length} repos</span></div>
     
      <label className="search-field">Search repositories<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try 'hello'" /></label>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={fetchRepos} />}
      {!loading && !error && <RepoList repositories={filteredRepos} />}
    </section>
  )
}

export default Projects
