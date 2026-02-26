import { DropZone } from './components/DropZone'
import { ImageInfo } from './components/ImageInfo'
import { ImageViewer } from './components/ImageViewer'
import { useImageLoader } from './hooks/useImageLoader'

const App = () => {
  const { image, error, loading, loadFile, clear, accept } = useImageLoader()

  return (
    <div className="checkerboard min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Pixel Checker</p>
            <h1 className="text-3xl font-semibold text-slate-900">图片像素放大与采样</h1>
          </div>
          <p className="max-w-3xl text-base text-slate-600">
            支持拖拽或点击上传图片，自动读取文件信息并在悬停时放大显示像素切片。可用于颜色取样、检查边缘
            细节或快速核对素材质量。
          </p>
        </header>

        <DropZone onFileSelected={loadFile} accept={accept} disabled={loading} />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {image ? (
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <ImageViewer image={image} onClear={clear} />
            <div className="flex flex-col gap-6">
              <ImageInfo image={image} />
              <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">使用提示</p>
                <div className="mt-3 flex flex-col gap-2">
                  <span>- 鼠标悬停在图片上可查看放大镜和像素 RGBA 信息。</span>
                  <span>- 大尺寸图片会自动缩放到性能友好的尺寸。</span>
                  <span>- 清空图片后可重新上传新的素材进行对比。</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
            暂未加载图片。上传后将显示预览、像素放大镜与详细信息。
          </div>
        )}
      </div>
    </div>
  )
}

export default App
