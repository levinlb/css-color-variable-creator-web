'use client'

import { Upload } from 'lucide-react'
import { useState } from 'react'

type UploadFormProps = {
	onFileSelect: (file: File) => Promise<void>
}

export default function UploadForm({ onFileSelect }: UploadFormProps) {
	const [loading, setLoading] = useState(false)

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			setLoading(true)
			await onFileSelect(file)
		} finally {
			setLoading(false)
			event.target.value = ''
		}
	}

	return (
		<>
			<h2 className="text-lg font-bold mb-4">Upload a CSS file</h2>

			<label
				htmlFor="file-upload"
				className="block w-full p-4 border-2 border-dashed rounded-md text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
			>
				{loading ? (
					'Uploading...'
				) : (
					<div className="flex flex-col items-center gap-2">
						<Upload className="w-6 h-6 text-blue-500" />
						<span>Click to select a CSS file</span>
					</div>
				)}
			</label>

			<input
				id="file-upload"
				type="file"
				accept=".css,.scss"
				onChange={handleFileChange}
				className="hidden"
				disabled={loading}
			/>
		</>
	)
}
