/// <reference types="vite/client" />

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}

interface Window {
  aptos?: {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    account: () => Promise<{ address: string; publicKey: string }>
    network: () => Promise<{ name: string; chainId: string }>
    signAndSubmitTransaction: (transaction: any) => Promise<any>
    signMessage: (payload: { message: string; nonce: string }) => Promise<any>
  }
  Buffer: typeof Buffer
}
