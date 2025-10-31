import { useCallback, useState } from 'react';
import {
  App,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Tabs,
  Typography,
  type TabsProps,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { checkEmail, checkUsername, signin, signup } from '../api';

type LoginFormValues = {
  username: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
};

type Action = 'login' | 'register';

// 包含注册的登录弹框, 名字不改了
export default function LoginModal() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm<LoginFormValues>();
  const showLoginModal = useAuthStore((state) => state.showLoginModal);
  const closeLoginModal = useAuthStore((state) => state.closeLoginModal);
  const [loading, setLoading] = useState(false);
  const setLogin = useAuthStore((state) => state.setLogin);
  const setUser = useAuthStore((state) => state.setUser);
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const [action, setAction] = useState<Action>('login');

  // 重置所有状态
  const reset = useCallback(() => {
    closeLoginModal();
    loginForm.resetFields();
    registerForm.resetFields();
    setLoading(false);
  }, [closeLoginModal, loginForm, registerForm]);

  const items: TabsProps['items'] = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          layout="vertical"
          form={loginForm}
          onFinish={(values: LoginFormValues) => {
            setLoading(true);
            signin(values)
              .then((res) => {
                if (res.data?.success) {
                  // 设置登录状态
                  setLogin(true);
                  setUser(res.data.data!);
                  // 关闭并重置
                  reset();
                } else {
                  message.error(res.data?.message || '登录失败请重试');
                }
              })
              .catch((error) => {
                message.error(
                  error.response?.data?.message || '登录失败请重试',
                );
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
            <Input prefix={<UserOutlined />} placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            label="密码"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              allowClear
            />
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
              网页版注册
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                closeLoginModal();
                loginForm.resetFields();
                navigate('/password-reset');
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
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          layout="vertical"
          form={registerForm}
          onFinish={(values: RegisterFormValues) => {
            // 注册逻辑
            setLoading(true);
            signup(values)
              .then((res) => {
                if (res.status < 300 && res.status >= 200) {
                  message.success({
                    content: '注册成功, 请前往邮箱进行验证',
                    duration: 6,
                  });
                  // 切换到登录页
                  setAction('login');
                  loginForm.setFieldsValue({
                    username: values.username,
                    password: values.password,
                  });
                }
              })
              .catch(() => {
                message.error('注册失败, 请重试');
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          <Form.Item
            name="username"
            // 一秒后才校验
            validateDebounce={1000}
            required
            rules={[
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.reject(new Error('请输入用户名'));
                  }
                  return checkUsername({ username: value }).catch(() => {
                    throw new Error('用户名已被占用');
                  });
                },
              },
            ]}
            label="用户名"
            hasFeedback
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item
            name="email"
            required
            // 一秒后才校验
            validateDebounce={1000}
            rules={[
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.reject(new Error('请输入邮箱'));
                  }
                  return checkEmail({ email: value }).catch(() => {
                    throw new Error('邮箱已被占用');
                  });
                },
              },
            ]}
            label="邮箱"
            hasFeedback
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" allowClear />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            label="密码"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      width={400}
      maskClosable={false}
      footer={null}
      open={showLoginModal}
      onCancel={() => {
        reset();
      }}
      destroyOnHidden
    >
      <Tabs
        items={items}
        centered
        activeKey={action}
        onChange={(key) => {
          setAction(key as Action);
        }}
      />
    </Modal>
  );
}
