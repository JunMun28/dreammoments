import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-focus)] disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				primary:
					"bg-[color:var(--dm-crimson)] text-white hover:bg-[color:var(--dm-crimson-hover)]",
				secondary:
					"border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]",
				ghost:
					"text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]",
				danger: "bg-[color:var(--dm-error)] text-white hover:opacity-90",
			},
			size: {
				sm: "min-h-[36px] px-4 text-sm",
				md: "min-h-[44px] px-6 text-sm",
				lg: "min-h-[52px] px-8 text-base",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

type ButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		loading?: boolean;
	};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant, size, loading, disabled, children, ...props },
		ref,
	) => {
		return (
			<button
				ref={ref}
				className={cn(buttonVariants({ variant, size }), className)}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					<>
						<LoadingSpinner size="sm" />
						{children}
					</>
				) : (
					children
				)}
			</button>
		);
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
