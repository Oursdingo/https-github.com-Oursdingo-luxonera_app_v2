import { Testimonial } from '@/types/testimonial';

export const testimonials: Testimonial[] = [
  // Photo d'un client portant une montre
  {
    id: '2',
    type: 'photo',
    customerName: 'Sophie Dubois',
    date: '2024-12-08',
    rating: 5,
    imageUrl: '/testimonials/photos/customer-photo-1.svg',
    text: "Ma nouvelle Sport Elite ! Parfaite pour mes sessions au bureau comme au sport. Merci LUXONÉRA 🔥",
    collection: 'Sport & Performance',
    verified: true
  },

  // Photo client
  {
    id: '6',
    type: 'photo',
    customerName: 'Thomas Bernard',
    date: '2024-11-25',
    rating: 5,
    imageUrl: '/testimonials/photos/customer-photo-2.svg',
    text: "Mon cadeau d'anniversaire préféré cette année ! Merci à ma femme et à LUXONÉRA pour cette merveille ⌚✨",
    collection: 'Sport & Performance'
  },

  // Photo client
  {
    id: '9',
    type: 'photo',
    customerName: 'Chloé Simon',
    date: '2024-11-15',
    rating: 5,
    imageUrl: '/testimonials/photos/customer-photo-3.svg',
    text: "Obsédée par ma nouvelle montre Or & Prestige 😍 Elle va avec absolument toutes mes tenues !",
    collection: 'Or & Prestige'
  }
];

// Helper pour obtenir les témoignages featured
export const getFeaturedTestimonials = () =>
  testimonials.filter(t => t.featured);

// Helper pour obtenir les témoignages par type
export const getTestimonialsByType = (type: Testimonial['type']) =>
  testimonials.filter(t => t.type === type);
