"use client";

import { useEffect, useState } from "react";

const dictionaries = {
  fr: {
    Home: "Accueil", "How it works": "Comment ça marche", Products: "Produits", "Get a quote": "Demander un devis", Book: "Réserver", Contact: "Contact", "Log in": "Connexion", "Sign up": "Créer un compte",
    "Get a free quote": "Obtenir un devis gratuit", "Track a parcel": "Suivre un colis", "Why customers choose us": "Pourquoi nos clients nous choisissent", "Products available to ship": "Produits disponibles à l'expédition", "View all products": "Voir tous les produits", "How it works": "Comment ça marche", "Four steps from the supplier to your door.": "Quatre étapes du fournisseur jusqu'à votre porte.", "Send us the order": "Envoyez-nous la commande", "We receive and check": "Nous réceptionnons et vérifions", "Ship by air or sea": "Expédition aérienne ou maritime", "Delivery in Rwanda": "Livraison au Rwanda", "Products we ship": "Produits expédiés", "Quote and tracking": "Devis et suivi", "Shipping estimate": "Estimation d'expédition", "Weight (kg)": "Poids (kg)", "Shipping method": "Mode d'expédition", Calculate: "Calculer", "Track your parcel": "Suivre votre colis", "Tracking number": "Numéro de suivi", Track: "Suivre", "Book your shipment": "Réserver votre expédition", "Full name *": "Nom complet *", "Phone / WhatsApp *": "Téléphone / WhatsApp *", Email: "E-mail", "Delivery city in Rwanda": "Ville de livraison au Rwanda", "Type of product": "Type de produit", "Approx. weight (kg)": "Poids approximatif (kg)", "Air freight": "Fret aérien", "Sea freight": "Fret maritime", "Not sure yet": "Je ne sais pas encore", "Supplier city in China": "Ville du fournisseur en Chine", "Describe your goods *": "Décrivez vos marchandises *", "Book on WhatsApp": "Réserver sur WhatsApp", "Book by email": "Réserver par e-mail", "Contact and location": "Contact et adresse", "Office in Rwanda": "Bureau au Rwanda", "Warehouse in China": "Entrepôt en Chine", "Opening hours": "Heures d'ouverture", "Send us a message": "Envoyez-nous un message", "Your name": "Votre nom", Message: "Message", "Send by email": "Envoyer par e-mail", "Create your account": "Créer votre compte", "Welcome back": "Ravi de vous revoir", Password: "Mot de passe", "Sign up with Google": "S'inscrire avec Google", "Continue with Google": "Continuer avec Google", "Forgot your password?": "Mot de passe oublié ?",
    "Ship from China to": "Expédiez depuis la Chine vers", "simply and safely": "simplement et en toute sécurité", "Air and sea freight from Guangzhou, Shenzhen and Yiwu straight to Kigali. We collect, consolidate, ship and clear customs for you.": "Fret aérien et maritime de Guangzhou, Shenzhen et Yiwu jusqu'à Kigali. Nous collectons, regroupons et expédions vos marchandises, et nous nous occupons du dédouanement.", "Browse the products and shipping options available through CHI-RWA Cargo.": "Découvrez les produits et options d'expédition proposés par CHI-RWA Cargo.", "Popular goods our customers import from China. Ask us about anything not listed.": "Produits populaires importés de Chine par nos clients. Contactez-nous pour tout autre article.", "Share your supplier details or have them deliver to our China warehouse.": "Transmettez les coordonnées de votre fournisseur ou faites livrer les marchandises à notre entrepôt en Chine.", "Goods are weighed, photographed and consolidated with other parcels.": "Les marchandises sont pesées, photographiées et regroupées avec d'autres colis.", "Pick the speed that fits your budget and timeline.": "Choisissez la vitesse adaptée à votre budget et à votre délai.", "We handle customs clearance and deliver in Kigali or pickup in our office.": "Nous nous occupons du dédouanement et livrons à Kigali ou à notre bureau.", "Get a quick estimate or check where your parcel is.": "Obtenez rapidement une estimation ou vérifiez où se trouve votre colis.", "Enter your weight and press Calculate.": "Saisissez le poids et appuyez sur Calculer.", "Enter your tracking number.": "Saisissez votre numéro de suivi.", "Tell us what you want to ship and we will confirm the price and pickup details.": "Indiquez-nous ce que vous souhaitez expédier. Nous confirmerons le prix et les détails de collecte.", "Fields marked * are required.": "Les champs marqués d'un * sont obligatoires.", "Talk to us about prices, pickups or your shipment.": "Contactez-nous pour les tarifs, les collectes ou votre expédition.", "Mon–Sat, 8:00–18:00 (Kigali time)": "Lun–sam, 8 h–18 h (heure de Kigali)", "This opens your email app with the message ready to send.": "Votre application e-mail s'ouvrira avec le message prêt à être envoyé.", "From $3 per kg": "À partir de 3 $ par kg", "Price on request": "Prix sur demande", "By sea, per CBM": "Par voie maritime, par m³", "Phones and electronics": "Téléphones et électronique", "Clothing and shoes": "Vêtements et chaussures", "Home appliances": "Appareils ménagers", "Auto spare parts": "Pièces automobiles", "Beauty and cosmetics": "Beauté et cosmétiques", "Building materials": "Matériaux de construction",
    "Payment method *": "Mode de paiement *", "Choose a payment method": "Choisissez un mode de paiement", "MTN Mobile Money": "MTN Mobile Money", "Airtel Money": "Airtel Money", "Card / Bank Transfer": "Carte / virement bancaire", "Discuss with company": "Contacter l'entreprise", "Payment method": "Mode de paiement", "Choose card or bank transfer": "Choisissez carte ou virement bancaire", "Card (online)": "Carte (en ligne)", "Bank transfer (arrange with company)": "Virement bancaire (à organiser avec l'entreprise)", "Get bank transfer details": "Obtenir les coordonnées bancaires",
  },
  rw: {
    Home: "Ahabanza", "How it works": "Uko bikora", Products: "Ibicuruzwa", "Get a quote": "Saba igiciro", Book: "Teganya kohereza", Contact: "Twandikire", "Log in": "Injira", "Sign up": "Iyandikishe",
    "Get a free quote": "Saba igiciro ku buntu", "Track a parcel": "Kurikirana imizigo", "Why customers choose us": "Impamvu abakiriya baduhitamo", "Products available to ship": "Ibicuruzwa byiteguye koherezwa", "View all products": "Reba ibicuruzwa byose", "Four steps from the supplier to your door.": "Intambwe enye kuva ku mucuruzi kugeza iwawe.", "Send us the order": "Twoherereze ibyo watumije", "We receive and check": "Turakira kandi tukagenzura", "Ship by air or sea": "Ohereza mu ndege cyangwa mu bwato", "Delivery in Rwanda": "Kugeza mu Rwanda", "Products we ship": "Ibicuruzwa twohereza", "Quote and tracking": "Igiciro no gukurikirana", "Shipping estimate": "Igereranya ry'igiciro", "Weight (kg)": "Uburemere (kg)", "Shipping method": "Uburyo bwo kohereza", Calculate: "Bara", "Track your parcel": "Kurikirana imizigo yawe", "Tracking number": "Nimero yo gukurikirana", Track: "Kurikirana", "Book your shipment": "Teganya kohereza imizigo", "Full name *": "Amazina yose *", "Phone / WhatsApp *": "Telefoni / WhatsApp *", Email: "Imeyili", "Delivery city in Rwanda": "Umujyi bizagezwamo mu Rwanda", "Type of product": "Ubwoko bw'igicuruzwa", "Approx. weight (kg)": "Uburemere bugereranyije (kg)", "Air freight": "Indege", "Sea freight": "Ubwato", "Not sure yet": "Sindabyemeza", "Supplier city in China": "Umujyi w'umucuruzi mu Bushinwa", "Describe your goods *": "Sobanura ibicuruzwa byawe *", "Book on WhatsApp": "Teganya kuri WhatsApp", "Book by email": "Teganya ukoresheje imeyili", "Contact and location": "Aho duherereye n'uko watwandikira", "Office in Rwanda": "Ibiro mu Rwanda", "Warehouse in China": "Ububiko mu Bushinwa", "Opening hours": "Amasaha y'akazi", "Send us a message": "Twoherereze ubutumwa", "Your name": "Amazina yawe", Message: "Ubutumwa", "Send by email": "Ohereza kuri imeyili", "Create your account": "Fungura konti", "Welcome back": "Urakaza neza", Password: "Ijambo ry'ibanga", "Sign up with Google": "Iyandikishe ukoresheje Google", "Continue with Google": "Komeza ukoresheje Google", "Forgot your password?": "Wibagiwe ijambo ry'ibanga?",
    "Ship from China to": "Ohereza ibicuruzwa bivuye mu Bushinwa bijya mu", "simply and safely": "mu buryo bworoshye kandi bwizewe", "Air and sea freight from Guangzhou, Shenzhen and Yiwu straight to Kigali. We collect, consolidate, ship and clear customs for you.": "Dutwara imizigo mu ndege no mu bwato tuyivana Guangzhou, Shenzhen na Yiwu tuyigeza i Kigali. Turayakira, tukayiteranya, tukayohereza kandi tukayikorera gasutamo.", "Browse the products and shipping options available through CHI-RWA Cargo.": "Reba ibicuruzwa n'uburyo bwo kohereza butangwa na CHI-RWA Cargo.", "Popular goods our customers import from China. Ask us about anything not listed.": "Ibicuruzwa abakiriya bakunze kuzana bavuye mu Bushinwa. Tubaze ibitari kuri uru rutonde.", "Share your supplier details or have them deliver to our China warehouse.": "Tanga amakuru y'umucuruzi wawe cyangwa amusabe kubigeza ku bubiko bwacu mu Bushinwa.", "Goods are weighed, photographed and consolidated with other parcels.": "Ibicuruzwa birapimwa, bigafotorwa kandi bigateranywa n'indi mizigo.", "Pick the speed that fits your budget and timeline.": "Hitamo umuvuduko ujyanye n'ingengo y'imari yawe n'igihe ufite.", "We handle customs clearance and deliver in Kigali or pickup in our office.": "Dukora ibya gasutamo tukabigeza i Kigali cyangwa ukabifatira ku biro byacu.", "Get a quick estimate or check where your parcel is.": "Bona igereranya ry'igiciro cyangwa urebe aho imizigo yawe igeze.", "Enter your weight and press Calculate.": "Andika uburemere ukande Bara.", "Enter your tracking number.": "Andika nimero yo gukurikirana.", "Tell us what you want to ship and we will confirm the price and pickup details.": "Tubwire ibyo ushaka kohereza maze twemeze igiciro n'uko bizakirwa.", "Fields marked * are required.": "Imyanya iriho * igomba kuzuzwa.", "Talk to us about prices, pickups or your shipment.": "Tuvugishe ku biciro, kwakira imizigo cyangwa kohereza kwawe.", "Mon–Sat, 8:00–18:00 (Kigali time)": "Kuwa mbere–kuwa gatandatu, 8:00–18:00 (isaha ya Kigali)", "This opens your email app with the message ready to send.": "Porogaramu ya imeyili irafunguka ubutumwa bwiteguye koherezwa.", "From $3 per kg": "Guhera kuri $3 kuri kg", "Price on request": "Igiciro kibazwa", "By sea, per CBM": "Mu bwato, kuri m³", "Phones and electronics": "Telefoni n'ibikoresho by'ikoranabuhanga", "Clothing and shoes": "Imyenda n'inkweto", "Home appliances": "Ibikoresho byo mu rugo", "Auto spare parts": "Ibikoresho by'imodoka", "Beauty and cosmetics": "Ubwiza n'amavuta yo kwisiga", "Building materials": "Ibikoresho by'ubwubatsi",
    "Payment method *": "Uburyo bwo kwishyura *", "Choose a payment method": "Hitamo uburyo bwo kwishyura", "MTN Mobile Money": "MTN Mobile Money", "Airtel Money": "Airtel Money", "Card / Bank Transfer": "Ikarita / kohereza kuri banki", "Discuss with company": "Ganira n'ikigo", "Payment method": "Uburyo bwo kwishyura", "Choose card or bank transfer": "Hitamo ikarita cyangwa kohereza kuri banki", "Card (online)": "Ikarita (kuri murandasi)", "Bank transfer (arrange with company)": "Kohereza kuri banki (bivugane n'ikigo)", "Get bank transfer details": "Saba amakuru ya banki",
  },
};

