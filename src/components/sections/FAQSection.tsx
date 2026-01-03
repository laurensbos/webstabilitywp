'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { faqs as defaultFaqs, type FAQ } from '@/data';
import styles from './FAQSection.module.css';

interface FAQSectionProps {
  faqs?: FAQ[];
  showCta?: boolean;
  title?: string;
  subtitle?: string;
}

export function FAQSection({ 
  faqs = defaultFaqs, 
  showCta = true,
  title = 'Veelgestelde vragen',
  subtitle = 'Alles wat je wilt weten over webstability'
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={`${styles.header} reveal`}>
          <h2 className={styles.title}>Veelgestelde <span className={styles.titleGradient}>vragen</span></h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.faqGrid}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`${styles.faqItem} ${openFaq === idx ? styles.faqItemOpen : ''} reveal stagger-${idx + 1}`}
            >
              <button 
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{faq.question}</span>
                {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {showCta && (
          <div className={styles.faqCta}>
            <p>Heb je een andere vraag?</p>
            <Link href="/contact" className={styles.ctaLink}>
              Neem contact op
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
