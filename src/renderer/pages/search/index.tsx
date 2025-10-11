import { useEffect, useState } from 'react';
import { App, Divider, Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { type Song, searchAll, getSongsOfArtist } from '../../api';
import SongTable from '../../components/SongTable';

export default function Search() {
  const { message } = App.useApp();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const searchType = searchParams.get('type') || 'all';
  // 是否搜索结果为空
  const [songsEmpty, setSongsEmpty] = useState(false);

  useEffect(() => {
    // 重置搜索状态
    setSongsEmpty(false);
    setSongs([]);

    if (keyword) {
      setLoading(true);
      if (searchType === 'all') {
        searchAll(keyword)
          .then((res) => {
            if (res.data.success) {
              if (!res.data?.data?.length) {
                setSongsEmpty(true);
              } else {
                setSongs(res.data?.data || []);
              }
            }
          })
          .catch(() => {
            message.error('搜索失败');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // 搜索歌手
        getSongsOfArtist(keyword)
          .then((res) => {
            if (!res.data.songs?.length) {
              setSongsEmpty(true);
            } else {
              setSongs(res.data?.songs || []);
            }
          })
          .catch(() => {
            message.error('搜索失败');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [keyword, message, searchType]);

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        搜索{searchType === 'all' ? '' : '歌手'}:{' '}
        <span style={{ color: 'var(--ant-color-link)' }}>{keyword}</span>
      </Typography.Title>

      <Divider size="middle" />

      {songsEmpty ? (
        <Typography.Text>未找到相关歌曲</Typography.Text>
      ) : (
        <SongTable songs={songs} loading={loading} />
      )}
    </>
  );
}
