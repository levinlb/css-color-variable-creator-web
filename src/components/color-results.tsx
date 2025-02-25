import { CssProcessingResult } from '@/lib/actions'

export default function ColorResults({ result }: { result: CssProcessingResult }) {
	if (!result.colors || Object.keys(result.colors).length === 0) {
		return <p>No colors found in the file.</p>
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Colors Found in {result.fileName}</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="border rounded-md p-4">
					<h3 className="font-medium mb-2">Existing Color Variables</h3>
					<div className="space-y-2">
						{Object.values(result.colors)
							.filter((color) => color.isExisting)
							.map((color, index) => (
								<div key={index} className="flex items-center gap-2">
									<div
										className="w-6 h-6 rounded-md border"
										style={{ backgroundColor: color.value }}
									/>
									<span className="font-mono text-sm">{color.variable}</span>
									<span className="text-gray-500 text-sm">{color.value}</span>
									<span className="text-xs text-gray-400 ml-auto">
										{color.occurrences} {color.occurrences === 1 ? 'use' : 'uses'}
									</span>
								</div>
							))}
						{Object.values(result.colors).filter((color) => color.isExisting).length === 0 && (
							<p className="text-sm text-gray-500">No existing color variables found.</p>
						)}
					</div>
				</div>

				<div className="border rounded-md p-4">
					<h3 className="font-medium mb-2">Generated Color Variables</h3>
					<div className="space-y-2">
						{Object.values(result.colors)
							.filter((color) => !color.isExisting)
							.map((color, index) => (
								<div key={index} className="flex items-center gap-2">
									<div
										className="w-6 h-6 rounded-md border"
										style={{ backgroundColor: color.value }}
									/>
									<span className="font-mono text-sm">{color.variable}</span>
									<span className="text-gray-500 text-sm">{color.value}</span>
									<span className="text-xs text-gray-400 ml-auto">
										{color.occurrences} {color.occurrences === 1 ? 'use' : 'uses'}
									</span>
								</div>
							))}
						{Object.values(result.colors).filter((color) => !color.isExisting).length === 0 && (
							<p className="text-sm text-gray-500">No colors without variables found.</p>
						)}
					</div>
				</div>
			</div>

			<div className="border rounded-md p-4">
				<h3 className="font-medium mb-2">Generated CSS</h3>
				<div className="flex justify-end mb-2">
					<button
						onClick={() => {
							navigator.clipboard.writeText(result.generatedCss || '')
						}}
						className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
					>
						Copy to clipboard
					</button>
				</div>
				<pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
					{result.generatedCss ||
						`:root {
${Object.values(result.colors)
	.map((color) => `  ${color.variable}: ${color.value};`)
	.join('\n')}
}`}
				</pre>
			</div>
		</div>
	)
}
