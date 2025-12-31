import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Clock, Shield } from 'lucide-react'
import styles from './DashboardPreview.module.css'

const sites = [
  { name: 'bakkerij-jansen.nl', status: 'up', uptime: '99.9%', speed: '1.2s', score: 94 },
  { name: 'advocaat-devries.nl', status: 'up', uptime: '99.8%', speed: '0.9s', score: 98 },
  { name: 'restaurant-luigi.nl', status: 'warning', uptime: '99.5%', speed: '2.8s', score: 72 },
  { name: 'tandarts-smile.nl', status: 'up', uptime: '100%', speed: '1.1s', score: 96 },
  { name: 'yoga-studio-zen.nl', status: 'down', uptime: '98.2%', speed: '--', score: 0 },
]

const DashboardPreview = () => {
  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <div className={styles.dots}>
            <span className={styles.red} />
            <span className={styles.yellow} />
            <span className={styles.green} />
          </div>
          <div className={styles.url}>app.webstability.nl</div>
        </div>
        
        <div className={styles.content}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.logo}>ws</div>
            <div className={styles.navItem} data-active="true">
              <TrendingUp size={18} />
            </div>
            <div className={styles.navItem}>
              <Clock size={18} />
            </div>
            <div className={styles.navItem}>
              <Shield size={18} />
            </div>
          </div>
          
          {/* Main */}
          <div className={styles.main}>
            {/* Stats */}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>47</span>
                <span className={styles.statLabel}>Sites</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>99.7%</span>
                <span className={styles.statLabel}>Uptime</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>1</span>
                <span className={styles.statLabel}>Down</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>2</span>
                <span className={styles.statLabel}>Warnings</span>
              </div>
            </div>
            
            {/* Sites List */}
            <div className={styles.sitesList}>
              <div className={styles.listHeader}>
                <span>Site</span>
                <span>Uptime</span>
                <span>Speed</span>
                <span>Score</span>
              </div>
              {sites.map((site, i) => (
                <motion.div 
                  key={site.name}
                  className={styles.siteRow}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className={styles.siteName}>
                    {site.status === 'up' && <CheckCircle size={14} className={styles.iconUp} />}
                    {site.status === 'warning' && <AlertTriangle size={14} className={styles.iconWarning} />}
                    {site.status === 'down' && <XCircle size={14} className={styles.iconDown} />}
                    <span>{site.name}</span>
                  </div>
                  <span className={styles.uptime}>{site.uptime}</span>
                  <span className={styles.speed}>{site.speed}</span>
                  <div className={styles.scoreWrap}>
                    <div 
                      className={`${styles.score} ${site.score >= 90 ? styles.scoreGood : site.score >= 50 ? styles.scoreOk : styles.scoreBad}`}
                    >
                      {site.score || '--'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPreview
