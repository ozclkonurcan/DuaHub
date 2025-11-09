// types/dua.ts

export interface Dua {
  id: string;
  title: string;              // Dua başlığı (Sabah Duası)
  arabic: string;             // Arapça metin
  transliteration: string;    // Okunuşu (Latin)
  meaning: string;            // Türkçe meal
  category: CategorySlug;     // Kategori slug
  benefit?: string;           // Faydası / Ne zaman okunur
  source?: string;            // Kaynak (Kuran 2:255, Müslim 2704)
  audioUrl?: string;          // Ses dosyası URL
  isPremium?: boolean;        // Premium dua mı?
  readCount?: number;         // Kaç kez okundu
  isFavorite?: boolean;       // Favori mi?
  tags?: string[];            // Etiketler (arama için)
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategorySlug = 
  | 'sabah-aksam'
  | 'namaz'
  | 'sikinti-dert'
  | 'sifa'
  | 'rizik-bereket'
  | 'evlilik-aile'
  | 'yolculuk'
  | 'uyku'
  | 'koruma'
  | 'sukur';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;               // Sabah-Akşam Duaları
  description: string;
  icon: string;               // Icon name from @expo/vector-icons
  color: string;              // Hex color
  duaCount: number;
  order: number;              // Sıralama
}

export interface UserStats {
  userId?: string;
  totalDuasRead: number;
  currentStreak: number;
  longestStreak: number;
  favoritesCount: number;
  lastReadDate?: Date;
  isPremium: boolean;
}

export interface ReadHistory {
  duaId: string;
  readAt: Date;
  count: number;
}