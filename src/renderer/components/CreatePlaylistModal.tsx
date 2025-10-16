import { App, Form, Input, Modal, type InputRef } from 'antd';
import { useRef, useState } from 'react';
import { useAuthStore } from '../store';
import { addSongToMyPlaylist, createPlaylist } from '../api';
import { useRefresh } from '../hooks';

export default function CreatePlaylistModal() {
  const { message } = App.useApp();
  const inputRef = useRef<InputRef>(null);
  const showPlaylistModal = useAuthStore(
    (state) => state.showCreatePlaylistModal,
  );
  const closePlaylistModal = useAuthStore(
    (state) => state.closeCreatePlaylistModal,
  );
  const [loading, setLoading] = useState(false);
  const { refreshUserInfo } = useRefresh();
  const songForCreatePlaylistModal = useAuthStore(
    (state) => state.songForCreatePlaylistModal,
  );

  return (
    <Modal
      maskClosable={false}
      width={400}
      title="创建歌单"
      open={showPlaylistModal}
      okText="创建"
      onCancel={closePlaylistModal}
      confirmLoading={loading}
      onOk={() => {
        const name = inputRef?.current?.input?.value?.trim();
        if (!name) {
          message.warning('歌单名不能为空');
        } else {
          setLoading(true);
          createPlaylist(name)
            .then((res) => {
              if (res.data.playlistId) {
                if (songForCreatePlaylistModal) {
                  // 如果提供了歌曲, 则添加到歌单
                  addSongToMyPlaylist(
                    res.data.playlistId,
                    songForCreatePlaylistModal,
                  )
                    .then((r) => {
                      if (r.data.success) {
                        message.success('创建歌单并添加歌曲成功');
                        closePlaylistModal();
                      }
                    })
                    .catch(() => {
                      message.error('创建歌单成功, 但添加歌曲失败, 请手动添加');
                    });
                } else {
                  message.success('创建歌单成功');
                  closePlaylistModal();
                }
              }
            })
            .catch(() => {
              message.error('创建歌单失败, 请重试');
            })
            .finally(() => {
              // 更新用户信息
              refreshUserInfo();
              setLoading(false);
            });
        }
      }}
      destroyOnHidden
    >
      <Form.Item
        required
        rules={[{ required: true, message: '请输入歌单名' }]}
        label="歌单名"
      >
        <Input
          ref={inputRef}
          placeholder="请输入歌单名"
          maxLength={20}
          showCount
        />
      </Form.Item>
    </Modal>
  );
}
