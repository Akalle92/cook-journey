import { scraperService } from '../scraperService';
import { Recipe } from '@/types/recipe';

// Mock fetch
global.fetch = jest.fn();

describe('ScraperService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeRecipe', () => {
    const mockHtml = `
      <html>
        <head>
          <title>Test Recipe</title>
          <meta property="og:title" content="Test Recipe" />
          <meta property="og:description" content="A delicious test recipe" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="recipe:ingredients" content="Ingredient 1\nIngredient 2" />
          <meta property="recipe:instructions" content="Step 1\nStep 2" />
        </head>
        <body>
          <script type="application/ld+json">
            {
              "@type": "Recipe",
              "name": "Test Recipe",
              "description": "A delicious test recipe",
              "image": "https://example.com/image.jpg",
              "recipeIngredient": ["Ingredient 1", "Ingredient 2"],
              "recipeInstructions": ["Step 1", "Step 2"]
            }
          </script>
        </body>
      </html>
    `;

    it('should successfully scrape a recipe from HTML', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await scraperService.scrapeRecipe('https://example.com/recipe');

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe?.title).toBe('Test Recipe');
      expect(result.recipe?.description).toBe('A delicious test recipe');
      expect(result.recipe?.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.recipe?.ingredients).toHaveLength(2);
      expect(result.recipe?.instructions).toHaveLength(2);
    });

    it('should handle Instagram-specific recipe data', async () => {
      const instagramHtml = `
        <html>
          <head>
            <title>Instagram Recipe</title>
            <meta property="og:title" content="Instagram Recipe" />
            <meta property="og:description" content="A recipe from Instagram" />
            <meta property="og:image" content="https://instagram.com/image.jpg" />
          </head>
          <body>
            <script type="application/ld+json">
              {
                "@type": "Recipe",
                "name": "Instagram Recipe",
                "description": "A recipe from Instagram",
                "image": "https://instagram.com/image.jpg",
                "recipeIngredient": ["Ingredient 1", "Ingredient 2"],
                "recipeInstructions": ["Step 1", "Step 2"]
              }
            </script>
          </body>
        </html>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(instagramHtml)
      });

      const result = await scraperService.scrapeRecipe('https://instagram.com/p/abc123');

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe?.title).toBe('Instagram Recipe');
      expect(result.recipe?.description).toBe('A recipe from Instagram');
      expect(result.recipe?.imageUrl).toBe('https://instagram.com/image.jpg');
    });

    it('should handle unsupported URLs', async () => {
      const result = await scraperService.scrapeRecipe('https://unsupported-site.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported website');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await scraperService.scrapeRecipe('https://example.com/recipe');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle invalid HTML', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<invalid>html</invalid>')
      });

      const result = await scraperService.scrapeRecipe('https://example.com/recipe');

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      // Should still extract basic information from meta tags
      expect(result.recipe?.title).toBe('');
      expect(result.recipe?.description).toBe('');
      expect(result.recipe?.imageUrl).toBe('');
    });
  });
}); 