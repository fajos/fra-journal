import AsyncStorage from '@react-native-async-storage/async-storage';
import { LifeArea, GoalEntry, CheckItem } from '../types/journal';
import { getServerUrl } from './cloudSyncService';

const AI_API_KEY_STORAGE = '@ejournal_ai_key';
const AI_PROVIDER_STORAGE = '@ejournal_ai_provider';

export interface DecomposedPlan {
  whyItMatters: string;
  supportNeeded: string;
  milestones: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  quarterPlans: {
    1: { theme: string; month1: string[]; month2: string[]; month3: string[] };
    2: { theme: string; month1: string[]; month2: string[]; month3: string[] };
    3: { theme: string; month1: string[]; month2: string[]; month3: string[] };
    4: { theme: string; month1: string[]; month2: string[]; month3: string[] };
  };
  monthPlans: Record<
    number,
    {
      keyGoals: string[];
      todos: string[];
      notes: string;
    }
  >;
  sampleWeek: {
    topPriorities: string[];
    days: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    carryForward: string;
  };
  source: 'deepseek' | 'openai' | 'smart-engine';
}

export async function getSavedAiApiKey(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(AI_API_KEY_STORAGE)) || '';
  } catch {
    return '';
  }
}

export async function setSavedAiApiKey(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_API_KEY_STORAGE, key.trim());
  } catch (err) {
    console.error('Error saving AI key:', err);
  }
}

export async function getSavedAiProvider(): Promise<'smart-engine' | 'deepseek' | 'openai'> {
  try {
    const prov = await AsyncStorage.getItem(AI_PROVIDER_STORAGE);
    return (prov as any) || 'smart-engine';
  } catch {
    return 'smart-engine';
  }
}

export async function setSavedAiProvider(prov: 'smart-engine' | 'deepseek' | 'openai'): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_PROVIDER_STORAGE, prov);
  } catch (err) {
    console.error('Error saving AI provider:', err);
  }
}

/**
 * Intelligent Decomposition Engine:
 * 1. Calls web backend API if online (supports DeepSeek / OpenAI / server keys).
 * 2. If offline or backend unreachable, executes built-in smart domain heuristics.
 */
export async function decomposeGoal(
  area: LifeArea,
  goalText: string,
  year: number = 2026
): Promise<DecomposedPlan> {
  const cleanGoal = goalText.trim() || `Excel in ${area}`;
  const customKey = await getSavedAiApiKey();
  const provider = await getSavedAiProvider();

  // Try calling backend API
  try {
    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/ai-decompose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area,
        goalText: cleanGoal,
        year,
        customApiKey: customKey || undefined,
        provider: provider === 'smart-engine' ? undefined : provider,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.plan && data.plan.milestones) {
        return data.plan;
      }
    }
  } catch {
    // Fall back to local heuristics
  }

  return generateLocalSmartDecomposition(area, cleanGoal, year);
}

