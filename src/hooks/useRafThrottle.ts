import { useCallback, useEffect, useRef } from 'react'

export const useRafThrottle = <T extends (...args: unknown[]) => void>(callback: T) => {
  const callbackRef = useRef(callback)
  const frameRef = useRef<number | null>(null)
  const lastArgs = useRef<unknown[] | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(
    () => () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    },
    []
  )

  return useCallback(
    (...args: unknown[]) => {
      lastArgs.current = args
      if (frameRef.current !== null) return
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        if (lastArgs.current) {
          callbackRef.current(...lastArgs.current)
        }
      })
    },
    []
  ) as T
}
