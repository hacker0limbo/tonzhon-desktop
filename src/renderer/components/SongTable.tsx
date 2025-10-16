import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Flex,
  Popover,
  Space,
  Table,
  Typography,
  type TableProps,
  theme,
} from 'antd';
import {
  CheckOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PlusSquareOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { type Song } from '../api';
import { useMusicPlayerStore } from '../store';
import SongTableActions from './SongTableActions';
import ContextMenuRow from './ContextMenuRow';
import { usePlayer } from '../hooks';
import { fallbackCover } from '../utils';

type SongTableProps = {
  songs: Song[];
  loading: boolean;
};

export default function SongTable({ songs, loading }: SongTableProps) {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const navigate = useNavigate();
  const { addSongsToPlaylist } = usePlayer();
  const resetNewSongs = useMusicPlayerStore((state) => state.resetNewSongs);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  // 禁用批量操作按钮
  const disabledBatchAction = useMemo(
    () => showBatchActions && !selectedSongIds.length,
    [showBatchActions, selectedSongIds],
  );
  const selectedSongs = useMemo(
    () => songs.filter((s) => selectedSongIds.includes(s.newId)),
    [songs, selectedSongIds],
  );
  const brokenSongIds = useMusicPlayerStore((state) => state.brokenSongIds);

  const columns: TableProps<Song>['columns'] = [
    {
      key: 'name',
      title: '歌曲',
      dataIndex: 'name',
      ellipsis: true,
      width: '35%',
      render: (name: string, record) => {
        const disabled = brokenSongIds.includes(record.newId);
        return (
          <Popover
            placement="bottomLeft"
            title={name}
            content={
              <Typography.Text style={{ fontSize: 12 }}>
                来自平台: {record?.platform ?? '未知'}
              </Typography.Text>
            }
          >
            <Flex gap="small" align="center">
              <img
                src={record.cover || fallbackCover}
                width={32}
                height={32}
                alt="cover"
                style={{ borderRadius }}
              />
              <Typography.Text disabled={disabled}>{name}</Typography.Text>
              {record.alias ? (
                <Typography.Text type="secondary">
                  ({record.alias})
                </Typography.Text>
              ) : null}
            </Flex>
          </Popover>
        );
      },
    },
    {
      key: 'artists',
      title: '艺人',
      dataIndex: 'artists',
      ellipsis: true,
      render: (artists: Song['artists'], record) => {
        const disabled = brokenSongIds.includes(record.newId);

        return (
          <Space size={4} split="/">
            {artists?.map((artist) => (
              <Typography.Text
                className={disabled ? 'disabled-link' : 'link'}
                key={artist.id}
                onClick={() => {
                  navigate(`/artists/${artist.name}`);
                }}
              >
                {artist?.name}
              </Typography.Text>
            ))}
          </Space>
        );
      },
    },
    {
      key: 'album',
      title: '专辑',
      dataIndex: 'album',
      render: (album: Song['album'], record) => {
        const disabled = brokenSongIds.includes(record.newId);
        return (
          <Typography.Text disabled={disabled}>{album?.name}</Typography.Text>
        );
      },
      ellipsis: true,
    },
    {
      key: 'actions',
      title: '操作',
      fixed: 'right',
      dataIndex: 'actions',
      render: (_, record) => {
        return <SongTableActions song={record} />;
      },
    },
  ];

  return (
    <>
      <Flex gap="middle">
        <Button
          icon={<PlayCircleOutlined />}
          onClick={() => {
            if (showBatchActions) {
              // 批量播放歌曲
              resetNewSongs(selectedSongs);
            } else {
              resetNewSongs(songs);
            }
          }}
          disabled={disabledBatchAction || !songs.length}
        >
          {showBatchActions ? '批量播放' : '播放全部'}
        </Button>
        {showBatchActions ? (
          <Button
            disabled={disabledBatchAction}
            icon={<PlusSquareOutlined />}
            onClick={() => {
              addSongsToPlaylist(selectedSongs);
            }}
          >
            批量添加
          </Button>
        ) : null}
        {/* TODO: 暂不实现批量和全部下载 */}
        <Button disabled icon={<DownloadOutlined />} title="暂不支持该功能">
          {showBatchActions ? '批量下载' : '下载全部'}
        </Button>
        <Button
          disabled={!songs.length}
          icon={
            showBatchActions ? <CheckOutlined /> : <UnorderedListOutlined />
          }
          onClick={() => {
            setShowBatchActions(!showBatchActions);
            // 不管关闭开始打开都重置选中状态
            setSelectedSongIds([]);
          }}
        >
          {showBatchActions ? '完成' : '批量操作'}
        </Button>
      </Flex>
      <Table
        rowKey={(record) => record.newId}
        style={{ marginTop: 16 }}
        size="middle"
        dataSource={songs}
        columns={columns}
        loading={loading}
        pagination={false}
        onRow={(record) => {
          return {
            // 传入 record 数据到 ContextMenuRow 组件中
            record,
            style: {},
            // className: 'ant-table-row-selected',
          };
        }}
        components={{
          body: {
            row: ContextMenuRow,
          },
        }}
        rowSelection={
          showBatchActions
            ? {
                selectedRowKeys: selectedSongIds,
                onChange: (selectedRowKeys) => {
                  setSelectedSongIds(selectedRowKeys as string[]);
                },
              }
            : undefined
        }
      />
    </>
  );
}
