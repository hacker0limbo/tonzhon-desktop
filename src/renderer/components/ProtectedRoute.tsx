import React from 'react';
import { Navigate } from 'react-router-dom';
import { App } from 'antd';
import { useAuthStore } from '../store';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

// 对要登录的页面进行重定向
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { message } = App.useApp();
  const login = useAuthStore((state) => state.login);

  if (!login) {
    message.warning('暂无权限访问, 请先登录');
    return <Navigate to="/" replace />;
  }

  return children;
}
