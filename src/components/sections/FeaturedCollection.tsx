"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductGrid from "@/components/product/ProductGrid";
import { Watch } from "@/types/product";
import Link from "next/link";
import Button from "@/components/ui/Button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeaturedCollectionProps {
  watches: Watch[];
}

export default function FeaturedCollection({
  watches,
}: FeaturedCollectionProps) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Filtrer les refs null
    const validCards = cardsRef.current.filter((card) => card !== null);

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Cards stagger animation avec refs directes
      if (validCards.length > 0) {
        gsap.from(validCards, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
          opacity: 0,
          y: 60,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-neutral-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div ref={titleRef} className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
            Nos Produits
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display mb-6">
            Collection Exclusive
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            Ne vous contentez pas d&apos;une montre ordinaire car le temps est
            précieux et mérite d&apos;être honoré
          </p>
        </div>

        <ProductGrid
          watches={watches}
          mode="collection"
          cardRef={(el, index) => {
            cardsRef.current[index] = el;
          }}
        />

        <div className="text-center mt-16">
          <Link href="/catalog">
            <Button variant="primary" size="lg">
              Voir Toute la Collection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
