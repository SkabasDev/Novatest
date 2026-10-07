import { CardBrand } from '../validators/cardBrand';

interface CardBrandLogosProps {
  brand: CardBrand;
}

/** VISA/MasterCard chips inside the card number input, with the live-detection ring/opacity states (spec §6). */
export function CardBrandLogos({ brand }: CardBrandLogosProps) {
  return (
    <div className="flex items-center gap-1.5">
      <BrandChip isActive={brand === 'VISA'} isDimmed={brand === 'MASTERCARD'}>
        <span className="text-[10px] font-bold italic tracking-tight text-visa">VISA</span>
      </BrandChip>
      <BrandChip isActive={brand === 'MASTERCARD'} isDimmed={brand === 'VISA'}>
        <span className="relative flex h-3.5 w-6 items-center justify-center">
          <span className="absolute left-0 h-3.5 w-3.5 rounded-full bg-mc-red" />
          <span className="absolute right-0 h-3.5 w-3.5 rounded-full bg-mc-yellow opacity-80" />
        </span>
      </BrandChip>
    </div>
  );
}

function BrandChip({ isActive, isDimmed, children }: { isActive: boolean; isDimmed: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-[26px] w-10 items-center justify-center rounded-sm bg-white transition-opacity duration-200 ${
        isActive ? 'opacity-100 ring-2 ring-primary' : isDimmed ? 'opacity-25' : 'opacity-100'
      }`}
    >
      {children}
    </span>
  );
}
