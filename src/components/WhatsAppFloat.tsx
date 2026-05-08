import WhatsAppIcon from "./WhatsAppIcon";
import { whatsappLink } from "@/utils/contact";

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hola AleBurgers! 🍔")}
      target="_blank"
      rel="noreferrer"
      className="ab-wsp-float"
      title="Pedir por WhatsApp"
      aria-label="Pedir por WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
