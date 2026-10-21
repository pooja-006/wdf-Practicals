function RepoList({ repositories }) {
  if (!repositories.length) return <p className="empty-state">No repositories match your search.</p>

  return (
    <div className="repo-grid">
      {repositories.map((repo) => (
        <a className="repo-card" href={repo.html_url} target="_blank" rel="noreferrer" key={repo.id}>
          <span className="repo-language">{repo.language || 'Code'}</span>
          <h3>{repo.name}</h3>
          <p>{repo.description || 'A GitHub project in progress.'}</p>
          <span className="repo-meta">★ {repo.stargazers_count} stars <span>↗</span></span>
        </a>
      ))}
    </div>
  )
}

export default RepoList
