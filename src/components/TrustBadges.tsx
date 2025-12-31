import { motion } from 'framer-motion'
import { Shield, Lock, Server, Award } from 'lucide-react'
import styles from './TrustBadges.module.css'

const TrustBadges = () => {
  const badges = [
    { icon: Shield, label: 'GDPR Compliant' },
    { icon: Lock, label: 'SSL Encrypted' },
    { icon: Server, label: '99.9% Uptime SLA' },
    { icon: Award, label: 'SOC 2 Type II' },
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
