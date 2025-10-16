import { App, Divider, Flex, Input, Typography } from 'antd';
import { useState } from 'react';
import SongTable from '../../components/SongTable';
import { getSongsFromNetEasePlaylist, type Song } from '../../api';

const DEFAULT_PLAYLIST_NAME = '未知歌单';

// 导入歌单
export default function ImportPlaylist() {
  const { message } = App.useApp();
  const [songs, setSongs] = useState<Song[]>([]);
  const [name, setName] = useState(DEFAULT_PLAYLIST_NAME);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Flex justify="space-between" align="center">
        <Typography.Text strong style={{ fontSize: 20 }}>
          {name}
        </Typography.Text>
        <Input.Search
          allowClear
          placeholder="请输入网易云歌单 id"
          style={{ width: 250 }}
          enterButton="导入"
          onSearch={(value, e, info) => {
            const v = value.trim();
            if (info?.source !== 'clear') {
              if (v) {
                // 重置状态
                setLoading(true);
                setSongs([]);
                setName(DEFAULT_PLAYLIST_NAME);
                getSongsFromNetEasePlaylist(v)
                  .then((res) => {
                    if (res.data.success) {
                      setSongs(res.data?.data?.songs);
                      setName(res.data?.data?.name);
                      message.success('导入网易云歌单成功');
                    } else {
                      message.error('获取歌单失败，请检查歌单 id 是否正确');
                    }
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              } else {
                message.warning('网易云歌单 id 不能为空');
              }
            }
          }}
        />
      </Flex>
      <Divider size="middle" />
      <SongTable songs={songs} loading={loading} />
    </>
  );
}
