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
  // 封面
  cover?: string;
};

export type Artist = {
  // 艺人名
  name: string;
  // 图片
  pic: string;
};

export type Playlist = {
  cover?: string;
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

export type User = {
  username: string;
  // 收藏的歌单
  collectedPlaylists: Playlist[];
  // 创建的歌单
  playlists: Playlist[];
  songWorks: [];
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

// 登录
export function signin(payload: { username: string; password: string }) {
  return axiosInstance.post<{
    success: boolean;
    message?: string;
    data?: User;
  }>('/sign_in', payload);
}

// 登出, status 200 以及 string "OK" 表示成功
export function signout() {
  return axiosInstance.post<string>('/sign_out', undefined, {
    withCredentials: true,
  });
}

// 获取用户信息, 需要携带 cookie, 401 表示未登录
export function getUserInfo() {
  return axiosInstance.get<User>('/me', {
    withCredentials: true,
  });
}

// 创建歌单 status 201 表示成功, 返回歌单 id
export function createPlaylist(name: string) {
  return axiosInstance.post<{ playlistId: string }>(
    '/playlists',
    { name },
    {
      withCredentials: true,
    },
  );
}

// 获取账户信息
export function getAccountInfo() {
  return axiosInstance.get<{ email: string }>('/account', {
    withCredentials: true,
  });
}

// 获取喜欢的歌曲
export function getFavoriteSongs() {
  return axiosInstance.get<{ success: boolean; songs: Song[] }>('/favorites', {
    withCredentials: true,
  });
}

// 根据网易云歌单 id 获取歌曲(导入歌单)
export function getSongsFromNetEasePlaylist(playlistId: string) {
  return axios.get<{ success: boolean; data: { name: string; songs: Song[] } }>(
    `/netease_playlist/${playlistId}`,
  );
}

// 添加一首歌到喜欢列表
export function addSongToFavorite(song: Song) {
  return axiosInstance.post<{ success: boolean }>(
    '/favorites',
    {
      // TODO: 这里可能要注意一下, 给后端传多余的歌曲信息都可以, 只要有 newId, 但是后端是无脑存的不做校验
      song,
    },
    {
      withCredentials: true,
    },
  );
}

// 移除一首歌从喜欢列表
export function removeSongFromFavorite(newId: string) {
  return axiosInstance.delete<{ success: boolean }>(`/favorites/${newId}`, {
    withCredentials: true,
  });
}

// 收藏歌单, 成功返回 201 和 Created 文字
export function addPlaylistToCollection(
  playlistId: string,
  playlistName: string,
) {
  return axiosInstance.post<string>(
    `/playlists/${playlistId}/collectedPlaylists`,
    {
      playlistName,
    },
    {
      withCredentials: true,
    },
  );
}

// 添加一首歌到我的某个歌单
export function addSongToMyPlaylist(playlistId: string, song: Song) {
  return axiosInstance.put<{ success: boolean }>(
    `/playlists/${playlistId}/addSong`,
    { toAdd: song },
    { withCredentials: true },
  );
}

// 从我的某个歌单中移除一首歌
export function removeSongFromMyPlaylist(playlistId: string, newId: string) {
  return axiosInstance.delete<{ success: boolean }>(
    `/playlists/${playlistId}/songs/${newId}`,
    {
      withCredentials: true,
    },
  );
}

// 重置密码, 成功返回 success: true, 否则返回错误信息
export function resetPassword(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return axiosInstance.post<{ success: boolean; message?: string }>(
    '/reset_password',
    payload,
  );
}

// 注册时校验用户名, status 200 表示可用, 422 表示已被占用
export function checkUsername(payload: { username: string }) {
  return axiosInstance.post<string>('/username_availability_check', payload);
}

// 注册时校验邮箱, status 200 表示可用, 422 表示已被占用
export function checkEmail(payload: { email: string }) {
  return axiosInstance.post<string>('/email_availability_check', payload);
}

// 注册接口, status 201 代表注册成功, 返回 Created
export function signup(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return axiosInstance.post<string>('/sign_up', payload);
}
