"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

/**
 * 导航栏组件，采用Instagram风格设计
 * Navigation bar component with Instagram-inspired styling
 */
const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // 导航项配置 | Navigation items configuration
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Rank", path: "/rank" },
    ...(user ? [{ name: "Profile", path: "/users/profile" }] : []),
  ];

  // 检查当前路径 | Check current path
  const isActive = (path: string) => pathname === path;

  // 样式常量 | Style constants
  const styles = {
    nav: {
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      padding: '0 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '60px'
    },
    brand: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'white',
      cursor: 'pointer',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    },
    navButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '8px 16px',
      borderRadius: '20px',
      transition: 'all 0.3s ease',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
    },
    authButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid white',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      padding: '8px 20px',
      borderRadius: '25px',
      transition: 'all 0.3s ease'
    }
  };

  // 处理登出 | Handle logout
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* 品牌标识 | Brand logo */}
        <div onClick={() => router.push('/')} style={styles.brand}>
          PressButton
        </div>

        {/* 导航区域 | Navigation area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 导航链接 | Navigation links */}
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              style={{
                ...styles.navButton,
                fontWeight: isActive(item.path) ? 'bold' : '500',
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
              }}
            >
              {item.name}
            </button>
          ))}

          {/* 认证按钮区域 | Authentication buttons area */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{
                color: 'white',
                fontSize: '14px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Hi, {user.name || user.email}!
              </span>
              <button onClick={handleLogout} style={styles.authButton}>
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/users/login')}
              style={styles.authButton}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
