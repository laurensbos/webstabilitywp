"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Check, Star, Shield, Zap, BarChart3, Bell } from 'lucide-react';
import styles from './Register.module.css';

const features = [
  { icon: Shield, text: "Monitor tot 5 websites gratis" },
  { icon: Zap, text: "5-minuten uptime checks" },
  { icon: Bell, text: "Email alerts bij downtime" },
  { icon: BarChart3, text: "30 dagen uptime historie" },
];

const testimonials = [
  {
    quote: "Perfect understanding of my specific needs. Fast delivery!",
    author: "Ene Claudiu",
    rating: 5,
  },
  {
    quote: "Super snelle service en zeer professioneel. Aanrader!",
    author: "Kevin Steenbergen",
    rating: 5,
  },
  {
    quote: "Uitstekende communicatie en resultaat. Top kwaliteit.",
    author: "Mike de Kreek",
    rating: 4,
  },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Zwak', color: '#ef4444' };
    if (password.length < 8) return { strength: 2, label: 'Matig', color: '#f59e0b' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 4, label: 'Sterk', color: '#00e599' };
    }
    return { strength: 3, label: 'Goed', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registratie mislukt');
      } else {
        router.push('/verify?email=' + encodeURIComponent(email));
      }
    } catch {
      setError('Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.gradient}></div>
        <div className={styles.grid}></div>
        <motion.div 
          className={styles.floatingOrb1}
          animate={{ 
            y: [0, -40, 0],
            x: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.floatingOrb2}
          animate={{ 
            y: [0, 50, 0],
            x: [0, -40, 0],
            scale: [1, 0.85, 1],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.floatingOrb3}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className={styles.content}>
        {/* Form Section */}
        <motion.div 
          className={styles.formWrapper}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" className={styles.logo}>
                webstability
              </Link>
            </motion.div>
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Account aanmaken
            </motion.h1>
            <motion.p 
              className={styles.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Start gratis met het monitoren van je sites
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className={styles.form}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {error && (
                <motion.div 
                  className={styles.error}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.inputGroup}>
              <label htmlFor="name">Naam</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="name"
                  type="text"
                  placeholder="Jouw naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Wachtwoord</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password.length > 0 && (
                <motion.div 
                  className={styles.strengthWrapper}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={styles.strengthBar}
                        style={{
                          background: level <= passwordStrength.strength ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </motion.div>
              )}
            </div>

            <motion.button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <>
                  Gratis account aanmaken
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <p className={styles.terms}>
              Door je aan te melden ga je akkoord met onze{' '}
              <Link href="/terms">voorwaarden</Link> en{' '}
              <Link href="/privacy">privacybeleid</Link>.
            </p>
          </motion.form>

          <motion.p 
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Heb je al een account?{' '}
            <Link href="/login">Inloggen</Link>
          </motion.p>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          className={styles.sidePanel}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Features */}
          <div className={styles.featuresCard}>
            <h3>Wat je krijgt:</h3>
            <ul className={styles.featuresList}>
              {features.map((feature, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className={styles.featureIcon}>
                    <Check size={14} />
                  </div>
                  {feature.text}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Rotating mini testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              className={styles.miniTestimonial}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.miniStars}>
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#00e599" color="#00e599" />
                ))}
              </div>
              <p>"{testimonials[currentTestimonial].quote}"</p>
              <span className={styles.miniAuthor}>— {testimonials[currentTestimonial].author}</span>
            </motion.div>
          </AnimatePresence>

          {/* Trustpilot badge */}
          <motion.a 
            href="https://www.trustpilot.com/review/webstability.nl"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.trustpilot}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <span className={styles.trustpilotScore}>4.1</span>
            <div className={styles.trustpilotStars}>
              {[...Array(4)].map((_, i) => (
                <Star key={i} size={14} fill="#00e599" color="#00e599" />
              ))}
              <Star size={14} fill="none" color="#00e599" />
            </div>
            <span className={styles.trustpilotText}>5 reviews op Trustpilot</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
