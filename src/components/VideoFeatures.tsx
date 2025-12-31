import { motion } from 'framer-motion'
import { Gauge, Search, Shield, Bell, FileText, Zap } from 'lucide-react'
import styles from './VideoFeatures.module.css'

const VideoFeatures = () => {
  const features = [
    {
      icon: Gauge,
      title: 'Performance Monitoring',
      description: 'Realtime Lighthouse scores, Core Web Vitals, en laadtijden. Weet precies hoe snel je client sites zijn.',
      video: 'performance', // placeholder for video ID
      stats: ['96+ Performance score', 'Core Web Vitals tracking', 'Historische data'],
    },
    {
      icon: Search,
      title: 'SEO Monitoring',
      description: 'Broken links, ontbrekende meta tags, indexering issues. Vind SEO problemen voordat ze rankings schaden.',
      video: 'seo',
      stats: ['404 detectie', 'Meta tag checks', 'Sitemap validatie'],
    },
    {
      icon: Shield,
      title: 'Security & SSL',
      description: 'SSL expiry alerts, security headers, malware detectie. Houd client sites veilig en vertrouwd.',
      video: 'security',
      stats: ['SSL monitoring', 'Security headers', 'Blacklist checks'],
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Email, Slack, of SMS notificaties wanneer iets kapot gaat. Mis nooit een kritiek probleem.',
      video: 'alerts',
      stats: ['Multi-channel', 'Custom triggers', 'Team notifications'],
    },
    {
      icon: FileText,
      title: 'White-label Reports',
      description: 'Gebrande PDF rapporten voor je clients. Toon waarde en rechtvaardig je retainer fees.',
      video: 'reports',
      stats: ['Custom branding', 'Scheduled delivery', 'Client portal'],
    },
    {
      icon: Zap,
      title: 'Uptime Monitoring',
      description: 'Checks elke minuut. Weet binnen seconden of een site down is. Voordat je client het merkt.',
      video: 'uptime',
      stats: ['1-min checks', '99.9% accuracy', 'Global nodes'],
    },
  ]

  return (
    <section className={styles.section} id="features">
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
            Eén platform voor complete website monitoring. Performance, SEO, security en uptime.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap}>
                  <feature.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
              </div>
              
              <p className={styles.cardDesc}>{feature.description}</p>
              
              {/* Video placeholder - replace with actual video */}
              <div className={styles.videoWrap}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.videoAnimation}>
                    <feature.icon size={32} />
                  </div>
                </div>
              </div>
              
              <ul className={styles.stats}>
                {feature.stats.map((stat, j) => (
                  <li key={j}>{stat}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default VideoFeatures
