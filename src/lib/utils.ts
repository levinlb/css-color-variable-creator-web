import type { ColorInfo } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generate modified CSS with all colors replaced by variables
 */
export function generateModifiedCss(
	cssContent: string,
	colors: Record<string, ColorInfo>,
): string {
	const sortedColors = Object.keys(colors).sort((a, b) => b.length - a.length);

	const colorMap = new Map<string, string>();
	sortedColors.forEach((color) => {
		if (colors[color].variable) {
			colorMap.set(color, `var(${colors[color].variable})`);
		}
	});

	let cssLines = cssContent.split("\n");

	cssLines = cssLines.map((line) => {
		if (line.includes("--") && line.includes(":")) {
			return line;
		}

		let processedLine = line;

		for (const [originalColor, variableName] of colorMap.entries()) {
			if (line.includes("gradient") && line.includes(originalColor)) {
				const gradientPattern = /(linear|radial|conic)-gradient\([^)]+\)/g;
				processedLine = processedLine.replace(gradientPattern, (match) => {
					return match.replace(
						new RegExp(
							`(^|[^a-zA-Z0-9-])${escapeRegExp(originalColor)}([^a-zA-Z0-9]|$)`,
							"g",
						),
						`$1${variableName}$2`,
					);
				});
			} else if (line.includes(originalColor)) {
				const colorValuePattern = new RegExp(
					`([:;\\s])${escapeRegExp(originalColor)}([;,\\s)]|$)`,
					"g",
				);
				processedLine = processedLine.replace(
					colorValuePattern,
					`$1${variableName}$2`,
				);

				const colorProperties = [
					"color:",
					"background:",
					"background-color:",
					"border:",
					"border-color:",
					"box-shadow:",
					"text-shadow:",
					"outline-color:",
					"fill:",
					"stroke:",
				];

				for (const prop of colorProperties) {
					if (line.includes(prop) && line.includes(originalColor)) {
						const propPattern = new RegExp(
							`(${escapeRegExp(prop)}[^;]*?)\\b${escapeRegExp(originalColor)}\\b([^;]*?)`,
							"g",
						);
						processedLine = processedLine.replace(
							propPattern,
							`$1${variableName}$2`,
						);
					}
				}

				if (
					originalColor.startsWith("rgba") ||
					originalColor.startsWith("hsla")
				) {
					processedLine = processedLine.replace(
						new RegExp(`\\b${escapeRegExp(originalColor)}\\b`, "g"),
						variableName,
					);
				}
			}
		}

		return processedLine;
	});

	return cssLines.join("\n");
}

/**
 * Generate CSS variables from color objects
 */
export function generateCssWithVariables(
	colors: Record<string, ColorInfo>,
): string {
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
 * Helper function to escape special characters in a string for use in a regular expression
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert a hex color to rgba
 */
export function hexToRgba(hex: string, alpha = 1): string {
	hex = hex.replace("#", "");

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convert rgba to hex
 */
export function rgbaToHex(rgba: string): string {
	const match = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (!match) return "#000000";

	const r = parseInt(match[1]).toString(16).padStart(2, "0");
	const g = parseInt(match[2]).toString(16).padStart(2, "0");
	const b = parseInt(match[3]).toString(16).padStart(2, "0");

	return `#${r}${g}${b}`;
}
