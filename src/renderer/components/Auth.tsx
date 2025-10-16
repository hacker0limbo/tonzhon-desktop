import React from 'react';
import { useAuthStore } from '../store';

type AuthProps = {
  children: React.ReactNode;
};

// 拦截子元素的 onClick 事件, 未登录下弹出登录框
export default function Auth({ children }: AuthProps) {
  const login = useAuthStore((state) => state.login);
  const openLoginModal = useAuthStore((state) => state.openLoginModal);

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
              if (!login) {
                e.preventDefault();
                openLoginModal();
              } else {
                child.props?.onClick?.(e);
              }
            },
          });
        }
        return child;
      })}
    </>
  );
}
