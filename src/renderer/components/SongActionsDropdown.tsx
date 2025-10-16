import React, { useMemo } from 'react';
import { Dropdown, type DropdownProps, App, type MenuProps } from 'antd';
import {
  CopyOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HeartFilled,
  HeartOutlined,
  LoginOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusCircleOutlined,
  PlusSquareOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useLocation, useParams } from 'react-router-dom';
import { copySongInfoToClipboard } from '../utils';
import {
  addSongToMyPlaylist,
  getSongSrc,
  removeSongFromMyPlaylist,
  type Song,
} from '../api';
import { useFavorite, usePlayer, useRefresh, useSong } from '../hooks';
import { useAuthStore, useMusicPlayerStore } from '../store';
import { REFRESH_PLAYLIST_EVENT } from '../constants';

type SongActionsDropdownProps = {
  trigger: DropdownProps['trigger'];
  song?: Song;
  children?: React.ReactNode;
};

// 点击歌曲的更多或者右键触发的菜单
export default function SongActionsDropdown({
  trigger,
  song,
  children,
}: SongActionsDropdownProps) {
  const { message, modal } = App.useApp();
  const { matchCurrentSong, isSongPlaying } = useSong(song);
  const { playNewSong, playOrPauseCurrentSong, addSongToPlaylist } =
    usePlayer();
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);
  const disabled = useMemo(
    () => brokenSongIds.includes(song?.newId ?? ''),
    [brokenSongIds, song?.newId],
  );
  const login = useAuthStore((state) => state.login);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const { isSongFavorite, favoriteSong, unFavoriteSong } = useFavorite(song);
  const myPlaylists = useAuthStore((state) => state.user?.playlists);
  const openCreatePlaylistModal = useAuthStore(
    (state) => state.openCreatePlaylistModal,
  );
  const { pathname } = useLocation();
  const { id: playlistId } = useParams<{ id?: string }>();
  // 当前路径是否在歌单相关页面, 并且该歌单在我的歌单里面
  const inMyPlaylists = useMemo(() => {
    const inPlaylist = ['playlists', 'my-playlists'].includes(
      pathname.split('/')?.[1],
    );
    if (!login) {
      return false;
    }
    if (inPlaylist && playlistId) {
      return myPlaylists?.some((playlist) => playlist.id === playlistId);
    }

    return false;
  }, [myPlaylists, pathname, playlistId, login]);

  const deleteActionItems: MenuProps['items'] = [
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      onClick: () => {
        if (playlistId && song) {
          modal.confirm({
            title: '移除确认',
            content: `确定要将 "${song.name}" 从该歌单移除吗?`,
            onOk() {
              return removeSongFromMyPlaylist(playlistId, song.newId)
                .then((res) => {
                  if (res.data.success) {
                    message.success('已成功移除');
                  } else {
                    throw new Error();
                  }
                })
                .catch(() => {
                  message.error('移除失败');
                })
                .finally(() => {
                  // NOTE: 这里需要通知上游的组件重新获取歌单信息, 所以通过自定义事件来触发
                  const refreshPlaylistEvent = new CustomEvent(
                    REFRESH_PLAYLIST_EVENT,
                  );
                  window.dispatchEvent(refreshPlaylistEvent);
                });
            },
          });
        }
      },
    },
  ];

  // 添加到我的歌单的菜单项
  const addToMyPlaylistItems: MenuProps['items'] = !login
    ? [
        {
          key: 'login-to-add-playlist',
          label: '登录添加到歌单',
          icon: <LoginOutlined />,
          onClick: () => {
            openLoginModal();
          },
        },
      ]
    : [
        {
          key: 'add-to-new-playlist',
          label: '添加到新歌单',
          disabled,
          icon: <PlusSquareOutlined />,
          onClick: () => {
            openCreatePlaylistModal(song);
          },
        },
        {
          type: 'divider',
        },
        ...(myPlaylists?.map((playlist) => ({
          key: `add-to-playlist-${playlist.id}`,
          label: playlist.name,
          disabled,
          icon: <CustomerServiceOutlined />,
          onClick: () => {
            if (song) {
              addSongToMyPlaylist(playlist.id, song)
                .then((res) => {
                  if (res.data.success) {
                    message.success(`已添加到歌单 "${playlist.name}"`);
                  } else {
                    message.error(`添加到歌单 "${playlist.name}" 失败`);
                  }
                })
                .catch(() => {
                  message.error(`添加到歌单 "${playlist.name}" 失败`);
                });
            }
          },
        })) || []),
      ];

  // 所有菜单项
  const items: MenuProps['items'] = [
    {
      key: 'play',
      disabled,
      // 显示下一个状态
      label: isSongPlaying ? '暂停' : '播放',
      icon: isSongPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />,
      onClick: () => {
        if (matchCurrentSong) {
          // 是当前歌曲, 下一步操作
          playOrPauseCurrentSong();
        } else {
          // 不存在歌曲或者不是当前这首歌, 播放这首新歌
          playNewSong(song);
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'favorite',
      disabled,
      label: '我喜欢',
      icon: isSongFavorite ? (
        <HeartFilled style={{ color: 'var(--ant-pink)' }} />
      ) : (
        <HeartOutlined />
      ),
      onClick: () => {
        if (!login) {
          // 未登录下我喜欢要先登录
          openLoginModal();
          return;
        }
        if (isSongFavorite) {
          unFavoriteSong();
        } else {
          favoriteSong();
        }
      },
    },
    {
      key: 'add',
      disabled,
      label: '添加到',
      icon: <PlusCircleOutlined />,
      children: [
        {
          key: 'add-to-playlist',
          label: '播放列表',
          disabled,
          icon: <UnorderedListOutlined />,
          onClick: () => {
            getSongSrc(song?.newId ?? '').then((res) => {
              if (res?.data?.success) {
                addSongToPlaylist(song);
              }
            });
          },
        },
        {
          type: 'divider',
        },
        ...addToMyPlaylistItems,
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'download',
      disabled,
      label: '下载',
      icon: <DownloadOutlined />,
      onClick: () => {
        getSongSrc(song?.newId ?? '')
          .then((res) => {
            if (res?.data?.success) {
              window.electron?.downloadFile({
                url: res.data.data,
                name: song?.name,
              });
            } else {
              message.error('获取下载链接失败');
            }
          })
          .catch(() => {
            message.error('获取下载链接失败');
          });
      },
    },
    {
      key: 'copy',
      label: '复制歌曲信息',
      icon: <CopyOutlined />,
      onClick: () => {
        copySongInfoToClipboard(song);
      },
    },
  ];

  return (
    <Dropdown
      trigger={trigger}
      menu={{
        items: [...items, ...(inMyPlaylists ? deleteActionItems : [])],
      }}
    >
      {children}
    </Dropdown>
  );
}
