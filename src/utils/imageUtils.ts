/**
 * Utility functions for handling image URLs and processing
 */

// Enhanced helper function to extract the first high-quality image URL from a possible JSON array
export const extractFirstImageUrl = (imageUrl: any): string | undefined => {
  if (!imageUrl) return undefined;
  
  try {
    // If it's already a string, return it
    if (typeof imageUrl === 'string') {
      if (!imageUrl.startsWith('http')) {
        // Try to fix relative URLs
        if (imageUrl.startsWith('/')) {
          return `https://example.com${imageUrl}`;
        }
        return undefined;
      }
      return imageUrl;
    }
    
    // If it's a JSON string, parse it
    if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
      const parsed = JSON.parse(imageUrl);
      
      // If it's an array, find the first valid image
      if (Array.isArray(parsed)) {
        // Find the largest image in the array (if size information is available)
        const imagesWithSize = parsed.filter(img => 
          typeof img === 'object' && img.url && (img.width || img.height)
        );
        
        if (imagesWithSize.length > 0) {
          // Sort by size (width * height) in descending order
          const sorted = imagesWithSize.sort((a, b) => {
            const aSize = (a.width || 0) * (a.height || 0);
            const bSize = (b.width || 0) * (b.height || 0);
            return bSize - aSize;
          });
          return sorted[0].url;
        }
        
        // If no size information, return the first valid URL
        for (const item of parsed) {
          if (typeof item === 'string' && item.startsWith('http')) {
            return item;
          } else if (typeof item === 'object') {
            if (item.url && typeof item.url === 'string') return item.url;
            if (item.src && typeof item.src === 'string') return item.src;
          }
        }
        return parsed[0];
      }
      
      // If it's an object, look for common image URL properties
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.url || parsed.src || parsed.image || parsed.imageUrl;
      }
      
      return parsed.toString();
    }
    
    // If it's already an object
    if (typeof imageUrl === 'object' && imageUrl !== null) {
      return imageUrl.url || imageUrl.src || imageUrl.image || imageUrl.imageUrl;
    }
    
    // If it's already an array, find the first valid image
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      // First try to find objects with size information
      const imagesWithSize = imageUrl.filter(img => 
        typeof img === 'object' && img !== null && (img.width || img.height)
      );
      
      if (imagesWithSize.length > 0) {
        // Sort by size in descending order
        const sorted = imagesWithSize.sort((a, b) => {
          const aSize = (a.width || 0) * (a.height || 0);
          const bSize = (b.width || 0) * (b.height || 0);
          return bSize - aSize;
        });
        return sorted[0].url || sorted[0].src;
      }
      
      // Otherwise return the first string or object with url/src
      for (const item of imageUrl) {
        if (typeof item === 'string' && item.startsWith('http')) {
          return item;
        } else if (typeof item === 'object' && item !== null) {
          if (item.url) return item.url;
          if (item.src) return item.src;
        }
      }
      return typeof imageUrl[0] === 'string' ? imageUrl[0] : undefined;
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
  }
  
  return undefined;
};
