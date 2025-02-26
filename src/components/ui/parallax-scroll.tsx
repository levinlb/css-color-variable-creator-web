import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface ParallaxScrollProps {
	children: React.ReactNode
	baseVelocity?: number
	className?: string
}

export function ParallaxScroll({ children, baseVelocity = 0.2, className }: ParallaxScrollProps) {
	const ref = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start end', 'end start'],
	})

	const y = useTransform(scrollYProgress, [0, 1], ['0%', `${baseVelocity * 100}%`])

	return (
		<motion.div ref={ref} style={{ y }} className={className}>
			{children}
		</motion.div>
	)
}
