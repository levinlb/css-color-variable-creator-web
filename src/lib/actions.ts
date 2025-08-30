"use server";

import { revalidatePath } from "next/cache";
import type { ColorInfo, CssProcessingResult, ProcessedFile } from "./types";
import { generateModifiedCss } from "./utils";

/**
 * Extract color values from CSS content
 */
function extractColors(
	cssContent: string,
	fileId: string,
): Record<string, ColorInfo> {
	const colors: Record<string, ColorInfo> = {};

	const variableRegex =
		/--([a-zA-Z0-9-_]+):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
	let match: RegExpExecArray | null;

	match = variableRegex.exec(cssContent);
	while (match !== null) {
		const varName = match[1];
		const colorValue = match[2];

		colors[colorValue] = {
			original: colorValue,
			variable: `--${varName}`,
			isExisting: true,
			value: colorValue,
			occurrences: 1,
			fileId,
		};
		match = variableRegex.exec(cssContent);
	}

	const colorRegex = /(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;

	match = colorRegex.exec(cssContent);
	while (match !== null) {
		const colorValue = match[1];

		if (colors[colorValue]) {
			colors[colorValue].occurrences++;
		} else {
			colors[colorValue] = {
				original: colorValue,
				isExisting: false,
				value: colorValue,
				occurrences: 1,
				fileId,
				variable: "",
			};
		}
		match = colorRegex.exec(cssContent);
	}

	// Generate semantic variable names for colors without existing variables
	const existingVariables = new Set<string>();

	// First, collect all existing variable names
	Object.values(colors).forEach((color) => {
		if (color.isExisting && color.variable) {
			existingVariables.add(color.variable);
		}
	});

	// Then generate semantic names for colors without variables
	Object.keys(colors).forEach((key) => {
		const color = colors[key];
		if (!color.isExisting) {
			color.variable = generateSemanticVariableName(
				color.value,
				existingVariables,
			);
		}
	});

	return colors;
}

/**
 * Generate a semantic variable name for a color
 */
function generateSemanticVariableName(
	colorValue: string,
	existingVariables: Set<string>,
): string {
	let baseName = "";

	if (colorValue.startsWith("#")) {
		baseName = `color-${colorValue.slice(1).toLowerCase()}`;
	} else if (colorValue.startsWith("rgb")) {
		const match = colorValue.match(
			/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
		);
		if (match) {
			const [, r, g, b, a] = match;
			baseName =
				a && a !== "1"
					? `color-rgb-${r}-${g}-${b}-${Math.round(parseFloat(a) * 100)}`
					: `color-rgb-${r}-${g}-${b}`;
		}
	} else if (colorValue.startsWith("hsl")) {
		const match = colorValue.match(
			/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/,
		);
		if (match) {
			const [, h, s, l, a] = match;
			baseName =
				a && a !== "1"
					? `color-hsl-${h}-${s}-${l}-${Math.round(parseFloat(a) * 100)}`
					: `color-hsl-${h}-${s}-${l}`;
		}
	}

	if (!baseName) {
		baseName = `color-${colorValue.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
	}

	let variableName = `--${baseName}`;
	let counter = 1;
	while (existingVariables.has(variableName)) {
		variableName = `--${baseName}-${counter}`;
		counter++;
	}

	existingVariables.add(variableName);
	return variableName;
}

/**
 * Generate CSS with variables for all colors
 */
function generateCssWithVariables(colors: Record<string, ColorInfo>): string {
	let css = ":root {\n";

	Object.values(colors).forEach((color) => {
		if (color.variable) {
			css += `  ${color.variable}: ${color.value};\n`;
		}
	});

	css += "}\n";
	return css;
}

/**
 * Process multiple CSS/SCSS files to extract color variables
 */
export async function processCssFiles(
	files: File[],
): Promise<CssProcessingResult> {
	try {
		console.log(`Processing ${files.length} CSS files...`);

		const processedFiles: ProcessedFile[] = [];
		const allColors: Record<string, ColorInfo> = {};

		for (const file of files) {
			const fileId = Math.random().toString(36).substring(2, 9);
			const fileContent = await file.text();

			const colors = extractColors(fileContent, fileId);
			const modifiedCss = generateModifiedCss(fileContent, colors);

			Object.values(colors).forEach((color) => {
				const key = color.value;
				if (allColors[key]) {
					allColors[key].occurrences += color.occurrences;
					if (!allColors[key].variable && color.variable) {
						allColors[key].variable = color.variable;
					}
				} else {
					allColors[key] = { ...color };
				}
			});

			processedFiles.push({
				id: fileId,
				name: file.name,
				size: file.size,
				colors,
				originalCss: fileContent,
				modifiedCss,
			});
		}

		// Generate semantic variable names for the consolidated colors
		const existingGlobalVariables = new Set<string>();

		Object.values(allColors).forEach((color) => {
			if (color.isExisting && color.variable) {
				existingGlobalVariables.add(color.variable);
			}
		});

		Object.keys(allColors).forEach((key) => {
			const color = allColors[key];
			if (!color.isExisting || !color.variable) {
				color.variable = generateSemanticVariableName(
					color.value,
					existingGlobalVariables,
				);
			}
		});

		processedFiles.forEach((file) => {
			Object.keys(file.colors).forEach((colorValue) => {
				if (allColors[colorValue]) {
					file.colors[colorValue].variable = allColors[colorValue].variable;
				}
			});
			file.modifiedCss = generateModifiedCss(file.originalCss, file.colors);
		});

		const combinedVariablesCss = generateCssWithVariables(allColors);

		revalidatePath("/");
		return {
			success: true,
			files: processedFiles,
			combinedVariablesCss,
		};
	} catch (error) {
		console.error("Error processing CSS files:", error);
		return { error: "Failed to process files", files: [] };
	}
}

export async function processCssFile(
	input: FormData | string,
): Promise<CssProcessingResult> {
	try {
		let fileContent: string;
		let fileName: string = "style.css";
		let fileSize: number = 0;
		const fileId = Math.random().toString(36).substring(2, 9);

		if (typeof input === "string") {
			fileContent = input;
			fileSize = new Blob([fileContent]).size;
		} else {
			const file = input.get("file") as File;
			if (!file) {
				return { error: "No file provided", files: [] };
			}
			fileName = file.name;
			fileSize = file.size;
			fileContent = await file.text();
		}

		const colors = extractColors(fileContent, fileId);
		const modifiedCss = generateModifiedCss(fileContent, colors);

		const existingVariables = new Set<string>();
		Object.values(colors).forEach((color) => {
			if (color.isExisting && color.variable) {
				existingVariables.add(color.variable);
			}
		});

		Object.keys(colors).forEach((key) => {
			const color = colors[key];
			if (!color.isExisting || !color.variable) {
				color.variable = generateSemanticVariableName(
					color.value,
					existingVariables,
				);
			}
		});

		const combinedVariablesCss = generateCssWithVariables(colors);

		revalidatePath("/");
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
		};
	} catch (error) {
		console.error("Error processing CSS file:", error);
		return { error: "Failed to process file", files: [] };
	}
}
