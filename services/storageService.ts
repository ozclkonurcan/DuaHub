// services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITES: '@duahub_favorites',
  READ_COUNTS: '@duahub_read_counts',
  USER_STATS: '@duahub_user_stats',
};

// Favoriler
export const getFavorites = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (duaId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(duaId)) {
      favorites.push(duaId);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

export const removeFavorite = async (duaId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter(id => id !== duaId);
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

export const isFavorite = async (duaId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.includes(duaId);
};

// Okuma sayıları
export const getReadCounts = async (): Promise<Record<string, number>> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.READ_COUNTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting read counts:', error);
    return {};
  }
};

export const getReadCount = async (duaId: string): Promise<number> => {
  const counts = await getReadCounts();
  return counts[duaId] || 0;
};

export const incrementReadCount = async (duaId: string): Promise<number> => {
  try {
    const counts = await getReadCounts();
    counts[duaId] = (counts[duaId] || 0) + 1;
    await AsyncStorage.setItem(KEYS.READ_COUNTS, JSON.stringify(counts));
    return counts[duaId];
  } catch (error) {
    console.error('Error incrementing read count:', error);
    return 0;
  }
};

// Kullanıcı istatistikleri
export interface UserStats {
  totalDuasRead: number;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_STATS);
    return data ? JSON.parse(data) : {
      totalDuasRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalDuasRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  }
};

export const updateUserStats = async (): Promise<void> => {
  try {
    const stats = await getUserStats();
    const today = new Date().toISOString().split('T')[0];
    
    stats.totalDuasRead += 1;
    
    // Streak hesaplama
    if (stats.lastReadDate) {
      const lastDate = new Date(stats.lastReadDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Ardışık gün
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak kırıldı
        stats.currentStreak = 1;
      }
      // diffDays === 0 ise aynı gün, streak değişmez
    } else {
      stats.currentStreak = 1;
    }
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    stats.lastReadDate = today;
    
    await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// Tümünü temizle (debug için)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.FAVORITES,
      KEYS.READ_COUNTS,
      KEYS.USER_STATS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};