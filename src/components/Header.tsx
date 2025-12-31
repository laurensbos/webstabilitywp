import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import styles from './Header.module.css'

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <a href="#" className={styles.logo}>webstability</a>

        <nav className={styles.nav}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className={styles.actions}>
          <a href="#" className={styles.login}>Log in</a>
          <a href="#pricing" className={styles.cta}>Start Free</a>
        </div>

        <button 
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          <a href="#pricing" className={styles.cta} onClick={() => setMobileOpen(false)}>Start Free</a>
        </div>
      )}
    </header>
  )
}

export default Header
