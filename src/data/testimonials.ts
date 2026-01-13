import { Testimonial } from '@/types/testimonial';

export const testimonials: Testimonial[] = [
  // Témoignage texte avec étoiles
  {
    id: '1',
    type: 'text',
    customerName: 'Alexandre Martin',
    date: '2024-12-10',
    rating: 5,
    text: "Une expérience d'achat exceptionnelle ! La montre Élégance Classique est encore plus belle en vrai. Le service client est impeccable, livraison rapide et soignée. Je recommande vivement LUXONÉRA pour leur professionnalisme.",
    collection: 'Élégance Classique',
    verified: true,
    featured: true
  },

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

  // Vidéo témoignage
  {
    id: '4',
    type: 'video',
    customerName: 'Julien Rousseau',
    date: '2024-12-03',
    rating: 5,
    videoUrl: '/testimonials/videos/demo-video.mp4', // Placeholder - remplacer par vraie vidéo
    thumbnailUrl: '/testimonials/videos/video-thumb-1.svg',
    text: "Découvrez mon unboxing de la collection Or & Prestige !",
    collection: 'Or & Prestige',
    verified: true,
    featured: true
  },

  // Témoignage texte simple
  {
    id: '5',
    type: 'text',
    customerName: 'Émilie Petit',
    date: '2024-11-28',
    rating: 5,
    text: "Ravie de mon achat ! La montre est magnifique, élégante et correspond parfaitement à la description. L'équipe LUXONÉRA a été très réactive sur WhatsApp. Transaction sécurisée. 10/10",
    collection: 'Élégance Classique',
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

  // Conversation WhatsApp
  {
    id: '7',
    type: 'conversation',
    customerName: 'Laura Moreau',
    date: '2024-11-20',
    conversationImageUrl: '/testimonials/conversations/conversation-2.jpeg',
    platform: 'whatsapp'
  },

  // Témoignage texte
  {
    id: '8',
    type: 'text',
    customerName: 'David Leroy',
    date: '2024-11-18',
    rating: 5,
    text: "Troisième montre achetée chez LUXONÉRA, toujours aussi satisfait ! Authenticité garantie, prix compétitifs, service irréprochable. C'est devenu mon revendeur de confiance.",
    verified: true,
    featured: true
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

  // Vidéo témoignage
  {
    id: '11',
    type: 'video',
    customerName: 'Anaïs Fontaine',
    date: '2024-11-05',
    rating: 5,
    videoUrl: '/testimonials/videos/demo-video-2.mp4', // Placeholder - remplacer par vraie vidéo
    thumbnailUrl: '/testimonials/videos/video-thumb-2.svg',
    text: "Review complète de ma montre LUXONÉRA après 2 mois d'utilisation",
    collection: 'Élégance Classique',
    verified: true
  },

  // Témoignage texte
  {
    id: '12',
    type: 'text',
    customerName: 'Nicolas Dupont',
    date: '2024-10-30',
    rating: 5,
    text: "Excellent rapport qualité/prix. J'ai comparé avec d'autres revendeurs et LUXONÉRA offre les meilleurs prix avec un service client au top. Montre reçue en 48h, emballage soigné.",
    collection: 'Sport & Performance',
    verified: true
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
