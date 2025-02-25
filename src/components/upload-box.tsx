'use client'

import { CssProcessingResult } from '@/lib/actions'
import { CloudUploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import ColorResults from './color-results'
import UploadButton from './upload-button'

export default function UploadBox() {
	const [result, setResult] = useState<CssProcessingResult | null>(null)
	const uploadButtonRef = useRef<HTMLDivElement>(null)

	const handleResult = (newResult: CssProcessingResult) => {
		console.log('Result received in UploadBox:', newResult)
		setResult(newResult)
	}

	const handleBoxClick = () => {
		const buttonElement = uploadButtonRef.current?.querySelector('button')
		if (buttonElement) {
			buttonElement.click()
		}
	}

	return (
		<div className="w-full">
			<div
				className="w-full border border-dashed rounded-md p-6 flex flex-col items-center justify-center relative min-h-[200px] cursor-pointer hover:bg-gray-50 transition-colors"
				onClick={handleBoxClick}
			>
				<CloudUploadIcon className="w-10 h-10 text-gray-400 mb-2" />
				<p className="text-sm text-center">Drop your css/scss file here</p>
				<p className="text-xs text-gray-500 mt-1 mb-2">or click anywhere in this area</p>

				<div ref={uploadButtonRef} onClick={(e) => e.stopPropagation()}>
					<UploadButton onResult={handleResult} />
				</div>
			</div>

			{result && result.success && (
				<div className="mt-6">
					<ColorResults result={result} />
				</div>
			)}
		</div>
	)
}
