export const fitWithin = (width: number, height: number, maxDimension: number) => {
  const maxSide = Math.max(width, height)
  if (maxSide <= maxDimension) {
    return { width, height, scale: 1, scaled: false }
  }
  const scale = maxDimension / maxSide
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    scale,
    scaled: true,
  }
}

export const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality = 0.92) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('图片压缩失败'))
        }
      },
      type,
      quality
    )
  })
