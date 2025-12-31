import { motion } from 'framer-motion'
import { Check, X, Clock, Zap } from 'lucide-react'
import styles from './Comparison.module.css'

const comparisons = [
  { feature: 'Uptime monitoring 24/7', manual: false, webstability: true },
  { feature: 'Directe alerts bij downtime', manual: false, webstability: true },
  { feature: 'Performance & laadtijd tracking', manual: false, webstability: true },
  { feature: 'SSL certificaat checks', manual: false, webstability: true },
  { feature: 'Overzichtelijk dashboard', manual: false, webstability: true },
  { feature: 'Schaalbaar naar 100+ sites', manual: false, webstability: true },
  { feature: 'Tijdsinvestering per week', manual: '10+ uur', webstability: '< 30 min' },
]

export default function Comparison() {
  return (
    <section className={styles.comparison}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            Van <span className={styles.gradient}>10 uur</span> naar 30 minuten per week
          </h2>
          <p className={styles.subtitle}>
            Stop met handmatig checken. Laat Webstability het zware werk doen.
          </p>
        </motion.div>

        <motion.div 
          className={styles.table}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.tableHeader}>
            <div className={styles.featureCol}>Functie</div>
            <div className={styles.manualCol}>
              <Clock size={16} />
              Handmatig
            </div>
            <div className={styles.wsCol}>
              <Zap size={16} />
              Webstability
            </div>
          </div>

          {comparisons.map((row, index) => (
            <motion.div 
              key={index} 
              className={styles.tableRow}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={styles.featureCol}>{row.feature}</div>
              <div className={styles.manualCol}>
                {typeof row.manual === 'boolean' ? (
                  row.manual ? <Check className={styles.check} size={20} /> : <X className={styles.x} size={20} />
                ) : (
                  <span className={styles.manualText}>{row.manual}</span>
                )}
              </div>
              <div className={styles.wsCol}>
                {typeof row.webstability === 'boolean' ? (
                  row.webstability ? <Check className={styles.check} size={20} /> : <X className={styles.x} size={20} />
                ) : (
                  <span className={styles.wsText}>{row.webstability}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
