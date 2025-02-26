import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AnimatedTextProps {
	text: string
	className?: string
	delay?: number
}

export function AnimatedText({ text, className, delay = 0 }: AnimatedTextProps) {
	const words = text.split(' ')

	const container = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.12, delayChildren: delay * 0.1 },
		},
	}

	const child = {
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				damping: 12,
				stiffness: 100,
			},
		},
		hidden: {
			opacity: 0,
			y: 20,
			transition: {
				type: 'spring',
				damping: 12,
				stiffness: 100,
			},
		},
	}

	return (
		<motion.div
			style={{ overflow: 'hidden' }}
			variants={container}
			initial="hidden"
			animate="visible"
			className={cn('inline-flex flex-wrap', className)}
		>
			{words.map((word, index) => (
				<motion.span variants={child} key={index} className="mr-1">
					{word}
				</motion.span>
			))}
		</motion.div>
	)
}
