import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import styles from './FAQ.module.css'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  
  const faqs = [
    {
      q: 'Werkt dit alleen met WordPress sites?',
      a: 'Webstability werkt met elke website. Je voert simpelweg de URL in en wij beginnen met monitoren. Geen plugins of code nodig.',
    },
    {
      q: 'Hoe vaak worden mijn sites gecheckt?',
      a: 'Elke 5 minuten controleren we de uptime van al je sites. Bij downtime krijg je direct een e-mail alert.',
    },
    {
      q: 'Wat gebeurt er als mijn site offline gaat?',
      a: 'Je ontvangt binnen enkele minuten een e-mail met alle details: welke site, wanneer het begon, en de foutmelding. Zodra de site weer online is, krijg je ook daarvan bericht.',
    },
    {
      q: 'Krijg ik ook SSL certificaat waarschuwingen?',
      a: 'Ja! We controleren dagelijks alle SSL certificaten. Je krijgt waarschuwingen op 30, 14, 7, 3 en 1 dag voor expiratie.',
    },
    {
      q: 'Kan ik alerts uitzetten voor bepaalde sites?',
      a: 'Ja, in je dashboard kun je per site of globaal instellen welke alerts je wilt ontvangen.',
    },
    {
      q: 'Is er een gratis versie?',
      a: 'Je kunt Webstability gratis uitproberen. Maak een account aan en start direct met monitoren.',
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
            Veelgestelde <span className={styles.gradient}>vragen</span>
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
