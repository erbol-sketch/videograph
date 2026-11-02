import Hero from '../components/Hero'
import { About, Portfolio, Services, Booking, Contact, Ticker, Reveal } from '../components/Sections'
import { site } from '../lib/site'

const links = ['about', 'portfolio', 'services', 'booking', 'contact']

export default function Page() {
  return (
    <main>
      <nav className="nav">
        <a href="#home" className="logo">{site.name}</a>
        <div>
          {links.map((l) => (
            <a key={l} href={`#${l}`}>{l}</a>
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