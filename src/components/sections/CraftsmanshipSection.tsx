"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Watch, Award, Headphones } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    title: "Sélection Rigoureuse",
    description:
      "Chaque montre est minutieusement sélectionnée pour sa qualité, son design et son excellence horlogère",
    icon: Search,
  },
  {
    title: "Collection Variée",
    description:
      "Un large choix de montres prestigieuses pour tous les styles et toutes les occasions",
    icon: Watch,
  },
  {
    title: "Expertise Horlogère",
    description: "Notre connaissance approfondie vous guide vers la montre qui vous correspond parfaitement",
    icon: Award,
  },
  {
    title: "Service Premium",
    description: "Accompagnement personnalisé et service client disponible 24/7 pour vous conseiller",
    icon: Headphones,
  },
];

export default function CraftsmanshipSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter((card) => card !== null);

    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Utiliser ScrollTrigger avec once: true pour garantir l'animation
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 40,
          },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true, // Animation une seule fois
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.2, // Stagger manuel
            ease: "power3.out",
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-accent-gold mb-4">
            Notre Engagement
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6">
            Votre Expert en Montres de Luxe
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            Chez LUXONÉRA, chaque montre est soigneusement sélectionnée auprès des meilleures marques horlogères.
            Nous vous proposons des pièces d&apos;exception authentiques avec un service personnalisé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="craft-card bg-neutral-900 p-8 rounded-lg hover:bg-neutral-800 transition-all duration-300 group opacity-100"
                style={{ opacity: 1 }}
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform text-accent-gold">
                  <IconComponent size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display mb-3">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-gradient-to-r from-accent-gold/20 to-transparent p-8 md:p-12 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-display mb-4">
              Prêt à découvrir votre prochaine montre?
            </h3>
            <p className="text-neutral-400 mb-6 max-w-xl mx-auto">
              Contactez-nous sur WhatsApp pour un conseil personnalisé et
              trouvez la montre qui vous correspond
            </p>
            <a
              href="https://wa.me/22671363053?text=Bonjour!%20Je%20suis%20intéressé%20par%20vos%20montres%20de%20luxe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Contactez-nous sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
