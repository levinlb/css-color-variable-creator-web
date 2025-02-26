'use server'

import { revalidatePath } from 'next/cache'
import { ColorInfo, CssProcessingResult, ProcessedFile } from './types'
import { generateModifiedCss } from './utils'

/**
 * Extract color values from CSS content
 */
function extractColors(cssContent: string, fileId: string): Record<string, ColorInfo> {
	const colors: Record<string, ColorInfo> = {}

	const variableRegex = /--([a-zA-Z0-9-_]+):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g
	let match

	while ((match = variableRegex.exec(cssContent)) !== null) {
		const varName = match[1]
		const colorValue = match[2]

		colors[colorValue] = {
			original: colorValue,
			variable: `--${varName}`,
			isExisting: true,
			value: colorValue,
			occurrences: 1,
			fileId,
		}
	}

	const colorRegex = /(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g

	while ((match = colorRegex.exec(cssContent)) !== null) {
		const colorValue = match[1]

		if (colors[colorValue]) {
			colors[colorValue].occurrences++
		} else {
			colors[colorValue] = {
				original: colorValue,
				isExisting: false,
				value: colorValue,
				occurrences: 1,
				fileId,
				variable: '',
			}
		}
	}

	Object.keys(colors).forEach((key) => {
		const color = colors[key]
		if (!color.isExisting) {
			const index =
				Object.values(colors)
					.filter((c) => !c.isExisting)
					.indexOf(color) + 1
			color.variable = `--color-${fileId}-${index}`
		}
	})

	return colors
}

/**
 * Generate CSS with variables for all colors
 */
function generateCssWithVariables(colors: Record<string, ColorInfo>): string {
	let css = ':root {\n'

	Object.values(colors).forEach((color) => {
		if (color.variable) {
			css += `  ${color.variable}: ${color.value};\n`
		}
	})

	css += '}\n'
	return css
}

/**
 * Process multiple CSS/SCSS files to extract color variables
 */
export async function processCssFiles(files: File[]): Promise<CssProcessingResult> {
	try {
		console.log(`Processing ${files.length} CSS files...`)

		const processedFiles: ProcessedFile[] = []
		const allColors: Record<string, ColorInfo> = {}

		for (const file of files) {
			const fileId = Math.random().toString(36).substring(2, 9)
			const fileContent = await file.text()

			const colors = extractColors(fileContent, fileId)
			const modifiedCss = generateModifiedCss(fileContent, colors)

			// Merge colors into allColors
			Object.values(colors).forEach((color) => {
				const key = `${color.value}-${color.fileId}`
				if (allColors[key]) {
					allColors[key].occurrences += color.occurrences
				} else {
					allColors[key] = { ...color }
				}
			})

			processedFiles.push({
				id: fileId,
				name: file.name,
				size: file.size,
				colors,
				originalCss: fileContent,
				modifiedCss,
			})
		}

		const combinedVariablesCss = generateCssWithVariables(allColors)

		revalidatePath('/')
		return {
			success: true,
			files: processedFiles,
			combinedVariablesCss,
		}
	} catch (error) {
		console.error('Error processing CSS files:', error)
		return { error: 'Failed to process files', files: [] }
	}
}

// Legacy support for single file processing
export async function processCssFile(input: FormData | string): Promise<CssProcessingResult> {
	try {
		let fileContent: string
		let fileName: string = 'style.css'
		let fileSize: number = 0
		const fileId = Math.random().toString(36).substring(2, 9)

		if (typeof input === 'string') {
			fileContent = input
			fileSize = new Blob([fileContent]).size
		} else {
			const file = input.get('file') as File
			if (!file) {
				return { error: 'No file provided', files: [] }
			}
			fileName = file.name
			fileSize = file.size
			fileContent = await file.text()
		}

		const colors = extractColors(fileContent, fileId)
		const modifiedCss = generateModifiedCss(fileContent, colors)
		const combinedVariablesCss = generateCssWithVariables(colors)

		revalidatePath('/')
		return {
			success: true,
			files: [
				{
					id: fileId,
					name: fileName,
					size: fileSize,
					colors,
					originalCss: fileContent,
					modifiedCss,
				},
			],
			combinedVariablesCss,
		}
	} catch (error) {
		console.error('Error processing CSS file:', error)
		return { error: 'Failed to process file', files: [] }
	}
}
