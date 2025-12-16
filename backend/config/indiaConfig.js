// Allowed Indian cities and helper utilities for filtering locations
const ALLOWED_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Noida',
  'Gurugram',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Indore'
];

const isAllowedCity = (loc) => {
  if (!loc) return false;
  const normal = loc.toLowerCase();
  // Exact match or contains
  return ALLOWED_CITIES.some(city => normal.includes(city.toLowerCase()));
};

const isIndiaLocation = (loc) => {
  if (!loc) return false;
  const normal = loc.toLowerCase();
  // Contains 'india' OR is one of allowed cities OR 'remote india'
  if (normal.includes('india')) return true;
  if (isAllowedCity(loc)) return true;
  // Remote India explicit
  if (normal.includes('remote') && normal.includes('india')) return true;
  return false;
};

const normalizeCity = (loc) => {
  if (!loc) return '';
  const normal = loc.toLowerCase();
  // If contains allowed city, return that city name (first match)
  for (const city of ALLOWED_CITIES) {
    if (normal.includes(city.toLowerCase())) return city;
  }
  // Remote India
  if (normal.includes('remote') && normal.includes('india')) return 'Remote India';
  // Contains 'india' but not specific city
  if (normal.includes('india')) return 'India';
  return loc; // fallback
};

module.exports = {
  ALLOWED_CITIES,
  isAllowedCity,
  isIndiaLocation,
  normalizeCity
};
