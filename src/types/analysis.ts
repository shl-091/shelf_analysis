
export interface Product {
  name: string;
  brand: string;
  category: string;
  price: string | null;
  details: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface ShelfAnalysisResult {
  products: Product[];
  market_analysis: string;
}

export interface Ingredient {
  name: string;
  content: string;
  origin?: string;
}

export interface IngredientAnalysisResult {
  product_name: string;
  ingredients: Ingredient[];
  origin_place: string;
  nutrition_facts: string;
}

export type AnalysisResult = ShelfAnalysisResult | IngredientAnalysisResult;
