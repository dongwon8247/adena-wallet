import { FontsType } from '@styles/theme';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { HighlightNumberWrapper } from './highlight-number.styles';

export interface HighlightNumberProps {
  value: string;
  fontColor?: string;
  fontStyleKey?: FontsType;
  minimumFontSize?: string;
  lineHeight?: string;
}

export const HighlightNumber: React.FC<HighlightNumberProps> = ({
  value,
  fontColor = 'white',
  fontStyleKey = 'header6',
  minimumFontSize = '14px',
  lineHeight,
}) => {
  const hasDecimal = value.includes('.');
  const [integer, decimal] = hasDecimal ? value.split('.') : [value, ''];

  const integerStr = useMemo(() => {
    return BigNumber(integer.replace(/,/g, '')).toFormat(0);
  }, [integer]);

  return (
    <HighlightNumberWrapper
      fontColor={fontColor}
      fontStyleKey={fontStyleKey}
      minimumFontSize={minimumFontSize}
      lineHeight={lineHeight}
    >
      <span className='value integer'>{integerStr}</span>
      <span className='value decimal'>
        {hasDecimal ? '.' : ''}
        {decimal}
      </span>
    </HighlightNumberWrapper>
  );
};
