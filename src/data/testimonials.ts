export interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Martijn de Vries',
    role: 'CTO',
    company: 'TechFlow',
    image: '/testimonials/1.jpg',
    content: 'Sinds we webstability gebruiken hebben we 40% minder downtime. De alerts komen binnen seconden en de interface is super intuïtief.',
    rating: 5
  },
  {
    name: 'Lisa van der Berg',
    role: 'Founder',
    company: 'E-commerce Studio',
    image: '/testimonials/2.jpg',
    content: 'Als agency monitoren we 50+ klant websites. webstability bespaart ons uren per week en onze klanten zijn blij met de uptime rapporten.',
    rating: 5
  },
  {
    name: 'Thomas Bakker',
    role: 'DevOps Engineer',
    company: 'CloudScale',
    image: '/testimonials/3.jpg',
    content: 'De API integratie was binnen 10 minuten opgezet. Eindelijk een monitoring tool die past in onze CI/CD pipeline.',
    rating: 5
  }
];
