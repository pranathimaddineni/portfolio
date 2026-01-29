import './Portfolio.css'

const projects = [
  { 
    "name": "Jatango", 
    "url": "https://www.jatango.com",
    "description": "Live streaming ecommerce platform for interactive shopping experiences",
    "icon": "📺"
  },
  { 
    "name": "Get Notifi", 
    "url": "https://www.getnotifi.com",
    "description": "Smart notification system for seamless communication",
    "icon": "🔔"
  },
  { 
    "name": "La-Excellence", 
    "url": "https://laex.in/",
    "description": "Premium educational platform for excellence in learning",
    "icon": "🎓"
  },
  { 
    "name": "Resume", 
    "url": "https://drive.google.com/uc?export=download&id=1p5tNkCxvzCX72zjiitM0TGzGpdUqD1js",
    "description": "Download my professional resume and portfolio",
    "icon": "📄"
  },
  { 
    "name": "Github", 
    "url": "https://github.com/pranathimaddineni",
    "description": "Explore my code repositories and open source contributions",
    "icon": "💻"
  }
]

function Portfolio() {
  const handleProjectClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="portfolio-section">
      <h2 className="portfolio-title">🌟 My Portfolio</h2>
      <div className="portfolio-grid">
        {projects.map((project, index) => (
          <button
            key={index}
            className="portfolio-item"
            onClick={() => handleProjectClick(project.url)}
            aria-label={`Visit ${project.name}`}
            style={{ '--delay': `${index * 0.1}s` }}
          >
            <div className="portfolio-item-icon">{project.icon}</div>
            <div className="portfolio-item-content">
              <span className="portfolio-item-name">{project.name}</span>
              <span className="portfolio-item-description">{project.description}</span>
            </div>
            <span className="portfolio-item-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
