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

  // Conversation WhatsApp
  {
    id: '3',
    type: 'conversation',
    customerName: 'Marc Laurent',
    date: '2024-12-05',
    conversationImageUrl: '/testimonials/conversations/conversation-1.jpeg',
    platform: 'whatsapp',
    featured: false
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

  // Conversation WhatsApp
  {
    id: '7',
    type: 'conversation',
    customerName: 'Laura Moreau',
    date: '2024-11-20',
    conversationImageUrl: '/testimonials/conversations/conversation-2.jpeg',
    platform: 'whatsapp'
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
  },

  // Conversation WhatsApp
  {
    id: '10',
    type: 'conversation',
    customerName: 'Pierre Garnier',
    date: '2024-11-10',
    conversationImageUrl: '/testimonials/conversations/conversation-3.jpeg',
    platform: 'whatsapp'
  },

  // Conversation WhatsApp
  {
    id: '13',
    type: 'conversation',
    customerName: 'Sarah Konaté',
    date: '2024-12-20',
    conversationImageUrl: '/testimonials/conversations/conversation-4.jpeg',
    platform: 'whatsapp'
  },

  // Conversation WhatsApp
  {
    id: '14',
    type: 'conversation',
    customerName: 'Ibrahim Traoré',
    date: '2024-12-18',
    conversationImageUrl: '/testimonials/conversations/conversation-5.jpeg',
    platform: 'whatsapp'
  },

  // Conversation WhatsApp
  {
    id: '15',
    type: 'conversation',
    customerName: 'Aminata Ouédraogo',
    date: '2024-12-15',
    conversationImageUrl: '/testimonials/conversations/conversation-6.jpeg',
    platform: 'whatsapp'
  },

  // Conversation WhatsApp
  {
    id: '16',
    type: 'conversation',
    customerName: 'Boubacar Sawadogo',
    date: '2024-12-12',
    conversationImageUrl: '/testimonials/conversations/conversation-7.jpeg',
    platform: 'whatsapp'
  }
];

// Helper pour obtenir les témoignages featured
export const getFeaturedTestimonials = () =>
  testimonials.filter(t => t.featured);

// Helper pour obtenir les témoignages par type
export const getTestimonialsByType = (type: Testimonial['type']) =>
  testimonials.filter(t => t.type === type);
