import type React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "dark" | "accent";
}

export default function Card({
	variant = "default",
	className = "",
	children,
	...props
}: CardProps) {
	const baseStyles = "rounded-3xl border p-6 transition sm:p-8";
	const variants = {
		default: "border-slate-800 bg-slate-900/80 shadow-lg shadow-slate-950/20",
		dark: "border-slate-800 bg-slate-950/70 shadow-xl shadow-slate-950/20",
		accent:
			"border-cyan-500/20 bg-cyan-500/5 text-slate-100 shadow-xl shadow-cyan-500/10",
	};

	return (
		<div
			className={`${baseStyles} ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
