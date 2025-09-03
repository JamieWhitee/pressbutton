'use client';
import React, { useState, useEffect } from 'react';

const TokenDebugger: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>({});

  useEffect(() => {
    const checkTokens = () => {
      if (typeof window === 'undefined') return;

      const authToken = localStorage.getItem('auth_token');
      const enterpriseTokens = localStorage.getItem('enterprise_auth_tokens');
      
      let enterpriseParsed = null;
      try {
        enterpriseParsed = enterpriseTokens ? JSON.parse(enterpriseTokens) : null;
      } catch (e) {
        enterpriseParsed = 'PARSE_ERROR';
      }

      setTokenInfo({
        authToken: authToken ? 'EXISTS' : 'NOT_FOUND',
        enterpriseTokens: enterpriseTokens ? 'EXISTS' : 'NOT_FOUND',
        enterpriseParsed,
        tokensMatch: authToken && enterpriseParsed?.accessToken ? 
          (authToken === enterpriseParsed.accessToken ? 'YES' : 'NO') : 'N/A'
      });
    };

    checkTokens();
    
    // Check every 2 seconds
    const interval = setInterval(checkTokens, 2000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Token Debug:</strong></div>
      <div>Auth Token: {tokenInfo.authToken}</div>
      <div>Enterprise Tokens: {tokenInfo.enterpriseTokens}</div>
      <div>Tokens Match: {tokenInfo.tokensMatch}</div>
      {tokenInfo.enterpriseParsed && typeof tokenInfo.enterpriseParsed === 'object' && (
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          <div>Enterprise Token Type: {tokenInfo.enterpriseParsed.tokenType}</div>
          <div>Has Access Token: {tokenInfo.enterpriseParsed.accessToken ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  );
};

export default TokenDebugger;
