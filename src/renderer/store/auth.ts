import { create } from 'zustand';
import { type Playlist, type User, type Song } from '../api';

type AuthStore = {
  login: boolean;
  showLoginModal: boolean;
  user?: User;
  // 喜欢的歌曲
  favoriteSongs: Song[];
  // 展示创建歌单的弹框
  showCreatePlaylistModal: boolean;
  // 创建歌单提供的 newId,
  songForCreatePlaylistModal?: Song;

  openLoginModal: () => void;
  closeLoginModal: () => void;
  setLogin: (login: boolean) => void;
  setUser: (user?: User) => void;
  openCreatePlaylistModal: (song?: Song) => void;
  closeCreatePlaylistModal: () => void;
  setFavoriteSongs: (songs: Song[]) => void;
  // 重置 store, 一般用于登出后的操作
  resetAuth: () => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  login: false,
  showLoginModal: false,
  showCreatePlaylistModal: false,
  favoriteSongs: [],
  user: undefined,
  songForCreatePlaylistModal: undefined,

  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),
  setLogin: (login) => set({ login }),
  setUser: (user) => set({ user }),
  openCreatePlaylistModal: (song) =>
    set({ showCreatePlaylistModal: true, songForCreatePlaylistModal: song }),
  closeCreatePlaylistModal: () =>
    set({
      showCreatePlaylistModal: false,
      songForCreatePlaylistModal: undefined,
    }),
  setFavoriteSongs: (songs) => set({ favoriteSongs: songs }),
  resetAuth: () =>
    set({
      login: false,
      user: undefined,
      favoriteSongs: [],
      songForCreatePlaylistModal: undefined,
    }),
}));
