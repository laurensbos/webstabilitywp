import { Gauge, Search, Shield, Bell, FileText, Users } from 'lucide-react'
import styles from './Features.module.css'

const Features = () => {
  const features = [
    {
      icon: Gauge,
      title: 'Performance Monitoring',
      description: 'Lighthouse scores, Core Web Vitals, and load times. Know exactly how fast your client sites are.',
    },
    {
      icon: Search,
      title: 'SEO Monitoring',
      description: 'Broken links, missing meta tags, indexing issues. Catch SEO problems before they hurt rankings.',
    },
    {
      icon: Shield,
      title: 'Security & SSL',
      description: 'SSL expiry alerts, security headers, malware detection. Keep client sites secure and trusted.',
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Email, Slack, or SMS notifications when something breaks. Never miss a critical issue.',
    },
    {
      icon: FileText,
      title: 'White-label Reports',
      description: 'Branded PDF reports for your clients. Show value and justify your retainer fees.',
    },
    {
      icon: Users,
      title: 'Unlimited Sites',
      description: 'Add all your client websites. No per-site fees. One dashboard for everything.',
    },
  ]

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.gradient}>Everything</span> you need
          </h2>
          <p className={styles.subtitle}>
            Monitor client websites at scale. One dashboard for performance, SEO, security and uptime.
          </p>
        </div>
        
        <div className={styles.grid}>
          {features.map((feature, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.iconWrap}>
                <feature.icon size={24} />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
