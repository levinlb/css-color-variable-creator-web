export type ColorInfo = {
	original: string
	variable: string
	isExisting: boolean
	value: string
	occurrences: number
	fileId?: string
}

export type ProcessedFile = {
	id: string
	name: string
	size: number
	colors: Record<string, ColorInfo>
	originalCss: string
	modifiedCss: string
}

export type CssProcessingResult = {
	success?: boolean
	files: ProcessedFile[]
	error?: string
	combinedVariablesCss?: string
}