const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function translateValue(value, language) {
  const key = value.trim().replace(/\s+/g, " ");
  const translated = dictionaries[language]?.[key];
  if (!translated) return value;
  return `${value.match(/^\s*/)?.[0] || ""}${translated}${value.match(/\s*$/)?.[0] || ""}`;
}

function translateTree(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const value = language === "en" ? source : translateValue(source, language);
    if (node.nodeValue !== value) node.nodeValue = value;
  }
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll("*")] : [...root.querySelectorAll("*")];
  for (const element of elements) {
    let attrs = originalAttributes.get(element);
    if (!attrs) { attrs = new Map(); originalAttributes.set(element, attrs); }
    for (const attr of ["placeholder", "title", "aria-label"]) {
      if (!element.hasAttribute(attr)) continue;
      if (!attrs.has(attr)) attrs.set(attr, element.getAttribute(attr));
      const source = attrs.get(attr);
      const value = language === "en" ? source : translateValue(source, language);
      if (element.getAttribute(attr) !== value) element.setAttribute(attr, value);
    }
  }
}

export function LanguageControl() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("chi-rwa-language");
    if (saved === "fr" || saved === "rw") setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("chi-rwa-language", language);
    document.documentElement.lang = language;
    translateTree(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (!originalText.has(node)) originalText.set(node, node.nodeValue);
            const source = originalText.get(node);
            node.nodeValue = language === "en" ? source : translateValue(source, language);
          } else if (node.nodeType === Node.ELEMENT_NODE) translateTree(node, language);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return (
    <select id="lang" aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
      <option value="en">English</option>
      <option value="rw">Kinyarwanda</option>
      <option value="fr">Français</option>
    </select>
  );
}
