/**
 * Catalog AtelierPrint — sursă unică de adevăr pentru produse.
 * printArea: dreptunghi calibrat pe imaginea de 1024x1024 (coordonate în px), unde
 * userul poate poziționa designul urcat. shape: "rect" sau "ellipse" (afectează doar clip-ul vizual).
 */
const SITE_NAME = "AtelierPrint";

const CATALOG = [
  {
    slug: "tricou-bumbac-premium",
    name: "Tricou bumbac premium",
    description: "Tricou unisex din bumbac organic 180g, printat DTG în producția noastră.",
    category: "tricouri",
    priceFrom: 89,
    variants: [
      { id: "alb", label: "Alb", image: "products/tricou-alb.jpg" },
      { id: "negru", label: "Negru", image: "products/tricou-negru.jpg" },
    ],
    printArea: { x: 372, y: 300, w: 280, h: 300, shape: "rect" },
  },
  {
    slug: "tricou-copii",
    name: "Tricou copii",
    description: "Tricou din bumbac 160g pentru copii, print moale și rezistent la spălare.",
    category: "tricouri",
    priceFrom: 69,
    variants: [
      { id: "alb", label: "Alb", image: "products/tricou-copii-alb.jpg" },
    ],
    printArea: { x: 392, y: 320, w: 240, h: 260, shape: "rect" },
  },
  {
    slug: "hanorac-gluga",
    name: "Hanorac cu glugă",
    description: "Hanorac unisex din bumbac flaușat 300g, print DTF durabil pe piept.",
    category: "hanorace",
    priceFrom: 179,
    variants: [
      { id: "alb", label: "Alb", image: "products/hanorac-alb.jpg" },
      { id: "gri", label: "Gri", image: "products/hanorac-gri.jpg" },
      { id: "negru", label: "Negru", image: "products/hanorac-negru.jpg" },
    ],
    printArea: { x: 372, y: 330, w: 280, h: 260, shape: "rect" },
  },
  {
    slug: "cana-ceramica",
    name: "Cană ceramică 330ml",
    description: "Cană ceramică albă, print sublimare rezistent la spălare în mașină.",
    category: "căni",
    priceFrom: 49,
    variants: [
      { id: "alba", label: "Albă", image: "products/cana-alba.jpg" },
      { id: "neagra", label: "Neagră", image: "products/cana-neagra.jpg" },
    ],
    printArea: { x: 350, y: 430, w: 300, h: 240, shape: "rect" },
  },
  {
    slug: "husa-telefon",
    name: "Husă telefon personalizată",
    description: "Husă rigidă cu print UV de înaltă rezoluție, margini protejate.",
    category: "huse",
    priceFrom: 69,
    variants: [
      { id: "transparenta", label: "Transparentă", image: "products/husa-transparenta.jpg" },
    ],
    printArea: { x: 388, y: 270, w: 250, h: 520, shape: "rect" },
  },
  {
    slug: "mousepad",
    name: "Mousepad personalizat",
    description: "Mousepad cu suprafață textilă și bază antiderapantă din cauciuc.",
    category: "accesorii birou",
    priceFrom: 39,
    variants: [
      { id: "negru", label: "Negru", image: "products/mousepad-negru.jpg" },
    ],
    printArea: { x: 110, y: 175, w: 800, h: 660, shape: "rect" },
  },
  {
    slug: "perna-decorativa",
    name: "Pernă decorativă 40x40",
    description: "Față de pernă din poliester texturat, print pe toată suprafața frontală.",
    category: "decorațiuni",
    priceFrom: 79,
    variants: [
      { id: "alba", label: "Albă", image: "products/perna-alba.jpg" },
    ],
    printArea: { x: 210, y: 200, w: 600, h: 620, shape: "rect" },
  },
  {
    slug: "sacosa-bumbac",
    name: "Sacoșă de bumbac",
    description: "Sacoșă tote din bumbac gros, print mare pe o față.",
    category: "accesorii",
    priceFrom: 49,
    variants: [
      { id: "natur", label: "Natur", image: "products/sacosa-natur.jpg" },
      { id: "neagra", label: "Neagră", image: "products/sacosa-neagra.jpg" },
    ],
    printArea: { x: 300, y: 440, w: 420, h: 420, shape: "rect" },
  },
  {
    slug: "sapca-personalizata",
    name: "Șapcă personalizată",
    description: "Șapcă din bumbac twill cu print frontal, reglabilă.",
    category: "accesorii",
    priceFrom: 69,
    variants: [
      { id: "neagra", label: "Neagră", image: "products/sapca-neagra.jpg" },
    ],
    printArea: { x: 350, y: 230, w: 320, h: 220, shape: "rect" },
  },
  {
    slug: "sticker-vinil",
    name: "Sticker vinil",
    description: "Sticker din vinil laminat, rezistent la apă și zgârieturi.",
    category: "stickere",
    priceFrom: 12,
    variants: [
      { id: "alb", label: "Alb", image: "products/sticker-alb.jpg" },
    ],
    printArea: { x: 175, y: 95, w: 675, h: 830, shape: "rect" },
  },
  {
    slug: "tablou-canvas",
    name: "Tablou canvas 40x40",
    description: "Canvas întins pe șasiu de lemn, cerneluri pigmentate rezistente la lumină.",
    category: "decorațiuni",
    priceFrom: 149,
    variants: [
      { id: "alb", label: "Canvas alb", image: "products/canvas-alb.jpg" },
    ],
    printArea: { x: 178, y: 108, w: 705, h: 800, shape: "rect" },
  },
];

function getProductBySlug(slug) {
  return CATALOG.find((p) => p.slug === slug) || null;
}
