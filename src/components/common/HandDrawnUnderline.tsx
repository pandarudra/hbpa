import React, { useMemo, useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  color?: string;
  strokeWidth?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

const HEIGHT = 8;

function buildSquigglePath(width: number): string {
  const segments = Math.max(2, Math.round(width / 36));
  const step = width / segments;
  let path = `M0 ${2 + Math.random() * 2}`;
  for (let i = 1; i <= segments; i++) {
    const x = step * i;
    const prevX = step * (i - 1);
    const cx = (prevX + x) / 2 + (Math.random() - 0.5) * 6;
    const cy = Math.random() * 4;
    path += ` Q${cx} ${cy} ${x} ${2 + Math.random() * 2}`;
  }
  return path;
}

/** Hand-drawn pen-stroke underline, sketched fresh under its text on each mount. */
export function HandDrawnUnderline({ color = '#171D2E', strokeWidth = 2, children, style }: Props) {
  const [width, setWidth] = useState(0);
  const path = useMemo(() => (width > 0 ? buildSquigglePath(width) : ''), [width]);

  const onLayout = (e: LayoutChangeEvent) => {
    const measured = Math.round(e.nativeEvent.layout.width);
    setWidth((prev) => (prev === measured ? prev : measured));
  };

  return (
    <View style={[styles.container, style]}>
      <View onLayout={onLayout}>{children}</View>
      {width > 0 && (
        <Svg width={width} height={HEIGHT} style={styles.svg}>
          <Path
            d={path}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  svg: {
    marginTop: -3,
  },
});
