import { motion } from 'framer-motion'
import { Gauge, Shield, Bell, Clock, Activity, Zap } from 'lucide-react'
import styles from './Features.module.css'

const Features = () => {
  const features = [
    {
      icon: Activity,
      title: 'Uptime Monitoring',
      description: 'Elke 5 minuten controleren we of je sites online zijn. Bij downtime weet je het binnen seconden.',
    },
    {
      icon: Gauge,
      title: 'Performance Tracking',
      description: 'Response times en laadsnelheden bijhouden. Zie precies hoe snel je WordPress sites laden.',
    },
    {
      icon: Shield,
      title: 'SSL Certificaten',
      description: 'Automatische controle op SSL certificaten. Waarschuwingen 30, 14, 7 en 1 dag voor expiratie.',
    },
    {
      icon: Bell,
      title: 'Directe Alerts',
      description: 'E-mail notificaties zodra er iets misgaat. Je weet het eerder dan je klant.',
    },
    {
      icon: Clock,
      title: 'Uptime Historie',
      description: 'Bekijk de complete geschiedenis van elke site. 24 uur, 7 dagen of 30 dagen terugkijken.',
    },
    {
      icon: Zap,
      title: 'Simpel Dashboard',
      description: 'Eén overzicht voor al je sites. Geen complexe setup, direct aan de slag.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            <span className={styles.gradient}>Alles</span> wat je nodig hebt
          </h2>
          <p className={styles.subtitle}>
            Geen overbodige features. Alleen wat écht belangrijk is voor WordPress monitoring.
          </p>
        </motion.div>
        
        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div key={i} className={styles.card} variants={itemVariants}>
              <div className={styles.iconWrap}>
                <feature.icon size={24} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
