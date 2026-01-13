"use client";

import { useEffect, useRef } from 'react';
import { testimonials } from '@/data/testimonials';
import TestimonialCard from '@/components/testimonials/TestimonialCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation du hero
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll('.hero-animate'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }

    // Animation des cards au scroll
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.testimonial-card');

      gsap.from(cards, {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          once: true
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-black text-white py-20 sm:py-32 md:py-40 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="container-luxury relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-animate mb-4 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full">
              <Star size={14} className="sm:size-4 text-accent-gold" />
              <span className="text-xs sm:text-sm uppercase tracking-widest text-accent-gold font-medium">
                Témoignages Clients
              </span>
            </div>

            <h1 className="hero-animate font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 text-balance leading-tight">
              Ce Qu&apos;Ils Disent <br className="hidden sm:block" />
              <span className="sm:inline"> </span><span className="text-accent-gold">De Nous</span>
            </h1>

            <p className="hero-animate text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed text-balance px-4 sm:px-0">
              Découvrez les expériences authentiques de nos clients satisfaits.
              Conversations, photos, vidéos : leur confiance est notre plus belle récompense.
            </p>

            {/* Stats */}
            <div className="hero-animate grid grid-cols-3 md:flex md:flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-neutral-800">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-display text-accent-gold mb-1 sm:mb-2">500+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-neutral-400 uppercase tracking-wider">Clients Satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-display text-accent-gold mb-1 sm:mb-2">4.9/5</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-neutral-400 uppercase tracking-wider">Note Moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-display text-accent-gold mb-1 sm:mb-2">98%</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-neutral-400 uppercase tracking-wider">Recommandations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Quote - Hidden on mobile, smaller on tablet */}
        <Quote className="hidden sm:block md:hidden absolute top-20 right-10 text-accent-gold opacity-10" size={80} />
        <Quote className="hidden md:block absolute top-20 right-10 text-accent-gold opacity-10" size={120} />
        <Quote className="hidden sm:block md:hidden absolute bottom-20 left-10 text-accent-gold opacity-10 rotate-180" size={80} />
        <Quote className="hidden md:block absolute bottom-20 left-10 text-accent-gold opacity-10 rotate-180" size={120} />
      </section>

      {/* Testimonials Grid - Masonry Style */}
      <section className="py-12 sm:py-20 md:py-32 bg-gradient-to-b from-white to-neutral-50">
        <div className="container-luxury">
          {/* Grid avec effet Masonry */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-auto"
            style={{
              gridAutoFlow: 'dense'
            }}
          >
            {testimonials.map((testimonial, index) => {
              // Logique pour varier les tailles (effet masonry)
              // Les témoignages "featured" et vidéos prennent plus de place
              const isFeatured = testimonial.featured;
              const isVideo = testimonial.type === 'video';
              const isConversation = testimonial.type === 'conversation';

              // Classes pour varier la hauteur et créer l'effet masonry
              let spanClass = '';

              if (isFeatured && !isConversation) {
                spanClass = 'md:col-span-2'; // Featured prend 2 colonnes sur desktop
              }

              return (
                <div
                  key={testimonial.id}
                  className={`testimonial-card ${spanClass}`}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-12 sm:mt-16 md:mt-20 text-center">
            <div className="bg-black text-white rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 max-w-3xl mx-auto">
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
                Rejoignez Nos Clients <span className="text-accent-gold">Satisfaits</span>
              </h3>
              <p className="text-neutral-300 mb-6 sm:mb-8 text-base sm:text-lg">
                Vous aussi, vivez l&apos;expérience LUXONÉRA et partagez votre témoignage
              </p>
              <a
                href="/catalog"
                className="inline-block bg-accent-gold text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-accent-gold/90 transition-colors text-sm sm:text-base"
              >
                Découvrir Notre Collection
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
