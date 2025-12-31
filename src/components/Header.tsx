'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import styles from './Header.module.css'

const Header = () => {
  const { data: session } = useSession()
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
        <Link href="/" className={styles.logo}>webstability</Link>

        <nav className={styles.nav}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className={styles.actions}>
          {session ? (
            <Link href="/dashboard" className={styles.dashboardBtn}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.login}>Inloggen</Link>
              <Link href="/register" className={styles.cta}>Gratis starten</Link>
            </>
          )}
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
          {session ? (
            <Link href="/dashboard" className={styles.cta} onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}>Inloggen</Link>
              <Link href="/register" className={styles.cta} onClick={() => setMobileOpen(false)}>
                Gratis starten
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
