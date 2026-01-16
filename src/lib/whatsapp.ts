import { siteConfig } from "@/data/siteConfig";
import { CheckoutData } from "@/types/cart";

export const WHATSAPP_NUMBER = siteConfig.whatsapp.number;

export function formatCartForWhatsApp(cart: CheckoutData): string {
  let message = "\u{1F6CD}\uFE0F NOUVELLE COMMANDE LUXONERA\n\n";

  // Order number
  if (cart.orderNumber) {
    message += `\u{1F4CB} Numéro de commande: ${cart.orderNumber}\n\n`;
  }

  message += "\u{1F464} INFORMATIONS CLIENT:\n";
  message += "------------------\n";
  if (cart.customerName) {
    message += `Nom: ${cart.customerName}\n`;
  }
  if (cart.customerPhone) {
    message += `\u{1F4F1} Téléphone: ${cart.customerPhone}\n`;
  }

  // Informations du destinataire si différent
  if (cart.recipient) {
    message += "\n\u{1F381} DESTINATAIRE DE LA LIVRAISON:\n";
    message += "------------------\n";
    message += `Prénom: ${cart.recipient.firstName}\n`;
    message += `Nom: ${cart.recipient.lastName}\n`;
    message += `\u{1F4F1} Téléphone: ${cart.recipient.phone}\n`;
  }

  // Message de livraison personnalisé
  if (cart.deliveryMessage) {
    message += "\n\u{1F4AC} MESSAGE DE LIVRAISON:\n";
    message += "------------------\n";
    message += `${cart.deliveryMessage}\n`;
  }

  message += "\n\u{1F4E6} ARTICLES:\n";
  message += "------------------\n";

  cart.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    if (item.collection) {
      message += `   - Collection: ${item.collection}\n`;
    }
    if (item.color) {
      message += `   - Couleur: ${item.color}\n`;
    }
    message += `   - Quantité: ${item.quantity}\n`;
    message += `   - Prix: ${item.price.toLocaleString("fr-FR")} FCFA\n\n`;
  });

  message += "------------------\n";
  message += `\u{1F4B0} TOTAL: ${cart.total.toLocaleString("fr-FR")} FCFA\n\n`;
  message += "\u2705 Merci de confirmer cette commande pour procéder au paiement.";

  return encodeURIComponent(message);
}

export function createWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function openWhatsAppCheckout(cart: CheckoutData): void {
  const message = formatCartForWhatsApp(cart);
  const url = createWhatsAppLink(message);

  // Utiliser location.href pour une meilleure compatibilité iOS
  // window.open() est souvent bloqué sur iOS après des opérations async
  window.location.href = url;
}

export function openWhatsAppChat(customMessage?: string): void {
  const defaultMessage = "Bonjour! Je suis intéressé par vos montres.";
  const message = encodeURIComponent(customMessage || defaultMessage);
  const url = createWhatsAppLink(message);

  // Utiliser location.href pour une meilleure compatibilité iOS
  window.location.href = url;
}
