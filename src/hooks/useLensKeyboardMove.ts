import { useEffect, useRef } from 'react'
import { IMAGE_CONFIG } from '../config/imageConfig'

type MoveFn = (dx: number, dy: number) => void

const KEY_MAP: Record<string, { dx: number; dy: number }> = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 },
}

const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key)

export const useLensKeyboardMove = (enabled: boolean, moveBy: MoveFn) => {
  const enabledRef = useRef(enabled)
  const moveByRef = useRef(moveBy)
  const pressedRef = useRef<Set<string>>(new Set())
  const delayRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    enabledRef.current = enabled
    if (!enabled) {
      pressedRef.current.clear()
      if (delayRef.current !== null) {
        window.clearTimeout(delayRef.current)
        delayRef.current = null
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled])

  useEffect(() => {
    moveByRef.current = moveBy
  }, [moveBy])

  useEffect(() => {
    const applyMove = () => {
      let dx = 0
      let dy = 0
      pressedRef.current.forEach((key) => {
        const delta = KEY_MAP[key]
        if (!delta) return
        dx += delta.dx
        dy += delta.dy
      })
      const stepX = Math.sign(dx)
      const stepY = Math.sign(dy)
      if (stepX === 0 && stepY === 0) return
      const step = IMAGE_CONFIG.KEY_MOVE_STEP
      moveByRef.current(stepX * step, stepY * step)
    }

    const startRepeat = () => {
      if (delayRef.current !== null || intervalRef.current !== null) return
      delayRef.current = window.setTimeout(() => {
        delayRef.current = null
        applyMove()
        intervalRef.current = window.setInterval(
          applyMove,
          IMAGE_CONFIG.KEY_REPEAT_INTERVAL_MS
        )
      }, IMAGE_CONFIG.KEY_REPEAT_DELAY_MS)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const key = normalizeKey(event.key)
      if (!KEY_MAP[key]) return
      event.preventDefault()
      if (event.repeat) return
      if (!pressedRef.current.has(key)) {
        pressedRef.current.add(key)
        applyMove()
        startRepeat()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key)
      if (!KEY_MAP[key]) return
      if (pressedRef.current.has(key)) {
        pressedRef.current.delete(key)
      }
      if (pressedRef.current.size === 0) {
        if (delayRef.current !== null) {
          window.clearTimeout(delayRef.current)
          delayRef.current = null
        }
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (delayRef.current !== null) {
        window.clearTimeout(delayRef.current)
        delayRef.current = null
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])
}
