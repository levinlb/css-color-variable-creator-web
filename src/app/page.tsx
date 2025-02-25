import SimpleUpload from '@/components/simple-upload'

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-6 max-w-md mx-auto w-full gap-4">
			<h1 className="text-2xl font-bold text-center">CSS Color Variable Creator</h1>
			<p className="text-sm text-center">
				Upload a css/scss file to create and adjust CSS color variables easily.
			</p>

			<SimpleUpload />
		</main>
	)
}
