export interface SuperheroBadge {
  id: string;
  name: string;
  hero: string;
  universe: 'Marvel' | 'DC' | 'Harry Potter' | 'Custom';
  color: string;
  bgGradient: string;
  iconSymbol: string;
  accentBorder: string;
  imageUrl?: string;
  amount?: number;
}

export const SUPERHERO_BADGES: SuperheroBadge[] = [
  // --- Harry Potter Magical Badges ---
  {
    id: 'badge-gryffindor',
    name: 'Lion of Courage Honor',
    hero: 'Gryffindor',
    universe: 'Harry Potter',
    color: '#990000',
    bgGradient: 'from-red-950 via-red-700 to-amber-600',
    iconSymbol: '🦁',
    accentBorder: 'border-amber-400',
    imageUrl: 'https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?auto=format&fit=crop&w=300&q=80',
    amount: 500,
  },
  {
    id: 'badge-slytherin',
    name: 'Ambition Serpent Crest',
    hero: 'Slytherin',
    universe: 'Harry Potter',
    color: '#0F6D4E',
    bgGradient: 'from-[#0F6D4E] via-[#0F6D4E] to-slate-950',
    iconSymbol: '🐍',
    accentBorder: 'border-emerald-300',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80',
    amount: 1000,
  },
  {
    id: 'badge-ravenclaw',
    name: 'Wisdom Eagle Seal',
    hero: 'Ravenclaw',
    universe: 'Harry Potter',
    color: '#000A90',
    bgGradient: 'from-blue-950 via-blue-700 to-cyan-600',
    iconSymbol: '🦅',
    accentBorder: 'border-cyan-300',
    amount: 1500,
  },
  {
    id: 'badge-hufflepuff',
    name: 'Loyalty Badger Crest',
    hero: 'Hufflepuff',
    universe: 'Harry Potter',
    color: '#ECB939',
    bgGradient: 'from-amber-600 via-yellow-500 to-[#0F6D4E]-900',
    iconSymbol: '🦡',
    accentBorder: 'border-amber-300',
    amount: 2000,
  },
  {
    id: 'badge-golden-snitch',
    name: 'Seeker Quidditch Honor',
    hero: 'Golden Snitch',
    universe: 'Harry Potter',
    color: '#D4AF37',
    bgGradient: 'from-amber-300 via-yellow-400 to-amber-600',
    iconSymbol: '🧹',
    accentBorder: 'border-yellow-200',
    amount: 2500,
  },
  {
    id: 'badge-deathly-hallows',
    name: 'Elder Wand Master',
    hero: 'Deathly Hallows',
    universe: 'Harry Potter',
    color: '#0F6D4E',
    bgGradient: 'from-zinc-950 via-[#0F6D4E]-900 to-black',
    iconSymbol: '🪄',
    accentBorder: 'border-[#0F6D4E]-400',
    amount: 5000,
  },

  // --- Marvel Superhero Badges ---
  {
    id: 'badge-captain-america',
    name: 'First Avenger Shield',
    hero: 'Captain America',
    universe: 'Marvel',
    color: '#3182CE',
    bgGradient: 'from-blue-700 via-[#0F6D4E]-600 to-red-600',
    iconSymbol: '⭐',
    accentBorder: 'border-blue-400',
    amount: 500,
  },
  {
    id: 'badge-iron-man',
    name: 'Arc Reactor Benefactor',
    hero: 'Iron Man',
    universe: 'Marvel',
    color: '#DD6B20',
    bgGradient: 'from-red-900 via-amber-400 to-red-600',
    iconSymbol: '⚡',
    accentBorder: 'border-amber-300',
    amount: 1000,
  },
  {
    id: 'badge-spider-man',
    name: 'Friendly Neighborhood Hero',
    hero: 'Spider-Man',
    universe: 'Marvel',
    color: '#E53E3E',
    bgGradient: 'from-red-600 via-[#0F6D4E]-900 to-blue-700',
    iconSymbol: '🕷️',
    accentBorder: 'border-red-400',
    amount: 1500,
  },
  {
    id: 'badge-avengers',
    name: 'Avengers Assembled',
    hero: 'Avengers',
    universe: 'Marvel',
    color: '#3182CE',
    bgGradient: 'from-[#0F6D4E]-950 via-[#0F6D4E]-800 to-indigo-600',
    iconSymbol: 'A',
    accentBorder: 'border-[#0F6D4E]-400',
    amount: 2000,
  },
  {
    id: 'badge-thor',
    name: 'Mjolnir Lightning Honor',
    hero: 'Thor',
    universe: 'Marvel',
    color: '#4FD1C5',
    bgGradient: 'from-slate-900 via-cyan-500 to-blue-700',
    iconSymbol: '🔨',
    accentBorder: 'border-cyan-300',
    amount: 2500,
  },
  {
    id: 'badge-deadpool',
    name: 'Merc With a Heart',
    hero: 'Deadpool',
    universe: 'Marvel',
    color: '#C53030',
    bgGradient: 'from-red-800 via-black to-red-950',
    iconSymbol: '🔴',
    accentBorder: 'border-red-500',
    amount: 3000,
  },

  // --- DC Superhero Badges ---
  {
    id: 'badge-superman',
    name: 'Man of Steel Honor',
    hero: 'Superman',
    universe: 'DC',
    color: '#E53E3E',
    bgGradient: 'from-cyan-500 via-red-600 to-[#0F6D4E]-500',
    iconSymbol: 'S',
    accentBorder: 'border-yellow-400',
    amount: 500,
  },
  {
    id: 'badge-batman',
    name: 'Dark Knight Guardian',
    hero: 'Batman',
    universe: 'DC',
    color: '#F6E05E',
    bgGradient: 'from-zinc-950 via-amber-500 to-black',
    iconSymbol: '🦇',
    accentBorder: 'border-amber-400',
    amount: 1000,
  },
  {
    id: 'badge-wonder-woman',
    name: 'Amazonian Legend',
    hero: 'Wonder Woman',
    universe: 'DC',
    color: '#D69E2E',
    bgGradient: 'from-red-600 via-amber-400 to-blue-700',
    iconSymbol: 'W',
    accentBorder: 'border-yellow-300',
    amount: 1500,
  },
  {
    id: 'badge-flash',
    name: 'Speed Force Patron',
    hero: 'The Flash',
    universe: 'DC',
    color: '#E53E3E',
    bgGradient: 'from-red-600 via-yellow-400 to-amber-500',
    iconSymbol: '⚡',
    accentBorder: 'border-[#0F6D4E]-400',
    amount: 2000,
  },
  {
    id: 'badge-robin',
    name: 'Boy Wonder Shield',
    hero: 'Robin',
    universe: 'DC',
    color: '#38A169',
    bgGradient: 'from-red-600 via-green-600 to-yellow-400',
    iconSymbol: 'R',
    accentBorder: 'border-yellow-400',
    amount: 2500,
  },
];

/** Deterministically get a badge for a donation ID or index */
export function getBadgeForDonation(donationId: string | number): SuperheroBadge {
  const str = String(donationId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUPERHERO_BADGES.length;
  return SUPERHERO_BADGES[index];
}
