'use client';

import Link from 'next/link';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1>Privacybeleid</h1>
          <p className={styles.lastUpdated}>Laatst bijgewerkt: 1 januari 2026</p>

          <section className={styles.section}>
            <h2>1. Inleiding</h2>
            <p>
              Bij webstability nemen we je privacy serieus. Dit privacybeleid beschrijft hoe we 
              persoonlijke informatie verzamelen, gebruiken en beschermen wanneer je onze 
              website monitoring dienst gebruikt.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Gegevens die we verzamelen</h2>
            <p>We verzamelen de volgende gegevens:</p>
            <ul>
              <li><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld)</li>
              <li><strong>Betalingsgegevens:</strong> worden verwerkt door Mollie, wij slaan geen creditcardgegevens op</li>
              <li><strong>Website gegevens:</strong> URLs die je monitort, uptime statistieken, response times</li>
              <li><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Hoe we je gegevens gebruiken</h2>
            <p>Je gegevens worden gebruikt voor:</p>
            <ul>
              <li>Het leveren van onze monitoring diensten</li>
              <li>Het versturen van alerts en notificaties</li>
              <li>Het verbeteren van onze diensten</li>
              <li>Facturering en administratie</li>
              <li>Klantenservice en support</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Gegevens delen</h2>
            <p>
              We delen je gegevens niet met derden, behalve wanneer dit nodig is voor 
              onze dienstverlening (zoals betalingsverwerking via Mollie) of wanneer 
              dit wettelijk vereist is.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Beveiliging</h2>
            <p>
              We nemen passende technische en organisatorische maatregelen om je 
              gegevens te beschermen tegen ongeautoriseerde toegang, verlies of misbruik.
              Alle gegevens worden versleuteld opgeslagen en verzonden via HTTPS.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Je rechten</h2>
            <p>Je hebt het recht om:</p>
            <ul>
              <li>Inzage te vragen in je gegevens</li>
              <li>Je gegevens te laten corrigeren of verwijderen</li>
              <li>Je toestemming in te trekken</li>
              <li>Een klacht in te dienen bij de Autoriteit Persoonsgegevens</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Cookies</h2>
            <p>
              We gebruiken alleen essentiële cookies voor het functioneren van de 
              website en het bijhouden van je login sessie. We gebruiken geen 
              tracking cookies van derden.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Contact</h2>
            <p>
              Voor vragen over dit privacybeleid kun je contact opnemen via{' '}
              <a href="mailto:privacy@webstability.nl">privacy@webstability.nl</a>
            </p>
          </section>

          <div className={styles.backLink}>
            <Link href="/">← Terug naar home</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
