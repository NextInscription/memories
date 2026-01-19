import { useState, useEffect, useMemo, useRef } from "react";
import { useAccountBlobs } from "../hooks/useShelby";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import UploadModal from "./UploadModal";
import SearchFilters from "./SearchFilters";
import dayjs from "dayjs";

const PAGE_SIZE = 100;

export default function AlbumGrid() {
  const { account, connected } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [blobDetails, setBlobDetails] = useState<Map<string, any>>(new Map());
  const [blobContents, setBlobContents] = useState<Map<string, string>>(
    new Map(),
  );
  const [allBlobs, setAllBlobs] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 用 ref 存储最新状态，避免闭包问题
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // 获取账户的 blobs
  const {
    data: blobsData,
    isLoading,
    refetch,
  } = useAccountBlobs({
    account: account?.address.toString(),
    pagination: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    enabled: connected,
  });

  useEffect(() => {
    loadingRef.current = isLoading || isLoadingMore;
    hasMoreRef.current = hasMore;
  }, [isLoading, isLoadingMore, hasMore]);

  // 累积所有加载的 blobs
  useEffect(() => {
    console.log(
      "Page:",
      page,
      "BlobsData:",
      blobsData?.length,
      "PageSize:",
      PAGE_SIZE,
    );
    if (blobsData && blobsData.length > 0) {
      if (page === 0) {
        // 第一页，替换所有数据
        setAllBlobs(blobsData);
        console.log("First page loaded, total:", blobsData.length);
      } else {
        // 后续页，追加数据
        setAllBlobs((prev) => {
          const newBlobs = blobsData.filter(
            (newBlob: any) =>
              !prev.some(
                (existing) =>
                  extractFileName(existing) === extractFileName(newBlob),
              ),
          );
          console.log("Appending", newBlobs.length, "new blobs");
          return [...prev, ...newBlobs];
        });
      }

      // 检查是否还有更多数据
      if (blobsData.length < PAGE_SIZE) {
        console.log("No more data, setting hasMore to false");
        setHasMore(false);
      } else {
        console.log("More data available, hasMore remains true");
      }
    }
  }, [blobsData, page]);

  // 重置分页当账户改变时
  useEffect(() => {
    setPage(0);
    setAllBlobs([]);
    setHasMore(true);
  }, [connected, account?.address]);

  const blobs = allBlobs;

  // 辅助函数：提取纯文件名（去掉账户地址前缀）
  const extractFileName = (blob: any) => {
    const fullPath = blob.name || blob.blob_name;
    return fullPath.includes("/") ? fullPath.split("/").pop() : fullPath;
  };

  // 辅助函数：从文件名中提取标题（去掉时间戳）
  const extractTitle = (fileName: string) => {
    // 移除文件扩展名（如果有）
    const nameWithoutExt = fileName.includes(".")
      ? fileName.split(".").slice(0, -1).join(".")
      : fileName;
    // 分割并检查最后一部分是否是纯数字（时间戳）
    const parts = nameWithoutExt.split("_");
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart) && parts.length > 1) {
      // 最后一部分是时间戳，返回之前的部分
      return parts.slice(0, -1).join("_");
    }
    // 没有时间戳格式，返回原文件名
    return nameWithoutExt;
  };

  // 辅助函数：判断文件是否为视频
  const isVideoFile = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    return ["mp4", "mov", "avi", "mkv", "webm", "video"].includes(ext || "");
  };

  // 根据搜索词过滤 blobs
  const filteredBlobs = useMemo(() => {
    if (!searchTerm.trim()) {
      return blobs;
    }

    const searchLower = searchTerm.toLowerCase();
    return blobs.filter((blob: any) => {
      const fileName = extractFileName(blob);
      const title = extractTitle(fileName);
      return (
        title.toLowerCase().includes(searchLower) ||
        fileName.toLowerCase().includes(searchLower)
      );
    });
  }, [blobs, searchTerm]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("Intersection detected:", entries[0].isIntersecting);
        // 使用 ref 来读取最新的状态值，避免依赖项导致 observer 重新创建
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          console.log("Loading next page...");
          setIsLoadingMore(true);
          setPage((prev) => {
            console.log("Incrementing page from", prev, "to", prev + 1);
            return prev + 1;
          });
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
      console.log("Observer attached to load more trigger");
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [connected, filteredBlobs.length]); // 当数据变化时重新设置observer

  // 重置加载更多状态
  useEffect(() => {
    if (!isLoading) {
      setIsLoadingMore(false);
    }
  }, [isLoading]);

  // 处理点击打开预览
  const handlePreview = (blob: any) => {
    setPreviewBlob(blob);
    setIsPreviewOpen(true);
  };

  // 处理关闭预览
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewBlob(null);
  };

  // 处理上传成功
  const handleUploadSuccess = () => {
    // 重置到第一页
    setPage(0);
    setAllBlobs([]);
    setHasMore(true);
    // 重新获取数据
    refetch();
  };

  // 获取单个 blob 的详情和内容
  const fetchBlobDetails = async (blob: any) => {
    if (!account) return;

    try {
      console.log("Fetching details for blob:", blob);

      // 使用 HTTP URL 直接下载文件
      // URL 格式: https://api.shelbynet.shelby.xyz/shelby/v1/blobs/<account>/<filename>
      const accountAddress = account.address.toString();
      const fileName = extractFileName(blob);
      const downloadUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${fileName}`;

      console.log("Downloading from:", downloadUrl);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const fileData = await response.blob();
      const blobUrl = URL.createObjectURL(fileData);

      console.log("Downloaded successfully:", fileName);

      setBlobContents((prev) => new Map(prev).set(fileName, blobUrl));
      setBlobDetails((prev) => new Map(prev).set(fileName, blob));
    } catch (error) {
      console.error("Error fetching blob details:", error);
      // 即使下载失败，也保存基本信息
      const fileName = extractFileName(blob);
      setBlobDetails((prev) => new Map(prev).set(fileName, blob));
    }
  };

  // 当 blobs 加载完成后，获取每个 blob 的详情
  useEffect(() => {
    if (blobs.length > 0 && connected && account) {
      blobs.forEach((blob: any) => {
        const fileName = extractFileName(blob);
        if (!blobDetails.has(fileName)) {
          fetchBlobDetails(blob);
        }
      });
    }
  }, [blobs, connected, account]);

  // 边框颜色数组
  const borderColors = ["#f0e6d2", "#e2ece9", "#f5e1e1", "#e1e5f5", "#f5f1e1"];

  return (
    <>
      <div className="flex items-end justify-between mb-8 px-2">
        <div>
          <h2 className="text-3xl font-bold serif-title text-[#0e181b] dark:text-white">
            My Albums
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your memories, stored on Shelby.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {connected
            ? `${filteredBlobs.length} ${filteredBlobs.length === 1 ? "blob" : "blobs"}${searchTerm ? ` (filtered from ${blobs.length})` : ""}`
            : "Connect wallet to view your albums"}
        </div>
      </div>

      {/* Search Filters */}
      {connected && (
        <SearchFilters onSearchChange={setSearchTerm} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {/* Create New Blob - 第一个位置 */}
        <div
          key="create-new"
          onClick={() => setIsUploadModalOpen(true)}
          className="group cursor-pointer flex flex-col"
        >
          <div className="relative aspect-[4/5] rounded-xl mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group shadow-sm">
            <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined !text-4xl">add</span>
            </div>
            <p className="font-bold text-gray-400 group-hover:text-primary">
              Create New Blob
            </p>
          </div>
          <h3 className="text-xl font-bold serif-title text-gray-300 dark:text-gray-700">
            Upload Memory
          </h3>
          <p className="text-sm text-gray-300 dark:text-gray-700 italic">
            Start your new collection
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">
              Loading your memories...
            </div>
          </div>
        )}

        {/* Display blobs */}
        {!isLoading &&
          filteredBlobs.map((blob: any, index: number) => {
            const fileName = extractFileName(blob);
            const details = blobDetails.get(fileName);
            const contentUrl = blobContents.get(fileName);

            return (
              <div
                key={fileName}
                className="group cursor-pointer"
                onClick={() => contentUrl && handlePreview(blob)}
              >
                <div
                  className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
                  style={{
                    border:
                      "12px solid " + borderColors[index % borderColors.length],
                  }}
                >
                  {contentUrl ? (
                    // 显示 blob 内容（图片或视频）
                    isVideoFile(fileName) ? (
                      <video
                        src={contentUrl}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={contentUrl}
                        alt={blob.blob_name}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : details ? (
                    // 如果有详细信息但内容还在加载
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center p-4">
                      {blob.isDeleted ? (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-6xl text-gray-400">
                            delete
                          </span>
                          <p className="text-sm text-gray-500 mt-2">Deleted</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <span className="material-symbols-outlined text-6xl text-primary">
                            check_circle
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {blob.isWritten ? "Stored" : "Pending"}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Chunks: {blob.encoding?.erasure_n || 16}</p>
                            <p>Size: {blob.size} bytes</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 加载中的占位符
                    <div className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 animate-pulse">
                        image
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase text-white">
                    {isVideoFile(fileName) ? "VIDEO" : "IMAGE"}
                  </div>
                  {blob.isWritten && (
                    <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase text-white">
                      ✓
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold serif-title group-hover:text-primary transition-colors truncate">
                  {extractTitle(fileName)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="italic">
                    {dayjs(Number(blob.creationMicros) / 1000).format(
                      "YYYY-MM-DD HH:mm:ss",
                    )}
                  </span>
                </p>
              </div>
            );
          })}

        {/* Empty state */}
        {!isLoading && connected && blobs.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">
              <span className="material-symbols-outlined text-6xl">
                photo_library
              </span>
            </div>
            <p className="text-gray-500">
              No memories yet. Upload your first blob!
            </p>
          </div>
        )}

        {/* No search results */}
        {!isLoading &&
          connected &&
          blobs.length > 0 &&
          filteredBlobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                <span className="material-symbols-outlined text-6xl">
                  search_off
                </span>
              </div>
              <p className="text-gray-500">
                No memories found matching "{searchTerm}"
              </p>
            </div>
          )}

        {/* Load More Trigger */}
        {connected && filteredBlobs.length > 0 && hasMore && (
          <div ref={loadMoreRef} className="col-span-full text-center py-8">
            {/* {isLoadingMore && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Loading more memories...
                </span>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Preview Modal */}
      {isPreviewOpen && previewBlob && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClosePreview}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined !text-4xl">close</span>
            </button>

            {/* Content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {(() => {
                const fileName = extractFileName(previewBlob);
                const contentUrl = blobContents.get(fileName);

                if (!contentUrl) {
                  return (
                    <div className="text-white text-center">
                      <span className="material-symbols-outlined text-6xl animate-pulse">
                        loading
                      </span>
                      <p className="mt-4">Loading...</p>
                    </div>
                  );
                }

                if (isVideoFile(fileName)) {
                  return (
                    <video
                      src={contentUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    />
                  );
                }

                return (
                  <img
                    src={contentUrl}
                    alt={fileName}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  />
                );
              })()}
            </div>

            {/* Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="text-white space-y-2">
                <h3 className="text-xl font-bold">
                  {extractTitle(extractFileName(previewBlob))}
                </h3>
                <p className="text-sm text-white/80">
                  {dayjs(Number(previewBlob.creationMicros) / 1000).format(
                    "YYYY-MM-DD HH:mm:ss",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
