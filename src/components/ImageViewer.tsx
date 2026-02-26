import { useRef } from 'react'
import { IMAGE_CONFIG } from '../config/imageConfig'
import type { LoadedImage } from '../hooks/useImageLoader'
import { useImageLens } from '../hooks/useImageLens'

type ImageViewerProps = {
  image: LoadedImage
  onClear: () => void
}

export const ImageViewer = ({ image, onClear }: ImageViewerProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { lensCanvasRef, state, onPointerMove, onPointerLeave } = useImageLens({
    image,
    imgRef,
    containerRef,
  })

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">图片预览</h2>
          <p className="text-sm text-slate-500">移动鼠标查看放大镜与像素信息</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          清空图片
        </button>
      </div>

      <div
        ref={containerRef}
        className="checkerboard-surface relative mt-5 flex w-full justify-center overflow-hidden rounded-xl border border-slate-200 p-4"
      >
        <img
          ref={imgRef}
          src={image.src}
          alt={image.fileName}
          className="max-h-[70vh] max-w-full select-none"
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerLeave}
          draggable={false}
        />

        {state.visible && state.pixel && (
          <div
            className="pointer-events-none absolute flex w-[200px] flex-col gap-2"
            style={{ left: state.x, top: state.y }}
          >
            <canvas
              ref={lensCanvasRef}
              width={IMAGE_CONFIG.LENS_SIZE}
              height={IMAGE_CONFIG.LENS_SIZE}
              className="checkerboard-surface lens-surface rounded-lg border border-slate-900/10 shadow-glow"
            />
            <div className="rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-xs text-slate-700 shadow">
              <div className="flex items-center justify-between">
                <span>坐标</span>
                <span className="font-semibold text-slate-900">
                  {state.pixel.x}, {state.pixel.y}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>RGBA</span>
                <span className="font-semibold text-slate-900">{state.pixel.rgbaText}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>HEX</span>
                <span className="font-semibold text-slate-900">{state.pixel.hex}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
