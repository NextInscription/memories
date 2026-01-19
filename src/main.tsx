import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'
import './index.css'
import App from './App.tsx'

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5分钟
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{ network: Network.SHELBYNET }}
        onError={(error) => {
          console.error('Wallet adapter error:', error)
        }}
      >
        <App />
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </StrictMode>,
)


