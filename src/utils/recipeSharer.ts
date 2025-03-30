import { Recipe } from '@/types/recipe';

interface ShareOptions {
  title?: string;
  description?: string;
  includeImage?: boolean;
  includeNutrition?: boolean;
}

export const generateShareText = (recipe: Recipe, options: ShareOptions = {}): string => {
  const {
    title = recipe.title,
    description = recipe.description,
    includeImage = true,
    includeNutrition = true
  } = options;

  let shareText = `${title}\n\n`;

  if (description) {
    shareText += `${description}\n\n`;
  }

  if (includeImage && recipe.imageUrl) {
    shareText += `Image: ${recipe.imageUrl}\n\n`;
  }

  shareText += `Prep Time: ${recipe.prepTime}\n`;
  shareText += `Cook Time: ${recipe.cookTime}\n`;
  shareText += `Servings: ${recipe.servings}\n`;
  shareText += `Difficulty: ${recipe.difficulty}\n`;
  shareText += `Cuisine: ${recipe.cuisine}\n`;

  if (includeNutrition) {
    shareText += `Calories: ${recipe.calories}\n`;
  }

  if (recipe.dietaryRestrictions.length > 0) {
    shareText += `Dietary Restrictions: ${recipe.dietaryRestrictions.join(', ')}\n`;
  }

  shareText += '\nIngredients:\n';
  recipe.ingredients.forEach((ingredient, index) => {
    shareText += `${index + 1}. ${ingredient}\n`;
  });

  shareText += '\nInstructions:\n';
  recipe.instructions.forEach((instruction, index) => {
    shareText += `${index + 1}. ${instruction}\n`;
  });

  if (recipe.tags.length > 0) {
    shareText += `\nTags: ${recipe.tags.join(', ')}`;
  }

  return shareText;
};

export const shareRecipe = async (
  recipe: Recipe,
  options: ShareOptions = {}
): Promise<void> => {
  const shareText = generateShareText(recipe, options);

  if (navigator.share) {
    try {
      await navigator.share({
        title: recipe.title,
        text: shareText,
        url: recipe.imageUrl
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      throw new Error('Failed to share recipe');
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(shareText);
    throw new Error('Web Share API not supported');
  }
};

export const generateShareUrl = (recipe: Recipe): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/recipe/${encodeURIComponent(recipe.id)}`;
};

export const shareToSocialMedia = (
  recipe: Recipe,
  platform: 'facebook' | 'twitter' | 'pinterest' | 'whatsapp'
): void => {
  const shareUrl = generateShareUrl(recipe);
  const shareText = generateShareText(recipe, { includeImage: false });

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
  };

  window.open(shareUrls[platform], '_blank', 'width=600,height=400');
}; 