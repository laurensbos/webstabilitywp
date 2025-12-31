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
          </div>
          
          <div className={styles.links}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Prijzen</a>
            <a href="#">Documentatie</a>
            <a href="#">Changelog</a>
          </div>
          
          <div className={styles.links}>
            <h4>Bedrijf</h4>
            <a href="#">Over ons</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          
          <div className={styles.links}>
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Voorwaarden</a>
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
