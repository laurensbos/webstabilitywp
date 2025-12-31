import { Check, X } from 'lucide-react'
import styles from './Comparison.module.css'

const comparisons = [
  { feature: 'Automatische monitoring', manual: false, webstability: true },
  { feature: 'Realtime alerts', manual: false, webstability: true },
  { feature: 'Performance tracking', manual: false, webstability: true },
  { feature: 'SEO monitoring', manual: false, webstability: true },
  { feature: 'White-label rapporten', manual: false, webstability: true },
  { feature: 'Schaalbaar naar 100+ sites', manual: false, webstability: true },
  { feature: 'Tijdsinvestering per week', manual: '10+ uur', webstability: '< 30 min' },
]

export default function Comparison() {
  return (
    <section className={styles.comparison}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Handmatig vs <span className={styles.gradient}>Webstability</span>
          </h2>
          <p className={styles.subtitle}>Bespaar uren per week met geautomatiseerde monitoring</p>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.featureCol}>Feature</div>
            <div className={styles.manualCol}>Handmatig</div>
            <div className={styles.wsCol}>Webstability</div>
          </div>

          {comparisons.map((row, index) => (
            <div key={index} className={styles.tableRow}>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
