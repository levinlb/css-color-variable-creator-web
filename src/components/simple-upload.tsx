'use client'

import { processCssFile } from '@/lib/actions'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import ColorList from './color-list'
import CssPreview from './css-preview'

type Color = {
	original: string
	variable: string
	isExisting: boolean
	value: string
	occurrences: number
}

export default function SimpleUpload() {
	const [processing, setProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [colors, setColors] = useState<Color[]>([])
	const [variablesCss, setVariablesCss] = useState<string>('')
	const [modifiedCss, setModifiedCss] = useState<string>('')
	const [fileName, setFileName] = useState<string>('')

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

	const handleVariableChange = (original: string, newVariable: string) => {
		setColors((prevColors) =>
			prevColors.map((color) =>
				color.original === original ? { ...color, variable: newVariable } : color
			)
		)

		const updatedVariablesCss = colors
			.map((color) => {
				if (color.original === original) {
					return `${newVariable}: ${color.value};`
				}
				return `${color.variable}: ${color.value};`
			})
			.join('\n')

		setVariablesCss(`:root {\n${updatedVariablesCss}\n}`)

		setCopiedVariables(false)
		setCopiedModified(false)
	}

	const handleColorChange = (original: string, newValue: string) => {
		setColors((prevColors) =>
			prevColors.map((color) =>
				color.original === original ? { ...color, value: newValue } : color
			)
		)

		const updatedVariablesCss = colors
			.map((color) => {
				if (color.original === original) {
					return `${color.variable}: ${newValue};`
				}
				return `${color.variable}: ${color.value};`
			})
			.join('\n')

		setVariablesCss(`:root {\n${updatedVariablesCss}\n}`)

		setCopiedVariables(false)
		setCopiedModified(false)
	}

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return

		const file = acceptedFiles[0]
		setFileName(file.name)
		setProcessing(true)
		setError(null)
		setCopiedVariables(false)
		setCopiedModified(false)

		try {
			const cssContent = await file.text()

			const result = await processCssFile(cssContent)
			console.log('Process result:', result)

			if (result.error) {
				setError(result.error)
				return
			}

			setModifiedCss(result.modifiedCss || '')
			setVariablesCss(result.generatedCss || '')

			const colorArray = Object.entries(result.colors || {}).map(([original, data]) => ({
				original,
				variable: data.variable || `--color-${Math.random().toString(36).substring(2, 7)}`,
				value: data.value,
				isExisting: data.isExisting,
				occurrences: data.occurrences || 1,
			}))

			setColors(colorArray)
		} catch (err) {
			console.error('Error processing file:', err)
			setError('An error occurred while processing the file.')
		} finally {
			setProcessing(false)
		}
	}, [])

	const resetState = () => {
		setProcessing(false)
		setError(null)
		setColors([])
		setVariablesCss('')
		setModifiedCss('')
		setFileName('')
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
		maxFiles: 1,
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

			{colors.length === 0 ? (
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
						<p>Processing file...</p>
					) : (
						<div>
							<p className="mb-2">Drop your CSS, SCSS, or other stylesheet file here</p>
							<p className="text-sm text-gray-500">or click to select a file</p>
						</div>
					)}
				</div>
			) : (
				<div className={`relative flex flex-col h-full`}>
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-bold">
								{fileName}
								<span className="ml-2 text-sm font-normal text-gray-500">
									{colors.length} colors found
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
						{/* Color lists */}
						{(layoutMode === 'default' || layoutMode === 'colorsExpanded') && (
							<div
								className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'}`}
							>
								<ColorList
									title="Colors without Variables"
									colors={colors.filter((color) => !color.isExisting)}
									onVariableChange={handleVariableChange}
									onColorChange={handleColorChange}
									className={layoutMode === 'colorsExpanded' ? 'mb-6' : ''}
								/>

								<ColorList
									title="Existing Variables"
									colors={colors.filter((color) => color.isExisting)}
									onVariableChange={handleVariableChange}
									onColorChange={handleColorChange}
								/>
							</div>
						)}

						{(layoutMode === 'default' || layoutMode === 'codeExpanded') && (
							<div
								className={`flex flex-col gap-6 ${layoutMode === 'default' ? '' : 'order-first'}`}
							>
								<div className="flex flex-col h-full">
									<div className="mb-6">
										<CssPreview
											title="Variables"
											cssCode={variablesCss}
											onCopy={() => {
												navigator.clipboard.writeText(variablesCss)
												setCopiedVariables(true)
												setTimeout(() => setCopiedVariables(false), 2000)
											}}
											copied={copiedVariables}
										/>
									</div>

									<div>
										<CssPreview
											title="Modified CSS"
											cssCode={modifiedCss}
											onCopy={() => {
												navigator.clipboard.writeText(modifiedCss)
												setCopiedModified(true)
												setTimeout(() => setCopiedModified(false), 2000)
											}}
											copied={copiedModified}
											highlightButton={false}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
