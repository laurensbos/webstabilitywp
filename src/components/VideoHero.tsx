"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Star, Zap, Shield, Clock, TrendingUp } from 'lucide-react';
import styles from './VideoHero.module.css';

export default function VideoHero() {
  return (
    <section className={styles.hero}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.gridPattern}></div>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
        
        {/* Floating particles */}
        <div className={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Badge */}
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.badgeDot}></span>
          Gebouwd voor WordPress agencies
        </motion.div>

        {/* Main Headline - Large gradient text like Upstash */}
        <motion.div
          className={styles.headlineWrapper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className={styles.headline}>
            <span className={styles.headlineWhite}>Monitor</span>
            <br />
            <span className={styles.headlineGradient}>Everywhere</span>
          </h1>
          
          {/* Background text effect like Upstash "Fast Anywhere" */}
          <div className={styles.backgroundText}>
            <span>UPTIME</span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Real-time uptime monitoring, performance tracking en SSL checks voor al je 
          WordPress sites. Eén dashboard, onbeperkt sites.
        </motion.p>

        {/* Stats bar like Upstash */}
        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.stat}>
            <span className={styles.statValue}>5min</span>
            <span className={styles.statLabel}>Check Interval</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValue}>24/7</span>
            <span className={styles.statLabel}>Monitoring</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValue}>&lt;1s</span>
            <span className={styles.statLabel}>Alert Delay</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValueGreen}>{'>'}99.9%</span>
            <span className={styles.statLabel}>Uptime</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/register" className={styles.primaryCta}>
            Start gratis trial
            <ArrowRight size={18} />
          </Link>
          <button className={styles.secondaryCta}>
            <Play size={16} />
            Bekijk demo (2 min)
          </button>
        </motion.div>

        {/* Trustpilot */}
        <motion.a
          href="https://www.trustpilot.com/review/webstability.nl"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.trustpilot}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className={styles.stars}>
            {[1, 2, 3, 4].map(i => (
              <Star key={i} size={14} fill="#00e599" color="#00e599" />
            ))}
            <Star size={14} fill="transparent" color="#00e599" style={{ opacity: 0.5 }} />
          </div>
          <span>4.1/5 op Trustpilot</span>
        </motion.a>

        {/* Feature Cards Grid - Upstash style */}
        <motion.div
          className={styles.cardsGrid}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {/* Card 1 - Large */}
          <div className={`${styles.card} ${styles.cardLarge}`}>
            <div className={styles.cardHeader}>
              <h3>Real-time Dashboard</h3>
              <span className={styles.cardArrow}>↗</span>
            </div>
            <p>Monitor al je WordPress sites in één overzichtelijk dashboard. Instant notificaties bij downtime.</p>
            
            {/* Mini dashboard preview */}
            <div className={styles.miniDashboard}>
              <div className={styles.miniHeader}>
                <div className={styles.miniDots}>
                  <span></span><span></span><span></span>
                </div>
                <span className={styles.miniUrl}>app.webstability.nl</span>
              </div>
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatValue}>47</span>
                  <span className={styles.miniStatLabel}>SITES</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatValue}>99.7%</span>
                  <span className={styles.miniStatLabel}>UPTIME</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatValue}>1</span>
                  <span className={styles.miniStatLabel}>DOWN</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatValue}>2</span>
                  <span className={styles.miniStatLabel}>WARNINGS</span>
                </div>
              </div>
              <div className={styles.miniTable}>
                <div className={styles.miniRow}>
                  <span className={styles.miniRowStatus}>✓</span>
                  <span className={styles.miniRowSite}>bakkerij-jansen.nl</span>
                  <span className={styles.miniRowUptime}>99.9%</span>
                  <span className={styles.miniRowSpeed}>1.2s</span>
                  <span className={styles.miniRowScore} style={{ background: '#22c55e' }}>94</span>
                </div>
                <div className={styles.miniRow}>
                  <span className={styles.miniRowStatus}>✓</span>
                  <span className={styles.miniRowSite}>advocaat-devries.nl</span>
                  <span className={styles.miniRowUptime}>99.8%</span>
                  <span className={styles.miniRowSpeed}>0.9s</span>
                  <span className={styles.miniRowScore} style={{ background: '#22c55e' }}>98</span>
                </div>
                <div className={styles.miniRow}>
                  <span className={styles.miniRowStatus} style={{ color: '#fbbf24' }}>⚠</span>
                  <span className={styles.miniRowSite}>restaurant-luigi.nl</span>
                  <span className={styles.miniRowUptime}>99.5%</span>
                  <span className={styles.miniRowSpeed}>2.8s</span>
                  <span className={styles.miniRowScore} style={{ background: '#fbbf24' }}>72</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Zap size={24} />
            </div>
            <h3>Instant Alerts</h3>
            <p>Krijg direct een email als een site down gaat. Gemiddelde alert tijd onder 1 seconde.</p>
            
            {/* Alert animation */}
            <div className={styles.alertDemo}>
              <motion.div
                className={styles.alertPulse}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={styles.alertBadge}>
                <span>🔴</span> Site down gedetecteerd
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Shield size={24} />
            </div>
            <h3>SSL Monitoring</h3>
            <p>Automatische waarschuwingen voordat je SSL certificaat verloopt. Nooit meer onverwachte problemen.</p>
            
            {/* SSL indicator */}
            <div className={styles.sslDemo}>
              <div className={styles.sslLock}>🔒</div>
              <div className={styles.sslInfo}>
                <span className={styles.sslValid}>Geldig tot 15 maart 2026</span>
                <span className={styles.sslDays}>nog 74 dagen</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <TrendingUp size={24} />
            </div>
            <h3>Performance Tracking</h3>
            <p>Houd laadtijden en Core Web Vitals bij. Zie trends en optimaliseer proactief.</p>
            
            {/* Mini chart */}
            <div className={styles.chartDemo}>
              <svg viewBox="0 0 200 60" className={styles.miniChart}>
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00e599" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00e599" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 Q20,35 40,30 T80,25 T120,20 T160,15 T200,10"
                  fill="none"
                  stroke="#00e599"
                  strokeWidth="2"
                />
                <path
                  d="M0,40 Q20,35 40,30 T80,25 T120,20 T160,15 T200,10 V60 H0 Z"
                  fill="url(#chartGradient)"
                />
              </svg>
              <div className={styles.chartLabel}>
                <span className={styles.chartValue}>847ms</span>
                <span className={styles.chartTrend}>↓ 12%</span>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Clock size={24} />
            </div>
            <h3>Uptime History</h3>
            <p>Volledige historie van alle checks. Bewijs je betrouwbaarheid aan klanten met uptime rapporten.</p>
            
            {/* Uptime bars */}
            <div className={styles.uptimeBars}>
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={styles.uptimeBar}
                  style={{
                    background: Math.random() > 0.05 ? '#00e599' : '#ef4444',
                  }}
                />
              ))}
            </div>
            <span className={styles.uptimeLabel}>99.7% uptime - laatste 30 dagen</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
