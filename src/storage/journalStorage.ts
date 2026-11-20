import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  JournalState,
  LIFE_AREAS,
  LifeArea,
  QuarterPlan,
  MonthPlan,
  MonthReview,
  WeekPlan,
  GoalEntry,
  MonthWeekInfo,
  DayKey,
  DayDateInfo,
} from '../types/journal';

const STORAGE_KEY = '@ejournal_state_v3';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Intelligent Calendar Engine:
 * In a physical weekly planner/journal, every week is ALWAYS a complete 7-day spread
 * from Monday to Sunday (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).
 *
 * To avoid partial 1-day/5-day fragments and duplicate overlapping weeks across months,
 * we use the international calendar standard (ISO-8601 majority rule):
 * - A full 7-day week belongs uniquely to the month that contains the majority of its days
 *   (i.e. where Thursday falls).
 * - For example, in 2026:
 *   - The week Mon Oct 26 – Sun Nov 1 has 6 days in October and 1 in November (Thursday is Oct 29),
 *     so it belongs uniquely to October as its 5th week.
 *   - November starts cleanly on Monday Nov 2 (Week 1: Nov 2 – Nov 8) with ZERO overlap!
 * - Every week is guaranteed full 7 days, and every month has either 4 or 5 complete weeks.
 */
export function getWeeksForMonth(year: number, monthIndex: number): MonthWeekInfo[] {
  const weeks: MonthWeekInfo[] = [];

  // Find the Monday of the week that contains the 1st of this month
  const firstOfMonth = new Date(year, monthIndex - 1, 1);
  const firstJsDay = firstOfMonth.getDay();
  // Offset to preceding Monday (0=Sun -> -6, 1=Mon -> 0, etc.)
  const diffToMonday = (firstJsDay === 0 ? -6 : 1) - firstJsDay;
  let monday = new Date(year, monthIndex - 1, 1 + diffToMonday);

  let weekIndex = 1;

  while (true) {
    const thursday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

    const thursdayMonth = thursday.getMonth();
    const thursdayYear = thursday.getFullYear();

    // Check if the majority of this week (Thursday) belongs to this month
    if (thursdayYear === year && thursdayMonth === (monthIndex - 1)) {
      const monShort = MONTH_NAMES_SHORT[monday.getMonth()];
      const sunShort = MONTH_NAMES_SHORT[sunday.getMonth()];
      const monDay = monday.getDate();
      const sunDay = sunday.getDate();

      const startStr = `${monShort} ${monDay}`;
      const endStr = `${sunShort} ${sunDay}`;
      const shortRange =
        monShort === sunShort ? `${monShort} ${monDay} – ${sunDay}` : `${startStr} – ${endStr}`;

      const daysInfo = {} as Record<DayKey, DayDateInfo>;
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const isCur = d.getMonth() === (monthIndex - 1) && d.getFullYear() === year;
        daysInfo[DAY_KEYS[i]] = {
          dayNumber: d.getDate(),
          monthShort: MONTH_NAMES_SHORT[d.getMonth()],
          formatted: `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`,
          isCurrentMonth: isCur,
        };
      }

      weeks.push({
        weekIndex,
        startDay: monDay,
        endDay: sunDay,
        label: `Week ${weekIndex} (${shortRange})`,
        shortLabel: shortRange,
        dateRange: `${shortRange}, ${thursdayYear}`,
        days: daysInfo,
      });

      weekIndex++;
    } else if (
      thursdayYear > year ||
      (thursdayYear === year && thursdayMonth > (monthIndex - 1))
    ) {
      // Past all weeks assigned to this month
      break;
    }

    // Move to next Monday
    monday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  }

  return weeks;
}

/**
 * Returns a rolling 4-year window centered around the current calendar year.
 * For example, if current year is 2026 -> [2025, 2026, 2027, 2028].
 * When 2029 arrives -> [2028, 2029, 2030, 2031].
 * Older years automatically roll into the safe historical archive.
 */
export function getRollingYears(baseYear: number = new Date().getFullYear()): number[] {
  return [baseYear - 1, baseYear, baseYear + 1, baseYear + 2];
}

