"use client";

import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeritageStory() {
  const containerRef = useRef(null);
  const contentInnerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  useEffect(() => {
    // GSAP anime l'apparition du contenu - one time
    const ctx = gsap.context(() => {
      if (contentInnerRef.current) {
        gsap.from(contentInnerRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
          opacity: 0,
          x: -50,
          duration: 1,
          ease: "power3.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Image */}
          <motion.div style={{ y: y1 }} className="relative">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/images/heritage/heritage-story.jpg"
                alt="L'art de l'horlogerie Luxonera"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative Element */}
            <motion.div
              style={{ y: y2 }}
              className="absolute -bottom-8 -right-8 w-64 h-64 bg-accent-gold/20 rounded-full blur-3xl -z-10"
            />
          </motion.div>

          {/* Content - Framer Motion gère le parallax */}
          <motion.div style={{ y: y2 }}>
            {/* GSAP gère l'animation d'entrée */}
            <div ref={contentInnerRef}>
              <p className="text-sm uppercase tracking-widest text-accent-gold mb-4">
                Notre Histoire
              </p>
              <h2 className="text-4xl md:text-5xl font-display mb-6">
                Une Passion depuis 2017
              </h2>
              <div className="space-y-4 text-lg text-neutral-700">
                <p>
                  Luxonéra est née d&apos;un véritable amour pour
                  l&apos;horlogerie, avec une mission claire : offrir une
                  collection des montres diverses, élégantes et fiables
                  accessibles a tous.
                </p>
                <p>
                  Au fil des années, nous avons appris à connaître ce que
                  recherchent réellement les amateurs de belles montres : la
                  qualité, le style, la durabilité et surtout la confiance.
                </p>
                <p>
                  Notre clientèle est variée, allant des jeunes passionnés qui
                  découvrent l&apos;univers horloger aux adultes exigeants à la
                  recherche d&apos;une pièce raffinée. Chacun mérite une montre
                  qui reflète sa personnalité et son sens du détail.
                </p>
                <p>
                  Nous offrons un service d&apos;accompagnement personnalisé
                  pour aider chaque client à trouver la montre idéale, ainsi que
                  la possibilité de rendre chaque cadeau unique avec des cartes
                  personnalisées.
                </p>
                <p className="font-medium text-neutral-900">
                  « Ne vous contentez pas d&apos;une montre ordinaire, car le
                  temps est précieux et mérite d&apos;être honoré. »
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-neutral-200">
                <div>
                  <p className="text-3xl font-display text-accent-gold mb-2">
                    2017
                  </p>
                  <p className="text-sm text-neutral-600">Depuis</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-accent-gold mb-2">
                    Premium
                  </p>
                  <p className="text-sm text-neutral-600">Sélection</p>
                </div>
                <div>
                  <p className="text-3xl font-display text-accent-gold mb-2">
                    24/7
                  </p>
                  <p className="text-sm text-neutral-600">Service</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
