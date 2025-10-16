import { useState } from 'react';
import { App, Button, Flex, Form, Input, Modal, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { signin } from '../api';

type FormValues = {
  username: string;
  password: string;
};

export default function LoginModal() {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const showLoginModal = useAuthStore((state) => state.showLoginModal);
  const closeLoginModal = useAuthStore((state) => state.closeLoginModal);
  const [loading, setLoading] = useState(false);
  const setLogin = useAuthStore((state) => state.setLogin);
  const setUser = useAuthStore((state) => state.setUser);

  return (
    <Modal
      width={400}
      maskClosable={false}
      footer={null}
      open={showLoginModal}
      onCancel={() => {
        closeLoginModal();
        form.resetFields();
      }}
      title="登录"
      destroyOnHidden
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={(values: FormValues) => {
          setLoading(true);
          signin(values)
            .then((res) => {
              if (res.data?.success) {
                // 设置登录状态
                setLogin(true);
                setUser(res.data.data!);
                // 关闭并重置
                closeLoginModal();
                form.resetFields();
              } else {
                message.error(res.data?.message || '登录失败请重试');
              }
            })
            .catch(() => {
              message.error('登录失败请重试');
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
          label="用户名"
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
          label="密码"
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>

        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 12 }}
        >
          <Typography.Link
            onClick={() => {
              window.electron?.openExternal(
                'https://tonzhon.whamon.com/sign-up',
              );
            }}
          >
            注册
          </Typography.Link>
          <Typography.Link
            onClick={() => {
              window.electron?.openExternal(
                'https://tonzhon.whamon.com/password_reset',
              );
            }}
          >
            忘记密码?
          </Typography.Link>
        </Flex>

        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