export function createDefaultQuarterPlans(area: LifeArea): Record<1 | 2 | 3 | 4, QuarterPlan> {
  const isPersonalGrowth = area === 'Personal growth';
  return {
    1: {
      quarter: 1,
      theme: isPersonalGrowth ? 'Mindset & Daily Habits' : 'Foundation & Setup',
      month1: [
        { id: 'q1m1_1', text: isPersonalGrowth ? 'Establish 20-min morning reading' : '', completed: isPersonalGrowth },
        { id: 'q1m1_2', text: isPersonalGrowth ? 'Select and acquire first 3 books' : '', completed: false },
        { id: 'q1m1_3', text: '', completed: false },
      ],
      month2: [
        { id: 'q1m2_1', text: isPersonalGrowth ? 'Finish Book #1 and write key takeaways' : '', completed: false },
        { id: 'q1m2_2', text: '', completed: false },
        { id: 'q1m2_3', text: '', completed: false },
      ],
      month3: [
        { id: 'q1m3_1', text: isPersonalGrowth ? 'Finish Book #2 and review Q1 reading pace' : '', completed: false },
        { id: 'q1m3_2', text: '', completed: false },
        { id: 'q1m3_3', text: '', completed: false },
      ],
    },
    2: {
      quarter: 2,
      theme: isPersonalGrowth ? 'Expansion & Application' : 'Momentum & Growth',
      month1: [
        { id: 'q2m1_1', text: '', completed: false },
        { id: 'q2m1_2', text: '', completed: false },
        { id: 'q2m1_3', text: '', completed: false },
      ],
      month2: [
        { id: 'q2m2_1', text: '', completed: false },
        { id: 'q2m2_2', text: '', completed: false },
        { id: 'q2m2_3', text: '', completed: false },
      ],
      month3: [
        { id: 'q2m3_1', text: '', completed: false },
        { id: 'q2m3_2', text: '', completed: false },
        { id: 'q2m3_3', text: '', completed: false },
      ],
    },
    3: {
      quarter: 3,
      theme: 'Deep Work & Consistency',
      month1: [
        { id: 'q3m1_1', text: '', completed: false },
        { id: 'q3m1_2', text: '', completed: false },
        { id: 'q3m1_3', text: '', completed: false },
      ],
      month2: [
        { id: 'q3m2_1', text: '', completed: false },
        { id: 'q3m2_2', text: '', completed: false },
        { id: 'q3m2_3', text: '', completed: false },
      ],
      month3: [
        { id: 'q3m3_1', text: '', completed: false },
        { id: 'q3m3_2', text: '', completed: false },
        { id: 'q3m3_3', text: '', completed: false },
      ],
    },
    4: {
      quarter: 4,
      theme: 'Harvest & Annual Review',
      month1: [
        { id: 'q4m1_1', text: '', completed: false },
        { id: 'q4m1_2', text: '', completed: false },
        { id: 'q4m1_3', text: '', completed: false },
      ],
      month2: [
        { id: 'q4m2_1', text: '', completed: false },
        { id: 'q4m2_2', text: '', completed: false },
        { id: 'q4m2_3', text: '', completed: false },
      ],
      month3: [
        { id: 'q4m3_1', text: '', completed: false },
        { id: 'q4m3_2', text: '', completed: false },
        { id: 'q4m3_3', text: '', completed: false },
      ],
    },
  };
}

export function createDefaultWeekPlan(year: number, monthIndex: number, weekIndex: number): WeekPlan {
  const weeksInfo = getWeeksForMonth(year, monthIndex);
  const info = weeksInfo.find((w) => w.weekIndex === weekIndex) || weeksInfo[0];
  return {
    weekIndex,
    weekOf: info ? info.dateRange : `Week ${weekIndex}`,
    topPriorities: [
      { id: `w${weekIndex}_p1`, text: weekIndex === 1 ? 'Establish weekly schedule & block morning time' : '', completed: false },
      { id: `w${weekIndex}_p2`, text: weekIndex === 1 ? 'Review goal milestones for this month' : '', completed: false },
      { id: `w${weekIndex}_p3`, text: '', completed: false },
    ],
    days: {
      monday: weekIndex === 1 ? 'Kickoff weekly focus & plan key milestones' : '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: weekIndex === 1 ? 'Weekly reflection & review upcoming week' : '',
    },
    carryForward: '',
  };
}

export function createDefaultWeeks(
  year: number = new Date().getFullYear(),
  monthIndex: number = 1
): Record<number, WeekPlan> {
  const weeksInfo = getWeeksForMonth(year, monthIndex);
  const weeks: Record<number, WeekPlan> = {};
  weeksInfo.forEach((info) => {
    weeks[info.weekIndex] = createDefaultWeekPlan(year, monthIndex, info.weekIndex);
  });
  return weeks;
}

