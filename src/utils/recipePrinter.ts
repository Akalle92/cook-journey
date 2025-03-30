import { Recipe } from '@/types/recipe';

interface PrintOptions {
  includeImage?: boolean;
  includeNutrition?: boolean;
  includeTags?: boolean;
  includeDietaryRestrictions?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  pageSize?: 'A4' | 'Letter' | 'Legal';
}

export const generatePrintContent = (recipe: Recipe, options: PrintOptions = {}): string => {
  const {
    includeImage = true,
    includeNutrition = true,
    includeTags = true,
    includeDietaryRestrictions = true,
    fontSize = 'medium',
    pageSize = 'A4'
  } = options;

  const fontSizes = {
    small: '12px',
    medium: '14px',
    large: '16px'
  };

  const styles = `
    <style>
      @media print {
        body {
          font-size: ${fontSizes[fontSize]};
          line-height: 1.5;
          font-family: Arial, sans-serif;
        }
        .recipe-title {
          font-size: ${fontSizes[fontSize] === '12px' ? '24px' : '28px'};
          font-weight: bold;
          margin-bottom: 1em;
        }
        .recipe-section {
          margin: 1em 0;
        }
        .recipe-section-title {
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .recipe-image {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        .recipe-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1em;
          margin: 1em 0;
        }
        .recipe-info-item {
          display: flex;
          align-items: center;
          gap: 0.5em;
        }
        .recipe-ingredients {
          list-style-type: none;
          padding-left: 0;
        }
        .recipe-ingredients li {
          margin: 0.5em 0;
        }
        .recipe-instructions {
          list-style-type: decimal;
          padding-left: 1.5em;
        }
        .recipe-instructions li {
          margin: 0.5em 0;
        }
        .recipe-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          margin: 1em 0;
        }
        .recipe-tag {
          background-color: #f0f0f0;
          padding: 0.25em 0.5em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        .recipe-dietary {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
          margin: 1em 0;
        }
        .recipe-dietary-item {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.25em 0.5em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
      }
    </style>
  `;

  let content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${recipe.title}</title>
        ${styles}
      </head>
      <body>
        <div class="recipe-title">${recipe.title}</div>
        
        ${includeImage && recipe.imageUrl ? `
          <div class="recipe-section">
            <img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image" />
          </div>
        ` : ''}

        ${recipe.description ? `
          <div class="recipe-section">
            <div class="recipe-section-title">Description</div>
            <div>${recipe.description}</div>
          </div>
        ` : ''}

        <div class="recipe-section">
          <div class="recipe-info">
            <div class="recipe-info-item">
              <span>Prep Time:</span>
              <span>${recipe.prepTime}</span>
            </div>
            <div class="recipe-info-item">
              <span>Cook Time:</span>
              <span>${recipe.cookTime}</span>
            </div>
            <div class="recipe-info-item">
              <span>Servings:</span>
              <span>${recipe.servings}</span>
            </div>
            <div class="recipe-info-item">
              <span>Difficulty:</span>
              <span>${recipe.difficulty}</span>
            </div>
            <div class="recipe-info-item">
              <span>Cuisine:</span>
              <span>${recipe.cuisine}</span>
            </div>
            ${includeNutrition ? `
              <div class="recipe-info-item">
                <span>Calories:</span>
                <span>${recipe.calories}</span>
              </div>
            ` : ''}
          </div>
        </div>

        ${includeDietaryRestrictions && recipe.dietaryRestrictions.length > 0 ? `
          <div class="recipe-section">
            <div class="recipe-section-title">Dietary Restrictions</div>
            <div class="recipe-dietary">
              ${recipe.dietaryRestrictions.map(restriction => `
                <span class="recipe-dietary-item">${restriction}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="recipe-section">
          <div class="recipe-section-title">Ingredients</div>
          <ul class="recipe-ingredients">
            ${recipe.ingredients.map(ingredient => `
              <li>${ingredient}</li>
            `).join('')}
          </ul>
        </div>

        <div class="recipe-section">
          <div class="recipe-section-title">Instructions</div>
          <ol class="recipe-instructions">
            ${recipe.instructions.map(instruction => `
              <li>${instruction}</li>
            `).join('')}
          </ol>
        </div>

        ${includeTags && recipe.tags.length > 0 ? `
          <div class="recipe-section">
            <div class="recipe-section-title">Tags</div>
            <div class="recipe-tags">
              ${recipe.tags.map(tag => `
                <span class="recipe-tag">${tag}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
    </html>
  `;

  return content;
};

export const printRecipe = (recipe: Recipe, options: PrintOptions = {}): void => {
  const content = generatePrintContent(recipe, options);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }
}; 