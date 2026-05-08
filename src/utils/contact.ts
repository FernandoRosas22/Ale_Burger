export const WHATSAPP_NUMBER = "5491172106298";

export const PEDIDOS_URL =
  "https://pedidos.masdelivery.com/aleburgers?utm_source=ig&utm_medium=social&utm_content=link_in_bio";

export const INSTAGRAM_URL =
  "https://www.instagram.com/aleburgers.ok";

export const MAPS_EMBED_URL =
  "https://www.google.com/maps?q=-34.7205088,-58.7947361&hl=es&z=17&output=embed";

export const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/aleburgers.ok/@-34.7205044,-58.797311,17z";

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
