import { useRouteError, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // eslint-disable-next-line no-console
  console.error(error);
  // TODO: 需要加上 layout 组件

  return (
    <Result
      status="error"
      title="出错了"
      subTitle="你可以点击顶部的按钮重新加载或者直接回到首页"
      extra={
        <Button
          type="primary"
          onClick={() => {
            navigate('/');
          }}
        >
          回到首页
        </Button>
      }
    />
  );
}
