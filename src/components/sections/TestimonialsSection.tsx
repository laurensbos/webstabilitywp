import { Star, Lock, Shield, Server } from 'lucide-react';
import { testimonials as defaultTestimonials, type Testimonial } from '@/data';
import styles from './TestimonialsSection.module.css';

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  showTrustBadges?: boolean;
}

export function TestimonialsSection({ 
  testimonials = defaultTestimonials,
  showTrustBadges = true 
}: TestimonialsSectionProps) {
  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Testimonials</span>
          <h2 className={styles.title}>Wat klanten zeggen</h2>
          <p className={styles.subtitle}>
            Vertrouwd door 500+ bedrijven in Nederland en België
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.stars}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#6366f1" color="#6366f1" />
                ))}
              </div>
              <p className={styles.content}>"{testimonial.content}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.name}>{testimonial.name}</span>
                  <span className={styles.role}>{testimonial.role} bij {testimonial.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showTrustBadges && (
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Lock size={20} />
              <span>GDPR Compliant</span>
            </div>
            <div className={styles.trustBadge}>
              <Shield size={20} />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className={styles.trustBadge}>
              <Server size={20} />
              <span>EU Data Centers</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
