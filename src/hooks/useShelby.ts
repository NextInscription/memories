import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { getAccountBlobs as fetchAccountBlobs, uploadBlob as uploadBlobToShelby } from '../utils/shelby'

// 获取账户 blobs 的 hook
export function useAccountBlobs(params: {
  account?: string
  pagination?: { limit: number; offset: number }
  enabled?: boolean
}): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['accountBlobs', params.account, params.pagination],
    queryFn: () => {
      if (!params.account) {
        throw new Error('Account address is required')
      }
      return fetchAccountBlobs(
        params.account,
        params.pagination?.limit || 10,
        params.pagination?.offset || 0
      )
    },
    enabled: !!params.account && (params.enabled !== false),
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// 上传 blob 的 hook
export function useUploadBlob(): UseMutationResult<any, Error, {
  signer: any
  blobName: string
  blobData: Uint8Array
  expirationMicros?: number | bigint
}, unknown> {
  return useMutation({
    mutationFn: async ({ signer, blobName, blobData, expirationMicros }) => {
      // 转换 bigint 为 number
      const expiration = typeof expirationMicros === 'bigint'
        ? Number(expirationMicros / 1000000n)
        : expirationMicros as number
      return uploadBlobToShelby(signer, blobName, blobData, expiration)
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data)
    },
    onError: (error) => {
      console.error('Upload failed:', error)
    },
  })
}
