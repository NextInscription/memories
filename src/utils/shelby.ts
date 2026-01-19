import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import { ReedSolomonErasureCodingProvider } from '@shelby-protocol/sdk/browser'
import { Network } from '@aptos-labs/ts-sdk'

// 创建 Reed-Solomon provider（纯 JS 实现，不需要 WebAssembly）
const erasureProvider = new ReedSolomonErasureCodingProvider()

// 创建 Shelby SDK 客户端实例
// 如果需要 API key，可以在环境变量中配置 SHELBY_API_KEY
const shelbyConfig: any = {
  network: Network.SHELBYNET,
  provider: erasureProvider, // 使用 Reed-Solomon provider
}

// 如果有 API key，添加到配置中
if (import.meta.env.VITE_SHELBY_API_KEY) {
  shelbyConfig.apiKey = import.meta.env.VITE_SHELBY_API_KEY
  shelbyConfig.indexer = {
    apiKey: import.meta.env.VITE_SHELBY_API_KEY,
  }
}

export const shelbyClient = new ShelbyClient(shelbyConfig)

// 获取账户的 blobs
export async function getAccountBlobs(accountAddress: string, limit = 10, offset = 0) {
  try {
    const response = await shelbyClient.coordination.getAccountBlobs({
      account: accountAddress,
      pagination: { limit, offset },
      orderBy: { created_at: 'desc' }, // 按创建时间降序排列（最新的在前）
    })
    return response
  } catch (error) {
    console.error('Error fetching account blobs:', error)
    throw error
  }
}

// 上传 blob
export async function uploadBlob(
  signer: any,
  blobName: string,
  blobData: Uint8Array,
  expirationMicros?: number
) {
  try {
    // 上传功能需要直接使用 ShelbyClient
    // 这里暂时返回错误提示，需要实现正确的上传逻辑
    throw new Error('Upload functionality needs to be implemented')
  } catch (error) {
    console.error('Error uploading blob:', error)
    throw error
  }
}
