import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import styles from './Pricing.module.css'

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      description: 'Probeer gratis met 3 sites',
      features: [
        'Tot 3 websites',
        'Dagelijkse scans',
        'Uptime monitoring',
        'Performance scores',
        'Email alerts',
      ],
      popular: false,
    },
    {
      name: 'Agency',
      price: '49',
      description: 'Onbeperkt sites, flat fee',
      features: [
        'Onbeperkt websites',
        'Scans elk uur',
        'Uptime + Performance + SSL',
        'Slack & email alerts',
        'White-label rapporten',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '149',
      description: 'Voor grote agencies',
      features: [
        'Alles in Agency',
        'API toegang',
        'Custom branding',
        'Dedicated support',
        'SLA garantie (99.9%)',
        'Onboarding call',
      ],
      popular: false,
    },
  ]

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>
            Eén prijs, <span className={styles.gradient}>onbeperkt</span> sites
          </h2>
          <p className={styles.subtitle}>
            14 dagen gratis proberen. Geen creditcard nodig. Geen verborgen kosten per website.
          </p>
        </motion.div>
        
        <div className={styles.grid}>
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && <div className={styles.badge}>Meest gekozen</div>}
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.currency}>€</span>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>/maand</span>
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
              </div>
              
              <ul className={styles.features}>
                {plan.features.map((feature, j) => (
                  <li key={j}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`${styles.cta} ${plan.popular ? styles.ctaPrimary : ''}`}>
                Start gratis trial
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
        
        <motion.p 
          className={styles.guarantee}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          💰 30 dagen geld-terug-garantie. Geen vragen.
        </motion.p>
      </div>
    </section>
  )
}

export default Pricing
