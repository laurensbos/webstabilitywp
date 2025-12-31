import { ExternalLink } from 'lucide-react'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <a href="/" className={styles.logo}>webstability</a>
            <p className={styles.desc}>
              Website monitoring voor WordPress agencies. Uptime, performance, SSL — alles in één dashboard.
            </p>
            <a 
              href="https://www.trustpilot.com/review/webstability.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.trustpilot}
            >
              ⭐ 4.1/5 op Trustpilot
              <ExternalLink size={12} />
            </a>
          </div>
          
          <div className={styles.links}>
            <h4>Product</h4>
            <a href="#features">Functies</a>
            <a href="#pricing">Prijzen</a>
            <a href="#faq">FAQ</a>
          </div>
          
          <div className={styles.links}>
            <h4>Bedrijf</h4>
            <a href="mailto:info@webstability.nl">Contact</a>
            <a href="https://www.trustpilot.com/review/webstability.nl" target="_blank" rel="noopener noreferrer">Reviews</a>
          </div>
          
          <div className={styles.links}>
            <h4>Legal</h4>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Voorwaarden</a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>© 2025 webstability. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
