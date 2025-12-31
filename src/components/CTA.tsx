import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import styles from './CTA.module.css'

const CTA = () => {
  return (
    <section className={styles.cta}>
      <div className={styles.glow} />
      <div className={styles.container}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Nooit meer handmatig <span className={styles.gradient}>checken</span>
        </motion.h2>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Voeg al je client sites toe in 2 minuten. De eerste scan start direct.
        </motion.p>
        
        <motion.a 
          href="#pricing" 
          className={styles.primary}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Start gratis trial <ArrowRight size={18} />
        </motion.a>
        
        <motion.div 
          className={styles.features}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Setup in 2 minuten</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Geen creditcard nodig</span>
          </div>
          <div className={styles.feature}>
            <Check size={16} strokeWidth={3} />
            <span>Cancel wanneer je wilt</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
