"use client"

import { useState, useRef, useCallback } from "react"
import type { MediaEntityType } from "@/lib/media-storage"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export interface CoverImageUploadProps {
  value: string
  onChange: (url: string) => void
  entityType: MediaEntityType
  entityId: string
  aspectRatio?: string
  recommendText?: string
}

export function CoverImageUpload({
  value,
  onChange,
  entityType,
  entityId,
  aspectRatio = "3/4",
  recommendText = "建议按当前比例上传，如 1200x1600",
}: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  // 新增：切换“上传模式”还是“链接模式”
  const [mode, setMode] = useState<"upload" | "url">("upload")
  const [urlInput, setUrlInput] = useState("")
  
  const inputRef = useRef<HTMLInputElement>(null)

  const applyExternalUrl = useCallback(() => {
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setError("请输入外部图片链接")
      return
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("请输入以 http:// 或 https:// 开头的图片链接")
      return
    }
    setError("")
    onChange(trimmed)
  }, [onChange, urlInput])

  const upload = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("仅支持 JPG、PNG、WebP、GIF 格式")
        return
      }
      if (file.size > MAX_SIZE) {
        setError("文件大小不能超过 5 MB")
        return
      }
      setError("")
      setUploading(true)
      try {
        const formData = new FormData()
        formData.set("file", file)
        formData.set("entityType", entityType)
        formData.set("entityId", entityId)
        const res = await fetch("/api/media", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error || "上传失败 (Vercel 环境建议使用链接模式)")
          return
        }
        if (data?.url) {
          onChange(data.url)
        }
      } catch {
        setError("网络错误，请重试")
      } finally {
        setUploading(false)
      }
    },
    [entityType, entityId, onChange],
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ""
  }

  const hintText = `${recommendText} · 支持 JPG/PNG/WebP/GIF · 最大 5MB`

  // 预览模式
  if (value) {
    return (
      <div className="space-y-2 w-full">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30 group"
          style={{ aspectRatio }}
        >
          <img src={value} alt="封面图预览" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-gray-800 hover:bg-white"
              onClick={() => { onChange(""); setMode("url"); }}
            >
              <i className="ri-link-m mr-1" />
              换链接
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-red-600 hover:bg-white"
              onClick={() => onChange("")}
            >
              <i className="ri-delete-bin-line mr-1" />
              移除
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 编辑模式（无图时）
  return (
    <div className="space-y-3 w-full">
      <div
        className={`
          relative w-full overflow-hidden rounded-xl border-2 border-dashed
          ${uploading ? "border-muted-foreground/30 bg-muted/20" : "border-border hover:border-muted-foreground/40 hover:bg-muted/10"}
          transition-all flex flex-col items-center justify-center gap-4 px-6 py-10
        `}
        style={{ aspectRatio }}
        onClick={() => {
          if (!uploading && mode === "upload") {
            inputRef.current?.click()
          }
        }}
      >
        {mode === "upload" ? (
          // 上传模式 UI
          <>
            {uploading ? (
              <>
                <i className="ri-loader-4-line text-2xl text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">正在上传到服务器...</span>
              </>
            ) : (
              <>
                <i className="ri-image-add-line text-3xl text-muted-foreground/40" />
                <div className="text-center space-y-1 w-full max-w-md">
                  <p className="text-sm text-muted-foreground">点击或拖拽图片上传</p>
                  <p className="text-xs text-primary">或者：使用外部图片链接 (推荐)</p>
                  <div
                    className="mt-2 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="请输入外部图片链接"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="shrink-0 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                      onClick={applyExternalUrl}
                    >
                      使用链接
                    </button>
                  </div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </>
        ) : (
          // 链接模式 UI
          <div className="w-full space-y-4 px-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-primary font-medium">
              <i className="ri-link-m text-lg" />
              <span className="text-sm">粘贴图片 URL</span>
            </div>
            <input
              autoFocus
              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://gateway.pinata.cloud/ipfs/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90"
                onClick={applyExternalUrl}
              >
                确认使用
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                onClick={() => setMode("upload")}
              >
                返回
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-wider">{hintText}</p>
      {error && <p className="text-xs text-destructive text-center font-medium">⚠️ {error}</p>}
    </div>
  )
}
