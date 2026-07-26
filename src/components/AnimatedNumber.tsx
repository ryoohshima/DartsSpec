import { useEffect } from 'react'
import { animate, m, useMotionValue, useTransform } from 'framer-motion'

/**
 * 数値のカウントアップ / ダウン表示（docs/03 §4.3）。
 * tabular figures 前提でガタつかずに補間される。
 */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(value)
  const text = useTransform(motionValue, (v) => v.toFixed(1))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, motionValue])

  return <m.span className={className}>{text}</m.span>
}
