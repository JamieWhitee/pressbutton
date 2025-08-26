"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Navigation bar component with Instagram-inspired styling
 * Includes: Home, Rank, Profile, Login/Register
 */
const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Rank", path: "/rank" },
    { name: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #e91e63, #9c27b0, #ff9800)',
      padding: '0 20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px'
      }}>
        {/* Logo/Brand */}
        <div
          onClick={() => router.push('/')}
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            cursor: 'pointer',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          PressButton
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: isActive(item.path) ? 'bold' : '500',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.name}
            </button>
          ))}

          {/* Login/Register Button */}
          <button
            onClick={() => router.push('/users/login')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '8px 20px',
              borderRadius: '25px',
              transition: 'all 0.3s ease',
              textShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#e91e63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = 'white';
            }}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
