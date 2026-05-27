import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary";
}

export default function Button({
	variant = "primary",
	className = "",
	children,
	...props
}: ButtonProps) {
	const baseStyles =
		"rounded-2xl px-5 py-3 text-sm font-semibold transition outline-none cursor-pointer";
	const variants = {
		primary:
			"bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400/30",
		secondary:
			"border border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-500 focus:ring-2 focus:ring-slate-500/30",
	};

	return (
		<button
			type={props.type || "button"}
			className={`${baseStyles} ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
