import type { ElementType, ReactNode } from "react";

type LuxuryGoldHeroTitleProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

export function LuxuryGoldHeroTitle({
  children,
  as: Component = "span",
  className = "",
}: LuxuryGoldHeroTitleProps) {
  return (
    <Component
      className={`luxuryGoldHeroTitle ${className}`.trim()}
    >
      <span className="luxuryGoldHeroTitle__text">
        {children}
      </span>
    </Component>
  );
}
