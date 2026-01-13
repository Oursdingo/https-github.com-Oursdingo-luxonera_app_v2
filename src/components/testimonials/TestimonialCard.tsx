"use client";

import { Testimonial } from "@/types/testimonial";
import { Star, Quote, Play, CheckCircle, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Afficher les étoiles
  const renderStars = () => {
    if (!testimonial.rating) return null;
    return (
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < testimonial.rating!
                ? "fill-accent-gold text-accent-gold"
                : "text-neutral-300"
            }
          />
        ))}
      </div>
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Badge platform pour conversations
  const renderPlatformBadge = () => {
    if (testimonial.type !== "conversation" || !testimonial.platform)
      return null;

    const platformConfig = {
      whatsapp: { label: "WhatsApp", color: "bg-green-500" },
      instagram: {
        label: "Instagram",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
      email: { label: "Email", color: "bg-blue-500" },
    };

    const config = platformConfig[testimonial.platform];

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-medium ${config.color}`}
      >
        <MessageCircle size={14} />
        {config.label}
      </div>
    );
  };

  // Card de témoignage texte
  if (testimonial.type === "text") {
    return (
      <div className="bg-neutral-50 rounded-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group">
        <Quote
          size={24}
          className="sm:hidden text-accent-gold mb-3 opacity-40 group-hover:opacity-100 transition-opacity"
        />
        <Quote
          size={32}
          className="hidden sm:block text-accent-gold mb-4 opacity-40 group-hover:opacity-100 transition-opacity"
        />

        {renderStars()}

        <p className="text-neutral-800 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display font-semibold text-black text-sm sm:text-base">
                {testimonial.customerName}
              </p>
              {testimonial.verified && (
                <CheckCircle
                  size={14}
                  className="sm:size-4 text-accent-gold flex-shrink-0"
                />
              )}
            </div>
            {testimonial.collection && (
              <p className="text-xs text-neutral-500 uppercase tracking-wider">
                {testimonial.collection}
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            {formatDate(testimonial.date)}
          </p>
        </div>
      </div>
    );
  }

  // Card de photo client
  if (testimonial.type === "photo" && testimonial.imageUrl) {
    return (
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="relative aspect-[3/4] bg-neutral-100">
          <Image
            src={testimonial.imageUrl}
            alt={`Photo de ${testimonial.customerName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {testimonial.verified && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent-gold text-black p-1 sm:p-1.5 rounded-full">
              <CheckCircle size={14} className="sm:size-4" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {renderStars()}

          {testimonial.text && (
            <p className="text-neutral-700 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
              {testimonial.text}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-neutral-100">
            <div>
              <p className="font-display font-semibold text-black text-sm">
                {testimonial.customerName}
              </p>
              {testimonial.collection && (
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
                  {testimonial.collection}
                </p>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              {formatDate(testimonial.date)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card de conversation (screenshot WhatsApp/Instagram)
  if (testimonial.type === "conversation" && testimonial.conversationImageUrl) {
    return (
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-neutral-200">
        {/* <div className="p-2 sm:p-3 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {renderPlatformBadge()}
          <p className="text-xs text-neutral-400">
            {formatDate(testimonial.date)}
          </p>
        </div> */}

        <div className="relative w-full bg-neutral-100">
          <Image
            src={testimonial.conversationImageUrl}
            alt={`Conversation avec ${testimonial.customerName}`}
            width={800}
            height={1400}
            className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>
    );
  }

  // Card de vidéo témoignage
  if (
    testimonial.type === "video" &&
    testimonial.videoUrl &&
    testimonial.thumbnailUrl
  ) {
    return (
      <div className="bg-black rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
        <div className="relative aspect-video bg-neutral-900">
          {!isVideoPlaying ? (
            <>
              <Image
                src={testimonial.thumbnailUrl}
                alt={`Vidéo de ${testimonial.customerName}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors"
              >
                <div className="bg-accent-gold text-black p-3 sm:p-5 rounded-full group-hover:scale-110 transition-transform">
                  <Play size={24} fill="currentColor" className="sm:hidden" />
                  <Play
                    size={32}
                    fill="currentColor"
                    className="hidden sm:block"
                  />
                </div>
              </button>
              {testimonial.verified && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent-gold text-black p-1 sm:p-1.5 rounded-full">
                  <CheckCircle size={14} className="sm:size-4" />
                </div>
              )}
            </>
          ) : (
            <video
              src={testimonial.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </div>

        <div className="p-4 sm:p-5 bg-neutral-900">
          {renderStars()}

          {testimonial.text && (
            <p className="text-neutral-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
              {testimonial.text}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-neutral-700">
            <div>
              <p className="font-display font-semibold text-white text-sm">
                {testimonial.customerName}
              </p>
              {testimonial.collection && (
                <p className="text-xs text-accent-gold uppercase tracking-wider mt-0.5">
                  {testimonial.collection}
                </p>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {formatDate(testimonial.date)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
