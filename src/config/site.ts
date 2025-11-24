type NavItem = {
  label: string;
  href: string;
  submenu?: Array<{
    label: string;
    href: string;
    submenu?: string[];
  }>;
};

export const siteConfig = {
  name: "Factory Collective",
  description: "Commerce infrastructure for collectible factories.",
  keywords: [
    "Factory Collective",
    "Collectible Commerce",
    "Fashion",
    "Jewellery",
    "Art",
    "Design",
    "Objects",
    "Books",
  ],
  languages: ["en", "de"],
  canonicalDomain: "factory.collective",
  nav: [
    { 
      label: "SHOP", 
      href: "/shop",
      submenu: [
        { label: "Jewellery", href: "/shop/jewellery", submenu: ["Rings", "Necklaces", "Bracelets", "Earrings", "Chains", "Buttons - Brooches"] },
        { label: "Garments", href: "/shop/garments", submenu: ["Shirts", "Coats", "Pants", "Skirts", "Denim", "Knitwear", "Outerwear", "Footwear", "Boots", "Accessories", "Bags", "Wallets", "Scarves", "Belts", "Glasses", "Underwear", "Swimwear", "Eyewear", "Cyclingshorts"] },
        { label: "Objects", href: "/shop/objects", submenu: ["Vessels", "Bowls", "Plates", "Vases"] },
        { label: "Art", href: "/shop/art", submenu: ["Originals", "Prints", "Limited", "Poster"] },
        { label: "Books", href: "/shop/books", submenu: ["Limited Edition", "Open Edition"] },
      ]
    },
    { label: "COLLECTIONS", href: "/collections" },
    { label: "ARCHIVE", href: "/archive" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ] as NavItem[],
  footer: {
    supportEmail: "ops@factory.collective",
    phone: "+1 (347) 555-0112",
    address: "81 Prospect St, Brooklyn, NY",
  },
};
