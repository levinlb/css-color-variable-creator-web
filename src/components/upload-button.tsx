'use client'

import { CssProcessingResult, processCssFile } from '@/lib/actions'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'

export default function UploadButton({
	onResult,
}: {
	onResult: (result: CssProcessingResult) => void
}) {
	const [isDragging, setIsDragging] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelection = async (file: File) => {
		try {
			setIsUploading(true)
			setError(null)

			console.log(`Processing file: ${file.name}`)

			const formData = new FormData()
			formData.append('file', file)

			const result = await processCssFile(formData)
			console.log('Result received:', result)

			if (result.success) {
				onResult(result)
			} else if (result.error) {
				setError(result.error)
			}
		} catch (error) {
			console.error('Error uploading file:', error)
			setError('An unexpected error occurred')
		} finally {
			setIsUploading(false)
		}
	}

	const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (files && files.length > 0) {
			handleFileSelection(files[0])
		}
	}

	const handleButtonClick = () => {
		console.log('Button clicked')
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)

		const files = e.dataTransfer.files
		if (files && files.length > 0) {
			const file = files[0]
			if (file.type === 'text/css' || file.name.endsWith('.css') || file.name.endsWith('.scss')) {
				handleFileSelection(file)
			} else {
				setError('Please upload a CSS or SCSS file')
			}
		}
	}

	return (
		<div className="w-full">
			<div
				className={`absolute inset-0 w-full h-full ${
					isDragging ? 'bg-gray-50 opacity-50' : 'opacity-0'
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			/>

			<div className="flex flex-col items-center mt-4">
				<button
					type="button"
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 cursor-pointer flex items-center gap-2"
					onClick={handleButtonClick}
					disabled={isUploading}
					aria-label="Select CSS file"
				>
					<Upload size={16} />
					{isUploading ? 'Processing...' : 'Select File'}
				</button>

				<input
					type="file"
					accept=".css,.scss"
					className="hidden"
					ref={fileInputRef}
					onChange={handleFileInputChange}
					aria-hidden="true"
				/>

				{error && (
					<p className="text-red-500 text-sm mt-2" role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	)
}
