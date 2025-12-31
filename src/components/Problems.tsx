import styles from './Problems.module.css'

const Problems = () => {
  const problems = [
    {
      icon: '⚠️',
      title: 'Website down',
      stat: '€500',
      statLabel: 'per uur omzetverlies',
    },
    {
      icon: '🐌',
      title: 'Traag laden',
      stat: '53%',
      statLabel: 'verlaat na 3 sec',
    },
    {
      icon: '🔒',
      title: 'SSL verlopen',
      stat: '-40%',
      statLabel: 'vertrouwen',
    },
    {
      icon: '📉',
      title: 'SEO issues',
      stat: '-30%',
      statLabel: 'organisch verkeer',
    },
  ]

  return (
    <section className={styles.problems}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>Waarom monitoring?</span>
          <h2 className={styles.title}>
            Problemen ontdek je meestal<br />
            <span className={styles.titleAccent}>te laat</span>
          </h2>
        </div>
        
        <div className={styles.grid}>
          {problems.map((problem, i) => (
            <div key={i} className={styles.card}>
              <span className={styles.icon}>{problem.icon}</span>
              <h3 className={styles.cardTitle}>{problem.title}</h3>
              <div className={styles.stat}>{problem.stat}</div>
              <p className={styles.statLabel}>{problem.statLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Problems
