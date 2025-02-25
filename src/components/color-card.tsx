'use client'

import { hexToRgba, rgbaToHex } from '@/lib/utils'
import { Edit2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
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
	const [pickerValue, setPickerValue] = useState(() => {
		return color.value.startsWith('rgba') ? rgbaToHex(color.value) : color.value
	})
	const pickerRef = useRef<HTMLDivElement>(null)

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

	const handleColorChange = (newColor: string) => {
		setPickerValue(newColor)

		let finalColor = newColor
		if (color.value.startsWith('rgba')) {
			const alpha = color.value.match(/rgba\([^)]+,\s*([^)]+)\)/)?.[1] || '1'
			finalColor = hexToRgba(newColor, parseFloat(alpha))
		}

		onColorChange(color.original, finalColor)
	}

	return (
		<div className="p-4 border rounded-md bg-white hover:bg-gray-50 shadow-sm">
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-shrink-0">
					<div
						className="w-16 h-16 rounded-md border border-gray-200 cursor-pointer relative shadow-sm"
						style={{ backgroundColor: color.value }}
						onClick={handleColorClick}
					>
						<span className="absolute -top-2 -right-2 bg-white text-xs px-2 py-0.5 rounded-full border shadow-sm">
							{getColorFormat()}
						</span>
					</div>
				</div>

				{/* Variable name and value */}
				<div className="flex-1 min-w-0 flex flex-col justify-center">
					<div className="mb-2">
						{isEditing ? (
							<div className="flex">
								<Input
									type="text"
									value={tempVariable}
									onChange={(e) => setTempVariable(e.target.value)}
									onBlur={handleSave}
									onKeyDown={(e) => e.key === 'Enter' && handleSave()}
									autoFocus
								/>
								<Button onClick={handleSave} className=" text-white px-3 rounded-sm">
									Save
								</Button>
							</div>
						) : (
							<div className="flex items-center justify-between">
								<code className="text-sm font-mono px-2 py-1 bg-gray-100 rounded truncate max-w-[220px] mr-2">
									{color.variable}
								</code>
								<button
									onClick={handleEdit}
									className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
								>
									<Edit2 className="w-4 h-4" />
								</button>
							</div>
						)}
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 gap-1">
						<span className="truncate max-w-[280px] font-mono px-2 py-1 bg-gray-50 rounded">
							{color.value}
						</span>
						<span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600 text-xs">
							{color.occurrences} {color.occurrences === 1 ? 'use' : 'uses'}
						</span>
					</div>
				</div>
			</div>

			{/* Color picker */}
			{showPicker && (
				<div className="relative mt-4 pt-4 border-t">
					<div className="absolute right-0 top-2">
						<button
							onClick={() => setShowPicker(false)}
							className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
						>
							Close
						</button>
					</div>

					<div ref={pickerRef} className="mt-2">
						<HexColorPicker
							color={pickerValue}
							onChange={handleColorChange}
							className="mb-3 mx-auto"
						/>

						<div className="flex justify-between items-center mt-3">
							<div className="text-sm font-medium">Preview:</div>
							<div className="text-sm font-mono">{pickerValue}</div>
						</div>

						<div
							className="w-full h-8 rounded mt-1 border"
							style={{ backgroundColor: pickerValue }}
						></div>
					</div>
				</div>
			)}
		</div>
	)
}
