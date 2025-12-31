import { motion } from 'framer-motion'
import { Clock, AlertTriangle, TrendingDown, Frown } from 'lucide-react'
import styles from './PainPoints.module.css'

const PainPoints = () => {
  const pains = [
    {
      icon: Clock,
      title: 'Plugin updates die je mist',
      description: 'WordPress plugins updaten zichzelf niet. En die ene vulnerability? Die ontdek je pas als het te laat is.',
    },
    {
      icon: AlertTriangle,
      title: '"Mijn site is down!"',
      description: 'Je client belt in paniek. De site is al 3 uur offline. Jij wist van niks.',
    },
    {
      icon: TrendingDown,
      title: 'Trage sites zonder dat je het weet',
      description: 'Core Web Vitals in het rood. Google rankings dalen. Maar niemand checkt het.',
    },
    {
      icon: Frown,
      title: 'SSL certificaten die verlopen',
      description: '"Niet veilig" in de browser. Bezoekers haken af. Jij krijgt de schuld.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            WordPress beheren is chaos
          </h2>
          <p className={styles.subtitle}>
            Je hebt 20, 50, misschien 100 WordPress sites. En geen idee of ze allemaal veilig en snel zijn.
          </p>
        </motion.div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pains.map((pain, i) => (
            <motion.div key={i} className={styles.card} variants={itemVariants}>
              <div className={styles.iconWrap}>
                <pain.icon size={24} />
              </div>
              <h3 className={styles.cardTitle}>{pain.title}</h3>
              <p className={styles.cardDesc}>{pain.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className={styles.transition}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p>
            <span className={styles.highlight}>Dit hoeft niet.</span> Met Webstability monitor je alles automatisch.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default PainPoints
