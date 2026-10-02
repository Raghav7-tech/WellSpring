import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = {
  data: number[];
  color: string;
  width: number;
  height?: number;
};

function pointsFor(data: number[], width: number, height: number) {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);
  const horizontalStep = data.length > 1 ? width / (data.length - 1) : 0;

  return data.map((value, index) => ({
    x: index * horizontalStep,
    y: 5 + ((max - value) / range) * (height - 10),
  }));
}

export function Sparkline({ data, color, width, height = 54 }: Props) {
  const points = pointsFor(data, width, height);
  if (points.length === 0) return null;

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last?.x ?? width} ${height} L 0 ${height} Z`;
  const gradientId = `spark-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height} accessible accessibilityLabel="24 hour TDS trend">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.2} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradientId})`} />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" />
    </Svg>
  );
}

