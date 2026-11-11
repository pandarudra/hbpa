/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockComponent = (props: Record<string, unknown>) => React.createElement(View, props);
  return {
    __esModule: true,
    default: mockComponent,
    Svg: mockComponent,
    Circle: mockComponent,
    Path: mockComponent,
    Rect: mockComponent,
    Line: mockComponent,
    Polyline: mockComponent,
    Polygon: mockComponent,
    G: mockComponent,
    Text: mockComponent,
    TSpan: mockComponent,
    TextPath: mockComponent,
    Use: mockComponent,
    Image: mockComponent,
    Symbol: mockComponent,
    Defs: mockComponent,
    LinearGradient: mockComponent,
    RadialGradient: mockComponent,
    Stop: mockComponent,
    ClipPath: mockComponent,
    Pattern: mockComponent,
    Mask: mockComponent,
  };
});
