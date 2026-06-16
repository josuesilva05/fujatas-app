import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

/* ─── Pagination Root ─── */

interface PaginationProps extends React.ComponentProps<"nav"> {}

function Pagination({ className, ...props }: PaginationProps) {
	return (
		<nav
			role="navigation"
			aria-label="Pagination"
			className={cn("flex w-full", className)}
			{...props}
		/>
	);
}

/* ─── Content (ul) ─── */

interface PaginationContentProps extends React.ComponentProps<"ul"> {}

function PaginationContent({ className, ...props }: PaginationContentProps) {
	return (
		<ul
			className={cn("flex flex-row items-center gap-1", className)}
			{...props}
		/>
	);
}

/* ─── Item (li) ─── */

interface PaginationItemProps extends React.ComponentProps<"li"> {}

function PaginationItem({ className, ...props }: PaginationItemProps) {
	return <li className={cn("", className)} {...props} />;
}

/* ─── Link (page number button) ─── */

interface PaginationLinkProps extends React.ComponentProps<"button"> {
	isActive?: boolean;
}

function PaginationLink({
	className,
	isActive,
	...props
}: PaginationLinkProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors",
				"min-w-8 h-8 px-2.5",
				isActive
					? "bg-slate-955 text-white border border-slate-955 shadow-sm"
					: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
				"disabled:pointer-events-none disabled:opacity-40",
				className,
			)}
			{...props}
		/>
	);
}

/* ─── Previous ─── */

interface PaginationPreviousProps extends React.ComponentProps<"button"> {
	iconOnly?: boolean;
}

function PaginationPrevious({
	className,
	iconOnly,
	...props
}: PaginationPreviousProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors h-8 px-2.5",
				"border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
				"disabled:pointer-events-none disabled:opacity-40",
				className,
			)}
			{...props}
		>
			<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
			{!iconOnly && <span>Anterior</span>}
		</button>
	);
}

/* ─── Next ─── */

interface PaginationNextProps extends React.ComponentProps<"button"> {
	iconOnly?: boolean;
}

function PaginationNext({
	className,
	iconOnly,
	...props
}: PaginationNextProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs font-medium transition-colors h-8 px-2.5",
				"border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
				"disabled:pointer-events-none disabled:opacity-40",
				className,
			)}
			{...props}
		>
			{!iconOnly && <span>Próximo</span>}
			<ChevronRight className="w-3.5 h-3.5 shrink-0" />
		</button>
	);
}

/* ─── Ellipsis ─── */

interface PaginationEllipsisProps extends React.ComponentProps<"span"> {}

function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center w-8 h-8 text-xs text-slate-400 select-none",
				className,
			)}
			{...props}
		>
			<MoreHorizontal className="w-3.5 h-3.5" />
			<span className="sr-only">Mais páginas</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
