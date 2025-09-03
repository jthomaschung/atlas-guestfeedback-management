import { createContext, useContext, useState, ReactNode } from 'react';

interface TokenProcessingContextType {
  isProcessingTokens: boolean;
  setIsProcessingTokens: (processing: boolean) => void;
}

const TokenProcessingContext = createContext<TokenProcessingContextType | undefined>(undefined);

export function TokenProcessingProvider({ children }: { children: ReactNode }) {
  // Check for tokens immediately during initial render (synchronous)
  const initialTokenCheck = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasTokens = urlParams.has('access_token') && urlParams.has('refresh_token');
    console.log('🚀🚀🚀 TOKEN PROCESSING PROVIDER INITIAL CHECK 🚀🚀🚀', {
      hasTokens,
      url: window.location.href,
      searchParams: window.location.search
    });
    return hasTokens;
  };

  const [isProcessingTokens, setIsProcessingTokens] = useState(() => {
    // If we have tokens in URL, we're processing them
    return initialTokenCheck();
  });

  return (
    <TokenProcessingContext.Provider value={{ isProcessingTokens, setIsProcessingTokens }}>
      {children}
    </TokenProcessingContext.Provider>
  );
}

export function useTokenProcessing() {
  const context = useContext(TokenProcessingContext);
  if (context === undefined) {
    throw new Error('useTokenProcessing must be used within a TokenProcessingProvider');
  }
  return context;
}