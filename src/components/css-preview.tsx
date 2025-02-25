'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

type CssPreviewProps = {
	cssCode: string
	title: string
	onCopy?: () => void
	copied?: boolean
	highlightButton?: boolean
}

export default function CssPreview({
	cssCode,
	title,
	onCopy,
	copied,
	highlightButton = false,
}: CssPreviewProps) {
	const [internalCopied, setInternalCopied] = useState(false)

	const isCopied = copied !== undefined ? copied : internalCopied

	const handleCopy = () => {
		if (onCopy) {
			onCopy()
		} else {
			navigator.clipboard.writeText(cssCode)
			setInternalCopied(true)
			setTimeout(() => setInternalCopied(false), 2000)
		}
	}

	return (
		<div className="border rounded-md p-4">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-medium">{title}</h3>
				<button
					onClick={handleCopy}
					className={`${
						highlightButton
							? 'bg-blue-500 text-white hover:bg-blue-600'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					} px-2 py-1 rounded flex items-center gap-1 text-sm transition-colors`}
				>
					{isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
					{isCopied ? 'Copied!' : 'Copy'}
				</button>
			</div>

			<pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
				{cssCode}
			</pre>
		</div>
	)
}
