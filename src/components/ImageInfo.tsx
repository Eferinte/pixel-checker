import { formatBytes } from '../utils/format'
import type { LoadedImage } from '../hooks/useImageLoader'

type ImageInfoProps = {
  image: LoadedImage
}

export const ImageInfo = ({ image }: ImageInfoProps) => {
  const pixelCount = image.width * image.height

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">图片信息</h2>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>文件名</span>
          <span className="font-medium text-slate-900">{image.fileName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>格式</span>
          <span className="font-medium text-slate-900">{image.fileType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>原始尺寸</span>
          <span className="font-medium text-slate-900">
            {image.originalWidth} × {image.originalHeight}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>显示尺寸</span>
          <span className="font-medium text-slate-900">
            {image.width} × {image.height}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>像素总数</span>
          <span className="font-medium text-slate-900">{pixelCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>原始大小</span>
          <span className="font-medium text-slate-900">{formatBytes(image.originalSize)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>当前大小</span>
          <span className="font-medium text-slate-900">{formatBytes(image.displaySize)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>是否缩放</span>
          <span className="font-medium text-slate-900">{image.scaled ? '是' : '否'}</span>
        </div>
      </div>
    </div>
  )
}
