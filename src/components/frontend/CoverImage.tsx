"use client"
import { useState } from "react"
import Image from "next/image"

type CoverImageProps = {
  src?: string | null
  alt: string
  fallbackIcon?: string
}

export function CoverImage({ src, alt, fallbackIcon = "ri-image-line" }: CoverImageProps) {
  const trimmed = src?.trim()
  if (trimmed) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
      <i className={`${fallbackIcon} text-3xl`} />
    </div>
  )
}

export function CoverImageUpload({ value, onChange, aspectRatio = "3/4" }: any) {
  const [urlInput, setUrlInput] = useState("")

  // 1. 如果有图，显示预览
  if (value && value.startsWith('http')) {
    return (
      <div className="w-full relative rounded-xl overflow-hidden border border-neutral-200" style={{ aspectRatio }}>
        <img src={value} className="w-full h-full object-cover" alt="Preview" />
        <button 
          type="button"
          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold opacity-0 hover:opacity-100 transition-opacity"
          onClick={() => { onChange(""); setUrlInput(""); }}
        >
          移除并重填链接
        </button>
      </div>
    )
  }

  // 2. 只有输入框，彻底删除任何与 file 相关的逻辑
  return (
    <div 
      className="w-full p-6 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col gap-4"
      onClick={(e) => e.stopPropagation()} // 核心：防止点击事件向上冒泡触发隐藏的弹窗
    >
      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-neutral-600">在此粘贴 Pinata 图片链接</p>
        <input 
          className="w-full p-3 rounded-lg border-2 border-neutral-200 bg-white text-sm text-black outline-none focus:border-black"
          placeholder="https://gateway.pinata.cloud/ipfs/..."
          value={urlInput}
          autoFocus
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button 
          type="button"
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold hover:bg-neutral-800 transition"
          onClick={() => { if(urlInput.includes('http')) onChange(urlInput) }}
        >
          确 认 使 用
        </button>
      </div>
      <p className="text-[10px] text-neutral-400 text-center leading-tight uppercase tracking-wider">
        Vercel 专用：外部链接模式已启用
      </p>
    </div>
  )
}
