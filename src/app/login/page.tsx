"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Star, ExternalLink } from 'lucide-react';
import styles from './Login.module.css';

const testimonials = [
  {
    quote: "Perfect understanding of my specific needs in a surprisingly short time. Fast delivery. Very pleased with the result.",
    author: "Ene Claudiu",
    rating: 5,
  },
  {
    quote: "Super snelle service en zeer professioneel. Binnen no-time was alles geregeld. Aanrader!",
    author: "Kevin Steenbergen",
    rating: 5,
  },
  {
    quote: "Uitstekende communicatie en resultaat. Het team denkt echt met je mee en levert kwaliteit.",
    author: "Mike de Kreek",
    rating: 4,
  },
  {
    quote: "Goede ervaring. Snelle responstijd en het dashboard is heel overzichtelijk.",
    author: "Remco Meijers",
    rating: 4,
  },
];

export default function LoginPage() {
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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ongeldige email of wachtwoord. Probeer het opnieuw.');
      } else {
        router.push('/dashboard');
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
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.floatingOrb2}
          animate={{ 
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
              Welkom terug
            </motion.h1>
            <motion.p 
              className={styles.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Log in om je dashboard te bekijken
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
              <div className={styles.labelRow}>
                <label htmlFor="password">Wachtwoord</label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Vergeten?
                </Link>
              </div>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
                  Inloggen
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p 
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Nog geen account?{' '}
            <Link href="/register">Gratis aanmelden</Link>
          </motion.p>
        </motion.div>

        {/* Side Panel with Rotating Testimonials */}
        <motion.div 
          className={styles.sidePanel}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.testimonialWrapper}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className={styles.testimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < testimonials[currentTestimonial].rating ? "#00e599" : "none"} 
                      color="#00e599" 
                    />
                  ))}
                </div>
                <blockquote>
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {testimonials[currentTestimonial].author.charAt(0)}
                  </div>
                  <div>
                    <div className={styles.authorName}>{testimonials[currentTestimonial].author}</div>
                    <div className={styles.authorTitle}>Verified on Trustpilot</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className={styles.dots}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === currentTestimonial ? styles.activeDot : ''}`}
                  onClick={() => setCurrentTestimonial(i)}
                />
              ))}
            </div>
          </div>

          <motion.a 
            href="https://www.trustpilot.com/review/webstability.nl"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.trustpilot}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className={styles.trustpilotScore}>
              <span className={styles.score}>4.1</span>
              <div className={styles.trustpilotStars}>
                {[...Array(4)].map((_, i) => (
                  <Star key={i} size={16} fill="#00e599" color="#00e599" />
                ))}
                <Star size={16} fill="none" color="#00e599" />
              </div>
            </div>
            <span className={styles.trustpilotText}>5 reviews op Trustpilot</span>
            <ExternalLink size={14} className={styles.externalIcon} />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
