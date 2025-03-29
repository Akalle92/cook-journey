
// Add this to the existing file or create a new export
export const formatRecipeTitle = (title: string): string => {
  // Remove any existing "(Restaurant Style)" or similar suffixes
  const cleanTitle = title.replace(/\s*\(.*\)$/, '').trim();
  
  // Capitalize each word
  const formattedTitle = cleanTitle
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Add "(Restaurant Style)" suffix
  return `${formattedTitle} Recipe (Restaurant Style)`;
};
