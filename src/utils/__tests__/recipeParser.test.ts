import { parseRecipe, createRecipe } from '../recipeParser';

describe('recipeParser', () => {
  describe('parseRecipe', () => {
    it('should parse a complete recipe object', () => {
      const data = {
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['2 cups flour', '1 tbsp sugar'],
        instructions: ['Step 1', 'Step 2'],
        prepTime: '30m',
        cookTime: '1h',
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Italian',
        dietaryRestrictions: ['vegetarian'],
        calories: 500,
        images: ['image1.jpg', 'image2.jpg'],
        tags: ['dessert', 'baking'],
        category: 'Dessert',
        confidence: 0.95,
        method: 'manual',
        extractionResults: {},
        debugInfo: {},
        data: {}
      };

      const parsed = parseRecipe(data);
      expect(parsed).toEqual({
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['2 cups flour', '1 tbsp sugar'],
        instructions: ['Step 1', 'Step 2'],
        prepTime: '30m',
        cookTime: '1h',
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Italian',
        dietaryRestrictions: ['vegetarian'],
        calories: 500,
        imageUrls: ['image1.jpg', 'image2.jpg'],
        tags: ['dessert', 'baking'],
        category: 'Dessert',
        confidence: 0.95,
        method: 'manual',
        extractionResults: {},
        debugInfo: {},
        data: data
      });
    });

    it('should handle missing optional fields', () => {
      const data = {
        title: 'Test Recipe',
        ingredients: ['2 cups flour'],
        instructions: ['Step 1']
      };

      const parsed = parseRecipe(data);
      expect(parsed.title).toBe('Test Recipe');
      expect(parsed.description).toBe('');
      expect(parsed.ingredients).toEqual(['2 cups flour']);
      expect(parsed.instructions).toEqual(['Step 1']);
      expect(parsed.servings).toBe(4); // Default value
      expect(parsed.difficulty).toBe('medium'); // Default value
      expect(parsed.cuisine).toBe('Other'); // Default value
      expect(parsed.dietaryRestrictions).toEqual([]);
      expect(parsed.calories).toBe(0);
      expect(parsed.imageUrls).toEqual([]);
      expect(parsed.tags).toEqual([]);
    });

    it('should handle different image field formats', () => {
      const data = {
        title: 'Test Recipe',
        image: 'single.jpg',
        images: ['array1.jpg', 'array2.jpg']
      };

      const parsed = parseRecipe(data);
      expect(parsed.imageUrls).toEqual(['single.jpg', 'array1.jpg', 'array2.jpg']);
    });

    it('should clean up ingredient and instruction strings', () => {
      const data = {
        title: 'Test Recipe',
        ingredients: ['• 2 cups flour', '- 1 tbsp sugar', '* 3 eggs'],
        instructions: ['• Step 1', '- Step 2', '* Step 3']
      };

      const parsed = parseRecipe(data);
      expect(parsed.ingredients).toEqual(['2 cups flour', '1 tbsp sugar', '3 eggs']);
      expect(parsed.instructions).toEqual(['Step 1', 'Step 2', 'Step 3']);
    });
  });

  describe('createRecipe', () => {
    it('should create a recipe with all required fields', () => {
      const parsedData = {
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['2 cups flour'],
        instructions: ['Step 1'],
        prepTime: '30m',
        cookTime: '1h',
        servings: 4,
        difficulty: 'easy' as const,
        cuisine: 'Italian',
        dietaryRestrictions: ['vegetarian'],
        calories: 500,
        imageUrls: ['image1.jpg'],
        tags: ['dessert'],
        category: 'Dessert',
        confidence: 0.95,
        method: 'manual',
        extractionResults: {},
        debugInfo: {},
        data: {}
      };

      const recipe = createRecipe(parsedData);
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.imageUrl).toBe('image1.jpg');
      expect(recipe.imageUrls).toEqual(['image1.jpg']);
      expect(recipe.createdAt).toBeDefined();
      expect(recipe.updatedAt).toBeDefined();
    });
  });
}); 