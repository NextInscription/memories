import { useState, useRef } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs } from '@shelby-protocol/react'
import { shelbyClient } from '../utils/shelby'
import dayjs from 'dayjs'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: () => void
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [assetTitle, setAssetTitle] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [expirationTime, setExpirationTime] = useState('00:00')
  const [error, setError] = useState<string | null>(null)
  const [fileExtension, setFileExtension] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadBlobs = useUploadBlobs({
    client: shelbyClient,
    onSuccess: () => {
      console.log('Upload successful')
      onUploadSuccess()
      handleClose()
    },
    onError: (err: Error) => {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed, please try again')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file')
      return
    }

    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setError('File size cannot exceed 500MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // 提取并保存文件扩展名
    const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : ''
    setFileExtension(ext)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file)
      setPreview(videoURL)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !account || !signAndSubmitTransaction) {
      setError('Please select a file and connect your wallet')
      return
    }

    if (!assetTitle.trim()) {
      setError('Please enter an asset title')
      return
    }

    // 验证过期时间
    if (expirationDate && expirationTime) {
      const selectedDateTime = dayjs(`${expirationDate} ${expirationTime}`)
      const tomorrow = dayjs().startOf('day').add(1, 'day')

      if (selectedDateTime.isBefore(tomorrow)) {
        setError('Expiration date must be at least tomorrow')
        return
      }
    }

    setError(null)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const blobData = new Uint8Array(arrayBuffer)

      let expirationMicros: number
      if (expirationDate && expirationTime) {
        const dateTime = dayjs(`${expirationDate} ${expirationTime}`)
        // 转换为微秒时间戳（number类型）
        expirationMicros = dateTime.valueOf() * 1000
      } else {
        // 默认 30 天后
        expirationMicros = Date.now() * 1000 + 30 * 24 * 60 * 60 * 1000000
      }

      // 生成文件名：标题_时间戳.扩展名
      const timestamp = Math.floor(Date.now() / 1000)
      const blobName = `${assetTitle.trim()}_${timestamp}${fileExtension}`

      uploadBlobs.mutate({
        signer: {
          account: account.address,
          signAndSubmitTransaction,
        },
        blobs: [
          {
            blobName,
            blobData,
          },
        ],
        expirationMicros,
      })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed, please try again')
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    setAssetTitle('')
    setExpirationDate('')
    setExpirationTime('00:00')
    setError(null)
    setFileExtension('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2d3748] flex items-center justify-between bg-white dark:bg-[#1a202c]">
          <h2 className="text-xl font-bold tracking-tight">Upload Media Asset</h2>
          <button
            onClick={handleClose}
            className="text-[#616f89] hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Asset Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#616f89] uppercase tracking-wider">
              Asset Title
            </label>
            <input
              type="text"
              value={assetTitle}
              onChange={(e) => setAssetTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="w-full rounded-xl border border-[#dbdfe6] dark:border-[#2d3748] bg-white dark:bg-[#101622] h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-[#a0aec0]"
            />
          </div>

          {/* Expiration Date & Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#616f89] uppercase tracking-wider">
              Expiration Date & Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input')
                  input?.showPicker?.() || input?.focus()
                }}
                className="relative cursor-pointer"
              >
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl pointer-events-none">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dbdfe6] dark:border-[#2d3748] bg-white dark:bg-[#101622] focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                />
              </div>
              <div
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input')
                  input?.showPicker?.() || input?.focus()
                }}
                className="relative cursor-pointer"
              >
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl pointer-events-none">
                  schedule
                </span>
                <input
                  type="time"
                  value={expirationTime}
                  onChange={(e) => setExpirationTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dbdfe6] dark:border-[#2d3748] bg-white dark:bg-[#101622] focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                />
              </div>
            </div>
            <p className="text-xs text-[#a0aec0]">Leave empty for 30 days default</p>
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#616f89] uppercase tracking-wider">
              File Content
            </label>
            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center h-56 w-full border-2 border-dashed border-[#dbdfe6] dark:border-[#2d3748] rounded-2xl bg-slate-50 dark:bg-slate-900/50 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#111318] dark:text-white">
                      Drag and drop file here
                    </p>
                    <p className="text-sm text-[#616f89]">
                      Or <span className="text-primary font-semibold underline">click to browse</span>
                    </p>
                    <p className="text-[11px] text-[#a0aec0] mt-3 uppercase tracking-widest font-medium">
                      Supports MP4, MOV, JPG, PNG up to 500MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group h-72 w-full rounded-2xl overflow-hidden border border-[#dbdfe6] dark:border-[#2d3748] bg-slate-100">
                {selectedFile?.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-bold truncate max-w-[200px]">
                      {selectedFile?.name}
                    </p>
                    <p className="text-[10px] opacity-80 uppercase font-medium">
                      {selectedFile && formatFileSize(selectedFile.size)} MB • {selectedFile?.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        setPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="px-4 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span> Replace
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        setPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="size-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all shadow-lg"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined !text-xl">error</span>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-[#dbdfe6] dark:border-[#2d3748] flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={uploadBlobs.isPending}
            className="text-sm font-bold text-[#616f89] hover:text-[#111318] dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadBlobs.isPending}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadBlobs.isPending ? (
              <>
                <span className="material-symbols-outlined !animate-spin text-lg">loading</span>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>Upload Asset</span>
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Progress Overlay */}
        {uploadBlobs.isPending && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="flex flex-col items-center gap-6">
              {/* Animated Circle */}
              <div className="relative">
                <div className="size-20 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 size-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
                </div>
              </div>

              {/* Progress Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Uploading to Shelby
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we upload your asset...
                </p>
              </div>

              {/* Animated Dots */}
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
