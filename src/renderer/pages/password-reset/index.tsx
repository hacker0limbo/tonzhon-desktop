import { App, Button, Form, Input, Typography } from 'antd';
import { resetPassword, signout } from '../../api';
import { useAuthStore } from '../../store';

type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function PasswordReset() {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const openLoginModal = useAuthStore((state) => state.openLoginModal);
  const login = useAuthStore((state) => state.login);
  const resetAuth = useAuthStore((state) => state.resetAuth);

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        重置密码
      </Typography.Title>
      <Form
        form={form}
        onFinish={(values) => {
          const { email, password, username, confirmPassword } = values;
          if (password !== confirmPassword) {
            message.warning('两次输入的密码不一致');
            return;
          }

          resetPassword({
            username,
            email,
            password,
          })
            .then((res) => {
              if (res.data?.success) {
                if (login) {
                  // 登录状态下要登出
                  signout()
                    .then((r) => {
                      if (r.status === 200 && r.data === 'OK') {
                        message.success('密码重置成功, 请重新登录');
                        // 清理登录状态
                        resetAuth();
                        // 重新打开登录框
                        openLoginModal();
                      } else {
                        message.error('密码重置成功, 请手动登出后重新登录');
                      }
                    })
                    .catch(() => {
                      message.error('密码重置成功, 请手动登出后重新登录');
                    });
                } else {
                  message.success('密码重置成功');
                }
              } else {
                message.error(res.data?.message || '密码重置失败, 请重试');
              }
            })
            .catch((error) => {
              message.error(
                error?.response?.data?.message || '密码重置失败, 请重试',
              );
            });
        }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ required: true, message: '请输入邮箱' }]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="password"
          label="新密码"
          rules={[{ required: true, message: '请输入新密码' }]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          rules={[{ required: true, message: '请确认新密码' }]}
        >
          <Input.Password placeholder="请确认新密码" />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              form.submit();
            }}
          >
            重置密码
          </Button>
        </div>
      </Form>
    </>
  );
}
