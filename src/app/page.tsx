'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Globe,
  ArrowUpRight,
  Play,
  Zap
} from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import { PricingSection, FAQSection } from '@/components/sections';
import { features } from '@/data';
import styles from './page.module.css';

export default function HomePage() {
  // Initialize scroll reveal for all .reveal elements
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <Background />
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span className={styles.badgeTextFull}>Nu met AI-powered anomaly detection</span>
            <span className={styles.badgeTextShort}>Nieuw: AI-detectie</span>
          </div>
          <h1 className={styles.heroTitle}>
            Website monitoring <span className={styles.heroGradient}>die echt werkt</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Detecteer downtime binnen 30 seconden. Ontvang instant alerts via 
            Slack, Email of SMS. Trusted by 500+ Nederlandse bedrijven.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/register" className={styles.primaryCta}>
              Gratis starten
              <ArrowRight size={18} />
            </Link>
            <Link href="#features" className={styles.secondaryCta}>
              <Play size={16} />
              Bekijk demo
            </Link>
          </div>
          <div className={styles.heroTrust}>
            <div className={styles.trustItem}>
              <Check size={16} />
              <span>Geen creditcard nodig</span>
            </div>
            <div className={styles.trustItem}>
              <Check size={16} />
              <span>2 sites gratis</span>
            </div>
            <div className={styles.trustItem}>
              <Check size={16} />
              <span>Setup in 2 minuten</span>
            </div>
          </div>
        </div>
        
        {/* Hero Dashboard Preview */}
        <div className={styles.heroPreview}>
          <div className={styles.dashboardMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span></span><span></span><span></span>
              </div>
              <span className={styles.mockupUrl}>dashboard.webstability.nl</span>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.mockupSidebar}>
                <div className={styles.mockupLogo}>⚡</div>
                <div className={styles.mockupNav}></div>
                <div className={styles.mockupNav}></div>
                <div className={styles.mockupNav}></div>
              </div>
              <div className={styles.mockupMain}>
                <div className={styles.mockupStats}>
                  <div className={styles.mockupStatCard}>
                    <TrendingUp size={16} className={styles.mockupStatIcon} />
                    <span className={styles.mockupStatValue}>99.98%</span>
                    <span className={styles.mockupStatLabel}>Uptime</span>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <Zap size={16} className={styles.mockupStatIcon} />
                    <span className={styles.mockupStatValue}>127ms</span>
                    <span className={styles.mockupStatLabel}>Avg Response</span>
                  </div>
                  <div className={styles.mockupStatCard}>
                    <Globe size={16} className={styles.mockupStatIcon} />
                    <span className={styles.mockupStatValue}>12</span>
                    <span className={styles.mockupStatLabel}>Sites</span>
                  </div>
                </div>
                <div className={styles.mockupChart}>
                  <div className={styles.chartBars}>
                    {[85, 92, 78, 95, 88, 91, 97, 89, 94, 96, 93, 99].map((h, i) => (
                      <div key={i} className={styles.chartBar} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className={styles.mockupSites}>
                  <div className={styles.mockupSite}>
                    <span className={styles.siteStatus}></span>
                    <span>webshop.nl</span>
                    <span className={styles.siteUptime}>99.99%</span>
                  </div>
                  <div className={styles.mockupSite}>
                    <span className={styles.siteStatus}></span>
                    <span>api.webshop.nl</span>
                    <span className={styles.siteUptime}>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <div className={styles.floatingCard} style={{ top: '10%', right: '-5%' }}>
            <CheckCircle size={20} className={styles.floatingIcon} />
            <div>
              <span className={styles.floatingTitle}>Site is online</span>
              <span className={styles.floatingSubtitle}>webshop.nl • 23ms</span>
            </div>
          </div>
          <div className={styles.floatingCard} style={{ bottom: '15%', left: '-5%' }}>
            <Shield size={20} className={styles.floatingIconBlue} />
            <div>
              <span className={styles.floatingTitle}>SSL Geldig</span>
              <span className={styles.floatingSubtitle}>Verloopt over 89 dagen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className={styles.trustedBy}>
        <div className={styles.sectionContainer}>
          <p className={styles.trustedByText}>Vertrouwd door groeiende Nederlandse bedrijven</p>
          <div className={styles.trustedLogosWrapper}>
            <div className={styles.trustedLogosTrack}>
              <div className={styles.trustedLogo}>TechStartup</div>
              <div className={styles.trustedLogo}>WebAgency</div>
              <div className={styles.trustedLogo}>E-commerce.nl</div>
              <div className={styles.trustedLogo}>SaaS Platform</div>
              <div className={styles.trustedLogo}>Digital Studio</div>
              {/* Duplicate for seamless loop */}
              <div className={styles.trustedLogo}>TechStartup</div>
              <div className={styles.trustedLogo}>WebAgency</div>
              <div className={styles.trustedLogo}>E-commerce.nl</div>
              <div className={styles.trustedLogo}>SaaS Platform</div>
              <div className={styles.trustedLogo}>Digital Studio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.sectionHeader} reveal`}>
            <h2 className={styles.sectionTitle}>
              Alles wat je <span className={styles.sectionGradient}>nodig hebt</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Complete monitoring toolkit voor moderne websites
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              return (
                <div key={index} className={`${styles.featureCard} reveal stagger-${index + 1}`}>
                  <div className={styles.featureContent}>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <div className={styles.featureVisual}>
                    {/* Uptime - Heartbeat line */}
                    {index === 0 && (
                      <svg className={styles.heartbeatSvg} viewBox="0 0 200 60" preserveAspectRatio="none">
                        <polyline 
                          points="0,30 40,30 50,10 60,50 70,20 80,40 90,30 200,30" 
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {/* Performance - Speed indicator */}
                    {index === 1 && (
                      <div className={styles.speedVisual}>
                        <svg className={styles.speedGauge} viewBox="0 0 60 36">
                          <path d="M6,32 A24,24 0 0,1 54,32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" strokeLinecap="round"/>
                          <path d="M6,32 A24,24 0 0,1 48,14" fill="none" stroke="url(#speedGrad)" strokeWidth="5" strokeLinecap="round"/>
                          <defs>
                            <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#6366f1"/>
                              <stop offset="100%" stopColor="#06b6d4"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className={styles.speedLabel}>127ms</span>
                      </div>
                    )}
                    {/* SSL - Simple lock icon */}
                    {index === 2 && (
                      <div className={styles.shieldVisual}>
                        <svg className={styles.shieldSvg} viewBox="0 0 40 48">
                          <rect x="4" y="20" width="32" height="24" rx="4" fill="#6366f1"/>
                          <path d="M10,20 L10,14 A10,10 0 0,1 30,14 L30,20" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"/>
                          <circle cx="20" cy="32" r="4" fill="#0a0a0a"/>
                          <line x1="20" y1="34" x2="20" y2="38" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <div className={styles.shieldBadge}>
                          <span>89</span>
                          <small>dagen geldig</small>
                        </div>
                      </div>
                    )}
                    {/* Alerts - Notification bell */}
                    {index === 3 && (
                      <div className={styles.bellVisual}>
                        <svg className={styles.bellSvg} viewBox="0 0 80 80">
                          <path d="M40,10 C25,10 20,25 20,40 L20,50 L15,55 L15,60 L65,60 L65,55 L60,50 L60,40 C60,25 55,10 40,10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2"/>
                          <circle cx="40" cy="68" r="6" fill="#ef4444"/>
                          <circle cx="55" cy="18" r="8" fill="#ef4444"/>
                          <text x="55" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
                        </svg>
                        <span className={styles.alertText}>Site down gedetecteerd</span>
                      </div>
                    )}
                    {/* Reports - Bar chart */}
                    {index === 4 && (
                      <div className={styles.chartVisual}>
                        <svg className={styles.barChart} viewBox="0 0 200 80" preserveAspectRatio="none">
                          <rect x="10" y="30" width="20" height="50" rx="4" fill="rgba(34,197,94,0.3)"/>
                          <rect x="40" y="15" width="20" height="65" rx="4" fill="rgba(34,197,94,0.5)"/>
                          <rect x="70" y="40" width="20" height="40" rx="4" fill="rgba(34,197,94,0.3)"/>
                          <rect x="100" y="10" width="20" height="70" rx="4" fill="#6366f1"/>
                          <rect x="130" y="25" width="20" height="55" rx="4" fill="rgba(34,197,94,0.5)"/>
                          <rect x="160" y="20" width="20" height="60" rx="4" fill="rgba(34,197,94,0.4)"/>
                        </svg>
                      </div>
                    )}
                    {/* Multi-location - Globe dots */}
                    {index === 5 && (
                      <div className={styles.globeVisual}>
                        <div className={styles.globeDot} style={{left: '15%', top: '30%'}}>
                          <span>EU</span>
                        </div>
                        <div className={styles.globeDot} style={{left: '45%', top: '50%'}}>
                          <span>US</span>
                        </div>
                        <div className={styles.globeDot} style={{left: '75%', top: '35%'}}>
                          <span>AS</span>
                        </div>
                        <svg className={styles.globeLines} viewBox="0 0 200 80">
                          <line x1="35" y1="35" x2="95" y2="55" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="4,4"/>
                          <line x1="105" y1="55" x2="155" y2="40" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeDasharray="4,4"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.sectionHeader} reveal`}>
            <h2 className={styles.sectionTitle}>
              Start in <span className={styles.sectionGradient}>3 simpele stappen</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Van aanmelden tot volledig operationeel in minder dan 5 minuten
            </p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={`${styles.step} reveal stagger-1`}>
              <div className={styles.stepIllustration}>
                <div className={styles.browserFrame}>
                  <div className={styles.browserDots}><span></span><span></span><span></span></div>
                  <div className={styles.browserContent}>
                    <div className={styles.addSiteForm}>
                      <div className={styles.inputField}>
                        <span className={styles.inputIcon}></span>
                        <span className={styles.inputText}>jouwwebsite.nl</span>
                        <span className={styles.inputCursor}></span>
                      </div>
                      <div className={styles.addButton}></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Voeg je site toe</h3>
              <p>Vul de URL in en kies je monitoring instellingen. Klaar in 30 seconden.</p>
            </div>
            <div className={styles.stepConnector}>
              <svg viewBox="0 0 100 20" fill="none" preserveAspectRatio="none">
                <path d="M0 10 H100" stroke="url(#stepGradient)" strokeWidth="2" strokeDasharray="6 4" />
                <defs>
                  <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={`${styles.step} reveal stagger-2`}>
              <div className={styles.stepIllustration}>
                <div className={styles.notificationStack}>
                  <div className={styles.notification} style={{ transform: 'rotate(-3deg) translateY(0)' }}>
                    <div className={styles.notifIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}></div>
                    <div className={styles.notifLines}><span></span><span></span></div>
                  </div>
                  <div className={styles.notification} style={{ transform: 'rotate(2deg) translateY(-8px)' }}>
                    <div className={styles.notifIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}></div>
                    <div className={styles.notifLines}><span></span><span></span></div>
                  </div>
                  <div className={styles.notification} style={{ transform: 'rotate(-1deg) translateY(-16px)' }}>
                    <div className={styles.notifIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}></div>
                    <div className={styles.notifLines}><span></span><span></span></div>
                  </div>
                </div>
              </div>
              <h3>Configureer alerts</h3>
              <p>Kies hoe je gewaarschuwd wilt worden: Slack, Email, SMS of webhook.</p>
            </div>
            <div className={styles.stepConnector}>
              <svg viewBox="0 0 100 20" fill="none" preserveAspectRatio="none">
                <path d="M0 10 H100" stroke="url(#stepGradient2)" strokeWidth="2" strokeDasharray="6 4" />
                <defs>
                  <linearGradient id="stepGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={`${styles.step} reveal stagger-3`}>
              <div className={styles.stepIllustration}>
                <div className={styles.monitoringDashboard}>
                  <div className={styles.dashboardRow}>
                    <div className={styles.siteCard}>
                      <div className={styles.siteCardHeader}>
                        <span className={styles.siteCardDot}></span>
                        <span className={styles.siteCardName}>webshop.nl</span>
                      </div>
                      <div className={styles.siteCardStats}>
                        <span className={styles.siteCardUptime}>99.9%</span>
                        <span className={styles.siteCardMs}>45ms</span>
                      </div>
                    </div>
                    <div className={styles.siteCard}>
                      <div className={styles.siteCardHeader}>
                        <span className={styles.siteCardDot}></span>
                        <span className={styles.siteCardName}>api.nl</span>
                      </div>
                      <div className={styles.siteCardStats}>
                        <span className={styles.siteCardUptime}>100%</span>
                        <span className={styles.siteCardMs}>23ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Wij doen de rest</h3>
              <p>24/7 monitoring vanuit meerdere locaties. Direct alert bij problemen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className={styles.integrations}>
        <div className={styles.sectionContainer}>
          <div className={styles.integrationsLayout}>
            <div className={`${styles.integrationsText} reveal-left`}>
              <h2 className={styles.sectionTitle}>
                Ontvang <span className={styles.alertGradient}>alerts</span><br />waar jij werkt
              </h2>
              <p className={styles.sectionSubtitle}>
                Naadloze integratie met je favoriete tools. Van Slack tot custom webhooks - jij bepaalt waar de alerts naartoe gaan.
              </p>
              <Link href="/docs" className={`${styles.integrationsLink} ${styles.integrationsLinkDesktop}`}>
                Bekijk alle integraties <ArrowRight size={16} />
              </Link>
            </div>
            <div className={`${styles.integrationsVisual} reveal-right`}>
              <div className={styles.integrationsWrapper}>
                <div className={styles.integrationsTrack}>
                  {/* First set */}
                  <div className={styles.integrationCard} data-brand="slack">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 54 54" width="32" height="32">
                        <path fill="#E01E5A" d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"/>
                        <path fill="#36C5F0" d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"/>
                        <path fill="#2EB67D" d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"/>
                        <path fill="#ECB22E" d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"/>
                      </svg>
                    </div>
                    <span>Slack</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="discord">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="#5865F2">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                      </svg>
                    </div>
                    <span>Discord</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="teams">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="#6264A7">
                        <path d="M20.625 8.5h-6.25a.625.625 0 0 0-.625.625v6.25c0 .345.28.625.625.625h6.25c.345 0 .625-.28.625-.625v-6.25a.625.625 0 0 0-.625-.625zM17.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-6.875.5H4.25a.625.625 0 0 0-.625.625v8.75c0 .345.28.625.625.625h6.375a.625.625 0 0 0 .625-.625v-8.75a.625.625 0 0 0-.625-.625zM7.5 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                    </div>
                    <span>Teams</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="email">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <span>Email</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="sms">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <span>SMS</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="webhook">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                    <span>Webhooks</span>
                  </div>
                  {/* Duplicate set for seamless loop */}
                  <div className={styles.integrationCard} data-brand="slack">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 54 54" width="32" height="32">
                        <path fill="#E01E5A" d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"/>
                        <path fill="#36C5F0" d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"/>
                        <path fill="#2EB67D" d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"/>
                        <path fill="#ECB22E" d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"/>
                      </svg>
                    </div>
                    <span>Slack</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="discord">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="#5865F2">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                      </svg>
                    </div>
                    <span>Discord</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="teams">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="#6264A7">
                        <path d="M20.625 8.5h-6.25a.625.625 0 0 0-.625.625v6.25c0 .345.28.625.625.625h6.25c.345 0 .625-.28.625-.625v-6.25a.625.625 0 0 0-.625-.625zM17.5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-6.875.5H4.25a.625.625 0 0 0-.625.625v8.75c0 .345.28.625.625.625h6.375a.625.625 0 0 0 .625-.625v-8.75a.625.625 0 0 0-.625-.625zM7.5 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                    </div>
                    <span>Teams</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="email">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <span>Email</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="sms">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <span>SMS</span>
                  </div>
                  <div className={styles.integrationCard} data-brand="webhook">
                    <div className={styles.integrationLogo}>
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                    <span>Webhooks</span>
                  </div>
                </div>
              </div>
              <Link href="/docs" className={`${styles.integrationsLink} ${styles.integrationsLinkMobile}`}>
                Bekijk alle integraties <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.sectionContainer}>
          <div className={`${styles.ctaCard} reveal-scale`}>
            <h2>Stop met <span className={styles.ctaGradient}>gokken</span></h2>
            <p>Weet altijd als eerste wanneer je website offline is. Start binnen 2 minuten, geen creditcard nodig.</p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className={styles.primaryCta}>
                Start gratis monitoring
                <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className={styles.secondaryCta}>
                Plan een demo
              </Link>
            </div>
            <div className={styles.ctaStats}>
              <div className={styles.ctaStat}>
                <CheckCircle size={20} />
                <span>5 websites gratis</span>
              </div>
              <div className={styles.ctaStat}>
                <Clock size={20} />
                <span>Setup in 2 minuten</span>
              </div>
              <div className={styles.ctaStat}>
                <Users size={20} />
                <span>500+ bedrijven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Sticky Mobile CTA */}
      <div className={styles.stickyMobileCta}>
        <Link href="/register" className={styles.stickyMobileCtaButton}>
          Gratis starten
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
