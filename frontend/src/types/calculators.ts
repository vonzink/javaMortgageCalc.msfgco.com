export type CalculatorCategory = 'general' | 'government' | 'income' | 'tools';

export interface CalculatorMeta {
  slug: string;
  name: string;
  category: CalculatorCategory;
  icon: string;
  description: string;
  features: string[];
}

export interface CategoryInfo {
  id: CalculatorCategory;
  label: string;
  color: string;
}

export interface ReportItem {
  id: string;
  calcSlug: string;
  calcName: string;
  calcIcon: string;
  timestamp: number;
  data: Record<string, any>;
}
