import AsyncStorage from '@react-native-async-storage/async-storage';
import { LifeArea, GoalEntry, CheckItem } from '../types/journal';
import { getServerUrl } from './cloudSyncService';
import { MONTH_NAMES, getWeeksForMonth } from '../storage/journalStorage';

export interface DecomposedWeek {
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
}

export interface DecomposedMonth {
  keyGoals: string[];
  todos: string[];
  notes: string;
  weeks?: Record<number, DecomposedWeek>;
}

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
  monthPlans: Record<number, DecomposedMonth>;
  sampleWeek?: DecomposedWeek;
  source: 'deepseek' | 'openai' | 'smart-engine';
}

/**
 * Synthesizes actionable weekly schedules for the exact calendar weeks (4 or 5 weeks)
 * of any given month based on ISO-8601 calendar logic, the month's specific goals,
 * quarterly phase, and life area habits.
 */
export function generateWeeklyPlansForMonth(
  cleanGoal: string,
  monthIndex: number,
  monthName: string,
  quarterIndex: number,
  keyGoals: string[],
  todos: string[],
  habits: string[],
  initialSampleWeek?: DecomposedWeek,
  targetYear: number = 2026
): Record<number, DecomposedWeek> {
  const weeks: Record<number, DecomposedWeek> = {};
  const monthWeeks = getWeeksForMonth(targetYear, monthIndex);
  const totalWeeks = monthWeeks.length; // Exactly 4 or 5 weeks for this month

  const g0 = keyGoals[0] || `Advance ${cleanGoal}`;
  const g1 = keyGoals[1] || `Maintain 80%+ consistency on daily keystone habit`;
  const g2 = keyGoals[2] || `Deliver Quarter ${quarterIndex} milestone targets`;

  const t0 = todos[0] || `Audit monthly baseline & establish weekly schedule`;
  const t1 = todos[1] || `Execute primary tactical sprint`;
  const t2 = todos[2] || `Prepare monthly reflection & retrospective`;

  const h0 = habits[0] || 'Review priorities & execute keystone habit';
  const h1 = habits[1] || 'Dedicated deep focus session';
  const h2 = habits[2] || 'Habit check & metric tracking';
  const h3 = habits[3] || 'Rest, active joy & weekly reflection';

  for (let w = 1; w <= totalWeeks; w++) {
    // If Month 1, Week 1 and sampleWeek was provided, preserve sampleWeek
    if (monthIndex === 1 && w === 1 && initialSampleWeek) {
      weeks[1] = initialSampleWeek;
      continue;
    }

    if (w === 1) {
      weeks[1] = {
        topPriorities: [
          `Kick off ${monthName} milestone: ${g0}`,
          `Execute setup task: ${t0}`,
          `Lock in keystone daily habit: ${h0}`,
        ],
        days: {
          monday: `Kick off ${monthName}: establish intention for "${cleanGoal.substring(0, 36)}"`,
          tuesday: `Focused session: ${h0} and foundational setup`,
          wednesday: `Midweek calibration: ensure solid momentum on "${t0.substring(0, 35)}"`,
          thursday: `Overcome friction: ${h1} with zero distractions`,
          friday: `Wrap up Week 1 deliverables; evaluate initial output`,
          saturday: `Active joy & restorative downtime: ${h3}`,
          sunday: `Sunday Reset: review Week 1 wins, plan priorities for Week 2`,
        },
        carryForward: `Strong opening in ${monthName}. Early consistency builds compounding momentum.`,
      };
    } else if (w === 2) {
      weeks[2] = {
        topPriorities: [
          `Core execution sprint: ${g1}`,
          `Advance tactical deliverable: ${t1}`,
          `Sustain high consistency on ${h1}`,
        ],
        days: {
          monday: `Sprint kickoff: tackle top priority first for "${g1.substring(0, 35)}"`,
          tuesday: `Deep execution block: dedicated to ${h1}`,
          wednesday: `Mid-sprint check: review tracking metrics & KPIs`,
          thursday: `High-impact action: push through "${t1.substring(0, 35)}"`,
          friday: `Consolidate sprint deliverables; tidy workspace & review wins`,
          saturday: `Personal enrichment, outdoor recreation, and creative downtime`,
          sunday: `Weekly review: evaluate sprint velocity, outline Week 3 focus`,
        },
        carryForward: `Execution rhythm is steady. Maintain consistency into the next phase.`,
      };
    } else if (w === 3) {
      weeks[3] = {
        topPriorities: [
          `Target breakthrough on ${g2}`,
          `Resolve primary bottleneck or friction point`,
          `Mid-month calibration against Quarter ${quarterIndex} targets`,
        ],
        days: {
          monday: `Mid-month recommitment: assess progress against monthly targets`,
          tuesday: `High-leverage focus session: ${h2}`,
          wednesday: `Accountability check: audit habit consistency and address friction`,
          thursday: `Breakthrough sprint: push through resistance on challenging tasks`,
          friday: `Consolidate Week 3 victories; document key insights and wins`,
          saturday: `Rest, family connection, and physical/mental recharge`,
          sunday: `Sunday review: prepare for next week in ${monthName}`,
        },
        carryForward: `Plateaus yield to persistence. Approaching the finish line of ${monthName}.`,
      };
    } else if (w === totalWeeks) {
      // Final closing week for this month
      weeks[w] = {
        topPriorities: [
          `Finalize and deliver Month ${monthIndex} key goal: "${g0}"`,
          `Complete final monthly review tasks: ${t2}`,
          `Conduct Month in Review reflection & celebrate achievements`,
        ],
        days: {
          monday: `Closing sprint kickoff: line up all remaining deliverables for ${monthName}`,
          tuesday: `Deep closing block: finalize critical action items`,
          wednesday: `Milestone verification: measure tangible results against Q${quarterIndex}`,
          thursday: `Wrap up remaining todos and document key learnings`,
          friday: `Monthly celebration: acknowledge progress, celebrate top win`,
          saturday: `Celebration, gratitude, and unplugged restoration`,
          sunday: `Complete Month in Review: record one win, one lesson, and grateful moments`,
        },
        carryForward: `Outstanding dedication in ${monthName}. Carry forward these habits and wins into next month.`,
      };
    } else {
      // Week 4 of a 5-week month
      weeks[4] = {
        topPriorities: [
          `Accelerate momentum on ${g1}`,
          `Refine and optimize execution workflows`,
          `Pre-close key deliverables before final week wrap-up`,
        ],
        days: {
          monday: `Week 4 acceleration: streamline tasks and remove roadblocks`,
          tuesday: `Execution focus: high-output sprint block`,
          wednesday: `Midweek quality review: verify progress and deliverables`,
          thursday: `Push through remaining resistance on challenging tasks`,
          friday: `Review week 4 progress; celebrate consistency wins`,
          saturday: `Restorative rest, exercise, and mental rejuvenation`,
          sunday: `Weekly reset: prepare for final closing week of ${monthName}`,
        },
        carryForward: `Strong consistency through week 4. Position yourself for a triumphant monthly finish.`,
      };
    }
  }

  return weeks;
}

