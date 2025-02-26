'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

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
		<div className="border rounded-xl p-4 backdrop-blur-sm bg-white/60">
			<div className="flex justify-between items-center mb-3">
				<h3 className="font-medium">{title}</h3>
				<Button
					variant={highlightButton ? 'default' : 'outline'}
					size="sm"
					onClick={handleCopy}
					className="gap-1"
				>
					{isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
					{isCopied ? 'Copied!' : 'Copy'}
				</Button>
			</div>

			<pre className="bg-background/50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto border font-mono">
				{cssCode}
			</pre>
		</div>
	)
}
