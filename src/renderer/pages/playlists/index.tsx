import { App, Divider, Pagination, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getPlaylists, getPlaylistsTotal, type Playlist } from '../../api';
import PlaylistGroup from '../../components/PlaylistGroup';

const PAGE_SIZE = 30;

export default function Playlists() {
  const { message } = App.useApp();
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);
  const index = useMemo(() => (current - 1) * PAGE_SIZE, [current]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    getPlaylistsTotal().then((res) => {
      setTotal(res.data.total);
    });
  }, []);

  useEffect(() => {
    if (total) {
      setLoading(true);
      getPlaylists(index)
        .then((res) => {
          if (res.data.success) {
            setPlaylists(res.data.playlists ?? []);
          }
        })
        .catch(() => {
          message.error('获取歌单列表失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [index, total, message]);

  return (
    <Spin spinning={loading}>
      <PlaylistGroup playlists={playlists} />
      <Divider size="middle" />
      <Pagination
        current={current}
        defaultPageSize={PAGE_SIZE}
        total={total}
        align="end"
        showSizeChanger={false}
        showQuickJumper
        showTotal={(totalCount) => `共 ${totalCount} 张歌单`}
        onChange={(page) => {
          setCurrent(page);
        }}
      />
    </Spin>
  );
}
