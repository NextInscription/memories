import { useAccountBlobs } from '../hooks/useShelby'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

export function AutoLoadBlobs() {
  const { account, connected } = useWallet()

  const { data: blobsData, isLoading, error } = useAccountBlobs({
    account: account?.address.toString(),
    pagination: { limit: 10, offset: 0 },
    enabled: connected, // 只有连接钱包后才自动加载
  })

  const blobs = blobsData?.blobs || []

  if (!connected) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
            我的 Blobs ({blobs.length})
          </h4>
          <span className="text-xs text-gray-500">
            {account?.address.toString().slice(0, 6)}...{account?.address.toString().slice(-4)}
          </span>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-sm text-red-500">加载失败</div>
        ) : blobs.length === 0 ? (
          <div className="text-sm text-gray-500">暂无 blobs</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {blobs.map((blob: any) => (
              <div
                key={blob.blob_name}
                className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs"
              >
                <div className="font-medium truncate">{blob.blob_name}</div>
                <div className="text-gray-500">
                  {(Number(blob.blob_size) / 1024).toFixed(2)} KB
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
