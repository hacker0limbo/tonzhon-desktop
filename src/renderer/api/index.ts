import axios from 'axios';

// NOTE: 有两种 API 端点
axios.defaults.baseURL = 'https://tonzhon-music-api.whamon.com';

const axiosInstance = axios.create({
  baseURL: 'https://tonzhon.whamon.com/api',
});

export type Song = {
  // 用于获取歌曲内容和歌词等
  newId: string;
  name: string;
  // 艺人
  artists?: [
    {
      name: string;
      id: string;
    },
    {
      name: string;
      id: string;
    },
  ];
  // 专辑
  album: {
    name: string;
    id: string;
  };
  // 其他信息
  alias?: string;
  // e.g. 5964088
  mvId?: string;
  originalId?: string;
  // 来自什么平台, e.g. qq
  platform?: string;
};

export type Artist = {
  // 艺人名
  name: string;
  // 图片
  pic: string;
};

export type Playlist = {
  cover: string;
  id: string;
  name: string;
};

export type PlaylistInfo = {
  author: string;
  // 收藏量
  collectCount: number;
  cover: string;
  // 创建时间
  created: string;
  name: string;
  // 播放量
  playCount: number;
  songs: Song[];
  __v: number;
  _id: string;
};

// 获取热门歌曲
export function getHotSongs() {
  return axios.get<{ success: boolean; songs: Song[] }>('/hot-songs');
}

// 获取新歌
export function getNewSongs() {
  return axios.get<{ success: boolean; songs: Song[] }>('/new-songs');
}

// 根据 newId 获取歌曲播放地址
export function getSongSrc(newId: string) {
  return axios.get<{ success: boolean; data: string }>(`/song_file/${newId}`);
}

// 获取某个歌手的所有歌曲
export function getSongsOfArtist(name: string) {
  return axios.get<{ songs?: Song[]; error?: string }>(
    `/songs_of_artist/${encodeURIComponent(name)}`,
  );
}

// 根据搜索获取某个歌手的歌曲
export function getSongsOfArtistBySearch(name: string, search = 'q') {
  return axios.get<{ success: boolean; data: { songs: Song[] } }>(
    `/search/${search}/${encodeURIComponent(name)}`,
  );
}

// 获取精选歌单
export function getRecommendPlaylists() {
  return axiosInstance.get<{ success: boolean; playlists: Playlist[] }>(
    '/recommended_playlists',
  );
}

// 获取歌单详情
export function getPlaylistInfo(id: string) {
  return axiosInstance.get<{ success: boolean; playlist: PlaylistInfo }>(
    `/playlists/${id}`,
  );
}

// 获取歌单总数
export function getPlaylistsTotal() {
  return axiosInstance.get<{ total: number }>('/num_playlists_with_covers');
}

// 获取所有歌单列表, index 为 playlist 的索引位置, 默认为 0, 每次获取 30 个
export function getPlaylists(index: number) {
  return axiosInstance.get<{ success: boolean; playlists: Playlist[] }>(
    `/latest_playlists_with_covers?skip=${index}`,
  );
}

// 根据关键词搜索所有歌曲
export function searchAll(keyword: string) {
  return axios.get<{ success: boolean; data: Song[] }>(
    `/safe-search?keyword=${keyword}`,
  );
}
