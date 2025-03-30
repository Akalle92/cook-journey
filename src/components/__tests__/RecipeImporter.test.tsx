import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeImporter } from '../RecipeImporter';
import { scraperService } from '@/services/scraperService';
import { Recipe } from '@/types/recipe';

// Mock the scraper service
jest.mock('@/services/scraperService');

describe('RecipeImporter', () => {
  const mockRecipe: Recipe = {
    id: '1',
    title: 'Test Recipe',
    description: 'A delicious test recipe',
    imageUrl: 'https://example.com/image.jpg',
    imageUrls: ['https://example.com/image.jpg'],
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'easy',
    cuisine: 'test',
    category: 'main',
    tags: ['test'],
    dietaryRestrictions: ['vegetarian'],
    calories: 500,
    confidence: 0.95,
    method: 'scraped',
    extractionResults: {},
    debugInfo: {},
    data: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the import button', () => {
    render(<RecipeImporter onImport={mockOnImport} />);
    
    expect(screen.getByText('Import Recipe')).toBeInTheDocument();
  });

  it('should open dialog when import button is clicked', () => {
    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    
    expect(screen.getByText('Import Recipe from URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter recipe URL')).toBeInTheDocument();
  });

  it('should show error when URL is empty', async () => {
    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    fireEvent.click(screen.getByText('Import Recipe'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
    });
  });

  it('should successfully import a recipe', async () => {
    (scraperService.scrapeRecipe as jest.Mock).mockResolvedValueOnce({
      success: true,
      recipe: mockRecipe
    });

    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    fireEvent.change(screen.getByPlaceholderText('Enter recipe URL'), {
      target: { value: 'https://example.com/recipe' }
    });
    fireEvent.click(screen.getByText('Import Recipe'));
    
    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith(mockRecipe);
      expect(screen.getByText('Recipe imported successfully')).toBeInTheDocument();
    });
  });

  it('should handle scraping error', async () => {
    const errorMessage = 'Failed to scrape recipe';
    (scraperService.scrapeRecipe as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: errorMessage
    });

    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    fireEvent.change(screen.getByPlaceholderText('Enter recipe URL'), {
      target: { value: 'https://example.com/recipe' }
    });
    fireEvent.click(screen.getByText('Import Recipe'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnImport).not.toHaveBeenCalled();
    });
  });

  it('should handle network error', async () => {
    (scraperService.scrapeRecipe as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    fireEvent.change(screen.getByPlaceholderText('Enter recipe URL'), {
      target: { value: 'https://example.com/recipe' }
    });
    fireEvent.click(screen.getByText('Import Recipe'));
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(mockOnImport).not.toHaveBeenCalled();
    });
  });

  it('should show loading state while importing', async () => {
    (scraperService.scrapeRecipe as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<RecipeImporter onImport={mockOnImport} />);
    
    fireEvent.click(screen.getByText('Import Recipe'));
    fireEvent.change(screen.getByPlaceholderText('Enter recipe URL'), {
      target: { value: 'https://example.com/recipe' }
    });
    fireEvent.click(screen.getByText('Import Recipe'));
    
    expect(screen.getByText('Importing...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Importing...')).not.toBeInTheDocument();
    });
  });
}); 