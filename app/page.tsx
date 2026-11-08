import Hero from '../components/Hero'
import { About, Portfolio, Services, Booking, Contact, Ticker, Reveal } from '../components/Sections'
import { site } from '../lib/site'

const links: [string, string][] = [
  ['about', 'обо мне'],
  ['portfolio', 'работы'],
  ['services', 'услуги'],
  ['booking', 'запись'],
  ['contact', 'контакты'],
]

export default function Page() {
  return (
    <main>
      <nav className="nav">
        <a href="#home" className="logo">{site.nick}</a>
        <div>
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </div>
      </nav>
      <Hero />
      <Ticker />
      <About />
      <Portfolio />
      <Services />
      <Booking />
      <Contact />
      <Reveal />
    </main>
  )
}