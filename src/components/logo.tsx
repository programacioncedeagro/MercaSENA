import { AgroFuturosLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

type LogoProps = SVGProps<SVGSVGElement> & {
  showText?: boolean;
};

export function Logo({ showText = false, className, ...props }: LogoProps) {
  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <AgroFuturosLogo className={cn("w-8 h-8", className)} {...props} />
        <span className="font-headline text-lg font-bold">AgroFuturos Conecta</span>
      </div>
    );
  }
  return <AgroFuturosLogo className={className} {...props} />;
}
