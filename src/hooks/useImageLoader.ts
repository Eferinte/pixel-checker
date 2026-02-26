import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCEPTED_TYPES, IMAGE_CONFIG } from '../config/imageConfig'
import { canvasToBlob, fitWithin, loadImageElement } from '../utils/image'
import { formatBytes, formatTypes } from '../utils/format'

export type LoadedImage = {
  src: string
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  fileName: string
  fileType: string
  originalSize: number
  displaySize: number
  scaled: boolean
}

export const useImageLoader = () => {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const activeUrlRef = useRef<string | null>(null)

  const revokeActiveUrl = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current)
      activeUrlRef.current = null
    }
  }, [])

  const clear = useCallback(() => {
    revokeActiveUrl()
    setImage(null)
    setError(null)
  }, [revokeActiveUrl])

  useEffect(() => () => revokeActiveUrl(), [revokeActiveUrl])

  const loadFile = useCallback(
    async (file: File) => {
      setError(null)
      setLoading(true)
      try {
        if (!IMAGE_CONFIG.SUPPORTED_TYPES.includes(file.type)) {
          throw new Error(`不支持的格式，请上传 ${formatTypes(IMAGE_CONFIG.SUPPORTED_TYPES)} 文件。`)
        }
        if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
          throw new Error(
            `文件过大，最大支持 ${formatBytes(IMAGE_CONFIG.MAX_FILE_SIZE_BYTES)}。`
          )
        }

        const originalUrl = URL.createObjectURL(file)
        const img = await loadImageElement(originalUrl)
        const { width, height, scaled } = fitWithin(
          img.naturalWidth,
          img.naturalHeight,
          IMAGE_CONFIG.MAX_IMAGE_DIMENSION
        )

        let displayUrl = originalUrl
        let displaySize = file.size

        if (scaled) {
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (!ctx) throw new Error('无法创建画布上下文')
          ctx.drawImage(img, 0, 0, width, height)

          const outputType = file.type === 'image/jpeg' || file.type === 'image/webp' ? file.type : 'image/png'
          const blob = await canvasToBlob(canvas, outputType, 0.92)
          displayUrl = URL.createObjectURL(blob)
          displaySize = blob.size
          URL.revokeObjectURL(originalUrl)
        }

        revokeActiveUrl()
        activeUrlRef.current = displayUrl

        setImage({
          src: displayUrl,
          width,
          height,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          fileName: file.name,
          fileType: file.type,
          originalSize: file.size,
          displaySize,
          scaled,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : '图片处理失败'
        setError(message)
        setImage(null)
        revokeActiveUrl()
      } finally {
        setLoading(false)
      }
    },
    [revokeActiveUrl]
  )

  return {
    image,
    error,
    loading,
    loadFile,
    clear,
    accept: ACCEPTED_TYPES,
  }
}
