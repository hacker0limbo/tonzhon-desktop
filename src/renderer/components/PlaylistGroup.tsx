import {
  AppstoreOutlined,
  BarsOutlined,
  PlayCircleFilled,
} from '@ant-design/icons';
import { useState } from 'react';
import {
  Col,
  Flex,
  Row,
  Image,
  theme,
  Typography,
  App,
  Segmented,
  Table,
  type TableProps,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { getPlaylistInfo, type Playlist } from '../api';
import { fallbackCover, getPlaylistCoverUrl } from '../utils';
import PlaylistTableActions from './PlaylistTableActions';
import { usePlaylistCollection } from '../hooks';
import ContextMenuPlaylistRow from './ContextMenuPlaylistRow';
import PlaylistActionsDropdown from './PlaylistActionsDropdown';

type PlaylistGroupProps = {
  playlists: Playlist[];
};

type ViewMode = 'card' | 'list';

// 歌单列表
export default function PlaylistGroup({ playlists }: PlaylistGroupProps) {
  const {
    token: { borderRadiusLG, borderRadius },
  } = theme.useToken();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const { playWholePlaylist } = usePlaylistCollection();

  const columns: TableProps<Playlist>['columns'] = [
    {
      title: '歌单名',
      dataIndex: 'name',
      ellipsis: true,
      width: '70%',
      render: (name: string, record: Playlist) => {
        return (
          <Flex align="center" gap="small">
            <img
              src={getPlaylistCoverUrl(record.cover) || fallbackCover}
              width={32}
              height={32}
              alt="cover"
              style={{ borderRadius }}
            />
            <Typography.Text
              className="link"
              onClick={() => {
                navigate(`/playlists/${record.id}`);
              }}
            >
              {record.name}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: '操作',
      fixed: 'right',
      render: (_, record) => {
        return <PlaylistTableActions playlist={record} />;
      },
    },
  ];

  return (
    <>
      <Flex justify="end" style={{ marginBottom: 16 }}>
        <Segmented
          style={{ textAlign: 'right' }}
          value={viewMode}
          onChange={(value) => {
            setViewMode(value as ViewMode);
          }}
          options={[
            {
              value: 'card',
              icon: <AppstoreOutlined />,
              title: '卡片视图',
            },
            {
              value: 'list',
              icon: <BarsOutlined />,
              title: '列表视图',
            },
          ]}
        />
      </Flex>

      {viewMode === 'card' ? (
        <Row gutter={[16, 16]}>
          {playlists.map((playlist) => {
            const { cover, id, name } = playlist;
            return (
              <Col span={4} key={id}>
                <Flex vertical align="center" gap="small">
                  <PlaylistActionsDropdown
                    trigger={['contextMenu']}
                    playlist={playlist}
                  >
                    <Image
                      fallback={fallbackCover}
                      onClick={() => {
                        navigate(`/playlists/${id}`);
                      }}
                      rootClassName="playlist-cover"
                      style={{ borderRadius: borderRadiusLG }}
                      src={getPlaylistCoverUrl(cover)}
                      preview={{
                        visible: false,
                        mask: (
                          <PlayCircleFilled
                            style={{ fontSize: 48 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // 直接播放整张专辑
                              playWholePlaylist(id);
                            }}
                          />
                        ),
                      }}
                    />
                  </PlaylistActionsDropdown>
                  <Typography.Text className="link">{name}</Typography.Text>
                </Flex>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Table
          rowKey={(record) => record.id}
          size="middle"
          pagination={false}
          columns={columns}
          dataSource={playlists}
          onRow={(record) => {
            return {
              record,
              style: {},
            };
          }}
          components={{
            body: {
              row: ContextMenuPlaylistRow,
            },
          }}
        />
      )}
    </>
  );
}
