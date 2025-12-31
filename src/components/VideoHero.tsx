"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Star, Zap, Shield, Clock, TrendingUp, Bell, Mail, MessageSquare } from 'lucide-react';
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

        {/* Main Headline - Nederlandse tekst */}
        <motion.div
          className={styles.headlineWrapper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className={styles.headline}>
            <span className={styles.headlineWhite}>Nooit meer</span>
            <br />
            <span className={styles.headlineGradient}>handmatig checken</span>
          </h1>
          
          {/* Background text effect */}
          <div className={styles.backgroundText}>
            <span>MONITORING</span>
          </div>
        </motion.div>

        {/* Subtitle - Korter en krachtiger */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Eén dashboard voor al je WordPress sites. 
          Weet direct als er iets misgaat.
        </motion.p>

        {/* Stats bar - Nederlandse labels */}
        <motion.div
          className={styles.statsBar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.stat}>
            <span className={styles.statValue}>5 min</span>
            <span className={styles.statLabel}>Check interval</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValue}>24/7</span>
            <span className={styles.statLabel}>Monitoring</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValue}>&lt;1s</span>
            <span className={styles.statLabel}>Alert snelheid</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.stat}>
            <span className={styles.statValueGreen}>99.9%</span>
            <span className={styles.statLabel}>Uptime garantie</span>
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
          {/* Card 1 - Large Dashboard */}
          <div className={`${styles.card} ${styles.cardLarge}`}>
            <div className={styles.cardHeader}>
              <h3>Real-time Dashboard</h3>
              <span className={styles.cardArrow}>↗</span>
            </div>
            <p>Alle WordPress sites van je klanten in één overzicht. Direct zien wat aandacht nodig heeft.</p>
            
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

          {/* Card 2 - Instant Alerts */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Zap size={24} />
            </div>
            <h3>Directe Alerts</h3>
            <p>Weet binnen seconden als een site down gaat. Via email, Slack of SMS.</p>
            
            <div className={styles.alertDemo}>
              <motion.div
                className={styles.alertPulse}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={styles.alertBadge}>
                <span>🔴</span> Site offline gedetecteerd
              </div>
            </div>
          </div>

          {/* Card 3 - SSL */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Shield size={24} />
            </div>
            <h3>SSL Monitoring</h3>
            <p>Nooit meer een verlopen certificaat. Waarschuwing 30, 14 en 7 dagen vooraf.</p>
            
            <div className={styles.sslDemo}>
              <div className={styles.sslLock}>🔒</div>
              <div className={styles.sslInfo}>
                <span className={styles.sslValid}>Geldig tot 15 maart 2026</span>
                <span className={styles.sslDays}>nog 74 dagen</span>
              </div>
            </div>
          </div>

          {/* Card 4 - Performance */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <TrendingUp size={24} />
            </div>
            <h3>Performance Trends</h3>
            <p>Zie laadtijden over tijd. Spot problemen voordat klanten klagen.</p>
            
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
                <span className={styles.chartTrend}>↓ 12% sneller</span>
              </div>
            </div>
          </div>

          {/* Card 5 - Uptime History */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Clock size={24} />
            </div>
            <h3>Uptime Rapporten</h3>
            <p>Bewijs je betrouwbaarheid. Deel rapporten met klanten.</p>
            
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
