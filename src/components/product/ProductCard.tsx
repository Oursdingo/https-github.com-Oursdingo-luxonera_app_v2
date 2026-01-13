"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Watch } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";

interface ProductCardProps {
  watch: Watch;
  mode?: "collection" | "product"; // collection = accueil, product = catalogue/détail
}

export default function ProductCard({
  watch,
  mode = "product",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // < 1024px = mobile/tablette
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(watch);
  };

  // Gestion sécurisée des images
  const mainImage =
    !imageError && watch.images?.main
      ? watch.images.main
      : "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80";

  const hoverImage = watch.images?.gallery?.[0] || mainImage;

  // URL de redirection selon le mode
  const linkHref =
    mode === "collection"
      ? `/catalog?collection=${encodeURIComponent(watch.collection)}`
      : `/watch/${watch.slug}`;

  return (
    <Link
      href={linkHref}
      className="group block w-full sm:w-[300px] md:w-[340px]"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Conteneur principal */}
      <article className="bg-white rounded-xl shadow-sm hover:shadow-2xl overflow-hidden transition-all duration-500">
        {/* === Image principale === */}
        <div className="relative w-full h-[380px] overflow-hidden bg-neutral-50">
          {/* Image par défaut */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={mainImage}
              alt={watch.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>

          {/* Image de survol */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={hoverImage}
              alt={`${watch.name} - Vue 2`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {mode === "collection" && watch.featured && (
              <span className="bg-accent-gold text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
                Collection
              </span>
            )}
            {mode === "product" && watch.featured && (
              <span className="bg-accent-gold text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
                Nouveauté
              </span>
            )}

            {/* Stock Status Badges */}
            {!watch.inStock ? (
              <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Rupture de stock
              </span>
            ) : watch.stockQuantity && watch.stockQuantity <= 5 ? (
              <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow animate-pulse">
                {watch.stockQuantity} restant{watch.stockQuantity > 1 ? 's' : ''}
              </span>
            ) : null}

            {mode === "product" && watch.color && watch.color !== "Main" && (
              <span className="bg-neutral-100 text-neutral-800 text-xs font-medium px-3 py-1 rounded-full shadow">
                {watch.color}
              </span>
            )}
          </div>

          {/* Bouton rapide - désactivé sur mobile */}
          {mode === "product" && !isMobile && (
            <div
              className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Button
                onClick={handleAddToCart}
                disabled={!watch.inStock}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Ajouter au panier
              </Button>
            </div>
          )}

          {/* Overlay pour mode collection - désactivé sur mobile */}
          {mode === "collection" && !isMobile && (
            <div
              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-white text-lg font-medium px-6 py-3 bg-accent-gold/90 rounded-lg">
                Voir la collection
              </span>
            </div>
          )}
        </div>

        {/* === Informations produit === */}
        <div className="p-5 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1 line-clamp-1">
            {watch.collection}
          </p>
          <h3 className="font-display text-lg sm:text-xl leading-tight group-hover:text-accent-gold transition-colors line-clamp-2">
            {watch.name}
          </h3>
          {/* Ne pas afficher le prix pour les produits featured (images de collection) */}
          {!(watch.featured && mode === "collection") && (
            <p className="text-base sm:text-lg font-semibold">
              {formatPrice(watch.price)}
            </p>
          )}

          {/* Spécifications si disponibles */}
          {mode === "product" && watch.specifications && (watch.specifications.movement || watch.specifications.diameter) && (
            <div className="mt-2 pt-3 border-t border-neutral-100 space-y-1">
              {watch.specifications.movement && (
                <p className="text-xs text-neutral-600">
                  <span className="font-medium">Mouvement:</span>{" "}
                  {watch.specifications.movement}
                </p>
              )}
              {watch.specifications.diameter && (
                <p className="text-xs text-neutral-600">
                  <span className="font-medium">Diamètre:</span>{" "}
                  {watch.specifications.diameter}
                </p>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
