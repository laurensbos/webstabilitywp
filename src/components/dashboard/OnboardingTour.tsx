'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Globe, Bell, Settings, ChevronRight, Sparkles } from 'lucide-react';
import styles from './OnboardingTour.module.css';

interface OnboardingTourProps {
  onComplete: () => void;
  userName?: string;
}

const steps = [
  {
    id: 1,
    title: 'Welkom bij Webstability! 🎉',
    description: 'We helpen je om je websites 24/7 te monitoren. Laten we je even rondleiden.',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Voeg je eerste site toe',
    description: 'Klik op "Site toevoegen" om je eerste website te monitoren. We controleren elke 5 minuten of je site online is.',
    icon: Globe,
    highlight: 'add-site-btn',
  },
  {
    id: 3,
    title: 'Ontvang meldingen',
    description: 'Krijg direct een melding via email of SMS wanneer je site offline gaat. Geen downtime meer missen!',
    icon: Bell,
  },
  {
    id: 4,
    title: 'Pas je instellingen aan',
    description: 'Configureer je notificatie voorkeuren, voeg webhooks toe, en bekijk gedetailleerde statistieken.',
    icon: Settings,
  },
];

export function OnboardingTour({ onComplete, userName }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem('onboarding-completed');
    if (completed) {
      setIsVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Progress dots */}
        <div className={styles.progress}>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentStep ? styles.dotActive : ''} ${index < currentStep ? styles.dotCompleted : ''}`}
            />
          ))}
        </div>

        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleSkip}>
          <X size={20} />
        </button>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconGlow} />
            <Icon size={48} className={styles.icon} />
          </div>

          <h2 className={styles.title}>
            {currentStep === 0 && userName ? `Welkom, ${userName}! 🎉` : step.title}
          </h2>
          <p className={styles.description}>{step.description}</p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={handleSkip}>
            Overslaan
          </button>
          <button className={styles.nextBtn} onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                Aan de slag!
                <Sparkles size={18} />
              </>
            ) : (
              <>
                Volgende
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          Stap {currentStep + 1} van {steps.length}
        </div>
      </div>
    </div>
  );
}
