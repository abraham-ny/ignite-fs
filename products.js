// ============================================================
// PRODUCTS DATA — edit here to add/remove products
// Prices in KES. category must match filter-btn data-filter.
// ============================================================
const PRODUCTS = [
  {
    id: "p001",
    name: "Galaxy Burst Shell",
    category: "aerial",
    price: 2500,
    originalPrice: 3000,
    stock: 45,
    description: "Multi-colour aerial shell with 3-second hang time. Brilliant starfall effect. Perfect for outdoor events.",
    emoji: "🎆",
    badge: "Bestseller",
    effects: ["Gold Stars", "Color Burst", "Crackle Tail"]
  },
  {
    id: "p002",
    name: "Crimson Fountain",
    category: "fountain",
    price: 850,
    originalPrice: null,
    stock: 120,
    description: "Ground fountain that shoots 15ft of crimson and gold sparks for 60 seconds. Great for garden parties.",
    emoji: "🌋",
    badge: null,
    effects: ["Crimson Sparks", "Gold Rain", "Smoke Finish"]
  },
  {
    id: "p003",
    name: "Wedding Sparklers 36\"",
    category: "sparkler",
    price: 350,
    originalPrice: null,
    stock: 500,
    description: "Long-burning 36-inch gold sparklers. Burns 4+ minutes. Sold in packs of 10. Ideal for grand exits.",
    emoji: "✨",
    badge: "Pack of 10",
    effects: ["Gold Sparkle", "Slow Burn", "Low Smoke"]
  },
  {
    id: "p004",
    name: "Phantom Roman Candle",
    category: "roman",
    price: 600,
    originalPrice: 750,
    stock: 80,
    description: "8-shot roman candle with alternating red, green, and gold stars. Includes whistle effect on final shot.",
    emoji: "🕯️",
    badge: "Sale",
    effects: ["Red Stars", "Green Stars", "Whistle Finale"]
  },
  {
    id: "p005",
    name: "Celebration Cake 25 Shot",
    category: "cake",
    price: 4500,
    originalPrice: 5200,
    stock: 30,
    description: "Pre-fused 25-shot cake pack. Full 90-second show in a single device. Mix of brocade, glitter and pearls.",
    emoji: "🎂",
    badge: "Popular",
    effects: ["Brocade Crown", "Glitter Mine", "Color Pearl"]
  },
  {
    id: "p006",
    name: "Silver Comet Shell",
    category: "aerial",
    price: 1800,
    originalPrice: null,
    stock: 60,
    description: "Single-shot aerial shell with comet tail and silver glitter burst. Reaches 80m altitude.",
    emoji: "☄️",
    badge: null,
    effects: ["Silver Comet", "Glitter Burst", "Report"]
  },
  {
    id: "p007",
    name: "Waterfall Fountain Pro",
    category: "fountain",
    price: 1200,
    originalPrice: null,
    stock: 75,
    description: "Professional waterfall effect fountain. 90 seconds of cascading silver and gold sparks. Event-grade.",
    emoji: "💫",
    badge: "Pro Grade",
    effects: ["Waterfall", "Silver Cascade", "Gold Shimmer"]
  },
  {
    id: "p008",
    name: "Heart Sparklers",
    category: "sparkler",
    price: 280,
    originalPrice: null,
    stock: 300,
    description: "Heart-shaped sparklers for weddings and proposals. Burns 2 minutes. Pack of 6.",
    emoji: "💗",
    badge: "Pack of 6",
    effects: ["Heart Shape", "Gold Sparkle", "Romantic Glow"]
  },
  {
    id: "p009",
    name: "Dragon Breath Roman",
    category: "roman",
    price: 900,
    originalPrice: 1100,
    stock: 50,
    description: "12-shot roman candle with intense red and orange dragon breath effect. Powerful visual impact.",
    emoji: "🐉",
    badge: "Intense",
    effects: ["Dragon Breath", "Orange Stars", "Heavy Report"]
  },
  {
    id: "p010",
    name: "Grand Finale Cake 49 Shot",
    category: "cake",
    price: 8500,
    originalPrice: 10000,
    stock: 15,
    description: "The ultimate show finale. 49 shots of synchronized multi-effect bursts. Professional event must-have.",
    emoji: "🏆",
    badge: "Grand",
    effects: ["Fan Pattern", "Multi-Color", "Crackle Finale"]
  },
  {
    id: "p011",
    name: "Blue Peony Shell",
    category: "aerial",
    price: 3200,
    originalPrice: null,
    stock: 35,
    description: "Premium blue peony burst — one of the rarest colours in fireworks. Imported. Limited stock.",
    emoji: "🔵",
    badge: "Rare",
    effects: ["Blue Peony", "Silver Ring", "Crackling Stars"]
  },
  {
    id: "p012",
    name: "Kids Safe Sparklers",
    category: "sparkler",
    price: 200,
    originalPrice: null,
    stock: 800,
    description: "Cool-touch safety sparklers for children. No harmful chemicals. Smoke-free. Pack of 12.",
    emoji: "🌟",
    badge: "Child Safe",
    effects: ["Cool-Touch", "No Smoke", "Gold Glow"]
  }
];

// ============================================================
// CONFIG — Replace with your actual Google Apps Script URL
// ============================================================
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwdjEhrDo2RN2LfP0y5fKhYoshMUjqQDc1H_ygxIEF8d0DSxKN4pjRVtM0MVf3XobB3/exec",
  CURRENCY: "KES",
  FREE_DELIVERY_THRESHOLD: 5000
};
