import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  CustomerServiceOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Flex, Image, Typography, Button, theme, Divider, App } from 'antd';
import { useParams } from 'react-router-dom';
import { type PlaylistInfo, getPlaylistInfo } from '../../api';
import { fallbackCover, formatCount, getPlaylistCoverUrl } from '../../utils';
import SongTable from '../../components/SongTable';

export default function Playlist() {
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo>();
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
            <Button icon={<CustomerServiceOutlined />} title="播放" disabled>
              {formatCount(playlistInfo?.playCount)}
            </Button>
            <Button icon={<HeartOutlined />} title="收藏" disabled>
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
