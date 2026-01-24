/**
 * Currency Conversion Service
 * Uses Frankfurter API (free, no API key required)
 * API Documentation: https://www.frankfurter.app/docs/
 * Hosted by European Central Bank
 */

const BASE_URL = 'https://api.frankfurter.app';

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  INR: '₹',
  MXN: 'MX$',
  BRL: 'R$',
  ARS: 'ARS$',
  CLP: 'CLP$',
  COP: 'COL$',
  PEN: 'S/',
  UYU: 'UY$',
  VES: 'Bs.',
  BOB: 'Bs.',
  PYG: '₲',
  CRC: '₡',
  GTQ: 'Q',
  HNL: 'L',
  NIO: 'C$',
  PAB: 'B/.',
  DOP: 'RD$',
  HTG: 'G',
  JMD: 'J$',
  TTD: 'TT$',
  BBD: 'Bds$',
  KYD: 'CI$'
};

// Popular currencies by region
export const CURRENCIES_BY_REGION = {
  'América del Norte': ['USD', 'CAD', 'MXN'],
  'América del Sur': ['BRL', 'ARS', 'COP', 'CLP', 'PEN', 'UYU', 'BOB', 'PYG', 'VES'],
  'América Central': ['CRC', 'GTQ', 'HNL', 'NIO', 'PAB'],
  'Caribe': ['DOP', 'HTG', 'JMD', 'TTD', 'BBD', 'KYD'],
  'Europa': ['EUR', 'GBP', 'CHF'],
  'Asia': ['JPY', 'CNY', 'INR'],
  'Oceanía': ['AUD']
};

// Map destinations to currencies
const DESTINATION_CURRENCY_MAP = {
  // América del Norte
  'Estados Unidos': 'USD',
  'USA': 'USD',
  'United States': 'USD',
  'Canadá': 'CAD',
  'Canada': 'CAD',
  'México': 'MXN',
  'Mexico': 'MXN',
  
  // América del Sur
  'Ecuador': 'USD', // Ecuador usa dólar
  'Colombia': 'COP',
  'Perú': 'PEN',
  'Peru': 'PEN',
  'Brasil': 'BRL',
  'Brazil': 'BRL',
  'Argentina': 'ARS',
  'Chile': 'CLP',
  'Uruguay': 'UYU',
  'Bolivia': 'BOB',
  'Paraguay': 'PYG',
  'Venezuela': 'VES',
  
  // América Central
  'Costa Rica': 'CRC',
  'Guatemala': 'GTQ',
  'Honduras': 'HNL',
  'Nicaragua': 'NIO',
  'Panamá': 'PAB',
  'Panama': 'PAB',
  
  // Europa
  'España': 'EUR',
  'Spain': 'EUR',
  'Francia': 'EUR',
  'France': 'EUR',
  'Alemania': 'EUR',
  'Germany': 'EUR',
  'Italia': 'EUR',
  'Italy': 'EUR',
  'Portugal': 'EUR',
  'Países Bajos': 'EUR',
  'Netherlands': 'EUR',
  'Bélgica': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Grecia': 'EUR',
  'Greece': 'EUR',
  'Reino Unido': 'GBP',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'Inglaterra': 'GBP',
  'England': 'GBP',
  'Suiza': 'CHF',
  'Switzerland': 'CHF',
  
  // Asia
  'Japón': 'JPY',
  'Japan': 'JPY',
  'China': 'CNY',
  'India': 'INR',
  
  // Oceanía
  'Australia': 'AUD',
  'Nueva Zelanda': 'AUD'
};

/**
 * Get currency for a destination
 */
export const getCurrencyForDestination = (destination) => {
  if (!destination) return 'USD';
  
  // Direct match
  if (DESTINATION_CURRENCY_MAP[destination]) {
    return DESTINATION_CURRENCY_MAP[destination];
  }
  
  // Partial match
  const lowerDestination = destination.toLowerCase();
  for (const [key, currency] of Object.entries(DESTINATION_CURRENCY_MAP)) {
    if (lowerDestination.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDestination)) {
      return currency;
    }
  }
  
  return 'USD'; // Default fallback
};

/**
 * Get all supported currencies
 */
export const getSupportedCurrencies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currencies`);
    const data = await response.json();
    
    if (data) {
      return Object.entries(data).map(([code, name]) => ({ code, name }));
    }
    
    throw new Error('Failed to fetch currencies');
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return fallback list
    return Object.keys(CURRENCY_SYMBOLS).map(code => ({ 
      code, 
      name: code 
    }));
  }
};

/**
 * Get exchange rates for a base currency
 */
export const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    const response = await fetch(`${BASE_URL}/latest?from=${baseCurrency}`);
    const data = await response.json();
    
    if (data && data.rates) {
      return {
        base: data.base,
        rates: data.rates,
        lastUpdated: data.date
      };
    }
    
    throw new Error('Failed to fetch exchange rates');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return {
        amount: parseFloat(amount),
        convertedAmount: parseFloat(amount),
        rate: 1,
        fromCurrency,
        toCurrency
      };
    }

    const response = await fetch(
      `${BASE_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.rates && data.rates[toCurrency]) {
      const convertedAmount = data.rates[toCurrency];
      const rate = convertedAmount / amount;
      
      return {
        amount: parseFloat(amount),
        convertedAmount: convertedAmount,
        rate: rate,
        fromCurrency: data.base,
        toCurrency: toCurrency,
        lastUpdated: data.date
      };
    }
    
    throw new Error('Failed to convert currency');
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

/**
 * Format currency value
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'es-ES') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return `${symbol} ${formatted}`;
  } catch (error) {
    return `${symbol} ${parseFloat(amount).toFixed(2)}`;
  }
};

/**
 * Get popular currencies list
 */
export const getPopularCurrencies = () => {
  return [
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra esterlina', symbol: '£' },
    { code: 'COP', name: 'Peso colombiano', symbol: 'COL$' },
    { code: 'MXN', name: 'Peso mexicano', symbol: 'MX$' },
    { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
    { code: 'ARS', name: 'Peso argentino', symbol: 'ARS$' },
    { code: 'CLP', name: 'Peso chileno', symbol: 'CLP$' },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
    { code: 'CAD', name: 'Dólar canadiense', symbol: 'CA$' },
    { code: 'JPY', name: 'Yen japonés', symbol: '¥' },
    { code: 'CNY', name: 'Yuan chino', symbol: '¥' },
    { code: 'CHF', name: 'Franco suizo', symbol: 'CHF' },
    { code: 'AUD', name: 'Dólar australiano', symbol: 'A$' }
  ];
};

export default {
  getCurrencyForDestination,
  getSupportedCurrencies,
  getExchangeRates,
  convertCurrency,
  formatCurrency,
  getPopularCurrencies
};