export function createDefaultMonthPlans(
  area: LifeArea,
  year: number = new Date().getFullYear()
): Record<number, MonthPlan> {
  const monthPlans: Record<number, MonthPlan> = {};
  const isPersonalGrowth = area === 'Personal growth';

  for (let m = 1; m <= 12; m++) {
    monthPlans[m] = {
      monthIndex: m,
      monthName: MONTH_NAMES[m - 1],
      keyGoals: [
        {
          id: `m${m}_g1`,
          text: isPersonalGrowth && m === 1 ? 'Read 25 pages daily without distraction' : '',
          completed: false,
        },
        {
          id: `m${m}_g2`,
          text: isPersonalGrowth && m === 1 ? 'Journal 3 key insights at the end of each chapter' : '',
          completed: false,
        },
        { id: `m${m}_g3`, text: '', completed: false },
        { id: `m${m}_g4`, text: '', completed: false },
        { id: `m${m}_g5`, text: '', completed: false },
      ],
      todos: [
        {
          id: `m${m}_t1`,
          text: isPersonalGrowth && m === 1 ? 'Set up quiet reading corner in study' : '',
          completed: true,
        },
        { id: `m${m}_t2`, text: '', completed: false },
        { id: `m${m}_t3`, text: '', completed: false },
        { id: `m${m}_t4`, text: '', completed: false },
        { id: `m${m}_t5`, text: '', completed: false },
        { id: `m${m}_t6`, text: '', completed: false },
      ],
      notes: isPersonalGrowth && m === 1 ? 'Remember: Consistency in small daily habits compounds into remarkable transformation.' : '',
      review: {
        whatIAchieved: isPersonalGrowth && m === 1 ? 'Completed 1 full book and kept up consistent morning reading habits for 3 straight weeks.' : '',
        whatWasLeftUndone: '',
        whatGotInTheWay: '',
        carryForwardItems: [
          { id: `m${m}_cf1`, text: 'Carry forward remaining chapters of Book #2', completed: false },
        ],
        reflection: {
          oneWin: isPersonalGrowth && m === 1 ? 'Protecting 7:00 AM reading window every morning' : '',
          oneLesson: isPersonalGrowth && m === 1 ? 'Phone out of sight prevents attention fractures' : '',
          gratefulFor: isPersonalGrowth && m === 1 ? 'Quiet mornings and inspiring authors' : '',
        },
      },
      weeks: createDefaultWeeks(year, m),
    };
  }
  return monthPlans;
}

export function createDefaultGoalsForYear(year: number): Record<LifeArea, GoalEntry> {
  const goals = {} as Record<LifeArea, GoalEntry>;

  LIFE_AREAS.forEach((item, index) => {
    const isSampleTop = index < 3;
    goals[item.key] = {
      area: item.key,
      text: isSampleTop
        ? index === 0
          ? 'Read 12 transformative books and write monthly summaries'
          : index === 1
          ? 'Establish a daily 30-minute workout and prioritize 7.5 hours of sleep'
          : 'Dedicate 15 minutes each morning to quiet prayer and meditation'
        : '',
      priority: (isSampleTop ? index + 1 : 1) as 1 | 2 | 3,
      isTopThree: isSampleTop,
      whyItMatters: isSampleTop
        ? index === 0
          ? 'To sharpen my mind, expand my worldview, and cultivate lifelong learning.'
          : index === 1
          ? 'To have sustained energy for family, creative work, and vitality.'
          : 'To maintain inner peace and emotional grounding amidst busy seasons.'
        : '',
      milestones: {
        q1: isSampleTop ? 'Finish first 3 books and establish consistent routine' : '',
        q2: isSampleTop ? 'Read books 4-6; do mid-year checkin' : '',
        q3: isSampleTop ? 'Read books 7-9; join local book discussion circle' : '',
        q4: isSampleTop ? 'Read books 10-12; compile top takeaways into personal playbook' : '',
      },
      supportNeeded: isSampleTop ? 'Accountability partner, quiet reading nook at home, library card' : '',
      quarterPlans: createDefaultQuarterPlans(item.key),
      monthPlans: createDefaultMonthPlans(item.key, year),
    };
  });

  return goals;
}

