export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: 'Hoe snel worden problemen gedetecteerd?',
    answer: 'Met ons Pro en Business plan detecteren we problemen binnen 30 seconden. We checken vanaf meerdere locaties wereldwijd en bevestigen downtime voordat we je alerten, om false positives te voorkomen.'
  },
  {
    question: 'Welke alert methodes worden ondersteund?',
    answer: 'We ondersteunen Email, SMS, Slack, Discord, Microsoft Teams, Telegram, PagerDuty en webhooks. Je kunt meerdere methodes combineren en per website verschillende instellingen gebruiken.'
  },
  {
    question: 'Kan ik mijn abonnement op elk moment opzeggen?',
    answer: 'Ja, je kunt op elk moment opzeggen zonder opzegtermijn. Bij jaarlijkse betaling krijg je het resterende bedrag naar rato teruggestort.'
  },
  {
    question: 'Bieden jullie een API aan?',
    answer: 'Ja, onze REST API is beschikbaar voor Pro en Business klanten. Hiermee kun je websites toevoegen, statistieken ophalen en alerts beheren. Volledige documentatie is beschikbaar.'
  },
  {
    question: 'Hoe werkt de SSL monitoring?',
    answer: 'We monitoren je SSL certificaten en sturen automatisch herinneringen op 30, 14 en 7 dagen voor expiratie. Zo vergeet je nooit meer een certificaat te vernieuwen.'
  },
  {
    question: 'Wat als ik meer websites nodig heb?',
    answer: 'Neem contact met ons op voor een Enterprise plan op maat. We bieden flexibele oplossingen voor grote organisaties met honderden of duizenden websites.'
  }
];

// Extended FAQ for pricing page
export const pricingFaqs: FAQ[] = [
  ...faqs,
  {
    question: 'Kan ik op elk moment opzeggen?',
    answer: 'Ja, je kunt op elk moment opzeggen zonder opzegtermijn. Bij jaarlijkse betaling krijg je het resterende bedrag naar rato teruggestort.'
  },
  {
    question: 'Wat gebeurt er als mijn limiet is bereikt?',
    answer: 'Je ontvangt een melding wanneer je dicht bij je limiet komt. Je kunt eenvoudig upgraden naar een hoger plan of websites verwijderen.'
  },
  {
    question: 'Is er een gratis proefperiode voor betaalde plannen?',
    answer: 'Ja! Pro en Business plannen hebben een 14 dagen gratis proefperiode. Je creditcard wordt pas na de proefperiode belast.'
  },
  {
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'We accepteren creditcards (Visa, Mastercard, American Express), iDEAL en bankoverschrijving voor jaarlijkse plannen.'
  },
  {
    question: 'Bieden jullie korting voor jaarlijkse betaling?',
    answer: 'Ja! Bij jaarlijkse betaling krijg je 20% korting op alle betaalde plannen.'
  }
];
