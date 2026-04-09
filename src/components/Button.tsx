import React from 'react';
import { Button as UiButton, buttonVariants } from './ui/button';
import type { ButtonProps as UiButtonProps } from './ui/button';
import { cn } from '@/lib/utils';

/** Mapeamento do variant legado para o variant shadcn/ui */
type LegacyVariant = 'primary' | 'ghost' | 'accent' | 'outline' | 'outline-white';
const variantMap: Record<LegacyVariant, UiButtonProps['variant']> = {
  primary:        'default',
  ghost:          'ghost',
  accent:         'accent',
  outline:        'outline',
  'outline-white':'outline-white',
};

type Props = Omit<UiButtonProps, 'variant'> & {
  variant?: LegacyVariant | UiButtonProps['variant'];
  fullWidth?: boolean;
};

export const Button: React.FC<Props> = ({ variant = 'primary', fullWidth, className, ...rest }) => {
  const mapped = variantMap[variant as LegacyVariant] ?? (variant as UiButtonProps['variant']);
  return (
    <UiButton
      variant={mapped}
      className={cn(fullWidth && 'w-full', className)}
      {...rest}
    />
  );
};

export { buttonVariants };
export default Button;


