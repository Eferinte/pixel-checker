export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export const formatTypes = (types: string[]) =>
  types
    .map((type) => {
      if (type.includes('jpeg')) return 'JPG'
      if (type.includes('png')) return 'PNG'
      if (type.includes('webp')) return 'WEBP'
      if (type.includes('gif')) return 'GIF'
      return type.split('/')[1]?.toUpperCase() ?? type
    })
    .join(' / ')

export const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`

export const formatRgba = (r: number, g: number, b: number, a: number) => {
  const alpha = Math.round((a / 255) * 100) / 100
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
