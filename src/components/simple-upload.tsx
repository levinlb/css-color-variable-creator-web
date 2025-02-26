'use client'

import { processCssFiles } from '@/lib/actions'
import { ColorInfo, ProcessedFile } from '@/lib/types'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import ColorList from './color-list'
import CssPreview from './css-preview'

type FileFilter = {
	id: string
	isVisible: boolean
}

export default function SimpleUpload() {
	const [processing, setProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
	const [fileFilters, setFileFilters] = useState<FileFilter[]>([])
	const [combinedVariablesCss, setCombinedVariablesCss] = useState<string>('')
	const [copiedVariables, setCopiedVariables] = useState(false)
	const [copiedModified, setCopiedModified] = useState(false)
	const [isFullscreen] = useState(true)
	const [layoutMode, setLayoutMode] = useState<'default' | 'colorsExpanded' | 'codeExpanded'>(
		'default'
	)

	const toggleLayoutMode = (mode: 'default' | 'colorsExpanded' | 'codeExpanded') => {
		if (layoutMode === mode) {
			setLayoutMode('default')
		} else {
			setLayoutMode(mode)
		}
	}

	const toggleFileVisibility = (fileId: string) => {
		setFileFilters((prev) =>
			prev.map((filter) =>
				filter.id === fileId ? { ...filter, isVisible: !filter.isVisible } : filter
			)
		)
	}

	const getVisibleFiles = () => {
		return processedFiles.filter(
			(file) => fileFilters.find((filter) => filter.id === file.id)?.isVisible ?? true
		)
	}

	const getCombinedColors = () => {
		const visibleFiles = getVisibleFiles()
		const combinedColors: Record<string, ColorInfo> = {}

		visibleFiles.forEach((file) => {
			Object.entries(file.colors).forEach(([key, color]) => {
				if (combinedColors[key]) {
					combinedColors[key].occurrences += color.occurrences
				} else {
					combinedColors[key] = { ...color }
				}
			})
		})

		return combinedColors
	}

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return

		setProcessing(true)
		setError(null)
		setCopiedVariables(false)
		setCopiedModified(false)

		try {
			const result = await processCssFiles(acceptedFiles)
			console.log('Process result:', result)

			if (result.error) {
				setError(result.error)
				return
			}

			setProcessedFiles(result.files)
			setCombinedVariablesCss(result.combinedVariablesCss || '')
			setFileFilters(result.files.map((file) => ({ id: file.id, isVisible: true })))
		} catch (err) {
			console.error('Error processing files:', err)
			setError('An error occurred while processing the files.')
		} finally {
			setProcessing(false)
		}
	}, [])

	const resetState = () => {
		setProcessing(false)
		setError(null)
		setProcessedFiles([])
		setFileFilters([])
		setCombinedVariablesCss('')
		setCopiedVariables(false)
		setCopiedModified(false)
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'text/css': ['.css'],
			'text/scss': ['.scss'],
			'text/x-scss': ['.scss'],
			'text/sass': ['.sass'],
			'text/x-sass': ['.sass'],
			'text/less': ['.less'],
			'text/x-less': ['.less'],
			'text/plain': ['.css', '.scss', '.sass', '.less', '.styl'],
		},
		multiple: true,
	})

	return (
		<div
			className={`transition-all duration-300 ease-in-out ${
				isFullscreen ? 'fixed inset-0 z-50 bg-white p-5' : 'relative'
			}`}
		>
			{/* Fullscreen toggle
			{colors.length > 0 && (
				<button
					onClick={() => setIsFullscreen(!isFullscreen)}
					className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
				>
					{isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
				</button>
			)} */}

			{processedFiles.length === 0 ? (
				<div
					{...getRootProps()}
					className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${
						isDragActive
							? 'border-blue-500 bg-blue-50'
							: 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
					}`}
				>
					<input {...getInputProps()} />
					{processing ? (
						<p>Processing files...</p>
					) : (
						<div>
							<p className="mb-2">Drop your CSS, SCSS, or other stylesheet files here</p>
							<p className="text-sm text-gray-500">or click to select files</p>
						</div>
					)}
				</div>
			) : (
				<div className={`relative flex flex-col h-full`}>
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-bold">
								Processed Files
								<span className="ml-2 text-sm font-normal text-gray-500">
									{processedFiles.length} files, {Object.keys(getCombinedColors()).length} colors
									found
								</span>
							</h2>
						</div>

						<div className="flex gap-2">
							<button
								onClick={resetState}
								className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
							>
								<RotateCcw className="w-4 h-4" />
								<span>Reset</span>
							</button>
						</div>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-2">
							<AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
							<div>
								<p className="font-medium">Error</p>
								<p className="text-sm">{error}</p>
							</div>
						</div>
					)}

					<div className="mb-4">
						<h3 className="text-sm font-medium mb-2">File Filters</h3>
						<div className="flex flex-wrap gap-2">
							{fileFilters.map((filter) => {
								const file = processedFiles.find((f) => f.id === filter.id)
								if (!file) return null

								return (
									<button
										key={filter.id}
										onClick={() => toggleFileVisibility(filter.id)}
										className={`px-3 py-1.5 text-sm rounded transition-colors ${
											filter.isVisible ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
										}`}
									>
										{file.name}
									</button>
								)
							})}
						</div>
					</div>

					<div className="mb-4 flex gap-2">
						<button
							onClick={() => toggleLayoutMode('default')}
							className={`px-3 py-1.5 text-sm rounded transition-colors ${
								layoutMode === 'default'
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 hover:bg-gray-200'
							}`}
						>
							Default View
						</button>
						<button
							onClick={() => toggleLayoutMode('colorsExpanded')}
							className={`px-3 py-1.5 text-sm rounded transition-colors ${
								layoutMode === 'colorsExpanded'
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 hover:bg-gray-200'
							}`}
						>
							Colors Expanded
						</button>
						<button
							onClick={() => toggleLayoutMode('codeExpanded')}
							className={`px-3 py-1.5 text-sm rounded transition-colors ${
								layoutMode === 'codeExpanded'
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 hover:bg-gray-200'
							}`}
						>
							Code Expanded
						</button>
					</div>

					<div
						className={`grid gap-6 h-full ${
							layoutMode === 'colorsExpanded'
								? 'grid-cols-1'
								: layoutMode === 'codeExpanded'
								? 'grid-cols-1'
								: 'grid-cols-1 md:grid-cols-2'
						}`}
					>
						{(layoutMode === 'default' || layoutMode === 'colorsExpanded') && (
							<div
								className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'}`}
							>
								{getVisibleFiles().map((file) => (
									<div key={file.id} className="border rounded-lg p-4">
										<h3 className="font-medium mb-4">{file.name}</h3>
										<ColorList
											title="Colors without Variables"
											colors={Object.values(file.colors).filter((color) => !color.isExisting)}
											onVariableChange={() => {}}
											onColorChange={() => {}}
											className={layoutMode === 'colorsExpanded' ? 'mb-6' : ''}
										/>
										<ColorList
											title="Existing Variables"
											colors={Object.values(file.colors).filter((color) => color.isExisting)}
											onVariableChange={() => {}}
											onColorChange={() => {}}
										/>
									</div>
								))}
							</div>
						)}

						{(layoutMode === 'default' || layoutMode === 'codeExpanded') && (
							<div
								className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'}`}
							>
								<div className="flex flex-col h-full">
									<div className="mb-6">
										<CssPreview
											title="Combined Variables"
											cssCode={combinedVariablesCss}
											onCopy={() => {
												navigator.clipboard.writeText(combinedVariablesCss)
												setCopiedVariables(true)
												setTimeout(() => setCopiedVariables(false), 2000)
											}}
											copied={copiedVariables}
										/>
									</div>

									{getVisibleFiles().map((file) => (
										<div key={file.id} className="mb-6">
											<CssPreview
												title={`Modified CSS - ${file.name}`}
												cssCode={file.modifiedCss}
												onCopy={() => {
													navigator.clipboard.writeText(file.modifiedCss)
													setCopiedModified(true)
													setTimeout(() => setCopiedModified(false), 2000)
												}}
												copied={copiedModified}
												highlightButton={false}
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
