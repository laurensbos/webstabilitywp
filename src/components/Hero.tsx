import styles from './Hero.module.css'
import { ArrowRight, Check, Star } from 'lucide-react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.trustBadge}>
          <div className={styles.stars}>
            {[...Array(4)].map((_, i) => (
              <Star key={i} size={14} fill="#00e599" color="#00e599" />
            ))}
            <Star size={14} fill="none" color="#00e599" />
          </div>
          <span>4.1/5 op Trustpilot</span>
        </div>

        <h1 className={styles.title}>
          <span className={styles.line1}>WordPress</span>
          <span className={styles.line2}>Monitoring Platform</span>
        </h1>
        
        <p className={styles.subtitle}>
          Monitor uptime, performance en security van al je WordPress sites. 
          Speciaal gebouwd voor agencies en freelancers.
        </p>
        
        <div className={styles.ctaGroup}>
          <Link href="/register" className={styles.cta}>
            Gratis starten
            <ArrowRight size={18} />
          </Link>
          <a href="#features" className={styles.ctaSecondary}>
            Bekijk features
          </a>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Geen creditcard nodig</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>5 sites gratis monitoren</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Setup in 2 minuten</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
