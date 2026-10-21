function Skills({ skillList }) {
  return (
    <section className="content-section" id="skills">
      <p className="section-label">02 / Skills</p>
      <h2>A practical toolkit</h2>
      <div className="skill-list">
        {skillList.map((skill) => <div className="skill-card" key={skill}><span className="skill-dot" />{skill}</div>)}
      </div>
    </section>
  )
}

export default Skills
