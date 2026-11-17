import React from 'react';

export interface HeroIntroProps {
  badge?: string;
  titlePrefix: string;
  highlightText: string;
  lead: string;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({
  badge = 'Centro de Informática • USS',
  titlePrefix,
  highlightText,
  lead,
}) => {
  return (
    <div className="hero-intro gex-enter">
      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#ffc53d] mb-4">
        {badge}
      </p>
      <h1
        id="portada-titulo"
        className="font-display text-[2.15rem] leading-[1.06] sm:text-5xl xl:text-[3.6rem] font-extrabold tracking-tight text-balance mb-4 text-white"
      >
        {titlePrefix}{' '}
        <span className="text-[#ffc53d] block sm:inline">
          {highlightText}
        </span>
      </h1>
      <p className="text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed mb-7">
        {lead}
      </p>
    </div>
  );
};
