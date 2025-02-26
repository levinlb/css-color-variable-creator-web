import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'CSS Color Variable Creator - Transform Your CSS Colors',
	description:
		'Transform your CSS color values into organized variables with ease. Upload your stylesheets and get instant color variable suggestions with our intelligent color management tool.',
	keywords: [
		'CSS',
		'color variables',
		'CSS variables',
		'color management',
		'CSS tools',
		'web development',
	],
	authors: [{ name: 'CSS Color Variable Creator' }],
	openGraph: {
		title: 'CSS Color Variable Creator - Transform Your CSS Colors',
		description:
			'Transform your CSS color values into organized variables with ease. Upload your stylesheets and get instant color variable suggestions.',
		type: 'website',
		locale: 'en_US',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'CSS Color Variable Creator',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'CSS Color Variable Creator',
		description: 'Transform your CSS color values into organized variables with ease.',
		images: ['/og-image.jpg'],
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
			<body className="min-h-screen bg-background font-sans antialiased">
				{children}
				<Analytics />
			</body>
		</html>
	)
}
