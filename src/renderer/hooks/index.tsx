import { useMemo, useCallback } from 'react';
import { App as AntdApp, App } from 'antd';
import { useAuthStore, useMusicPlayerStore } from '../store';
import {
  getUserInfo,
  type Song,
  addSongToFavorite,
  removeSongFromFavorite,
  getFavoriteSongs,
  type Playlist,
  addPlaylistToCollection,
  getPlaylistInfo,
} from '../api';

// 获取当前播放的歌曲
export function useCurrentSong() {
  const songs = useMusicPlayerStore((state) => state.songs);
  const playerIndex = useMusicPlayerStore((state) => state.playerIndex);
  const currentSong = useMemo(() => {
    if (songs.length) {
      return songs[playerIndex];
    }
    return null;
  }, [songs, playerIndex]);

  return currentSong;
}

// 给定一个歌曲, 返回这首歌曲是否在播放列表里, 以及是否在播放
export function useSong(song?: Song) {
  const currentSong = useCurrentSong();
  // 播放器存在歌曲且是当前这首歌曲
  const matchCurrentSong = useMemo(
    () => currentSong && currentSong?.newId === song?.newId,
    [currentSong, song],
  );
  const isPlayerPlaying = useMusicPlayerStore((state) => state.isPlayerPlaying);
  // 下一个状态是否是暂停(显示暂停按钮): 是当前歌曲, 并且当前歌曲正在播放
  const isSongPlaying = useMemo(
    () => matchCurrentSong && isPlayerPlaying,
    [matchCurrentSong, isPlayerPlaying],
  );

  return {
    matchCurrentSong,
    isSongPlaying,
  };
}

// 返回播放器的相关操作
export function usePlayer() {
  const { message } = AntdApp.useApp();
  const addSongToFront = useMusicPlayerStore((state) => state.addSongToFront);
  const isPlayerPlaying = useMusicPlayerStore((state) => state.isPlayerPlaying);
  const playerInstance = useMusicPlayerStore((state) => state.playerInstance);
  const addSong = useMusicPlayerStore((state) => state.addSong);
  const songs = useMusicPlayerStore((state) => state.songs);
  const addSongs = useMusicPlayerStore((state) => state.addSongs);

  // 在播放列表里顶端插入一首歌并播放
  const playNewSong = useCallback(
    (newSong?: Song) => {
      if (!newSong) {
        return;
      }

      addSongToFront(newSong);
    },
    [addSongToFront],
  );

  // 继续播放或暂停当前歌曲
  const playOrPauseCurrentSong = useCallback(() => {
    if (isPlayerPlaying) {
      playerInstance?.pause();
    } else {
      playerInstance?.play();
    }
  }, [isPlayerPlaying, playerInstance]);

  // 添加一首歌到播放列表末尾, 不影响当前播放
  const addSongToPlaylist = useCallback(
    (newSong?: Song) => {
      if (!newSong) {
        return;
      }

      if (songs.find((song) => song.newId === newSong.newId)) {
        message.info('歌曲已存在播放列表');
      } else {
        addSong(newSong);
      }
    },
    [addSong, message, songs],
  );

  // 添加多首歌到播放列表末尾, 不影响当前播放
  const addSongsToPlaylist = useCallback(
    (newSongs: Song[]) => {
      // 去除已存在的重复的歌曲
      const filteredNewSongs = newSongs.filter(
        (newSong) => !songs.find((s) => s.newId === newSong.newId),
      );

      if (!newSongs.length || !filteredNewSongs.length) {
        return;
      }
      addSongs(filteredNewSongs);
    },
    [addSongs, songs],
  );

  return {
    playNewSong,
    playOrPauseCurrentSong,
    addSongToPlaylist,
    addSongsToPlaylist,
  };
}

