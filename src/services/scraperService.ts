import { Recipe } from '@/types/recipe';
import { parseUrl, isSupportedUrl, getUrlType, cleanUrl } from '@/utils/urlParser';
import { parseRecipe } from '@/utils/recipeParser';

interface ScrapingResult {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}

class ScraperService {
  private static instance: ScraperService;
  private readonly CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  private constructor() {}

  public static getInstance(): ScraperService {
    if (!ScraperService.instance) {
      ScraperService.instance = new ScraperService();
    }
    return ScraperService.instance;
  }

  private async fetchWithProxy(url: string): Promise<string> {
    try {
      const response = await fetch(this.CORS_PROXY + encodeURIComponent(url));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching with proxy:', error);
      throw error;
    }
  }

  private async extractInstagramData(html: string): Promise<any> {
    // Instagram specific extraction logic
    const scriptRegex = /<script type="application\/ld\+json">(.*?)<\/script>/g;
    const matches = html.match(scriptRegex);
    
    if (matches) {
      for (const match of matches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
          const data = JSON.parse(jsonStr);
          if (data['@type'] === 'Recipe') {
            return data;
          }
        } catch (error) {
          console.error('Error parsing Instagram JSON:', error);
        }
      }
    }

    // Fallback to meta tags
    const metaTags = {
      title: this.extractMetaContent(html, 'og:title'),
      description: this.extractMetaContent(html, 'og:description'),
      image: this.extractMetaContent(html, 'og:image'),
      ingredients: this.extractMetaContent(html, 'recipe:ingredients'),
      instructions: this.extractMetaContent(html, 'recipe:instructions')
    };

    return {
      title: metaTags.title,
      description: metaTags.description,
      imageUrl: metaTags.image,
      ingredients: metaTags.ingredients ? metaTags.ingredients.split('\n') : [],
      instructions: metaTags.instructions ? metaTags.instructions.split('\n') : []
    };
  }

  private extractMetaContent(html: string, property: string): string {
    const regex = new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`);
    const match = html.match(regex);
    return match ? match[1] : '';
  }

  private async extractGeneralRecipeData(html: string): Promise<any> {
    // Try to find structured data first
    const scriptRegex = /<script type="application\/ld\+json">(.*?)<\/script>/g;
    const matches = html.match(scriptRegex);
    
    if (matches) {
      for (const match of matches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '');
          const data = JSON.parse(jsonStr);
          if (data['@type'] === 'Recipe') {
            return data;
          }
        } catch (error) {
          console.error('Error parsing JSON-LD:', error);
        }
      }
    }

    // Fallback to meta tags and common HTML patterns
    return {
      title: this.extractMetaContent(html, 'og:title') || this.extractTitle(html),
      description: this.extractMetaContent(html, 'og:description') || this.extractDescription(html),
      imageUrl: this.extractMetaContent(html, 'og:image') || this.extractImage(html),
      ingredients: this.extractIngredients(html),
      instructions: this.extractInstructions(html)
    };
  }

  private extractTitle(html: string): string {
    const titleRegex = /<title>(.*?)<\/title>/;
    const match = html.match(titleRegex);
    return match ? match[1] : '';
  }

  private extractDescription(html: string): string {
    const descRegex = /<meta[^>]*name="description"[^>]*content="([^"]*)"|<meta[^>]*property="og:description"[^>]*content="([^"]*)"/;
    const match = html.match(descRegex);
    return match ? (match[1] || match[2]) : '';
  }

  private extractImage(html: string): string {
    const imgRegex = /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/;
    const match = html.match(imgRegex);
    return match ? match[1] : '';
  }

  private extractIngredients(html: string): string[] {
    const ingredientRegex = /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)<\/li>/g;
    const matches = html.match(ingredientRegex);
    return matches ? matches.map(match => match.replace(/<[^>]*>/g, '').trim()) : [];
  }

  private extractInstructions(html: string): string[] {
    const instructionRegex = /<li[^>]*class="[^"]*instruction[^"]*"[^>]*>(.*?)<\/li>/g;
    const matches = html.match(instructionRegex);
    return matches ? matches.map(match => match.replace(/<[^>]*>/g, '').trim()) : [];
  }

  public async scrapeRecipe(url: string): Promise<ScrapingResult> {
    try {
      if (!isSupportedUrl(url)) {
        return {
          success: false,
          error: 'Unsupported website'
        };
      }

      const cleanUrlString = cleanUrl(url);
      const html = await this.fetchWithProxy(cleanUrlString);
      const urlType = getUrlType(cleanUrlString);

      let recipeData;
      switch (urlType) {
        case 'instagram':
          recipeData = await this.extractInstagramData(html);
          break;
        default:
          recipeData = await this.extractGeneralRecipeData(html);
      }

      const parsedRecipe = parseRecipe(recipeData);
      return {
        success: true,
        recipe: parsedRecipe
      };
    } catch (error) {
      console.error('Error scraping recipe:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape recipe'
      };
    }
  }
}

export const scraperService = ScraperService.getInstance(); 