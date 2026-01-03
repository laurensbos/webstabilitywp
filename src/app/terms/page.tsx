'use client';

import Link from 'next/link';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1>Algemene Voorwaarden</h1>
          <p className={styles.lastUpdated}>Laatst bijgewerkt: 1 januari 2026</p>

          <section className={styles.section}>
            <h2>1. Definities</h2>
            <p>
              In deze voorwaarden wordt verstaan onder:
            </p>
            <ul>
              <li><strong>webstability:</strong> de aanbieder van de website monitoring dienst</li>
              <li><strong>Gebruiker:</strong> de persoon of organisatie die gebruik maakt van onze diensten</li>
              <li><strong>Dienst:</strong> de website monitoring en gerelateerde functionaliteiten</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Toepasselijkheid</h2>
            <p>
              Deze voorwaarden zijn van toepassing op alle diensten die webstability aanbiedt. 
              Door gebruik te maken van onze diensten ga je akkoord met deze voorwaarden.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Beschrijving van de dienst</h2>
            <p>
              webstability biedt website monitoring diensten aan, waaronder:
            </p>
            <ul>
              <li>Uptime monitoring met regelmatige checks</li>
              <li>SSL certificaat monitoring</li>
              <li>Performance monitoring</li>
              <li>Alert notificaties via e-mail en webhooks</li>
              <li>Rapportages en statistieken</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Abonnementen en betaling</h2>
            <p>
              We bieden verschillende abonnementsvormen aan. Betaling vindt maandelijks of 
              jaarlijks vooruit plaats via Mollie. Bij jaarlijkse betaling ontvang je korting.
            </p>
            <p>
              Abonnementen worden automatisch verlengd tenzij je tijdig opzegt. 
              Opzegging kan op elk moment via je dashboard of door contact met ons op te nemen.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Fair use</h2>
            <p>
              Je mag onze dienst alleen gebruiken voor legitieme website monitoring doeleinden. 
              Het is niet toegestaan om:
            </p>
            <ul>
              <li>De dienst te gebruiken voor DDoS aanvallen of andere schadelijke activiteiten</li>
              <li>Excessief veel requests te genereren buiten normale monitoring om</li>
              <li>Websites te monitoren zonder toestemming van de eigenaar</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Beschikbaarheid</h2>
            <p>
              We streven naar 99.9% uptime van onze eigen dienst. We zijn niet aansprakelijk 
              voor gemiste alerts of downtime als gevolg van overmacht, gepland onderhoud 
              of storingen bij derden.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Aansprakelijkheid</h2>
            <p>
              webstability is niet aansprakelijk voor directe of indirecte schade als gevolg 
              van het gebruik van onze diensten. Onze dienst is bedoeld als hulpmiddel en 
              vervangt geen eigen monitoring of beveiligingsmaatregelen.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Beëindiging</h2>
            <p>
              We behouden ons het recht voor om accounts te beëindigen die in strijd handelen 
              met deze voorwaarden. Bij beëindiging worden je gegevens na 30 dagen verwijderd.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Wijzigingen</h2>
            <p>
              We kunnen deze voorwaarden van tijd tot tijd aanpassen. Bij belangrijke 
              wijzigingen informeren we je via e-mail. Voortgezet gebruik na wijzigingen 
              betekent acceptatie van de nieuwe voorwaarden.
            </p>
          </section>

          <section className={styles.section}>
            <h2>10. Contact</h2>
            <p>
              Voor vragen over deze voorwaarden kun je contact opnemen via{' '}
              <a href="mailto:support@webstability.nl">support@webstability.nl</a>
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
