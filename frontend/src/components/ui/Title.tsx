import React from "react";
import {cn} from "@/lib/utils";

type TitleElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TitleVariant = 'default' | 'secondary' | 'gradient' | 'primary';

interface TitleProps extends React.HTMLAttributes<HTMLElement> {
    as?: TitleElement;
    level?: TitleLevel;
    variant?: TitleVariant;
    className?: string;
    children: React.ReactNode;
}

const titleSizeClasses: Record<TitleLevel, string> = {
    1: 'text-2xl sm:text-4xl lg:text-5xl',  // 24px -> 36px -> 48px
    2: 'text-xl sm:text-3xl lg:text-4xl',   // 20px -> 30px -> 36px
    3: 'text-lg sm:text-2xl lg:text-3xl',   // 18px -> 24px -> 30px
    4: 'text-base sm:text-xl lg:text-2xl',  // 16px -> 20px -> 24px
    5: 'text-sm sm:text-lg lg:text-xl',     // 14px -> 18px -> 20px
    6: 'text-sm sm:text-base lg:text-lg',   // 14px -> 16px -> 18px
};

const titleVariantClasses: Record<TitleVariant, string> = {
    default: 'text-color-primary',
    secondary: 'text-color-secondary',
    primary: 'text-primary',
    gradient: 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent',
};

export const Title = React.forwardRef<HTMLElement, TitleProps>(
    ({
         as,
         level = 3,
         variant = 'default',
         className,
         children,
         ...props
     }, ref) => {
        const Component = as || (`h${level}` as TitleElement);

        const classes = cn(
            titleSizeClasses[level],
            titleVariantClasses[variant],
            'font-bold leading-tight tracking-tight',
            className
        );

        return React.createElement(
            Component,
            {
                ref,
                className: classes,
                ...props,
            },
            children
        );
    }
);

Title.displayName = 'Title';