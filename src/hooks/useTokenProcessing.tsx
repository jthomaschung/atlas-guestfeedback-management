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
    return urlParams.has('access_token') && urlParams.has('refresh_token');
  };

  const [isProcessingTokens, setIsProcessingTokens] = useState(initialTokenCheck);

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