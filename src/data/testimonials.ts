import { Testimonial } from '@/types/testimonial';

export const testimonials: Testimonial[] = [
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

  // Conversation WhatsApp
  {
    id: '7',
    type: 'conversation',
    customerName: 'Laura Moreau',
    date: '2024-11-20',
    conversationImageUrl: '/testimonials/conversations/conversation-2.jpeg',
    platform: 'whatsapp'
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
