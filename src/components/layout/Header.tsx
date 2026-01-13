"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Le header est transparent uniquement sur la page d'accueil
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled || !isHomePage
          ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <nav className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - À gauche en mobile */}
          <button
            className={cn(
              "md:hidden p-2 transition-colors order-1",
              isScrolled || !isHomePage ? "text-black" : "text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo - Au centre en mobile, à gauche en desktop */}
          <Link
            href="/"
            className="order-2 md:order-1 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/logo/logo.png"
              alt="Luxonera"
              width={180}
              height={60}
              className="h-12 md:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8 order-2">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm uppercase tracking-wider transition-colors relative group",
                    isScrolled || !isHomePage
                      ? pathname === item.href
                        ? "text-black font-medium"
                        : "text-neutral-600 hover:text-black"
                      : pathname === item.href
                      ? "text-white font-medium"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-[2px] bg-accent-gold transition-all",
                      pathname === item.href
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart Icon - À droite */}
          <Link
            href="/cart"
            className={cn(
              "relative p-2 rounded-full transition-colors order-3",
              isScrolled || !isHomePage
                ? "hover:bg-neutral-100 text-black"
                : "hover:bg-white/20 text-white"
            )}
            aria-label="Panier"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={cn(
              "md:hidden mt-4 pb-4 pt-4",
              isScrolled || !isHomePage
                ? "border-t border-neutral-200"
                : "border-t border-white/20 bg-black/40 backdrop-blur-md rounded-lg"
            )}
          >
            <ul className="space-y-4">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block text-lg",
                      isScrolled || !isHomePage
                        ? pathname === item.href
                          ? "text-black font-medium"
                          : "text-neutral-600"
                        : pathname === item.href
                        ? "text-white font-medium"
                        : "text-white/80"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
