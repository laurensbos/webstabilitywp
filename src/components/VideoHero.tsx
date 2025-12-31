import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useState } from 'react'
import styles from './VideoHero.module.css'
import DashboardPreview from './DashboardPreview'

const VideoHero = () => {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <motion.div 
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.badgeDot} />
          Gebouwd voor WordPress agencies
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className={styles.line1}>Al je WordPress sites</span>
          <span className={styles.line2}>in één dashboard</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Uptime, performance, SSL en security voor al je client sites. 
          Eén prijs, onbeperkt sites. Geen gedoe met plugins.
        </motion.p>
        
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a href="#pricing" className={styles.cta}>
            Start gratis trial
            <ArrowRight size={18} />
          </a>
          <button className={styles.videoBtn} onClick={() => setVideoOpen(true)}>
            <Play size={18} fill="currentColor" />
            Bekijk demo (2 min)
          </button>
        </motion.div>

        <motion.div 
          className={styles.stats}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={styles.stat}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Agencies</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>50k+</span>
            <span className={styles.statLabel}>Websites gemonitord</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>99.9%</span>
            <span className={styles.statLabel}>Uptime</span>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div className={styles.modal} onClick={() => setVideoOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setVideoOpen(false)}>×</button>
            <div className={styles.videoPlaceholder}>
              <Play size={64} />
              <p>Product Demo Video</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default VideoHero
