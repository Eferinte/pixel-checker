import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { IMAGE_CONFIG } from '../config/imageConfig'
import { clamp, formatRgba, toHex } from '../utils/format'
import { useRafThrottle } from './useRafThrottle'
import type { LoadedImage } from './useImageLoader'

export type PixelInfo = {
  x: number
  y: number
  rgba: [number, number, number, number]
  hex: string
  rgbaText: string
}

type LensState = {
  visible: boolean
  x: number
  y: number
  pixel?: PixelInfo
}

type LensOptions = {
  image: LoadedImage | null
  imgRef: RefObject<HTMLImageElement>
  containerRef: RefObject<HTMLDivElement>
}

export const useImageLens = ({ image, imgRef, containerRef }: LensOptions) => {
  const lensCanvasRef = useRef<HTMLCanvasElement>(null)
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sourceCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const isReadyRef = useRef(false)
  const [state, setState] = useState<LensState>({ visible: false, x: 0, y: 0 })

  useEffect(() => {
    setState((prev) => ({ ...prev, visible: false }))
    isReadyRef.current = false
    sourceCanvasRef.current = null
    sourceCtxRef.current = null

    if (!image) return

    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, image.width, image.height)
      sourceCanvasRef.current = canvas
      sourceCtxRef.current = ctx
      isReadyRef.current = true
    }
    img.onerror = () => {
      isReadyRef.current = false
    }
    img.src = image.src
  }, [image])

  const drawLens = useCallback((imgX: number, imgY: number) => {
    const lensCanvas = lensCanvasRef.current
    const sourceCanvas = sourceCanvasRef.current
    if (!lensCanvas || !sourceCanvas) return

    const lensSize = IMAGE_CONFIG.LENS_SIZE
    const zoom = IMAGE_CONFIG.LENS_ZOOM
    const maxSourceSize = Math.min(sourceCanvas.width, sourceCanvas.height)
    const sourceSize = Math.max(2, Math.min(maxSourceSize, Math.round(lensSize / zoom)))
    const half = Math.floor(sourceSize / 2)
    const sx = clamp(imgX - half, 0, sourceCanvas.width - sourceSize)
    const sy = clamp(imgY - half, 0, sourceCanvas.height - sourceSize)

    const lensCtx = lensCanvas.getContext('2d')
    if (!lensCtx) return
    lensCtx.imageSmoothingEnabled = false
    lensCtx.clearRect(0, 0, lensSize, lensSize)
    lensCtx.drawImage(sourceCanvas, sx, sy, sourceSize, sourceSize, 0, 0, lensSize, lensSize)

    lensCtx.strokeStyle = 'rgba(15, 23, 42, 0.4)'
    lensCtx.lineWidth = 1
    lensCtx.strokeRect(0.5, 0.5, lensSize - 1, lensSize - 1)
    lensCtx.beginPath()
    lensCtx.moveTo(lensSize / 2, 0)
    lensCtx.lineTo(lensSize / 2, lensSize)
    lensCtx.moveTo(0, lensSize / 2)
    lensCtx.lineTo(lensSize, lensSize / 2)
    lensCtx.stroke()
  }, [])

  const update = useCallback(
    (clientX: number, clientY: number) => {
      if (!image || !imgRef.current || !containerRef.current || !isReadyRef.current) {
        return
      }

      const imgRect = imgRef.current.getBoundingClientRect()
      if (
        clientX < imgRect.left ||
        clientX > imgRect.right ||
        clientY < imgRect.top ||
        clientY > imgRect.bottom
      ) {
        setState((prev) => ({ ...prev, visible: false }))
        return
      }

      const relX = clientX - imgRect.left
      const relY = clientY - imgRect.top
      const scaleX = image.width / imgRect.width
      const scaleY = image.height / imgRect.height
      const imgX = clamp(Math.floor(relX * scaleX), 0, image.width - 1)
      const imgY = clamp(Math.floor(relY * scaleY), 0, image.height - 1)

      const sourceCtx = sourceCtxRef.current
      if (!sourceCtx) return
      const data = sourceCtx.getImageData(imgX, imgY, 1, 1).data
      const rgba: [number, number, number, number] = [data[0], data[1], data[2], data[3]]
      const pixel: PixelInfo = {
        x: imgX,
        y: imgY,
        rgba,
        hex: toHex(data[0], data[1], data[2]),
        rgbaText: formatRgba(data[0], data[1], data[2], data[3]),
      }

      drawLens(imgX, imgY)

      const containerRect = containerRef.current.getBoundingClientRect()
      const lensSize = IMAGE_CONFIG.LENS_SIZE
      const offset = IMAGE_CONFIG.LENS_OFFSET
      const infoHeight = IMAGE_CONFIG.LENS_INFO_HEIGHT

      let lensX = clientX - containerRect.left + offset
      let lensY = clientY - containerRect.top + offset
      const totalHeight = lensSize + infoHeight

      if (lensX + lensSize > containerRect.width) {
        lensX = clientX - containerRect.left - lensSize - offset
      }
      if (lensY + totalHeight > containerRect.height) {
        lensY = clientY - containerRect.top - totalHeight - offset
      }

      lensX = clamp(lensX, 0, Math.max(0, containerRect.width - lensSize))
      lensY = clamp(lensY, 0, Math.max(0, containerRect.height - totalHeight))

      setState({ visible: true, x: lensX, y: lensY, pixel })
    },
    [containerRef, drawLens, image, imgRef]
  )

  const throttledUpdate = useRafThrottle(update)

  const onPointerMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      throttledUpdate(event.clientX, event.clientY)
    },
    [throttledUpdate]
  )

  const onPointerLeave = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }))
  }, [])

  return {
    lensCanvasRef,
    state,
    onPointerMove,
    onPointerLeave,
  }
}
