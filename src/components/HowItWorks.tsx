import { motion } from 'framer-motion'
import { Plus, Cpu, Mail, Play } from 'lucide-react'
import styles from './HowItWorks.module.css'

const HowItWorks = () => {
  const steps = [
    {
      icon: Plus,
      number: '01',
      title: 'Voeg je sites toe',
      description: 'Voer de URLs in van al je client websites. Geen code installatie nodig. Setup duurt 2 minuten.',
    },
    {
      icon: Cpu,
      number: '02',
      title: 'Wij monitoren 24/7',
      description: 'Automatische scans checken performance, uptime, SEO, en security. De klok rond.',
    },
    {
      icon: Mail,
      number: '03',
      title: 'Ontvang alerts & rapporten',
      description: 'Instant notificaties bij problemen. Wekelijkse of maandelijkse rapporten voor je clients.',
    },
  ]

  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            <span className={styles.gradient}>Zo</span> werkt het
          </h2>
          <p className={styles.subtitle}>
            Voeg je sites toe, wij doen de rest. Geen code installatie nodig.
          </p>
        </motion.div>
        
        {/* Video walkthrough */}
        <motion.div 
          className={styles.videoSection}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.videoWrap}>
            <div className={styles.videoPlaceholder}>
              <button className={styles.playBtn}>
                <Play size={32} fill="currentColor" />
              </button>
              <p>Bekijk de walkthrough (45 sec)</p>
            </div>
          </div>
        </motion.div>
        
        <div className={styles.grid}>
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className={styles.iconWrap}>
                <step.icon size={24} />
              </div>
              <div className={styles.number}>{step.number}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDesc}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
