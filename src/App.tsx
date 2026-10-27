import { Fragment, useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  Braces,
  Check,
  Code2,
  Github,
  GraduationCap,
  Linkedin,
  Network,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { certificates, learningInterests, profile, projects, skills } from './content'
import type { Certificate, Project } from './content'
import Navigation from './components/Navigation'
import HeroVisual from './components/HeroVisual'
import TechnologyMarquee from './components/TechnologyMarquee'
import CertificateDialog from './components/CertificateDialog'
import useAnimations from './hooks/useAnimations'
import PortfolioCompanion from './companion/PortfolioCompanion'
import MusicPlayer from './components/MusicPlayer'

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span className="label-rule" />
      {children}
    </div>
  )
}

function LiveLink({ project }: { project: Project }) {
  return (
    <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">
      Explore live project <ArrowUpRight size={18} />
      <span className="sr-only">: {project.title} (opens in a new tab)</span>
    </a>
  )
}

function ProjectVisual({ project }: { project: Project }) {
  return (
    <a
      className={`project-visual visual-${project.id}`}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${project.title} live (opens in a new tab)`}
    >
      <div className="project-visual-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>
          {project.id === 'e-likas'
            ? 'e-likasligao.online'
            : project.id === 'windows-dictionary'
              ? 'WINDOWS SERVER DICTIONARY'
              : 'DEVCON × SUI · 2026'}
        </span>
        <ArrowUpRight size={14} />
      </div>
      {project.image ? (
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          decoding="async"
          width={project.id === 'e-likas' ? 1536 : project.id === 'sui-code-camp' ? 1440 : 1887}
          height={project.id === 'e-likas' ? 1024 : project.id === 'sui-code-camp' ? 1000 : 1030}
        />
      ) : (
        <div className="sui-cover">
          <div className="sui-cover-orbits" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="sui-code">&lt; move /&gt;</span>
          <strong>
            Learn.
            <br />
            Build.
            <br />
            <span>Explore.</span>
          </strong>
          <span className="sui-cover-label">
            SUI MOVE CODE CAMP <span>↗</span>
          </span>
        </div>
      )}
      <span className="project-image-link" aria-hidden="true">
        <ArrowUpRight size={21} />
      </span>
    </a>
  )
}

export default function App() {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  useAnimations()
  const featured = projects[0]
  const champion = certificates[0]
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation open={mobileMenuOpen} onMenuChange={setMobileMenuOpen} />
      <main id="main">
        <section id="home" tabIndex={-1} className="hero container" aria-labelledby="hero-title">
          <div className="hero-main">
            <div className="hero-intro">
              <div className="hero-kicker">
                <span className="status-dot" />
                {profile.title}
              </div>
              <h1 id="hero-title">
                Building ideas
                <br className="desktop-break" /> into{' '}
                <span className="gradient-text">practical</span>
                <br className="desktop-break" /> digital experiences
                <span className="headline-dot">.</span>
              </h1>
              <p>{profile.introduction}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">
                  View My Work <ArrowDownRight size={18} />
                </a>
                <a className="button button-secondary" href="#contact">
                  Let’s Connect <ArrowUpRight size={17} />
                </a>
              </div>
              <MusicPlayer suppressed={Boolean(selectedCertificate) || mobileMenuOpen} />
            </div>
            <HeroVisual />
          </div>
          <div className="hero-bottom">
            <a href="#about" className="scroll-cue">
              <span className="scroll-icon">
                <ArrowDown size={14} />
              </span>
              SCROLL TO EXPLORE
            </a>
            <span className="hero-disciplines">
              WEB <span>/</span> MOBILE <span>/</span> DESKTOP
            </span>
            <span className="hero-edition">
              PORTFOLIO <span>—</span> 2026
            </span>
          </div>
        </section>

        <TechnologyMarquee />

        <section
          id="about"
          tabIndex={-1}
          className="section about-section"
          aria-labelledby="about-title"
        >
          <div className="container">
            <SectionLabel number="01">A LITTLE ABOUT ME</SectionLabel>
            <div className="about-layout">
              <figure className="portrait-wrap" data-reveal>
                <picture>
                  <source
                    srcSet="/images/portrait-480.webp 480w, /images/portrait-800.webp 800w"
                    sizes="(max-width: 650px) 90vw, 400px"
                    type="image/webp"
                  />
                  <img
                    src="/images/portrait.jpg"
                    alt="Cristian N. Ponce wearing a dark suit at an event; the supplied portrait has an intentional soft blur."
                    loading="lazy"
                    width="1038"
                    height="1854"
                  />
                </picture>
                <figcaption>
                  <span>CRISTIAN N. PONCE</span>
                  <span>
                    THE PERSON BEHIND THE CODE <ArrowUpRight size={14} />
                  </span>
                </figcaption>
                <span className="portrait-corner" aria-hidden="true" />
              </figure>
              <div className="about-copy" data-reveal>
                <h2 id="about-title">
                  Curious by nature.
                  <br />
                  <span className="muted-heading">A builder at heart.</span>
                </h2>
                {profile.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="education">
                  <GraduationCap size={24} />
                  <div>
                    <span className="eyebrow">CURRENTLY STUDYING</span>
                    <h3>{profile.degree}</h3>
                    <p>{profile.education}</p>
                  </div>
                </div>
                <div className="interest-line">
                  <span>Building applications.</span>
                  <span>Exploring what connects them.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="skills"
          tabIndex={-1}
          className="section skills-section container"
          aria-labelledby="skills-title"
        >
          <SectionLabel number="02">MY TOOLKIT</SectionLabel>
          <div className="skills-layout">
            <div className="skills-intro" data-reveal>
              <h2 id="skills-title">
                Different tools.
                <br />
                <span className="muted-heading">One builder’s mindset.</span>
              </h2>
              <p>The technologies I work with to turn an idea into something people can use.</p>
              <div className="toolkit-symbol" aria-hidden="true">
                <Braces size={56} strokeWidth={1} />
                <span>ALWAYS LEARNING_</span>
              </div>
            </div>
            <div className="skill-list">
              {skills.map((skill) => (
                <div className="skill-row" key={skill.number} data-reveal>
                  <span className="skill-number">{skill.number}</span>
                  <div>
                    <h3>{skill.title}</h3>
                    {skill.description && <p className="skill-context">{skill.description}</p>}
                    <div className="skill-items">
                      {skill.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                  <Code2 size={19} />
                </div>
              ))}
              <div className="exploring-row" data-reveal>
                <Network size={20} />
                <div>
                  <span className="eyebrow">{learningInterests.title}</span>
                  <p>
                    {learningInterests.items.map((interest, index) => (
                      <Fragment key={interest}>
                        {index > 0 && <span>·</span>}
                        {interest}
                      </Fragment>
                    ))}
                  </p>
                </div>
                <Sparkles size={16} />
              </div>
            </div>
          </div>
        </section>

        <section
          id="projects"
          tabIndex={-1}
          className="section projects-section"
          aria-labelledby="projects-title"
        >
          <div className="container">
            <SectionLabel number="03">SELECTED WORK</SectionLabel>
            <div className="section-heading" data-reveal>
              <h2 id="projects-title">
                Ideas put into practice<span className="accent-dot">.</span>
              </h2>
              <p>
                From a community-focused capstone
                <br className="desktop-break" /> to tools built through learning.
              </p>
            </div>
            <article className="featured-project" data-reveal>
              <div className="featured-heading">
                <span className="project-category">
                  <span className="status-dot" />
                  {featured.category}
                </span>
                <span className="project-number">PROJECT / {featured.number}</span>
              </div>
              <ProjectVisual project={featured} />
              <div className="featured-details">
                <div>
                  <h3>{featured.title}</h3>
                  <p className="project-subtitle">{featured.subtitle}</p>
                  <div className="tags">
                    {featured.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <LiveLink project={featured} />
                </div>
                <div>
                  <p className="project-description">{featured.description}</p>
                  <ul className="feature-list">
                    {featured.features?.map((feature) => (
                      <li key={feature}>
                        <Check size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
            <div className="supporting-projects">
              {projects.slice(1).map((project) => (
                <article className="supporting-project" key={project.id} data-reveal>
                  <ProjectVisual project={project} />
                  <div className="supporting-info">
                    <div className="project-meta">
                      <span>{project.category}</span>
                      <span>{project.number}</span>
                    </div>
                    <h3>{project.title}</h3>
                    {project.id === 'sui-code-camp' && (
                      <p className="project-subtitle">{project.subtitle}</p>
                    )}
                    <p className="project-description">{project.description}</p>
                    <div className="tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <LiveLink project={project} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="achievements"
          tabIndex={-1}
          className="section achievements-section container"
          aria-labelledby="achievements-title"
        >
          <SectionLabel number="04">MILESTONES ALONG THE WAY</SectionLabel>
          <div className="section-heading" data-reveal>
            <h2 id="achievements-title">
              Learning. Building.
              <br />
              <span className="muted-heading">Growing.</span>
            </h2>
            <p>
              Competition awards, shared learning,
              <br className="desktop-break" /> and milestones worth remembering.
            </p>
          </div>
          <button
            className="champion-showcase"
            onClick={() => setSelectedCertificate(champion)}
            data-reveal
            aria-label="View Web Development Champion certificate"
          >
            <div className="champion-content">
              <div className="champion-kicker">
                <Trophy size={18} />
                IT DAYS 2025 · AWARD
              </div>
              <span className="champion-word">
                Champion<span>↗</span>
              </span>
              <h3>Web Development Competition</h3>
              <p>April 23, 2025 · Infotech Development Systems Colleges, Inc.</p>
              <span className="text-link">
                View certificate <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="champion-image">
              <img
                src={champion.thumbnail}
                alt={champion.alt}
                loading="lazy"
                width="640"
                height="447"
              />
            </div>
          </button>
          <div className="certificate-list">
            {certificates.slice(1).map((certificate) => (
              <button
                className="certificate-row"
                key={certificate.id}
                onClick={() => setSelectedCertificate(certificate)}
                aria-label={`View ${certificate.title} certificate`}
                data-reveal
              >
                <span
                  className={`certificate-icon ${certificate.category === 'Award' ? 'award-icon' : ''}`}
                >
                  {certificate.category === 'Award' ? (
                    <Award size={21} />
                  ) : certificate.category === 'Assessment result' ? (
                    <Braces size={21} />
                  ) : (
                    <GraduationCap size={21} />
                  )}
                </span>
                <span className="certificate-info">
                  <span className="eyebrow">{certificate.category}</span>
                  <span className="certificate-title">{certificate.title}</span>
                  <span className="certificate-detail">{certificate.detail}</span>
                </span>
                <time dateTime={certificate.date}>{certificate.dateLabel}</time>
                <span className="certificate-open">
                  <ArrowUpRight size={20} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          id="contact"
          tabIndex={-1}
          className="section contact-section"
          aria-labelledby="contact-title"
        >
          <div className="container">
            <SectionLabel number="05">LET’S CONNECT</SectionLabel>
            <div className="contact-layout" data-reveal>
              <div>
                <h2 id="contact-title">
                  Let’s build
                  <br />
                  something <span className="gradient-text">useful.</span>
                </h2>
                <p>{profile.contactCopy}</p>
                <div className="contact-links">
                  {profile.socials.map((social) => (
                    <a
                      className={`button ${social.label === 'LinkedIn' ? 'button-primary' : 'button-secondary'}`}
                      href={social.url}
                      key={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.label === 'LinkedIn' ? <Linkedin size={18} /> : <Github size={18} />}
                      {social.label}
                      <ArrowUpRight size={17} />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </div>
              <a
                className="contact-arrow"
                href={profile.socials[0].url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Cristian on LinkedIn (opens in a new tab)"
              >
                <ArrowUpRight strokeWidth={0.9} />
                <span>
                  GOOD IDEAS START
                  <br />
                  WITH A CONVERSATION
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <a href="#home" className="wordmark" aria-label="Back to top">
          cnp<span className="wordmark-dot">.</span>
        </a>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <div className="footer-links">
          {profile.socials.map((social) => (
            <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer">
              {social.label}
              <ArrowUpRight size={13} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
          <a className="back-to-top" href="#home" aria-label="Back to top">
            <ArrowUp size={18} />
          </a>
        </div>
      </footer>
      <PortfolioCompanion />
      {selectedCertificate && (
        <CertificateDialog
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  )
}
