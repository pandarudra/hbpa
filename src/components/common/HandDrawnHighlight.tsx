import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  color?: string;
  roughness?: number;
  /** Per-frame wobble amplitude; 0 disables the boiling redraw animation. */
  boil?: number;
  seed?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

type Point = [number, number];

// Ported from drawably's scribbleFill/jitter/toPath (dist/rough.js, dist/prng.js)
// so the marker-wash reads the same: a 45° zig-zag hatch, quadratic-smoothed,
// re-jittered into 3 variants that step every 400ms for the "boiling" redraw.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function jitter(points: Point[], rand: () => number, amp: number): Point[] {
  return points.map(([x, y]) => [x + (rand() * 2 - 1) * amp, y + (rand() * 2 - 1) * amp]);
}

function toPath(points: Point[]): string {
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const mx = (cx + points[i + 1][0]) / 2;
    const my = (cy + points[i + 1][1]) / 2;
    d += `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += `L${lx.toFixed(2)} ${ly.toFixed(2)}`;
  return d;
}

function scribbleFill(
  w: number,
  h: number,
  seed: number,
  roughness: number,
  boilSeed: number,
  boil: number,
): string {
  const gap = 6;
  const pts: Point[] = [];
  let flip = false;
  for (let t = gap; t < w + h; t += gap) {
    const a: Point = [Math.max(0, t - h), Math.min(t, h)];
    const b: Point = [Math.min(t, w), Math.max(0, t - w)];
    pts.push(...(flip ? [b, a] : [a, b]));
    flip = !flip;
  }
  if (pts.length < 2) return '';
  const jittered = jitter(pts, mulberry32(seed), 1.2 * roughness);
  const boiled = boil > 0 ? jitter(jittered, mulberry32(boilSeed), boil) : jittered;
  return toPath(boiled);
}

const BOIL_INTERVAL_MS = 400;

/** Hand-drawn highlighter marker-wash behind its children (drawably's DrawablyHighlight, native). */
export function HandDrawnHighlight({
  color = '#2724d1',
  roughness = 1,
  boil = 0.3,
  seed,
  children,
  style,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [frame, setFrame] = useState(0);
  const baseSeed = useMemo(() => seed ?? Math.floor(Math.random() * 0x100000000), [seed]);

  useEffect(() => {
    if (!boil) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % 3), BOIL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [boil]);

  const variants = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) return [];
    return [0, 1, 2].map((i) =>
      scribbleFill(size.width, size.height, baseSeed, roughness, baseSeed + (i + 1) * 7919, boil),
    );
  }, [size.width, size.height, baseSeed, roughness, boil]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      Math.round(prev.width) === Math.round(width) && Math.round(prev.height) === Math.round(height)
        ? prev
        : { width, height },
    );
  };

  return (
    <View style={[styles.container, style]}>
      {variants.length > 0 && (
        <View style={styles.washLayer} pointerEvents="none">
          <Svg width={size.width} height={size.height}>
            {variants.map((d, i) => (
              <Path
                key={i}
                d={d}
                stroke={color}
                strokeWidth={6}
                strokeOpacity={0.3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={boil ? (frame === i ? 1 : 0) : i === 0 ? 1 : 0}
              />
            ))}
          </Svg>
        </View>
      )}
      <View onLayout={onLayout}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  washLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
});
