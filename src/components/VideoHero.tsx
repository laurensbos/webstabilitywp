import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import styles from './VideoHero.module.css'
import DashboardPreview from './DashboardPreview'

const VideoHero = () => {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <section className={styles.hero}>
      {/* Animated background elements */}
      <div className={styles.backgroundEffects}>
        <motion.div 
          className={styles.glowOrb1}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.glowOrb2}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className={styles.floatingShape1}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.floatingShape2}
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.badge}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.span 
            className={styles.badgeDot}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Gebouwd voor WordPress agencies
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.span 
            className={styles.line1}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Al je WordPress sites
          </motion.span>
          <motion.span 
            className={styles.line2}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            in één dashboard
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Uptime, performance, SSL en security voor al je client sites. 
          Eén prijs, onbeperkt sites. Geen gedoe met plugins.
        </motion.p>
        
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/register" className={styles.cta}>
              Start gratis trial
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </motion.div>
          <motion.button 
            className={styles.videoBtn} 
            onClick={() => setVideoOpen(true)}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className={styles.playIcon}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play size={18} fill="currentColor" />
            </motion.span>
            Bekijk demo (2 min)
          </motion.button>
        </motion.div>

        {/* Trustpilot Badge */}
        <motion.div 
          className={styles.trustpilot}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.a 
            href="https://www.trustpilot.com/review/webstability.nl" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.trustpilotLink}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className={styles.trustpilotStars}>
              {[1,2,3,4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <Star size={18} fill="#00e599" color="#00e599" />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <Star size={18} fill="none" color="#00e599" strokeWidth={1.5} />
              </motion.div>
            </div>
            <span className={styles.trustpilotScore}>4.1/5 op Trustpilot</span>
            <ExternalLink size={14} />
          </motion.a>
        </motion.div>

        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <motion.div 
          className={styles.modal} 
          onClick={() => setVideoOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <button className={styles.modalClose} onClick={() => setVideoOpen(false)}>×</button>
            <div className={styles.videoPlaceholder}>
              <Play size={64} />
              <p>Product Demo Video</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

export default VideoHero
