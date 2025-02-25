'use server'

import { revalidatePath } from 'next/cache'
import { generateModifiedCss } from './utils'

export type ColorInfo = {
	original: string
	variable?: string
	isExisting: boolean
	value: string
	occurrences: number
}

export type CssProcessingResult = {
	success?: boolean
	fileName?: string
	fileSize?: number
	colors?: Record<string, ColorInfo>
	error?: string
	generatedCss?: string
	originalCss?: string
	modifiedCss?: string
}

/**
 * Extract color values from CSS content
 */
function extractColors(cssContent: string): Record<string, ColorInfo> {
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
			color.variable = `--color-${index}`
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
 * Process a CSS/SCSS file to extract color variables
 */
export async function processCssFile(input: FormData | string): Promise<CssProcessingResult> {
	try {
		console.log('Processing CSS content...')

		let fileContent: string
		let fileName: string = 'style.css'
		let fileSize: number = 0

		if (typeof input === 'string') {
			fileContent = input
			fileSize = new Blob([fileContent]).size
			console.log(`String content received, length: ${fileContent.length}`)
		} else {
			const file = input.get('file') as File

			if (!file) {
				console.log('No file provided')
				return { error: 'No file provided' }
			}

			fileName = file.name
			fileSize = file.size
			console.log(`File received: ${fileName}, size: ${fileSize}`)

			fileContent = await file.text()
			console.log(`File content length: ${fileContent.length}`)
		}

		const colors = extractColors(fileContent)
		console.log(`Colors extracted: ${Object.keys(colors).length}`)

		const generatedCss = generateCssWithVariables(colors)

		const modifiedCss = generateModifiedCss(fileContent, colors)
		console.log('Generated modified CSS with variables')

		revalidatePath('/')
		return {
			success: true,
			fileName,
			fileSize,
			colors,
			generatedCss,
			originalCss: fileContent,
			modifiedCss,
		}
	} catch (error) {
		console.error('Error processing CSS file:', error)
		return { error: 'Failed to process file' }
	}
}
