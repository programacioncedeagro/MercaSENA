import { CampeSenaLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';
import Image from 'next/image';

type LogoProps = SVGProps<SVGSVGElement> & {
  showText?: boolean;
  useImage?: boolean;
};

export function Logo({ showText = false, useImage = true, className, ...props }: LogoProps) {
  if (useImage) {
    return (
      <Image
        src="/logoCampe_g.png"
        alt="CampeSENA - Una Esperanza Debida"
        width={240}
        height={70}
        className={cn("h-auto", className)}
        priority
      />
    );
  }
  
  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <CampeSenaLogo className={cn("w-48 h-auto", className)} {...props} />
      </div>
    );
  }
  return <CampeSenaLogo className={className} {...props} />;
}
