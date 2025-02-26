'use client'

import { hexToRgba, rgbaToHex } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, Edit2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useDebouncedCallback } from 'use-debounce'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'

type ColorCardProps = {
	color: {
		original: string
		variable: string
		isExisting: boolean
		value: string
		occurrences: number
	}
	onVariableChange: (original: string, newVariable: string) => void
	onColorChange: (original: string, newValue: string) => void
}

export default function ColorCard({ color, onVariableChange, onColorChange }: ColorCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [tempVariable, setTempVariable] = useState(color.variable)
	const [showPicker, setShowPicker] = useState(false)
	const [localColor, setLocalColor] = useState(color.value)
	const pickerRef = useRef<HTMLDivElement>(null)

	// Convert RGBA to HEX for the color picker
	const currentPickerValue = useMemo(() => {
		return localColor.startsWith('rgba') ? rgbaToHex(localColor) : localColor
	}, [localColor])

	// Update local color when prop changes
	useEffect(() => {
		setLocalColor(color.value)
	}, [color.value])

	const handleColorChange = (newColor: string) => {
		let previewColor = newColor
		if (color.value.startsWith('rgba')) {
			const alpha = color.value.match(/rgba\([^)]+,\s*([^)]+)\)/)?.[1] || '1'
			previewColor = hexToRgba(newColor, parseFloat(alpha))
		}
		setLocalColor(previewColor)
		debouncedUpdateColor(previewColor)
	}

	const debouncedUpdateColor = useDebouncedCallback((finalColor: string) => {
		onColorChange(color.original, finalColor)
	}, 300)

	const getColorFormat = () => {
		if (color.value.startsWith('#')) {
			return color.value.length <= 5 ? 'HEX-3' : 'HEX-6'
		} else if (color.value.startsWith('rgba')) {
			return 'RGBA'
		} else if (color.value.startsWith('rgb')) {
			return 'RGB'
		} else if (color.value.startsWith('hsl')) {
			return 'HSL'
		} else {
			return 'OTHER'
		}
	}

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setShowPicker(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Reset temp variable when color variable changes
	useEffect(() => {
		setTempVariable(color.variable)
	}, [color.variable])

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = () => {
		const formattedVariable = tempVariable.startsWith('--') ? tempVariable : `--${tempVariable}`
		onVariableChange(color.original, formattedVariable)
		setIsEditing(false)
	}

	const handleColorClick = () => {
		setShowPicker((prev) => !prev)
	}

	return (
		<div className="p-4 border rounded-xl backdrop-blur-sm bg-white/60 hover:bg-white/80 transition-colors">
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-shrink-0">
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="w-16 h-16 rounded-lg border shadow-sm cursor-pointer relative overflow-hidden"
						style={{ backgroundColor: localColor }}
						onClick={handleColorClick}
					>
						<Badge variant="secondary" className="absolute -top-1 -right-1 shadow-sm">
							{getColorFormat()}
						</Badge>
					</motion.div>
				</div>

				{/* Variable name and value */}
				<div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
					<div>
						{isEditing ? (
							<div className="flex gap-2">
								<Input
									type="text"
									value={tempVariable}
									onChange={(e) => setTempVariable(e.target.value)}
									onBlur={handleSave}
									onKeyDown={(e) => e.key === 'Enter' && handleSave()}
									autoFocus
									className="font-mono"
								/>
								<Button size="icon" onClick={handleSave} variant="outline">
									<Check className="h-4 w-4" />
								</Button>
								<Button size="icon" onClick={() => setIsEditing(false)} variant="outline">
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="flex items-center justify-between gap-2">
								<code className="px-2 py-1.5 bg-background rounded-md font-mono text-sm truncate flex-1">
									{color.variable}
								</code>
								<Button size="icon" variant="ghost" onClick={handleEdit} className="flex-shrink-0">
									<Edit2 className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<code className="px-2 py-1.5 bg-background/50 rounded-md font-mono text-sm text-muted-foreground truncate">
							{localColor}
						</code>
						<Badge variant="secondary" className="sm:flex-shrink-0">
							{color.occurrences} {color.occurrences === 1 ? 'use' : 'uses'}
						</Badge>
					</div>
				</div>
			</div>

			{/* Color picker */}
			{showPicker && (
				<motion.div
					key={color.original}
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="relative mt-4 pt-4 border-t"
				>
					<div className="absolute right-0 top-2">
						<Button variant="outline" size="sm" onClick={() => setShowPicker(false)}>
							Close
						</Button>
					</div>

					<div ref={pickerRef} className="mt-2">
						<HexColorPicker
							color={currentPickerValue}
							onChange={handleColorChange}
							className="mb-3 mx-auto"
						/>

						<div className="flex justify-between items-center mt-3">
							<div className="text-sm font-medium">Preview:</div>
							<code className="text-sm font-mono">{currentPickerValue}</code>
						</div>

						<div
							className="w-full h-8 rounded-lg mt-1 border shadow-sm"
							style={{ backgroundColor: localColor }}
						/>
					</div>
				</motion.div>
			)}
		</div>
	)
}
