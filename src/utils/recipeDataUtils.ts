
// Add this to the existing file or create a new export
export const formatRecipeTitle = (title: string): string => {
  // Remove any existing "(Restaurant Style)" or similar suffixes
  const cleanTitle = title.replace(/\s*\(.*\)$/, '').trim();
  
  // Clean up any HTML entities
  const decodedTitle = decodeHtmlEntities(cleanTitle);
  
  // Capitalize each word
  const formattedTitle = decodedTitle
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Add "(Restaurant Style)" suffix
  return `${formattedTitle} Recipe (Restaurant Style)`;
};

// Extract the first value from a string, array, or object
export const extractFirstValue = (value: any): string => {
  if (!value) return '';
  
  if (typeof value === 'string') {
    return value.trim();
  }
  
  if (Array.isArray(value) && value.length > 0) {
    return typeof value[0] === 'string' ? value[0].trim() : String(value[0]);
  }
  
  if (typeof value === 'object' && value !== null) {
    const firstKey = Object.keys(value)[0];
    return firstKey ? String(value[firstKey]).trim() : '';
  }
  
  return String(value).trim();
};

// Parse various time formats into a standardized string representation
export const parseTimeValue = (timeValue: any): string => {
  if (!timeValue) return '30 min';
  
  let timeStr = String(timeValue).toLowerCase().trim();
  
  // Handle ISO duration format
  if (timeStr.startsWith('pt')) {
    const hours = timeStr.match(/(\d+)h/i);
    const minutes = timeStr.match(/(\d+)m/i);
    let result = '';
    
    if (hours && hours[1]) {
      result += `${hours[1]} hr `;
    }
    
    if (minutes && minutes[1]) {
      result += `${minutes[1]} min`;
    }
    
    return result.trim() || '30 min';
  }
  
  // Handle regular time format (e.g., "1 hour 30 minutes", "45 mins", etc.)
  if (timeStr.includes('hour') || timeStr.includes('hr') || 
      timeStr.includes('min') || timeStr.includes('sec')) {
    return timeStr;
  }
  
  // If it's just a number, assume it's minutes
  if (/^\d+$/.test(timeStr)) {
    return `${timeStr} min`;
  }
  
  // Default value if parsing fails
  return '30 min';
};

// Determine recipe difficulty based on various factors
export const determineDifficulty = (
  prepTime: any,
  ingredients: any[],
  instructions: any[],
  providedDifficulty?: string
): string => {
  // Use provided difficulty if available
  if (providedDifficulty) {
    const difficulty = String(providedDifficulty).toLowerCase().trim();
    if (difficulty.includes('easy')) return 'Easy';
    if (difficulty.includes('medium') || difficulty.includes('moderate')) return 'Medium';
    if (difficulty.includes('hard') || difficulty.includes('difficult')) return 'Hard';
  }
  
  // Calculate difficulty score
  let score = 0;
  
  // Factor 1: Preparation time
  const timeStr = String(prepTime || '').toLowerCase();
  if (timeStr.includes('hour') || timeStr.includes('hr') || 
      (timeStr.match(/\d+/) && parseInt(timeStr.match(/\d+/)?.[0] || '0') > 45)) {
    score += 2;
  }
  
  // Factor 2: Number of ingredients
  if (ingredients.length > 10) {
    score += 1;
  }
  if (ingredients.length > 15) {
    score += 1;
  }
  
  // Factor 3: Number of instructions
  if (instructions.length > 7) {
    score += 1;
  }
  if (instructions.length > 12) {
    score += 1;
  }
  
  // Determine difficulty level based on score
  if (score <= 2) return 'Easy';
  if (score <= 4) return 'Medium';
  return 'Hard';
};

// Decode HTML entities in a string
export const decodeHtmlEntities = (text: string): string => {
  if (!text) return '';
  
  // Safely convert to string
  const str = String(text);
  
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x25a2;': '•', // Convert square symbol to bullet point
    '&nbsp;': ' ',
    '&bull;': '•',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&hellip;': '…',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&frac14;': '¼',
    '&frac12;': '½',
    '&frac34;': '¾'
  };
  
  // Replace named entities
  let decoded = str.replace(/&(?:amp|lt|gt|quot|#39|#x25a2|nbsp|bull|ndash|mdash|lsquo|rsquo|ldquo|rdquo|hellip|trade|copy|reg|deg|frac14|frac12|frac34);/g, 
    match => entities[match as keyof typeof entities] || match);
  
  // Replace numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => 
    String.fromCharCode(parseInt(dec, 10)));
  
  // Replace hex entities
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
};

// Enhanced ingredient normalization
export const normalizeIngredient = (ingredient: any): string => {
  if (!ingredient) return '';
  
  // Extract the ingredient text regardless of input format
  let ingredientText = '';
  
  if (typeof ingredient === 'string') {
    ingredientText = ingredient;
  } else if (typeof ingredient === 'object' && ingredient !== null) {
    // Try to extract from common ingredient object formats
    ingredientText = ingredient.name || 
                    ingredient.text || 
                    ingredient.ingredient || 
                    ingredient.description ||
                    ingredient.value ||
                    JSON.stringify(ingredient);
  } else {
    ingredientText = String(ingredient);
  }
  
  // Clean up the ingredient text
  ingredientText = decodeHtmlEntities(ingredientText)
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/^[-•*]+\s*/, '') // Remove bullet points at the beginning
    .replace(/^\d+\.\s*/, '') // Remove numbering at the beginning
    .replace(/\b([A-Z]{2,})\b/g, match => match.charAt(0) + match.slice(1).toLowerCase()); // Fix ALL CAPS ingredients
  
  // Ensure first letter is capitalized
  if (ingredientText.length > 0) {
    ingredientText = ingredientText.charAt(0).toUpperCase() + ingredientText.slice(1);
  }
  
  // Add period at the end if missing and the ingredient has significant length
  if (ingredientText.length > 10 && 
      !ingredientText.endsWith('.') && 
      !ingredientText.endsWith('!') && 
      !ingredientText.endsWith('?')) {
    ingredientText += '.';
  }
  
  return ingredientText;
};

// Enhanced instruction normalization
export const normalizeInstruction = (instruction: any): string => {
  if (!instruction) return '';
  
  // Extract the instruction text regardless of input format
  let instructionText = '';
  
  if (typeof instruction === 'string') {
    instructionText = instruction;
  } else if (typeof instruction === 'object' && instruction !== null) {
    // Try to extract from common instruction object formats
    instructionText = instruction.text || 
                     instruction.step || 
                     instruction.description || 
                     instruction.value ||
                     JSON.stringify(instruction);
  } else {
    instructionText = String(instruction);
  }
  
  // Clean up the instruction text
  instructionText = decodeHtmlEntities(instructionText)
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/^[-•*]+\s*/, '') // Remove bullet points at the beginning
    .replace(/^\d+\.\s*/, ''); // Remove numbering at the beginning
  
  // Ensure first letter is capitalized
  if (instructionText.length > 0) {
    instructionText = instructionText.charAt(0).toUpperCase() + instructionText.slice(1);
  }
  
  // Add period at the end if missing
  if (instructionText.length > 0 && 
      !instructionText.endsWith('.') && 
      !instructionText.endsWith('!') && 
      !instructionText.endsWith('?')) {
    instructionText += '.';
  }
  
  return instructionText;
};
