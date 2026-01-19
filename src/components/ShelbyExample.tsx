import { useAccountBlobs, useUploadBlob, useBlob } from '../hooks/useShelby'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

// 示例1: 显示账户的所有 blobs
export function AccountBlobsList() {
  const { account, connected } = useWallet()

  const { data: blobsData, isLoading, error, refetch } = useAccountBlobs({
    account: account?.address.toString(),
    pagination: { limit: 10, offset: 0 },
    enabled: connected, // 只有连接钱包后才查询
  })

  if (!connected) {
    return <div className="text-gray-500">请先连接钱包</div>
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (error) {
    return <div className="text-red-500">错误: {error.message}</div>
  }

  const blobs = blobsData?.blobs || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">账户 Blobs</h3>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          刷新
        </button>
      </div>

      {blobs.length === 0 ? (
        <div className="text-gray-500">暂无 blobs</div>
      ) : (
        <ul className="space-y-2">
          {blobs.map((blob: any) => (
            <li key={blob.blob_name} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="font-bold">{blob.blob_name}</div>
              <div className="text-sm text-gray-500">大小: {blob.blob_size} bytes</div>
              <div className="text-sm text-gray-500">创建时间: {new Date(Number(blob.creation_time) / 1000).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 示例2: 上传文件
export function UploadBlob() {
  const { account, connected } = useWallet()
  const uploadBlob = useUploadBlob()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !account) return

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    uploadBlob.mutate({
      signer: account,
      blobName: file.name,
      blobData: uint8Array,
      expirationMicros: BigInt(Date.now() * 1000 + 86400000000), // 1天后过期
    })
  }

  if (!connected) {
    return <div className="text-gray-500">请先连接钱包</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">上传 Blob</h3>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploadBlob.isPending}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-primary file:text-white
          hover:file:bg-primary/90
        "
      />
      {uploadBlob.isPending && <div className="text-primary">上传中...</div>}
      {uploadBlob.isSuccess && <div className="text-green-500">上传成功！</div>}
      {uploadBlob.isError && <div className="text-red-500">上传失败: {uploadBlob.error?.message}</div>}
    </div>
  )
}

// 示例3: 获取特定 blob
export function BlobView({ blobName }: { blobName: string }) {
  const { account, connected } = useWallet()

  const { data: blobData, isLoading, error } = useBlob({
    account: account?.address.toString(),
    blobName,
    enabled: connected,
  })

  if (!connected) {
    return <div className="text-gray-500">请先连接钱包</div>
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (error) {
    return <div className="text-red-500">错误: {error.message}</div>
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-2">{blobName}</h3>
      {blobData && (
        <div className="space-y-2">
          <div>大小: {blobData.blob_size} bytes</div>
          <div>创建时间: {new Date(Number(blobData.creation_time) / 1000).toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}
