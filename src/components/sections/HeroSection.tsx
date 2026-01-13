"use client";

import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import localFont from "next/font/local";

const logoFont = localFont({
  src: "../layout/fonts/Ceraso.otf",
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    // GSAP animations d'entrée - one time
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
          },
          0.3
        );
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power3.out",
          },
          0.5
        );
      }

      if (descriptionRef.current) {
        tl.from(
          descriptionRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power3.out",
          },
          0.7
        );
      }

      if (ctaRef.current) {
        tl.from(
          ctaRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power3.out",
          },
          0.9
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-watch.mp4" type="video/mp4" />
          <source src="/videos/hero-watch.webm" type="video/webm" />
          {/* Fallback pour les navigateurs sans support vidéo */}
        </video>

        {/* Overlay sombre pour rendre le texte lisible */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Gradient overlay pour un effet premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Content - Framer Motion gère scale au scroll */}
      <motion.div
        ref={contentRef}
        className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto"
        style={{ scale }}
      >
        {/* GSAP gère les animations d'entrée via refs */}
        <h1
          ref={titleRef}
          className={`font-logo text-7xl md:text-7xl lg:text-8xl mb-6 tracking-wide ${logoFont.className}`}
        >
          Luxonera
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl md:text-3xl font-light tracking-wider mb-12 text-neutral-300"
        >
          L&apos;Excellence Horlogère
        </p>

        <p
          ref={descriptionRef}
          className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto"
        >
          Découvrez notre sélection exclusive de montres de prestige, alliant raffinement et élégance intemporelle
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/catalog">
            <Button variant="primary" size="lg" className="min-w-[200px]">
              Découvrir la Collection
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] border-white text-white hover:bg-white hover:text-black"
            >
              Notre Histoire
            </Button>
          </Link>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-15 left-[47.5%] md:left-[51.5%] translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </motion.section>
  );
}
