import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import styles from './Testimonials.module.css'

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Perfect understanding of my specific needs in a surprisingly short time, given the rather niched domain of my activity. Fast delivery. Very pleased with the result.",
      author: 'Ene Claudiu',
      role: 'Verified Trustpilot Review',
      rating: 5,
    },
    {
      quote: "Super snelle service en zeer professioneel. Binnen no-time was alles geregeld. Aanrader!",
      author: 'Kevin Steenbergen',
      role: 'Verified Trustpilot Review',
      rating: 5,
    },
    {
      quote: "Uitstekende communicatie en resultaat. Het team denkt echt met je mee en levert kwaliteit.",
      author: 'Mike de Kreek',
      role: 'Verified Trustpilot Review',
      rating: 4,
    },
    {
      quote: "Goede ervaring. Snelle responstijd en het dashboard is heel overzichtelijk.",
      author: 'Remco Meijers',
      role: 'Verified Trustpilot Review',
      rating: 4,
    },
    {
      quote: "Prima tool voor website monitoring. Werkt zoals verwacht en de alerts zijn snel.",
      author: 'Thomas V.',
      role: 'Verified Trustpilot Review',
      rating: 3,
    },
  ]

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.trustpilotBadge}>
            <div className={styles.trustpilotStars}>
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={20} fill="#00e599" color="#00e599" />
              ))}
              <Star size={20} fill="none" color="#00e599" />
            </div>
            <div className={styles.trustpilotInfo}>
              <span className={styles.trustpilotScore}>4.1 / 5</span>
              <span className={styles.trustpilotText}>op Trustpilot</span>
            </div>
            <a 
              href="https://www.trustpilot.com/review/webstability.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.trustpilotLink}
            >
              Bekijk reviews <ExternalLink size={14} />
            </a>
          </div>
          
          <h2 className={styles.title}>
            Wat klanten <span className={styles.gradient}>zeggen</span>
          </h2>
          <p className={styles.subtitle}>
            Echte reviews van echte klanten op Trustpilot
          </p>
        </motion.div>
        
        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, j) => (
                    <Star 
                      key={j} 
                      size={16} 
                      fill={j < t.rating ? "#00e599" : "none"} 
                      color="#00e599" 
                    />
                  ))}
                </div>
                <span className={styles.verifiedBadge}>
                  ✓ Geverifieerd
                </span>
              </div>
              <blockquote className={styles.quote}>"{t.quote}"</blockquote>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.author.charAt(0)}</div>
                <div>
                  <div className={styles.name}>{t.author}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className={styles.ctaSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a 
            href="https://www.trustpilot.com/evaluate/webstability.nl" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.writeReview}
          >
            Schrijf ook een review op Trustpilot
            <ExternalLink size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
