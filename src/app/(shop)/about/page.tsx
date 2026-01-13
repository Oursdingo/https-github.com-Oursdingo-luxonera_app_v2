import Image from "next/image";
import { siteConfig } from "@/data/siteConfig";
import { Gift, FileText, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="container-luxury">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display mb-6">
            À propos de LUXONÉRA
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto">
            Depuis 2017, l&apos;élégance au quotidien
          </p>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto space-y-8 text-lg leading-relaxed mb-20">
          <p>
            Depuis 2017, LUXONÉRA sélectionne des montres conçues pour ceux qui
            aiment le style, la qualité et l&apos;élégance au quotidien. Notre
            passion est simple : proposer des modèles fiables, esthétiques et
            accessibles, pour tous les âges et toutes les occasions.
          </p>

          <p>
            Chaque montre est choisie avec soin pour son design, son confort et
            son authenticité. Au-delà des tendances éphémères, nous recherchons
            des pièces qui racontent une histoire, qui résistent au temps et
            accompagnent les moments précieux de votre vie.
          </p>

          <p>
            Que vous recherchiez une pièce discrète pour le quotidien, un modèle
            tendance qui affirme votre personnalité ou une montre de collection
            pour marquer un moment unique, nous mettons l&apos;accent sur le bon
            goût et la durabilité. Chez LUXONÉRA, chaque montre est plus
            qu&apos;un simple accessoire : c&apos;est une expression de qui vous
            êtes.
          </p>

          <p>
            Notre engagement va au-delà du produit. Nous croyons en une relation
            authentique avec nos clients, basée sur la confiance, l&apos;écoute
            et le service. Parce que choisir une montre est un acte personnel,
            nous vous accompagnons à chaque étape pour que votre expérience soit
            aussi mémorable que la montre elle-même.
          </p>
        </div>

        {/* Services Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-display text-center mb-12">
            LUXONÉRA, c&apos;est aussi un service personnalisé
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Gift
                  className="w-12 h-12 text-accent-gold"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-display mb-3">
                Conseils personnalisés
              </h3>
              <p className="text-neutral-600">
                Un accompagnement expert pour choisir le modèle qui vous
                correspond parfaitement
              </p>
            </div>

            <div className="text-center p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <FileText
                  className="w-12 h-12 text-accent-gold"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-display mb-3">Cartes dédiées</h3>
              <p className="text-neutral-600">
                Des cartes élégantes pour accompagner vos cadeaux et rendre
                chaque moment unique
              </p>
            </div>

            <div className="text-center p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Truck
                  className="w-12 h-12 text-accent-gold"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-display mb-3">Livraison sécurisée</h3>
              <p className="text-neutral-600">
                Une livraison rapide et sécurisée pour recevoir votre montre en
                toute tranquillité
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-black text-white rounded-2xl p-12 mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-display text-accent-gold mb-2">
                2017
              </p>
              <p className="text-neutral-400">Année de création</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-display text-accent-gold mb-2">
                100%
              </p>
              <p className="text-neutral-400">Service premium</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-display text-accent-gold mb-2">
                24/7
              </p>
              <p className="text-neutral-400">Service personnalisé</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-neutral-50 to-white p-12 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-display mb-4">
            Notre engagement : offrir des montres qui font plaisir
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            À offrir ou à s&apos;offrir. Contactez-nous sur WhatsApp pour
            découvrir la montre qui vous ressemble et vivre une expérience
            d&apos;achat unique.
          </p>
          <a
            href={`https://wa.me/${siteConfig.whatsapp.number}?text=Bonjour!%20Je%20souhaite%20découvrir%20vos%20montres%20LUXONÉRA`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Bienvenue dans l&apos;univers LUXONÉRA
          </a>
        </div>
      </div>
    </div>
  );
}
