import { create } from 'zustand';
import { getSongSrc, type Song } from '../api';
import {
  type ReactJkMusicPlayerInstance,
  type ReactJkMusicPlayerAudioListProps,
  type ReactJkMusicPlayerProps,
} from 'react-jinke-music-player';
import { uniqBy } from 'lodash';

export type PlayerSong = ReactJkMusicPlayerAudioListProps & {
  newId: string;
};

type MusicPlayerStore = {
  playerInstance: ReactJkMusicPlayerInstance | null;
  playerConfigs: Omit<ReactJkMusicPlayerProps, 'audioLists'>;
  songs: PlayerSong[];
  playerIndex: number;
  isPlayerPlaying: boolean;
  // 无法播放的音乐 newId
  brokenSongIds: string[];

  setPlayerInstance: (instance: ReactJkMusicPlayerInstance) => void;
  // 当前是否有歌曲在播放
  setIsPlayerPlaying: (playing: boolean) => void;
  // 设置一个新的播放列表
  resetNewSongs: (songs: Song[]) => void;
  // 在列表最后添加一首歌, 不影响当前播放
  addSong: (song: Song) => void;
  // 在列表最后添加多首歌, 不影响当前播放
  addSongs: (songs: Song[]) => void;
  // 在列表首位添加一首歌并且播放这首歌
  addSongToFront: (song: Song) => void;
  // 记录当前播放的索引, 但是不作为状态传入 Player
  setPlayerIndex: (index: number) => void;
  // 同步播放器的播放列表到 store, 因为可以在 playerList 里进行删除歌曲
  setSongs: (songs: PlayerSong[]) => void;
};

// TODO: 暂时不做歌曲持久化
export const useMusicPlayerStore = create<MusicPlayerStore>()((set, get) => {
  // 将提供的 Song 格式转换为播放器需要的 PlayerSong 格式, 如果提供 musicSrc 则直接使用, 否则通过接口获取
  function transformSongToPlayerSong({
    name,
    artists,
    newId,
  }: Song): PlayerSong {
    return {
      // newId 作为唯一标识
      newId,
      name,
      singer: artists?.map((artist) => artist?.name)?.join(' / '),
      musicSrc: () =>
        getSongSrc(newId).then((res) => {
          if (res.data.success) {
            const source = res.data.data;
            // TODO: 这里如果是添加到播放列表里的动作的话会导致播放器异常, 可能原因为每次获取的 source 都不同(时间戳), 即使是同一首歌
            return source;
          } else {
            // 记录损坏的音质
            set((state) => ({
              brokenSongIds: [...state.brokenSongIds, newId],
            }));
            // 会被 onAudioError 捕获
            return 'no source';
          }
        }),
    };
  }

  return {
    brokenSongIds: [],
    songs: [],
    playerInstance: null,
    playerConfigs: {},
    playerIndex: 0,
    isPlayerPlaying: false,

    setIsPlayerPlaying: (playing) => set({ isPlayerPlaying: playing }),
    resetNewSongs: (songs) => {
      set({
        songs: songs.map(transformSongToPlayerSong),
        playerConfigs: { clearPriorAudioLists: true },
      });
    },
    addSongToFront: (song) => {
      set((state) => ({
        // 去重, 并且保证新歌在最前面
        songs: uniqBy(
          [transformSongToPlayerSong(song), ...state.songs],
          'newId',
        ),
        playerConfigs: { clearPriorAudioLists: true },
      }));
    },
    addSong: (song) => {
      set((state) => ({
        songs: [...state.songs, transformSongToPlayerSong(song)],
        playerConfigs: { clearPriorAudioLists: false },
      }));
    },
    addSongs: (songs: Song[]) => {
      set((state) => ({
        songs: [...state.songs, ...songs.map(transformSongToPlayerSong)],
        playerConfigs: { clearPriorAudioLists: false },
      }));
    },
    setPlayerInstance: (instance) => set({ playerInstance: instance }),
    setPlayerIndex: (index) => set({ playerIndex: index }),
    // 同步播放列表
    setSongs: (songs) => {
      if (songs.length) {
        set({ songs });
      } else {
        // 重置
        set({
          songs: [],
          playerConfigs: { clearPriorAudioLists: true },
        });
      }
    },
  };
});
