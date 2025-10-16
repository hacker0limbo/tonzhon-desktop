import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  CustomerServiceOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { Flex, Image, Typography, Button, theme, Divider, App } from 'antd';
import { useParams } from 'react-router-dom';
import {
  type PlaylistInfo,
  getPlaylistInfo,
  addPlaylistToCollection,
} from '../../api';
import { fallbackCover, formatCount, getPlaylistCoverUrl } from '../../utils';
import SongTable from '../../components/SongTable';
import { useAuthStore } from '../../store';
import { useRefresh } from '../../hooks';
import { REFRESH_PLAYLIST_EVENT } from '../../constants';

export default function Playlist() {
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo>();
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const collectedPlaylists = useAuthStore(
    (state) => state.user?.collectedPlaylists,
  );
  const { refreshUserInfo } = useRefresh();
  // 该歌单是否被收藏
  const isPlaylistCollected = useMemo(
    () => collectedPlaylists?.some((playlist) => playlist.id === id),
    [collectedPlaylists, id],
  );

  const collectPlaylist = useCallback(() => {
    if (id && playlistInfo) {
      addPlaylistToCollection(id, playlistInfo.name)
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
  }, [id, message, playlistInfo, refreshUserInfo]);

  const fetchPlaylistInfo = useCallback(() => {
    if (id) {
      setLoading(true);
      getPlaylistInfo(id)
        .then((res) => {
          if (res.data.success) {
            setPlaylistInfo(res.data.playlist);
          }
        })
        .catch(() => {
          message.error('获取歌单信息失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, message]);

  useEffect(() => {
    fetchPlaylistInfo();
  }, [fetchPlaylistInfo]);

  // 监听自定义事件, 用于刷新歌单信息
  useEffect(() => {
    window.addEventListener(REFRESH_PLAYLIST_EVENT, fetchPlaylistInfo);

    return () => {
      window.removeEventListener(REFRESH_PLAYLIST_EVENT, fetchPlaylistInfo);
    };
  }, [fetchPlaylistInfo]);

  return (
    <>
      <Flex gap="middle">
        <Image
          fallback={fallbackCover}
          src={getPlaylistCoverUrl(playlistInfo?.cover)}
          preview={false}
          width={120}
          style={{ borderRadius: borderRadiusLG }}
        />
        <Flex justify="space-between" vertical>
          <div>
            <Typography.Text style={{ fontSize: 24, marginBottom: 16 }} strong>
              {playlistInfo?.name}
            </Typography.Text>
            <Flex gap="small" align="center">
              <Typography.Text
                // type="secondary"
                className="link"
                style={{ fontSize: 12 }}
              >
                {playlistInfo?.author}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {`${dayjs(playlistInfo?.created).format('YYYY-MM-DD')} 创建`}
              </Typography.Text>
            </Flex>
          </div>
          <Flex gap="small">
            <Button icon={<CustomerServiceOutlined />} title="播放量">
              {formatCount(playlistInfo?.playCount)}
            </Button>
            <Button
              icon={
                isPlaylistCollected ? (
                  <StarFilled style={{ color: 'var(--ant-pink)' }} />
                ) : (
                  <StarOutlined />
                )
              }
              title="收藏"
              onClick={() => {
                // TODO: 暂无取消收藏功能
                if (!isPlaylistCollected) {
                  collectPlaylist();
                }
              }}
            >
              {formatCount(playlistInfo?.collectCount)}
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => {
                const playlistUrl = `https://tonzhon.whamon.com/playlist/${id}`;
                window.electron?.copyToClipboard(playlistUrl);
                message.success({
                  duration: 3,
                  content: '歌单链接已复制',
                });
              }}
            >
              分享
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <Divider size="middle" />

      <SongTable loading={loading} songs={playlistInfo?.songs ?? []} />
    </>
  );
}
