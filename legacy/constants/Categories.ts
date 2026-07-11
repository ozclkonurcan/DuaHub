// constants/Categories.ts
import duasData from '../data/duas.json';
import { Category, CategorySlug } from '../types/dua';

// Dua sayılarını hesapla
const calculateDuaCounts = () => {
  const counts: Record<string, number> = {};
  duasData.duas.forEach((dua: any) => {
    counts[dua.category] = (counts[dua.category] || 0) + 1;
  });
  return counts;
};

const duaCounts = calculateDuaCounts();

export const CATEGORIES: Category[] = [
  {
    id: '1',
    slug: 'sabah-aksam',
    name: 'Sabah-Akşam Duaları',
    description: 'Her gün sabah ve akşam okunması tavsiye edilen dualar',
    icon: 'sunny',
    color: '#F59E0B',
    duaCount: duaCounts['sabah-aksam'] || 0,
    order: 1,
  },
  {
    id: '2',
    slug: 'namaz',
    name: 'Namaz Duaları',
    description: 'Namaz öncesi, sonrası ve içinde okunan dualar',
    icon: 'moon',
    color: '#3B82F6',
    duaCount: duaCounts['namaz'] || 0,
    order: 2,
  },
  {
    id: '3',
    slug: 'sikinti-dert',
    name: 'Sıkıntı-Dert Duaları',
    description: 'Zorluk ve sıkıntılı zamanlarda okunacak dualar',
    icon: 'heart',
    color: '#EF4444',
    duaCount: duaCounts['sikinti-dert'] || 0,
    order: 3,
  },
  {
    id: '4',
    slug: 'sifa',
    name: 'Şifa Duaları',
    description: 'Hastalık ve sağlık için okunan dualar',
    icon: 'medical',
    color: '#10B981',
    duaCount: duaCounts['sifa'] || 0,
    order: 4,
  },
  {
    id: '5',
    slug: 'rizik-bereket',
    name: 'Rızık-Bereket Duaları',
    description: 'Rızık genişliği ve bereket için dualar',
    icon: 'gift',
    color: '#8B5CF6',
    duaCount: duaCounts['rizik-bereket'] || 0,
    order: 5,
  },
  {
    id: '6',
    slug: 'evlilik-aile',
    name: 'Evlilik-Aile Duaları',
    description: 'Aile birliği ve evlilik için dualar',
    icon: 'people',
    color: '#EC4899',
    duaCount: duaCounts['evlilik-aile'] || 0,
    order: 6,
  },
  {
    id: '7',
    slug: 'yolculuk',
    name: 'Yolculuk Duaları',
    description: 'Yola çıkarken ve yolculuk sırasında okunan dualar',
    icon: 'car',
    color: '#14B8A6',
    duaCount: duaCounts['yolculuk'] || 0,
    order: 7,
  },
  {
    id: '8',
    slug: 'uyku',
    name: 'Uyku Duaları',
    description: 'Uyumadan önce ve uykudan uyanınca okunan dualar',
    icon: 'bed',
    color: '#6366F1',
    duaCount: duaCounts['uyku'] || 0,
    order: 8,
  },
  {
    id: '9',
    slug: 'koruma',
    name: 'Koruma Duaları',
    description: 'Kötülüklerden korunmak için okunan dualar',
    icon: 'shield',
    color: '#F97316',
    duaCount: duaCounts['koruma'] || 0,
    order: 9,
  },
  {
    id: '10',
    slug: 'sukur',
    name: 'Şükür Duaları',
    description: 'Şükretmek ve hamd etmek için okunan dualar',
    icon: 'star',
    color: '#FBBF24',
    duaCount: duaCounts['sukur'] || 0,
    order: 10,
  },
];

export const getCategoryBySlug = (slug: CategorySlug): Category | undefined => {
  return CATEGORIES.find(cat => cat.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};