// 刷新用户信息
export function useRefresh() {
  const setLogin = useAuthStore((state) => state.setLogin);
  const setUser = useAuthStore((state) => state.setUser);
  const setFavoriteSongs = useAuthStore((state) => state.setFavoriteSongs);

  // 获取用户信息
  const refreshUserInfo = useCallback(() => {
    getUserInfo()
      .then((res) => {
        if (res.status === 200) {
          setLogin(true);
          setUser(res.data);
        } else {
          setLogin(false);
        }
      })
      .catch(() => {
        setLogin(false);
      });
  }, [setLogin, setUser]);

  // 获取我喜欢的音乐
  const refreshFavoriteSongs = useCallback(() => {
    getFavoriteSongs().then((res) => {
      if (res.data.success) {
        setFavoriteSongs(res.data.songs);
      }
    });
  }, [setFavoriteSongs]);

  return {
    refreshUserInfo,
    refreshFavoriteSongs,
  };
}

// 给定某一首歌曲, 返回这首歌的喜欢状态和操作
export function useFavorite(song?: Song) {
  const { message } = App.useApp();
  const { refreshFavoriteSongs } = useRefresh();
  const favoriteSongs = useAuthStore((state) => state.favoriteSongs);
  // 歌曲是否被喜欢
  const isSongFavorite = useMemo(() => {
    if (!song || !favoriteSongs.length) {
      return false;
    }
    return favoriteSongs.some((s) => s.newId === song?.newId);
  }, [favoriteSongs, song]);

  const favoriteSong = useCallback(() => {
    if (!song) {
      return;
    }
    addSongToFavorite(song)
      .then((res) => {
        if (res.data.success) {
          message.success('已添加到我喜欢');
        } else {
          message.error('添加到我喜欢失败');
        }
      })
      .catch(() => {
        message.error('添加到我喜欢失败');
      })
      .finally(() => {
        // 无论成功失败更新喜欢列表
        refreshFavoriteSongs();
      });
  }, [message, song, refreshFavoriteSongs]);

  const unFavoriteSong = useCallback(() => {
    if (!song) {
      return;
    }

    removeSongFromFavorite(song.newId)
      .then((res) => {
        if (res.data.success) {
          message.success('已取消喜欢');
        } else {
          message.error('取消喜欢失败');
        }
      })
      .catch(() => {
        message.error('取消喜欢失败');
      })
      .finally(() => {
        // 无论成功失败更新喜欢列表
        refreshFavoriteSongs();
      });
  }, [message, song, refreshFavoriteSongs]);

  return {
    isSongFavorite,
    favoriteSong,
    unFavoriteSong,
  };
}

// 给定一个 playlist, 返回该歌单的收藏状态和操作
export function usePlaylistCollection(playlist?: Partial<Playlist>) {
  const { message } = App.useApp();
  const collectedPlaylists = useAuthStore(
    (state) => state.user?.collectedPlaylists,
  );
  const { refreshUserInfo } = useRefresh();
  const resetNewSongs = useMusicPlayerStore((state) => state.resetNewSongs);

  // 该歌单是否被收藏
  const isPlaylistCollected = useMemo(() => {
    if (!playlist?.id) {
      return false;
    }
    return collectedPlaylists?.some((p) => p.id === playlist?.id);
  }, [collectedPlaylists, playlist?.id]);

  // 收藏某歌单
  const collectPlaylist = useCallback(() => {
    if (playlist?.id && playlist.name) {
      addPlaylistToCollection(playlist.id, playlist.name)
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            message.success('收藏歌单成功');
          }
        })
        .catch(() => {
          message.error('收藏歌单失败');
        })
        .finally(() => {
          refreshUserInfo();
        });
    }
  }, [message, playlist, refreshUserInfo]);

  // 播放某歌单, 接受可选的 playlistId 参数, 如果提供则播放对应歌单, 否则播放传入的 playlist
  const playWholePlaylist = useCallback(
    (playlistId?: string) => {
      const id = playlistId || playlist?.id;

      if (!id) {
        return;
      }
      // 获取歌曲信息后播放整张歌单
      getPlaylistInfo(id).then((res) => {
        if (res.data.success) {
          if (res.data.playlist?.songs?.length) {
            resetNewSongs(res.data.playlist.songs || []);
          } else {
            message.warning('该歌单为空');
          }
        }
      });
    },
    [message, playlist?.id, resetNewSongs],
  );

  return {
    isPlaylistCollected,
    collectPlaylist,
    playWholePlaylist,
    // TODO: 暂无取消收藏的操作
  };
}
