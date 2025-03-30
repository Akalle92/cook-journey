import { scaleRecipe, formatTime } from '../recipeScaler';
import { Recipe } from '@/types/recipe';

describe('recipeScaler', () => {
  const mockRecipe: Recipe = {
    id: '1',
    title: 'Test Recipe',
    description: 'Test Description',
    ingredients: [
      '2 cups flour',
      '1 tbsp sugar',
      '3 eggs',
      '1/2 cup milk',
      '1 tsp vanilla'
    ],
    instructions: ['Step 1', 'Step 2'],
    prepTime: '30m',
    cookTime: '1h',
    servings: 4,
    difficulty: 'easy',
    cuisine: 'Italian',
    dietaryRestrictions: ['vegetarian'],
    calories: 500,
    imageUrl: 'image1.jpg',
    imageUrls: ['image1.jpg'],
    tags: ['dessert'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: 'Dessert',
    confidence: 0.95,
    method: 'manual',
    extractionResults: {},
    debugInfo: {},
    data: {}
  };

  describe('scaleRecipe', () => {
    it('should scale ingredients correctly for 2x servings', () => {
      const scaled = scaleRecipe(mockRecipe, 8);
      expect(scaled.ingredients).toEqual([
        '4 cups flour',
        '2 tbsp sugar',
        '6 eggs',
        '1 cup milk',
        '2 tsp vanilla'
      ]);
    });

    it('should scale ingredients correctly for 0.5x servings', () => {
      const scaled = scaleRecipe(mockRecipe, 2);
      expect(scaled.ingredients).toEqual([
        '1 cup flour',
        '0.5 tbsp sugar',
        '1.5 eggs',
        '0.25 cup milk',
        '0.5 tsp vanilla'
      ]);
    });

    it('should handle ingredients without measurements', () => {
      const recipeWithText = {
        ...mockRecipe,
        ingredients: ['2 cups flour', 'salt to taste', '3 eggs']
      };
      const scaled = scaleRecipe(recipeWithText, 8);
      expect(scaled.ingredients).toEqual([
        '4 cups flour',
        'salt to taste',
        '6 eggs'
      ]);
    });

    it('should scale times correctly', () => {
      const scaled = scaleRecipe(mockRecipe, 8);
      expect(scaled.prepTime).toBe(60); // 30m * 2
      expect(scaled.cookTime).toBe(120); // 1h * 2
    });

    it('should handle unit conversions', () => {
      const recipeWithLargeAmounts = {
        ...mockRecipe,
        ingredients: ['16 tbsp sugar', '4 cups milk']
      };
      const scaled = scaleRecipe(recipeWithLargeAmounts, 2);
      expect(scaled.ingredients).toEqual([
        '1 cup sugar',
        '1 quart milk'
      ]);
    });
  });

  describe('formatTime', () => {
    it('should format minutes correctly', () => {
      expect(formatTime(45)).toBe('45m');
      expect(formatTime(90)).toBe('1h 30m');
      expect(formatTime(150)).toBe('2h 30m');
    });

    it('should handle zero minutes', () => {
      expect(formatTime(0)).toBe('0m');
    });

    it('should handle exact hours', () => {
      expect(formatTime(60)).toBe('1h 0m');
      expect(formatTime(120)).toBe('2h 0m');
    });
  });
}); 