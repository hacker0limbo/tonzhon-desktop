import { Tabs, type TabsProps, App as AntdApp } from 'antd';
import { useEffect, useState } from 'react';
import { getHotSongs, getNewSongs, type Song } from '../../api';
import SongTable from '../../components/SongTable';

export default function Home() {
  const { message } = AntdApp.useApp();
  const [newSongs, setNewSongs] = useState<Song[]>([]);
  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [loadingNewSongs, setLoadingNewSongs] = useState(false);
  const [loadingHotSongs, setLoadingHotSongs] = useState(false);

  const items: TabsProps['items'] = [
    {
      key: 'hot-songs',
      label: '热门歌曲',
      children: <SongTable songs={hotSongs} loading={loadingHotSongs} />,
    },
    {
      key: 'new-songs',
      label: '新歌推荐',
      children: <SongTable songs={newSongs} loading={loadingNewSongs} />,
    },
  ];

  useEffect(() => {
    setLoadingHotSongs(true);
    getHotSongs()
      .then((res) => {
        if (res.data.success) {
          setHotSongs(res.data.songs);
        }
      })
      .catch(() => {
        message.error('获取热门歌曲列表失败');
      })
      .finally(() => {
        setLoadingHotSongs(false);
      });
  }, [message]);

  useEffect(() => {
    setLoadingNewSongs(true);
    getNewSongs()
      .then((res) => {
        if (res.data.success) {
          setNewSongs(res.data.songs);
        }
      })
      .catch(() => {
        message.error('获取新歌列表失败');
      })
      .finally(() => {
        setLoadingNewSongs(false);
      });
  }, [message]);

  return <Tabs items={items} defaultActiveKey="hot-songs" />;
}
