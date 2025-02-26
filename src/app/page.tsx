'use client'

import CssCreator from '@/components/css-creator'
import { AnimatedText } from '@/components/ui/animated-text'
import { Button } from '@/components/ui/button'
import { FeatureCard } from '@/components/ui/feature-card'
import { ParallaxScroll } from '@/components/ui/parallax-scroll'
import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function Home() {
	const cssCreatorRef = useRef<HTMLDivElement>(null)

	return (
		<div className="min-h-screen flex flex-col bg-gradient-blur">
			<main className="flex-1 w-full overflow-hidden">
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-background/80 pointer-events-none" />
					<div className="px-6 py-16 md:py-32 mx-auto max-w-7xl relative">
						<div className="flex flex-col items-center text-center mb-24">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-50/80 text-blue-700 text-sm font-medium backdrop-blur-sm"
							>
								Simplify Your CSS Color Management
							</motion.div>

							<AnimatedText
								text="CSS Color Variable Creator"
								className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
								delay={2}
							/>

							<AnimatedText
								text="Transform your CSS color values into organized variables with ease. Upload your stylesheets and get instant color variable suggestions with our intelligent color management tool."
								className="text-xl text-muted-foreground max-w-2xl mb-8"
								delay={4}
							/>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="flex items-center gap-4"
							>
								<Button
									size="lg"
									variant={'outline'}
									className="gap-2 bg-white/80 shadow-lg"
									onClick={() => {
										cssCreatorRef.current?.scrollIntoView({ behavior: 'smooth' })
									}}
								>
									Get Started
									<span aria-hidden="true">→</span>
								</Button>
								<Link
									href="https://github.com/levinspiekermann/css-color-variable-creator-web"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
								>
									<Github className="w-5 h-5" />
									View on GitHub
								</Link>
							</motion.div>
						</div>

						<ParallaxScroll className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
							<FeatureCard
								icon="🎨"
								title="Smart Color Detection"
								description="Automatically detects and extracts all color values from your CSS files, including hex, RGB, RGBA, and HSL formats."
								delay={0}
							/>
							<FeatureCard
								icon="🔄"
								title="Batch Processing"
								description="Process multiple CSS files at once and get organized color variables with consistent naming conventions."
								delay={1}
							/>
							<FeatureCard
								icon="📋"
								title="Easy Export"
								description="Export your color variables in various formats and instantly copy them to your clipboard."
								delay={2}
							/>
						</ParallaxScroll>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
							className="w-full max-w-5xl mx-auto backdrop-blur-sm bg-white/60 rounded-2xl border shadow-2xl p-8 relative"
						>
							<div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-blue-50/50 rounded-2xl pointer-events-none" />
							<div className="relative" ref={cssCreatorRef}>
								<CssCreator />
							</div>
						</motion.div>
					</div>
				</div>
			</main>

			<footer className="border-t py-6 bg-background/50 backdrop-blur-sm">
				<div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground px-12">
					<p>© 2024 CSS Color Variable Creator. All rights reserved.</p>
					<div className="flex items-center gap-6">
						<Link
							href="https://github.com/levinspiekermann/css-color-variable-creator-web"
							className="hover:text-foreground transition-colors"
						>
							GitHub
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
