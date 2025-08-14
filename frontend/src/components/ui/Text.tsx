import React from 'react';
import { cn } from '@/lib/utils';

type TextElement = 'p' | 'span' | 'div' | 'li' | 'a' | 'label' | 'caption' | 'small';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type TextVariant = 'default' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: TextElement;
    size?: TextSize;
    variant?: TextVariant;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    className?: string;
    children: React.ReactNode;
}

const textSizeClasses: Record<TextSize, string> = {
    xs: 'text-xs sm:text-xs',     // 12px -> 12px
    sm: 'text-sm sm:text-sm',     // 14px -> 14px
    base: 'text-sm sm:text-base', // 14px -> 16px
    lg: 'text-base sm:text-lg',   // 16px -> 18px
    xl: 'text-lg sm:text-xl',     // 18px -> 20px
};

const textVariantClasses: Record<TextVariant, string> = {
    default: 'text-color-primary',
    secondary: 'text-color-secondary',
    muted: 'text-muted-foreground',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error',
    info: 'text-info-500',
};

const textWeightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
    ({
         as: Component = 'p',
         size = 'base',
         variant = 'default',
         weight = 'normal',
         className,
         children,
         ...props
     }, ref) => {
        const classes = cn(
            textSizeClasses[size],
            textVariantClasses[variant],
            textWeightClasses[weight],
            'leading-relaxed',
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

Text.displayName = 'Text';
