import styles from './LogoBar.module.css'

const LogoBar = () => {
  return (
    <section className={styles.logoBar}>
      <div className={styles.container}>
        <p className={styles.label}>Werkt met elke WordPress hosting</p>
        <div className={styles.logos}>
          <span>Kinsta</span>
          <span>WP Engine</span>
          <span>Cloudways</span>
          <span>SiteGround</span>
          <span>Flywheel</span>
        </div>
      </div>
    </section>
  )
}

export default LogoBar