function generateLocalSmartDecomposition(
  area: LifeArea,
  cleanGoal: string,
  year: number
): DecomposedPlan {
  const areaProfiles: Record<LifeArea, { why: string; support: string; q1Theme: string; q2Theme: string; q3Theme: string; q4Theme: string }> = {
    'Personal growth': {
      why: `Achieving "${cleanGoal}" elevates mental clarity, discipline, and opens transformative opportunities in ${year}.`,
      support: 'Reading list, journal, morning focus routine, mentor/accountability partner.',
      q1Theme: 'Keystone Habits & Knowledge Foundation',
      q2Theme: 'Deliberate Practice & Skill Deepening',
      q3Theme: 'Output, Execution & Mid-Year Polish',
      q4Theme: 'Mastery & Retrospective Review',
    },
    'Health and wellbeing': {
      why: `Succeeding in "${cleanGoal}" fuels physical energy, resilience, and vitality across all seasons in ${year}.`,
      support: 'Hydration bottle, workout schedule, sleep tracker, whole-food nutrition.',
      q1Theme: 'Base Conditioning & Sleep Hygiene',
      q2Theme: 'Strength/Endurance Progression',
      q3Theme: 'Consistency & Metric Benchmarks',
      q4Theme: 'Peak Fitness & Sustainable Lifestyle',
    },
    'Spiritual life': {
      why: `Pursuing "${cleanGoal}" centers the soul, deepens faith, and clarifies divine direction for ${year}.`,
      support: 'Daily scripture/devotional, morning prayer closet, fellowship group.',
      q1Theme: 'Sacred Rhythm & Morning Stillness',
      q2Theme: 'Scripture Immersion & Spiritual Discipline',
      q3Theme: 'Faith in Action & Community Service',
      q4Theme: 'Gratitude Overflow & Vision Renewal',
    },
    'Career or business': {
      why: `Delivering on "${cleanGoal}" creates commercial value, professional mastery, and economic expansion in ${year}.`,
      support: 'Task board, industry network, professional coach, weekly metrics audit.',
      q1Theme: 'Strategic Alignment & Quick High-Impact Wins',
      q2Theme: 'Aggressive Execution & Market Acquisition',
      q3Theme: 'Systemization & Operational Scaling',
      q4Theme: 'Revenue Finish & Next-Year Roadmap',
    },
    'Financial': {
      why: `Reaching "${cleanGoal}" unlocks peace of mind, eliminates stress, and builds wealth in ${year}.`,
      support: 'Automated savings transfers, budget tool, investing guide, low-friction accounts.',
      q1Theme: 'Cashflow Audit & Automated Savings',
      q2Theme: 'Income Expansion & Asset Allocation',
      q3Theme: 'Debt Reduction & Surplus Sweep',
      q4Theme: 'Year-End Optimization & Reinvestment',
    },
    'Family and relationships': {
      why: `Protecting and nurturing "${cleanGoal}" strengthens trust, presence, and lasting love in ${year}.`,
      support: 'Weekly date night / family night, shared calendar, phone-free dinners.',
      q1Theme: 'Reconnection & Quality Attention',
      q2Theme: 'Shared Experiences & Family Trips',
      q3Theme: 'Deep Listening & Boundary Respect',
      q4Theme: 'Holiday Joy & Gratitude Celebration',
    },
    'Community and impact': {
      why: `Serving through "${cleanGoal}" blesses others, drives justice, and leaves a meaningful legacy in ${year}.`,
      support: 'Community organization, volunteering calendar, mentor network.',
      q1Theme: 'Identify Needs & First Volunteer Shift',
      q2Theme: 'Mentorship & Active Grassroots Impact',
      q3Theme: 'Resource Mobilization & Group Action',
      q4Theme: 'Impact Celebration & Advocacy',
    },
    'Rest and joy': {
      why: `Prioritizing "${cleanGoal}" prevents burnout, restores creativity, and keeps life joyful in ${year}.`,
      support: 'Non-negotiable Sabbath, leisure books, outdoor adventures, creative hobby.',
      q1Theme: 'Rest Sanctuary & Digital Detoxing',
      q2Theme: 'Micro-Adventures & Creative Hobbies',
      q3Theme: 'Vacation Retreat & Nature Immersion',
      q4Theme: 'Restorative Recharge & Celebration',
    },
  };

  const p = areaProfiles[area] || areaProfiles['Personal growth'];

  const monthPlans: Record<number, { keyGoals: string[]; todos: string[]; notes: string }> = {};
  for (let m = 1; m <= 12; m++) {
    monthPlans[m] = {
      keyGoals: [
        `Month ${m} strategic target for "${cleanGoal.substring(0, 40)}"`,
        'Maintain 80%+ daily habit consistency',
        'Complete end-of-month progress review',
      ],
      todos: [
        'Audit monthly sprint on the 1st',
        'Execute core deliverables in week 2 & 3',
        'Document key learnings',
      ],
      notes: `Focus on progressive consistency for Quarter ${Math.ceil(m / 3)}.`,
    };
  }

  return {
    whyItMatters: p.why,
    supportNeeded: p.support,
    milestones: {
      q1: `Build foundation and achieve milestone 1 for "${cleanGoal.substring(0, 35)}" by March 31.`,
      q2: `Accelerate progress and reach 50% target by June 30.`,
      q3: `Refine systems and hit 75% target by September 30.`,
      q4: `Complete full breakthrough for "${cleanGoal.substring(0, 35)}" by December 31.`,
    },
    quarterPlans: {
      1: {
        theme: p.q1Theme,
        month1: [`Set up tracking systems for ${cleanGoal}`, 'Audit current baseline', 'Establish daily 20-min block'],
        month2: ['Increase consistency to 5 days/week', 'Eliminate top friction point', 'Check velocity'],
        month3: ['Complete Q1 milestone review', 'Adjust cadence for spring', 'Celebrate wins'],
      },
      2: {
        theme: p.q2Theme,
        month1: ['Launch phase 2 core deliverables', 'Weekly accountability check', 'Deepen practice'],
        month2: ['Overcome plateaus with mentor feedback', 'Refine weekly plan', 'Push limits'],
        month3: ['Mid-year halfway evaluation', 'Time audit', 'Consolidate gains'],
      },
      3: {
        theme: p.q3Theme,
        month1: ['Re-energize focus post-summer', 'Increase execution tempo', 'Track key metrics'],
        month2: ['Tackle toughest obstacle head on', 'Double down on high ROI activities', 'Clear distractions'],
        month3: ['Q3 sprint finish push', 'Document lessons learned', 'Prepare final quarter plan'],
      },
      4: {
        theme: p.q4Theme,
        month1: ['Begin 90-day final sprint', 'Lock in daily non-negotiables', 'Optimize environment'],
        month2: ['Surpass 90% completion mark', 'Finalize core deliverable', 'Express gratitude'],
        month3: ['Full annual review of goal', 'Celebrate complete victory in ' + year, 'Draft vision for next year'],
      },
    },
    monthPlans,
    sampleWeek: {
      topPriorities: [
        `Execute primary step for "${cleanGoal.substring(0, 35)}"`,
        'Maintain daily habit tracking Monday through Sunday',
        'Conduct Sunday reflection and plan next week',
      ],
      days: {
        monday: 'Set weekly intention & complete initial deep work sprint',
        tuesday: 'Focus on primary tactical milestone',
        wednesday: 'Midweek check-in & friction removal',
        thursday: 'Consistent execution block',
        friday: 'Review weekly progress & organize deliverables',
        saturday: 'Active joy, lighter tasks & personal recharge',
        sunday: 'Sunday Reset: review past 7 days, plan upcoming week',
      },
      carryForward: 'Consistency compounds exponentially over 52 weeks.',
    },
    source: 'smart-engine',
  };
}

