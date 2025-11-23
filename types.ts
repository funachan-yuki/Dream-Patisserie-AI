export interface Ingredient {
  name: string;
  amount: string;
  cost: number;
}

export interface RecipeStep {
  step: number;
  description: string;
  visualPrompt: string;
  imageUrl?: string | null;
}

export interface SweetsData {
  name: string;
  description: string;
  ingredients: Ingredient[];
  recipe: RecipeStep[];
  totalCost: number;
  suggestedPrice: number;
  profitMargin: string;
  visualPrompt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}