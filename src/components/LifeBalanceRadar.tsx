import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { JournalState, LIFE_AREAS, LifeArea } from '../types/journal';
import { THEME } from '../constants/theme';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react-native';

interface LifeBalanceRadarProps {
  state: JournalState;
  onSelectArea: (area: LifeArea) => void;
}

export function calculateAreaScore(goal: any): number {
  if (!goal) return 0;
  let score = 0;

  // 1. Goal text defined
  if (goal.text && goal.text.trim().length > 5) score += 20;
  // 2. Why it matters defined
  if (goal.whyItMatters && goal.whyItMatters.trim().length > 5) score += 15;
  // 3. Milestones written
  const milestones = goal.milestones || {};
  const milestoneCount = ['q1', 'q2', 'q3', 'q4'].filter((k) => milestones[k]?.trim()?.length > 0).length;
  score += milestoneCount * 7.5; // up to 30

  // 4. Completed tasks across quarters & months
  let totalTasks = 0;
  let completedTasks = 0;

  Object.values(goal.quarterPlans || {}).forEach((qp: any) => {
    ['month1', 'month2', 'month3'].forEach((mKey) => {
      (qp[mKey] || []).forEach((item: any) => {
        if (item.text?.trim()) {
          totalTasks++;
          if (item.completed) completedTasks++;
        }
      });
    });
  });

  if (totalTasks > 0) {
    score += (completedTasks / totalTasks) * 35;
  } else {
    // If no tasks created yet, give base credit for defining
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

export const LifeBalanceRadar: React.FC<LifeBalanceRadarProps> = ({ state, onSelectArea }) => {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 340);
  const center = size / 2;
  const radius = center - 42;

  const areaScores = LIFE_AREAS.map((item) => {
    const goal = state.goals[item.key];
    const score = calculateAreaScore(goal);
    return {
      key: item.key,
      label: item.label,
      score,
    };
  });

  const totalScore = Math.round(
    areaScores.reduce((acc, curr) => acc + curr.score, 0) / areaScores.length
  );

  // Sort to find strongest and most neglected area
  const sorted = [...areaScores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const needsLove = sorted[sorted.length - 1];

  const totalPoints = LIFE_AREAS.length;
  const angleStep = (Math.PI * 2) / totalPoints;

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Polygon points for data
  const dataPoints = areaScores.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (item.score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  });

  const polygonPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={18} color={THEME.colors.primary} />
          <Text style={styles.title}>Wheel of Life & Balance Score</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{totalScore}% Harmony</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Visualizing balance across your 8 life areas based on goals, milestones, and habit consistency.
      </Text>

      {/* SVG Radar Chart */}
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Concentric grid rings */}
          {gridLevels.map((lvl) => {
            const points = areaScores
              .map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = lvl * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(' ');
            return (
              <Polygon
                key={lvl}
                points={points}
                fill="none"
                stroke={THEME.colors.linedPaper}
                strokeWidth="1.2"
              />
            );
          })}

          {/* Spokes from center */}
          {areaScores.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <Line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={THEME.colors.linedPaper}
                strokeWidth="1"
              />
            );
          })}

          {/* Filled user data polygon */}
          <Polygon
            points={polygonPointsString}
            fill="rgba(142, 91, 103, 0.22)"
            stroke={THEME.colors.primary}
            strokeWidth="2.5"
          />

          {/* Data point dots and labels */}
          {dataPoints.map((p, i) => {
            const area = areaScores[i];
            const labelR = radius + 24;
            const lx = center + labelR * Math.cos(p.angle);
            const ly = center + labelR * Math.sin(p.angle);

            return (
              <React.Fragment key={area.key}>
                <Circle cx={p.x} cy={p.y} r="4" fill={THEME.colors.primary} />
                <SvgText
                  x={lx}
                  y={ly + 4}
                  fill={THEME.colors.textDark}
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {area.label.split(' ')[0]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Momentum Insights */}
      <View style={styles.insightsRow}>
        <View style={styles.insightBox}>
          <TrendingUp size={14} color={THEME.colors.success} />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Highest Momentum</Text>
            <Text style={styles.insightValue}>{strongest.label} ({strongest.score}%)</Text>
          </View>
        </View>

        <View style={styles.insightBox}>
          <AlertTriangle size={14} color={THEME.colors.accentGold} />
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Needs Attention</Text>
            <Text style={styles.insightValue}>{needsLove.label} ({needsLove.score}%)</Text>
          </View>
        </View>
      </View>

      {/* Area Progress Pills */}
      <View style={styles.pillsGrid}>
        {areaScores.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => onSelectArea(item.key)}
            style={styles.areaPill}
          >
            <Text style={styles.pillLabel} numberOfLines={1}>{item.label}</Text>
            <Text style={styles.pillScore}>{item.score}%</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...THEME.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  scoreBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D6DA',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  subtitle: {
    fontSize: 12.5,
    color: THEME.colors.textMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  insightBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FCFAF7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.colors.textDark,
    marginTop: 1,
  },
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.linedPaper,
    paddingTop: 10,
  },
  areaPill: {
    width: '48.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FBF9F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillLabel: {
    fontSize: 11,
    color: THEME.colors.textDark,
    fontWeight: '500',
    flex: 1,
  },
  pillScore: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginLeft: 4,
  },
});
