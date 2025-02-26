import { motion } from 'framer-motion'

interface FeatureCardProps {
	icon: string
	title: string
	description: string
	delay?: number
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{
				type: 'spring',
				damping: 20,
				stiffness: 100,
				delay: delay * 0.2,
			}}
			whileHover={{ y: -5 }}
			className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
		>
			<div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
				{icon}
			</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-muted-foreground">{description}</p>
		</motion.div>
	)
}
