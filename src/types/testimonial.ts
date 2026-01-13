export type TestimonialType = 'conversation' | 'photo' | 'video' | 'text';

export interface Testimonial {
  id: string;
  type: TestimonialType;
  customerName: string;
  date: string;
  rating?: number; // 1-5 étoiles

  // Pour les témoignages texte
  text?: string;
  collection?: string; // Ex: "Élégance Classique", "Sport & Performance"

  // Pour les photos et vidéos
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string; // Pour les vidéos

  // Pour les conversations (screenshots WhatsApp/Instagram)
  conversationImageUrl?: string;
  platform?: 'whatsapp' | 'instagram' | 'email';

  // Métadonnées
  verified?: boolean; // Avis vérifié
  featured?: boolean; // Mise en avant
}
