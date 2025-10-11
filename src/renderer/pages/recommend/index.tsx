import { useEffect, useState } from 'react';
import { App as AntdApp, Spin, theme } from 'antd';
import { getRecommendPlaylists, type Playlist } from '../../api';
import PlaylistGroup from '../../components/PlaylistGroup';

// 精选歌单
export default function Recommend() {
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setLoading(true);
    getRecommendPlaylists()
      .then((res) => {
        setPlaylists(res.data.playlists);
      })
      .catch(() => {
        message.error('获取精选歌单失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [message]);

  return (
    <Spin spinning={loading}>
      <PlaylistGroup playlists={playlists} />
    </Spin>
  );
}
