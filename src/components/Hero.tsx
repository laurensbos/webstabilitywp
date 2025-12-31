import styles from './Hero.module.css'
import { ArrowRight, Check } from 'lucide-react'

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span className={styles.line1}>Website</span>
          <span className={styles.line2}>Monitoring Platform</span>
        </h1>
        
        <p className={styles.subtitle}>
          Monitor uptime, performance, SEO en security. Alles in één dashboard voor agencies.
        </p>
        
        <a href="#pricing" className={styles.cta}>
          Start gratis trial
          <ArrowRight size={18} />
        </a>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Geen creditcard nodig</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Setup in 2 minuten</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>14 dagen gratis</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
