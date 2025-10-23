import { CampeSenaLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

type LogoProps = SVGProps<SVGSVGElement> & {
  showText?: boolean;
};

export function Logo({ showText = false, className, ...props }: LogoProps) {
  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <CampeSenaLogo className={cn("w-48 h-auto", className)} {...props} />
      </div>
    );
  }
  return <CampeSenaLogo className={className} {...props} />;
}