export function createEmptyGoalEntry(area: string, year: number, isCustom: boolean = true): GoalEntry {
  return {
    area: area as LifeArea,
    text: '',
    priority: 2,
    isTopThree: false,
    whyItMatters: '',
    milestones: { q1: '', q2: '', q3: '', q4: '' },
    supportNeeded: '',
    isCustom,
    quarterPlans: createDefaultQuarterPlans(area as LifeArea),
    monthPlans: createDefaultMonthPlans(area as LifeArea, year),
  };
}

export function getActiveGoalAreas(state: JournalState): {
  key: string;
  label: string;
  icon: string;
  defaultPlaceholder: string;
  isCustom: boolean;
}[] {
  if (!state || !state.goals) return LIFE_AREAS.map(a => ({ ...a, isCustom: false }));
  const keys = Object.keys(state.goals);
  return keys.map((key) => {
    const predefined = LIFE_AREAS.find((a) => a.key === key);
    if (predefined) {
      return { ...predefined, isCustom: false };
    }
    return {
      key,
      label: key,
      icon: 'Target',
      defaultPlaceholder: `e.g. Primary milestone and focus for ${key}...`,
      isCustom: true,
    };
  });
}

export function addCustomGoal(
  state: JournalState,
  areaName: string,
  goalText: string = '',
  priority: 1 | 2 | 3 = 2
): JournalState {
  const cleanName = areaName.trim();
  if (!cleanName) return state;

  const currentGoals = { ...state.goals };
  const customAreas = Array.from(new Set([...(state.customAreas || []), cleanName]));

  const newGoal: GoalEntry = {
    ...createEmptyGoalEntry(cleanName, state.year, true),
    text: goalText.trim(),
    priority,
    isTopThree: priority === 1,
  };

  currentGoals[cleanName] = newGoal;

  const yearsData = { ...(state.yearsData || {}) };
  if (yearsData[state.year]) {
    yearsData[state.year] = {
      ...yearsData[state.year],
      [cleanName]: newGoal,
    };
  } else {
    yearsData[state.year] = currentGoals;
  }

  return {
    ...state,
    goals: currentGoals,
    customAreas,
    yearsData,
  };
}

export function deleteGoal(state: JournalState, areaName: string): JournalState {
  const currentGoals = { ...state.goals };
  delete currentGoals[areaName];

  const customAreas = (state.customAreas || []).filter((a) => a !== areaName);

  const yearsData = { ...(state.yearsData || {}) };
  if (yearsData[state.year]) {
    const yrGoals = { ...yearsData[state.year] };
    delete yrGoals[areaName];
    yearsData[state.year] = yrGoals;
  }

  return {
    ...state,
    goals: currentGoals,
    customAreas,
    yearsData,
  };
}

export function createInitialJournalState(year: number = new Date().getFullYear()): JournalState {
  const defaultGoals = createDefaultGoalsForYear(year);
  return {
    year,
    goals: defaultGoals,
    yearsData: {
      [year]: defaultGoals,
    },
  };
}

export async function loadJournalState(): Promise<JournalState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const activeYear = parsed.year || new Date().getFullYear();
      const yearsData = parsed.yearsData || { [activeYear]: parsed.goals };

      // Ensure active year goals exist
      const goals = yearsData[activeYear] || createDefaultGoalsForYear(activeYear);
      yearsData[activeYear] = goals;

      return {
        year: activeYear,
        goals,
        customAreas: parsed.customAreas || Object.keys(goals).filter((k) => !LIFE_AREAS.some((a) => a.key === k)),
        yearsData,
      };
    }
  } catch (err) {
    console.warn('Failed to load journal state from storage:', err);
  }
  const defaultState = createInitialJournalState();
  await saveJournalState(defaultState);
  return defaultState;
}

export async function saveJournalState(state: JournalState): Promise<void> {
  try {
    // Keep yearsData synchronized with current year goals
    const updatedYearsData = {
      ...(state.yearsData || {}),
      [state.year]: state.goals,
    };
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        yearsData: updatedYearsData,
      })
    );
  } catch (err) {
    console.error('Failed to save journal state:', err);
  }
}

export async function clearLocalJournalStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local journal storage:', err);
  }
}

export async function resetJournalState(): Promise<JournalState> {
  const fresh = createInitialJournalState();
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset journal state in storage:', err);
  }
  return fresh;
}

