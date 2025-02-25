'use client'

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

	return (
		<div className={`border rounded-md p-5 bg-white shadow-sm ${className}`}>
			<div className="flex items-center justify-between mb-5">
				<h3 className="text-lg font-medium">{title}</h3>
				<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
					{filteredColors.length} colors
				</span>
			</div>

			{sortedColors.length > 0 ? (
				<div
					className="grid grid-cols-1 gap-5 overflow-y-auto"
					style={{ maxHeight: 'min(70vh, 800px)' }}
				>
					{sortedColors.map((color) => (
						<ColorCard
							key={color.original}
							color={color}
							onVariableChange={onVariableChange}
							onColorChange={onColorChange}
						/>
					))}
				</div>
			) : (
				<div className="p-8 text-center border border-dashed rounded-md bg-gray-50">
					<p className="text-gray-500">No colors found</p>
				</div>
			)}
		</div>
	)
}
