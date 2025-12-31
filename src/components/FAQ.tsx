import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import styles from './FAQ.module.css'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  
  const faqs = [
    {
      q: 'Werkt dit alleen met WordPress?',
      a: 'Nee! webstability werkt met elke website. Maar we zijn geoptimaliseerd voor WordPress agencies die veel sites beheren.',
    },
    {
      q: 'Moet ik een plugin installeren?',
      a: 'Nee. We monitoren extern via URL. Geen plugins, geen code, geen toegang tot je sites nodig.',
    },
    {
      q: 'Wat is het verschil met ManageWP?',
      a: 'ManageWP rekent per site (€2/site). Wij rekenen een flat fee voor onbeperkt sites. Bij 25+ sites ben je goedkoper uit.',
    },
    {
      q: 'Hoe snel krijg ik alerts?',
      a: 'Uptime checks draaien elke 5 minuten. Bij downtime krijg je binnen 1 minuut een alert via email of Slack.',
    },
    {
      q: 'Kan ik rapporten naar clients sturen?',
      a: 'Ja! Genereer white-label PDF rapporten met jouw logo. Perfect voor maandelijkse client updates.',
    },
    {
      q: 'Is er een free trial?',
      a: 'Beter: een gratis plan. Monitor 3 sites gratis, voor altijd. Upgrade wanneer je wilt.',
    },
  ]

  return (
    <section className={styles.faq} id="faq">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            <span className={styles.gradient}>Vragen?</span> Wij hebben antwoorden
          </h2>
        </motion.div>
        
        <motion.div 
          className={styles.list}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {faqs.map((faq, i) => (
            <div key={i} className={`${styles.item} ${openIndex === i ? styles.open : ''}`}>
              <button className={styles.question} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                {faq.q}
                <ChevronDown size={20} className={styles.icon} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    className={styles.answer}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