/**
 * Switch active journal year, preserving previous year data into yearsData.
 * Automatically initializes the target year if it's the first time visiting.
 */
export function switchJournalYear(state: JournalState, targetYear: number): JournalState {
  const updatedYearsData = {
    ...(state.yearsData || {}),
    [state.year]: state.goals,
  };

  const targetGoals = updatedYearsData[targetYear] || createDefaultGoalsForYear(targetYear);
  updatedYearsData[targetYear] = targetGoals;

  return {
    year: targetYear,
    goals: targetGoals,
    yearsData: updatedYearsData,
  };
}

// ----------------- Strongly-Typed Updaters -----------------

export function updateGoal(
  state: JournalState,
  area: LifeArea,
  updates: Partial<Omit<GoalEntry, 'quarterPlans' | 'monthPlans'>>
): JournalState {
  const goal = state.goals[area];
  if (!goal) return state;
  const updatedGoals = {
    ...state.goals,
    [area]: {
      ...goal,
      ...updates,
    },
  };
  return {
    ...state,
    goals: updatedGoals,
    yearsData: {
      ...(state.yearsData || {}),
      [state.year]: updatedGoals,
    },
  };
}

export function updateGoalQuarter(
  state: JournalState,
  area: LifeArea,
  quarter: 1 | 2 | 3 | 4,
  updates: Partial<QuarterPlan>
): JournalState {
  const goal = state.goals[area];
  if (!goal) return state;
  const qPlan = goal.quarterPlans[quarter];
  const updatedGoals = {
    ...state.goals,
    [area]: {
      ...goal,
      quarterPlans: {
        ...goal.quarterPlans,
        [quarter]: {
          ...qPlan,
          ...updates,
        },
      },
    },
  };
  return {
    ...state,
    goals: updatedGoals,
    yearsData: {
      ...(state.yearsData || {}),
      [state.year]: updatedGoals,
    },
  };
}

export function updateGoalMonth(
  state: JournalState,
  area: LifeArea,
  monthIndex: number,
  updates: Partial<Omit<MonthPlan, 'review' | 'weeks'>>
): JournalState {
  const goal = state.goals[area];
  if (!goal) return state;
  const mPlan = goal.monthPlans[monthIndex];
  const updatedGoals = {
    ...state.goals,
    [area]: {
      ...goal,
      monthPlans: {
        ...goal.monthPlans,
        [monthIndex]: {
          ...mPlan,
          ...updates,
        },
      },
    },
  };
  return {
    ...state,
    goals: updatedGoals,
    yearsData: {
      ...(state.yearsData || {}),
      [state.year]: updatedGoals,
    },
  };
}

export function updateGoalMonthReview(
  state: JournalState,
  area: LifeArea,
  monthIndex: number,
  updates: Partial<MonthReview>
): JournalState {
  const goal = state.goals[area];
  if (!goal) return state;
  const mPlan = goal.monthPlans[monthIndex];
  const updatedGoals = {
    ...state.goals,
    [area]: {
      ...goal,
      monthPlans: {
        ...goal.monthPlans,
        [monthIndex]: {
          ...mPlan,
          review: {
            ...mPlan.review,
            ...updates,
          },
        },
      },
    },
  };
  return {
    ...state,
    goals: updatedGoals,
    yearsData: {
      ...(state.yearsData || {}),
      [state.year]: updatedGoals,
    },
  };
}

export function updateGoalWeek(
  state: JournalState,
  area: LifeArea,
  monthIndex: number,
  weekIndex: number,
  updates: Partial<WeekPlan>
): JournalState {
  const goal = state.goals[area];
  if (!goal) return state;
  const mPlan = goal.monthPlans[monthIndex];
  if (!mPlan) return state;
  const defaultWeek = createDefaultWeekPlan(state.year, monthIndex, weekIndex);
  const wPlan = mPlan.weeks?.[weekIndex] || defaultWeek;
  const updatedGoals = {
    ...state.goals,
    [area]: {
      ...goal,
      monthPlans: {
        ...goal.monthPlans,
        [monthIndex]: {
          ...mPlan,
          weeks: {
            ...(mPlan.weeks || {}),
            [weekIndex]: {
              ...wPlan,
              ...updates,
            },
          },
        },
      },
    },
  };
  return {
    ...state,
    goals: updatedGoals,
    yearsData: {
      ...(state.yearsData || {}),
      [state.year]: updatedGoals,
    },
  };
}
