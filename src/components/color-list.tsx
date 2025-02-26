'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import ColorCard from './color-card'

type ColorListProps = {
	title: string
	colors: {
		original: string
		variable: string
		isExisting: boolean
		value: string
		occurrences: number
	}[]
	onVariableChange: (original: string, newVariable: string) => void
	onColorChange: (original: string, newValue: string) => void
	className?: string
}

export default function ColorList({
	title,
	colors,
	onVariableChange,
	onColorChange,
	className = '',
}: ColorListProps) {
	const filteredColors = colors.filter((color) => color.original)
	const sortedColors = [...filteredColors].sort((a, b) => b.occurrences - a.occurrences)

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	}

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	}

	return (
		<div className={`border rounded-xl p-5 backdrop-blur-sm bg-white/60 ${className}`}>
			<div className="flex items-center justify-between mb-5">
				<h3 className="text-lg font-medium">{title}</h3>
				<Badge variant="secondary">
					{filteredColors.length} color{filteredColors.length !== 1 ? 's' : ''}
				</Badge>
			</div>

			{sortedColors.length > 0 ? (
				<motion.div
					variants={container}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 gap-4 overflow-y-auto"
					style={{ maxHeight: 'min(70vh, 800px)' }}
				>
					{sortedColors.map((color) => (
						<motion.div key={color.original} variants={item}>
							<ColorCard
								color={color}
								onVariableChange={onVariableChange}
								onColorChange={onColorChange}
							/>
						</motion.div>
					))}
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="p-8 text-center border border-dashed rounded-lg bg-background/50"
				>
					<p className="text-muted-foreground">No colors found</p>
				</motion.div>
			)}
		</div>
	)
}
