import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, TrendingUp, Euro } from 'lucide-react'
import styles from './ROICalculator.module.css'

const ROICalculator = () => {
  const [sites, setSites] = useState(25)
  const [hourlyRate, setHourlyRate] = useState(75)
  const [minutesPerSite, setMinutesPerSite] = useState(15)

  // Calculations
  const hoursPerMonth = (sites * minutesPerSite * 4) / 60 // Weekly check * 4 weeks
  const costManual = hoursPerMonth * hourlyRate
  const webstabilityCost = sites <= 10 ? 49 : sites <= 50 ? 149 : 399
  const savings = costManual - webstabilityCost
  const roi = ((savings / webstabilityCost) * 100).toFixed(0)

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            <span className={styles.gradient}>Bereken</span> je ROI
          </h2>
          <p className={styles.subtitle}>
            Hoeveel tijd en geld bespaar jij met automatische monitoring?
          </p>
        </motion.div>

        <motion.div 
          className={styles.calculator}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.inputs}>
            <div className={styles.inputGroup}>
              <label>Aantal client websites</label>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={sites}
                onChange={(e) => setSites(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.value}>{sites} sites</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Jouw uurtarief (intern)</label>
              <input 
                type="range" 
                min="25" 
                max="150" 
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.value}>€{hourlyRate}/uur</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Minuten per site check</label>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="5"
                value={minutesPerSite}
                onChange={(e) => setMinutesPerSite(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.value}>{minutesPerSite} min</span>
            </div>
          </div>

          <div className={styles.results}>
            <div className={styles.resultCard}>
              <Clock size={24} />
              <div className={styles.resultValue}>{hoursPerMonth.toFixed(1)} uur</div>
              <div className={styles.resultLabel}>Per maand bespaard</div>
            </div>
            
            <div className={styles.resultCard}>
              <Euro size={24} />
              <div className={styles.resultValue}>€{costManual.toFixed(0)}</div>
              <div className={styles.resultLabel}>Kosten handmatig</div>
            </div>
            
            <div className={styles.resultCard + ' ' + styles.highlight}>
              <TrendingUp size={24} />
              <div className={styles.resultValue}>€{savings > 0 ? savings.toFixed(0) : 0}</div>
              <div className={styles.resultLabel}>Je bespaart per maand</div>
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Webstability kost:</span>
              <span>€{webstabilityCost}/maand</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Handmatig kost:</span>
              <span>€{costManual.toFixed(0)}/maand</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>ROI:</span>
              <span className={styles.roiValue}>{roi}%</span>
            </div>
          </div>

          <a href="#pricing" className={styles.cta}>
            Start met besparen
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default ROICalculator