export async function decomposeGoal(
  area: LifeArea,
  goalText: string,
  year: number = new Date().getFullYear()
): Promise<DecomposedPlan> {
  const cleanGoal = goalText.trim() || `Excel in ${area}`;

  // Try calling backend API where DEEPSEEK_API_KEY / OPENAI_API_KEY are configured in the environment
  try {
    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/ai-decompose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area,
        goalText: cleanGoal,
        year,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.plan && data.plan.milestones) {
        return data.plan;
      }
    }
  } catch {
    // Fall back to local heuristics if server is offline or unreachable
  }

  return generateLocalSmartDecomposition(area, cleanGoal, year);
}

function generateLocalSmartDecomposition(
  area: LifeArea,
  cleanGoal: string,
  year: number
): DecomposedPlan {
  const areaProfiles: Record<
    LifeArea,
    {
      why: string;
      support: string;
      q1Theme: string;
      q2Theme: string;
      q3Theme: string;
      q4Theme: string;
      habits: string[];
    }
  > = {
    'Personal growth': {
      why: `Achieving "${cleanGoal}" elevates mental clarity, discipline, and opens transformative opportunities in ${year}.`,
      support: 'Reading list, journal, morning focus routine, mentor/accountability partner.',
      q1Theme: 'Keystone Habits & Knowledge Foundation',
      q2Theme: 'Deliberate Practice & Skill Deepening',
      q3Theme: 'Output, Execution & Mid-Year Polish',
      q4Theme: 'Mastery & Retrospective Review',
      habits: ['Read 20 pages', 'Listen to educational podcast', 'Document 3 insights in journal', 'Reflect on weekly lesson'],
    },
    'Health and wellbeing': {
      why: `Succeeding in "${cleanGoal}" fuels physical energy, resilience, and vitality across all seasons in ${year}.`,
      support: 'Hydration bottle, workout schedule, sleep tracker, whole-food nutrition.',
      q1Theme: 'Base Conditioning & Sleep Hygiene',
      q2Theme: 'Strength/Endurance Progression',
      q3Theme: 'Consistency & Metric Benchmarks',
      q4Theme: 'Peak Fitness & Sustainable Lifestyle',
      habits: ['Drink 2.5L water', '45-min active workout or run', 'Prep nutrient-rich lunch', 'Lights out by 10:30 PM'],
    },
    'Spiritual life': {
      why: `Pursuing "${cleanGoal}" centers the soul, deepens faith, and clarifies divine direction for ${year}.`,
      support: 'Daily scripture/devotional, morning prayer closet, fellowship group.',
      q1Theme: 'Sacred Rhythm & Morning Stillness',
      q2Theme: 'Scripture Immersion & Spiritual Discipline',
      q3Theme: 'Faith in Action & Community Service',
      q4Theme: 'Gratitude Overflow & Vision Renewal',
      habits: ['15-min morning meditation & prayer', 'Read daily scripture chapter', 'Journal 3 blessings', 'Evening gratitude check'],
    },
    'Career or business': {
      why: `Delivering on "${cleanGoal}" creates commercial value, professional mastery, and economic expansion in ${year}.`,
      support: 'Task board, industry network, professional coach, weekly metrics audit.',
      q1Theme: 'Strategic Alignment & Quick High-Impact Wins',
      q2Theme: 'Aggressive Execution & Market Acquisition',
      q3Theme: 'Systemization & Operational Scaling',
      q4Theme: 'Revenue Finish & Next-Year Roadmap',
      habits: ['Complete high-priority frog task first', 'Send 3 outreach / networking emails', 'Review daily metrics & KPIs', 'Clean inbox and plan tomorrow'],
    },
    'Financial': {
      why: `Reaching "${cleanGoal}" unlocks peace of mind, eliminates stress, and builds wealth in ${year}.`,
      support: 'Automated savings transfers, budget tool, investing guide, low-friction accounts.',
      q1Theme: 'Cashflow Audit & Automated Savings',
      q2Theme: 'Income Expansion & Asset Allocation',
      q3Theme: 'Debt Reduction & Surplus Sweep',
      q4Theme: 'Year-End Optimization & Reinvestment',
      habits: ['Track every daily expense', 'Review daily balance & budget limits', 'Execute weekly savings sweep', 'Zero impulsive unbudgeted purchases'],
    },
    'Family and relationships': {
      why: `Protecting and nurturing "${cleanGoal}" strengthens trust, presence, and lasting love in ${year}.`,
      support: 'Weekly date night / family night, shared calendar, phone-free dinners.',
      q1Theme: 'Reconnection & Quality Attention',
      q2Theme: 'Shared Experiences & Family Trips',
      q3Theme: 'Deep Listening & Boundary Respect',
      q4Theme: 'Holiday Joy & Gratitude Celebration',
      habits: ['Unplug phone during dinner', 'Express genuine verbal appreciation', 'Call or message a loved one', 'Evening family check-in'],
    },
    'Community and impact': {
      why: `Serving through "${cleanGoal}" blesses others, drives justice, and leaves a meaningful legacy in ${year}.`,
      support: 'Community organization, volunteering calendar, mentor network.',
      q1Theme: 'Identify Needs & First Volunteer Shift',
      q2Theme: 'Mentorship & Active Grassroots Impact',
      q3Theme: 'Resource Mobilization & Group Action',
      q4Theme: 'Impact Celebration & Advocacy',
      habits: ['Perform 1 random act of kindness', 'Engage with community group', 'Share helpful knowledge or resources', 'Support a local cause'],
    },
    'Rest and joy': {
      why: `Prioritizing "${cleanGoal}" prevents burnout, restores creativity, and keeps life joyful in ${year}.`,
      support: 'Non-negotiable Sabbath, leisure books, outdoor adventures, creative hobby.',
      q1Theme: 'Rest Sanctuary & Digital Detoxing',
      q2Theme: 'Micro-Adventures & Creative Hobbies',
      q3Theme: 'Vacation Retreat & Nature Immersion',
      q4Theme: 'Restorative Recharge & Celebration',
      habits: ['1 hour of pure play or hobby', 'Evening stroll without headphones', 'Read uplifting fiction / art', 'Celebrate today\'s win'],
    },
  };

  const p = areaProfiles[area] || areaProfiles['Personal growth'];

  const sampleWeek: DecomposedWeek = {
    topPriorities: [
      `Execute primary step for "${cleanGoal.substring(0, 35)}"`,
      'Maintain daily habit tracking Monday through Sunday',
      'Conduct Sunday reflection and plan next week',
    ],
    days: {
      monday: `Set weekly intention & initiate: ${p.habits[0] || 'Review goals'}`,
      tuesday: `Focus on primary tactical milestone: ${p.habits[1] || 'Core practice'}`,
      wednesday: `Midweek check-in & friction removal: ${p.habits[2] || 'Track metrics'}`,
      thursday: `Consistent execution block: ${p.habits[0] || 'Deep session'}`,
      friday: `Review weekly progress & organize deliverables: ${p.habits[1] || 'Review wins'}`,
      saturday: `Active joy, lighter tasks & personal recharge: ${p.habits[3] || 'Rest & reflect'}`,
      sunday: 'Sunday Reset: review past 7 days, plan upcoming week',
    },
    carryForward: 'Consistency compounds exponentially over 52 weeks.',
  };

  const monthPlans: Record<number, DecomposedMonth> = {};
  for (let m = 1; m <= 12; m++) {
    const q = Math.ceil(m / 3);
    const monthName = MONTH_NAMES[m - 1];
    const keyGoals = [
      `Month ${m} strategic target for "${cleanGoal.substring(0, 40)}"`,
      'Maintain 80%+ daily habit consistency',
      `Complete Quarter ${q} milestone alignment`,
    ];
    const todos = [
      'Audit monthly sprint on the 1st',
      'Execute core deliverables in week 2 & 3',
      'Document key learnings',
    ];
    const weeks = generateWeeklyPlansForMonth(
      cleanGoal,
      m,
      monthName,
      q,
      keyGoals,
      todos,
      p.habits,
      m === 1 ? sampleWeek : undefined,
      year
    );

    monthPlans[m] = {
      keyGoals,
      todos,
      notes: `Focus on progressive consistency for Quarter ${q}.`,
      weeks,
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
    sampleWeek,
    source: 'smart-engine',
  };
}

/**
 * Merges a generated decomposition plan cleanly into an existing GoalEntry,
 * leaving personal reviews intact, and populating exact calendar weeks for all 12 months.
 */
export function applyDecompositionToGoal(
  goal: GoalEntry,
  plan: DecomposedPlan,
  year: number = 2026
): GoalEntry {
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

  // Months & Weeks (Exact calendar weeks for each month)
  if (plan.monthPlans) {
    for (let m = 1; m <= 12; m++) {
      const mp = plan.monthPlans[m];
      if (mp && updated.monthPlans[m]) {
        const monthWeeks = getWeeksForMonth(year, m);
        const populatedWeeks: Record<number, any> = {};

        monthWeeks.forEach((wInfo) => {
          const w = wInfo.weekIndex;
          const dw = mp.weeks?.[w];
          if (dw) {
            populatedWeeks[w] = {
              weekIndex: w,
              weekOf: `Week ${w} (${wInfo.shortLabel})`,
              topPriorities: (dw.topPriorities || []).map((t, i) => ({ id: `wp-${m}-${w}-${i}`, text: t, completed: false })),
              days: {
                monday: dw.days?.monday || '',
                tuesday: dw.days?.tuesday || '',
                wednesday: dw.days?.wednesday || '',
                thursday: dw.days?.thursday || '',
                friday: dw.days?.friday || '',
                saturday: dw.days?.saturday || '',
                sunday: dw.days?.sunday || '',
              },
              carryForward: dw.carryForward || '',
            };
          } else {
            populatedWeeks[w] = updated.monthPlans[m].weeks?.[w] || {
              weekIndex: w,
              weekOf: `Week ${w} (${wInfo.shortLabel})`,
              topPriorities: [],
              days: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' },
              carryForward: '',
            };
          }
        });

        updated.monthPlans[m] = {
          ...updated.monthPlans[m],
          keyGoals: (mp.keyGoals || []).map((t, i) => ({ id: `kg-${m}-${i}`, text: t, completed: false })),
          todos: (mp.todos || []).map((t, i) => ({ id: `td-${m}-${i}`, text: t, completed: false })),
          notes: mp.notes || updated.monthPlans[m].notes || '',
          weeks: populatedWeeks,
        };
      }
    }
  }

  // Week 1 of Month 1 override if sampleWeek specifically provided
  if (plan.sampleWeek && updated.monthPlans[1]?.weeks?.[1]) {
    updated.monthPlans[1].weeks[1] = {
      ...updated.monthPlans[1].weeks[1],
      topPriorities: (plan.sampleWeek.topPriorities || []).map((t, i) => ({ id: `wp-1-1-${i}`, text: t, completed: false })),
      days: {
        ...updated.monthPlans[1].weeks[1].days,
        ...plan.sampleWeek.days,
      },
      carryForward: plan.sampleWeek.carryForward || updated.monthPlans[1].weeks[1].carryForward || '',
    };
  }

  return updated;
}