/**
 * Merges a generated decomposition plan cleanly into an existing GoalEntry,
 * leaving personal reviews intact.
 */
export function applyDecompositionToGoal(goal: GoalEntry, plan: DecomposedPlan): GoalEntry {
  const updated: GoalEntry = {
    ...goal,
    whyItMatters: plan.whyItMatters || goal.whyItMatters,
    supportNeeded: plan.supportNeeded || goal.supportNeeded,
    milestones: {
      q1: plan.milestones?.q1 || goal.milestones.q1,
      q2: plan.milestones?.q2 || goal.milestones.q2,
      q3: plan.milestones?.q3 || goal.milestones.q3,
      q4: plan.milestones?.q4 || goal.milestones.q4,
    },
    quarterPlans: { ...goal.quarterPlans },
    monthPlans: { ...goal.monthPlans },
  };

  // Quarters
  if (plan.quarterPlans) {
    for (const q of [1, 2, 3, 4] as const) {
      const qp = plan.quarterPlans[q];
      if (qp) {
        updated.quarterPlans[q] = {
          quarter: q,
          theme: qp.theme || updated.quarterPlans[q]?.theme || '',
          month1: (qp.month1 || []).map((t, i) => ({ id: `m1-${i}`, text: t, completed: false })),
          month2: (qp.month2 || []).map((t, i) => ({ id: `m2-${i}`, text: t, completed: false })),
          month3: (qp.month3 || []).map((t, i) => ({ id: `m3-${i}`, text: t, completed: false })),
        };
      }
    }
  }

  // Months
  if (plan.monthPlans) {
    for (let m = 1; m <= 12; m++) {
      const mp = plan.monthPlans[m];
      if (mp && updated.monthPlans[m]) {
        updated.monthPlans[m] = {
          ...updated.monthPlans[m],
          keyGoals: (mp.keyGoals || []).map((t, i) => ({ id: `kg-${m}-${i}`, text: t, completed: false })),
          todos: (mp.todos || []).map((t, i) => ({ id: `td-${m}-${i}`, text: t, completed: false })),
          notes: mp.notes || updated.monthPlans[m].notes || '',
        };
      }
    }
  }

  // Week 1 of Month 1
  if (plan.sampleWeek && updated.monthPlans[1]?.weeks?.[1]) {
    updated.monthPlans[1].weeks[1] = {
      ...updated.monthPlans[1].weeks[1],
      topPriorities: (plan.sampleWeek.topPriorities || []).map((t, i) => ({ id: `wp-${i}`, text: t, completed: false })),
      days: {
        ...updated.monthPlans[1].weeks[1].days,
        ...plan.sampleWeek.days,
      },
      carryForward: plan.sampleWeek.carryForward || '',
    };
  }

  return updated;
}
