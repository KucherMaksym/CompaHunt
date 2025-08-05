import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonLinkProps {
    href: string;
    children: React.ReactNode;
    variant?: "default" | "secondary";
    className?: string;
}

export function ButtonLink({href, children, variant = "default", className,}: ButtonLinkProps) {
    const baseStyles =
        "w-full flex justify-center py-2 px-4 rounded-md shadow-xs text-sm font-medium transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500";

    const variantStyles =
        variant === "secondary"
            ? "text-black bg-primary-50 hover:bg-primary-100"
            : "text-primary bg-primary-600 hover:bg-primary-700 border border-transparent";

    return (
        <Link href={href} className={cn(baseStyles, variantStyles, className)}>
            {children}
        </Link>
    );
}
