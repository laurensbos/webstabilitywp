import { motion } from 'framer-motion'
import { Shield, Lock, Server, Zap } from 'lucide-react'
import styles from './TrustBadges.module.css'

const TrustBadges = () => {
  const badges = [
    { icon: Shield, label: 'GDPR Compliant' },
    { icon: Lock, label: 'SSL Encrypted' },
    { icon: Server, label: 'EU Data Centers' },
    { icon: Zap, label: '< 1 min Alert Time' },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.badges}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {badges.map((badge, i) => (
            <div key={i} className={styles.badge}>
              <badge.icon size={20} />
              <span>{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TrustBadges
