import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { fonts, statusColors, useAppTheme } from '../theme/tokens';
import type { Parameter, SiteStatus } from '../types';

type Props = {
  data: number[];
  parameter: Parameter;
  status: SiteStatus;
  width: number;
};

const HEIGHT = 244;
const PADDING = { top: 18, right: 14, bottom: 34, left: 46 };

export function ParameterChart({ data, parameter, status, width }: Props) {
  const theme = useAppTheme();
  if (data.length === 0) return null;

  const chartWidth = Math.max(width, 250);
  const innerWidth = chartWidth - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const rawMin = Math.min(...data, parameter.safeRange[0]);
  const rawMax = Math.max(...data, parameter.safeRange[1]);
  const rawRange = Math.max(rawMax - rawMin, 1);
  const yMin = Math.max(parameter.key === 'ph' ? 0 : 0, rawMin - rawRange * 0.12);
  const yMax = rawMax + rawRange * 0.12;
  const yRange = yMax - yMin;
  const color = statusColors[status];

  const xFor = (index: number) =>
    PADDING.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
  const yFor = (value: number) => PADDING.top + ((yMax - value) / yRange) * innerHeight;
  const linePath = data
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(value)}`)
    .join(' ');
  const safeY = yFor(parameter.safeRange[1]);
  const safeBottom = yFor(parameter.safeRange[0]);
  const yTicks = [yMin, yMin + yRange / 2, yMax];
  const xTicks = [
    { index: 0, label: '23h ago' },
    { index: 8, label: '15h' },
    { index: 16, label: '7h' },
    { index: 23, label: 'Now' },
  ];

  return (
    <View>
      <View style={styles.legend}>
        <View style={[styles.legendSwatch, { backgroundColor: `${theme.brand}18` }]} />
        <Text style={[styles.legendText, { color: theme.muted }]}>Safe range</Text>
      </View>
      <Svg
        width={chartWidth}
        height={HEIGHT}
        accessible
        accessibilityLabel={`${parameter.label} readings for the last 24 hours`}
      >
        <Rect
          x={PADDING.left}
          y={safeY}
          width={innerWidth}
          height={Math.max(safeBottom - safeY, 1)}
          fill={theme.brand}
          opacity={0.09}
          rx={5}
        />

        {yTicks.map((tick) => {
          const y = yFor(tick);
          return (
            <G key={tick}>
              <Line
                x1={PADDING.left}
                x2={chartWidth - PADDING.right}
                y1={y}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
              <SvgText
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={theme.faint}
                fontSize={10}
                fontFamily={fonts.mono}
              >
                {parameter.key === 'tds' ? Math.round(tick) : tick.toFixed(1)}
              </SvgText>
            </G>
          );
        })}

        <Path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={xFor(data.length - 1)}
          cy={yFor(data[data.length - 1] ?? 0)}
          r={5}
          fill={theme.surface}
          stroke={color}
          strokeWidth={3}
        />

        {xTicks.map((tick) => (
          <SvgText
            key={tick.label}
            x={xFor(tick.index)}
            y={HEIGHT - 8}
            textAnchor={tick.index === 0 ? 'start' : tick.index === 23 ? 'end' : 'middle'}
            fill={theme.faint}
            fontSize={10}
            fontFamily={fonts.body}
          >
            {tick.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', alignItems: 'center', gap: 7, marginLeft: 46, marginBottom: 2 },
  legendSwatch: { width: 18, height: 8, borderRadius: 3 },
  legendText: { fontFamily: fonts.body, fontSize: 11 },
});

