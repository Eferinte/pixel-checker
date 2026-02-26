import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { IMAGE_CONFIG } from '../config/imageConfig'
import { formatBytes, formatTypes } from '../utils/format'

type DropZoneProps = {
  onFileSelected: (file: File) => void
  accept: string
  disabled?: boolean
}

export const DropZone = ({ onFileSelected, accept, disabled }: DropZoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) {
        onFileSelected(file)
      }
    },
    [onFileSelected]
  )

  const openFileDialog = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (disabled) return
      setIsDragging(false)
      handleFiles(event.dataTransfer.files)
    },
    [disabled, handleFiles]
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div
      className={
        `rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ` +
        `${isDragging ? 'border-slate-900 bg-white/80 shadow-glow' : 'border-slate-300 bg-white/60'} ` +
        `${disabled ? 'opacity-60' : 'cursor-pointer hover:border-slate-900'}`
      }
      onClick={openFileDialog}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFileDialog()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(event) => {
          handleFiles(event.target.files)
          event.currentTarget.value = ''
        }}
        disabled={disabled}
      />
      <div className="mx-auto flex max-w-lg flex-col gap-3">
        <p className="text-lg font-semibold text-slate-900">拖拽图片到此处，或点击上传</p>
        <p className="text-sm text-slate-600">
          支持 {formatTypes(IMAGE_CONFIG.SUPPORTED_TYPES)}，最大文件 {formatBytes(
            IMAGE_CONFIG.MAX_FILE_SIZE_BYTES
          )}，最长边不超过 {IMAGE_CONFIG.MAX_IMAGE_DIMENSION}px。
        </p>
        <button
          type="button"
          className="mx-auto inline-flex items-center justify-center rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
          disabled={disabled}
        >
          选择图片
        </button>
      </div>
    </div>
  )
}
