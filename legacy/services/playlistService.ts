// services/playlistService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  duaIds: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

const PLAYLIST_KEY = '@duahub_playlists';

// Tüm playlistleri getir
export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const data = await AsyncStorage.getItem(PLAYLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting playlists:', error);
    return [];
  }
};

// Tek bir playlist getir
export const getPlaylist = async (id: string): Promise<Playlist | null> => {
  const playlists = await getPlaylists();
  return playlists.find(p => p.id === id) || null;
};

// Yeni playlist oluştur
export const createPlaylist = async (
  name: string,
  description?: string,
  color?: string
): Promise<Playlist> => {
  const playlists = await getPlaylists();
  
  const newPlaylist: Playlist = {
    id: Date.now().toString(),
    name,
    description,
    duaIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: color || '#3B82F6',
  };

  playlists.push(newPlaylist);
  await AsyncStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists));
  
  return newPlaylist;
};

// Playlist güncelle
export const updatePlaylist = async (
  id: string,
  updates: Partial<Playlist>
): Promise<void> => {
  const playlists = await getPlaylists();
  const index = playlists.findIndex(p => p.id === id);
  
  if (index !== -1) {
    playlists[index] = {
      ...playlists[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists));
  }
};

// Playlist sil
export const deletePlaylist = async (id: string): Promise<void> => {
  const playlists = await getPlaylists();
  const filtered = playlists.filter(p => p.id !== id);
  await AsyncStorage.setItem(PLAYLIST_KEY, JSON.stringify(filtered));
};

// Playlist'e dua ekle
export const addDuaToPlaylist = async (
  playlistId: string,
  duaId: string
): Promise<void> => {
  const playlist = await getPlaylist(playlistId);
  
  if (playlist && !playlist.duaIds.includes(duaId)) {
    playlist.duaIds.push(duaId);
    await updatePlaylist(playlistId, { duaIds: playlist.duaIds });
  }
};

// Playlist'ten dua çıkar
export const removeDuaFromPlaylist = async (
  playlistId: string,
  duaId: string
): Promise<void> => {
  const playlist = await getPlaylist(playlistId);
  
  if (playlist) {
    playlist.duaIds = playlist.duaIds.filter(id => id !== duaId);
    await updatePlaylist(playlistId, { duaIds: playlist.duaIds });
  }
};

// Varsayılan playlistler oluştur
export const createDefaultPlaylists = async (): Promise<void> => {
  const playlists = await getPlaylists();
  
  if (playlists.length === 0) {
    await createPlaylist('Sabah Rutini', 'Sabahları dinlenmesi gereken dualar', '#F59E0B');
    await createPlaylist('Akşam Rutini', 'Akşamları dinlenmesi gereken dualar', '#6366F1');
    await createPlaylist('Yasin', 'Yasin suresi', '#10B981');
  }
};