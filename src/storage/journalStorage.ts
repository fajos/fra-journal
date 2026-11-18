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
 * Calculates the exact weeks available for any month of any year,
 * adhering to the Monday-to-Sunday planner structure shown in the physical journal.
 * Handles 4-week months (e.g. Feb 2027), 5-week months, and 6-week months (e.g. Mar 2026, Aug 2026).
 */
export function getWeeksForMonth(year: number, monthIndex: number): MonthWeekInfo[] {
  const totalDays = new Date(year, monthIndex, 0).getDate();
  const weeks: MonthWeekInfo[] = [];
  let currentDay = 1;
  let weekIndex = 1;

  while (currentDay <= totalDays) {
    const curDate = new Date(year, monthIndex - 1, currentDay);
    const jsDay = curDate.getDay();
    const monBasedDay = jsDay === 0 ? 7 : jsDay; // 1=Mon..7=Sun
    const daysUntilSunday = 7 - monBasedDay;
    const endDay = Math.min(totalDays, currentDay + daysUntilSunday);

    const mShort = MONTH_NAMES_SHORT[monthIndex - 1];
    const startStr = `${mShort} ${currentDay}`;
    const endStr = `${mShort} ${endDay}`;

    // Monday date for full calendar week row
    const mondayOffset = 1 - monBasedDay;
    const mondayDate = new Date(year, monthIndex - 1, currentDay + mondayOffset);

    const daysInfo = {} as Record<DayKey, DayDateInfo>;
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
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
      startDay: currentDay,
      endDay,
      label: `Week ${weekIndex} (${startStr} - ${endStr})`,
      shortLabel: `${startStr} - ${endDay}`,
      dateRange: `${startStr} - ${endStr}, ${year}`,
      days: daysInfo,
    });

    currentDay = endDay + 1;
    weekIndex++;
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

export async function resetJournalState(): Promise<JournalState> {
  const fresh = createInitialJournalState();
  await saveJournalState(fresh);
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
