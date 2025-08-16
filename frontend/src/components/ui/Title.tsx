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
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
    4: 'text-base',
    5: 'text-sm',
    6: 'text-xs',
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