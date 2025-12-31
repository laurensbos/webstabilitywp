import { motion } from 'framer-motion'
import { Star, Play } from 'lucide-react'
import styles from './Testimonials.module.css'

const Testimonials = () => {
  const testimonials = [
    {
      quote: "We beheren 50+ client sites. Voor Webstability wisten we niet wanneer iets kapot ging. Nu vangen we issues op voordat clients het merken.",
      author: 'Mark de Vries',
      role: 'Agency Owner, DigitalFirst',
      hasVideo: true,
    },
    {
      quote: "De white-label rapporten zijn een game changer. Clients zien de waarde die we leveren, en het rechtvaardigt onze maandelijkse retainer.",
      author: 'Lisa van der Berg',
      role: 'Founder, WebCraft Studio',
      hasVideo: false,
    },
    {
      quote: "Setup duurde 5 minuten. Alle client sites toegevoegd en direct inzicht. De ROI was binnen de eerste week duidelijk.",
      author: 'Peter Bakker',
      role: 'CTO, GrowthAgency',
      hasVideo: false,
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
          <h2 className={styles.title}>
            Agencies <span className={styles.gradient}>vertrouwen</span> op ons
          </h2>
          <p className={styles.subtitle}>
            500+ agencies gebruiken Webstability voor hun client monitoring
          </p>
        </motion.div>
        
        {/* Video testimonial */}
        <motion.div 
          className={styles.videoTestimonial}
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
              <p>Video testimonial - Mark de Vries, DigitalFirst</p>
            </div>
          </div>
          <div className={styles.videoContent}>
            <blockquote>
              "Webstability bespaart ons 10 uur per week. We hadden geen idee hoe slecht sommige client sites presteerden. Nu hebben we volledige controle."
            </blockquote>
            <div className={styles.videoAuthor}>
              <div className={styles.avatar}>M</div>
              <div>
                <div className={styles.name}>Mark de Vries</div>
                <div className={styles.role}>Agency Owner, DigitalFirst • 50+ websites</div>
              </div>
            </div>
          </div>
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
              <div className={styles.stars}>
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
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
      </div>
    </section>
  )
}

export default Testimonials
