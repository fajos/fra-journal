import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { JournalState, LIFE_AREAS } from '../types/journal';
import { MONTH_NAMES } from '../storage/journalStorage';
import { JOURNAL_QUOTES } from '../constants/quotes';

export async function exportJournalToPDF(state: JournalState): Promise<string | null> {
  const htmlContent = generateJournalHTML(state);

  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
      return 'printed';
    }

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Reflective E-Journal ${state.year} Booklet`,
      });
    }

    return uri;
  } catch (err) {
    console.warn('Failed to export PDF:', err);
    return null;
  }
}

function generateJournalHTML(state: JournalState): string {
  const goalsList = LIFE_AREAS.map(({ key, label }) => {
    const goal = state.goals[key];
    return `
      <div class="goal-card ${goal.isTopThree ? 'top-three' : ''}">
        <div class="goal-header">
          <span class="goal-title">${label}</span>
          ${goal.isTopThree ? '<span class="badge">★ TOP 3</span>' : ''}
          <span class="priority">Priority: ${'●'.repeat(goal.priority)}${'○'.repeat(3 - goal.priority)}</span>
        </div>
        <p class="goal-text">${goal.text || '<em class="empty">No goal entered yet</em>'}</p>
        <div class="goal-meta">
          <strong>Why it matters:</strong> ${goal.whyItMatters || '—'}
        </div>
        <div class="goal-meta">
          <strong>Support needed:</strong> ${goal.supportNeeded || '—'}
        </div>
        <div class="milestones-row">
          <div class="m-box"><strong>Q1:</strong> ${goal.milestones.q1 || '—'}</div>
          <div class="m-box"><strong>Q2:</strong> ${goal.milestones.q2 || '—'}</div>
          <div class="m-box"><strong>Q3:</strong> ${goal.milestones.q3 || '—'}</div>
          <div class="m-box"><strong>Q4:</strong> ${goal.milestones.q4 || '—'}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Reflective E-Journal ${state.year}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
          @page {
            size: A4;
            margin: 18mm 16mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            background-color: #FAF7F2;
            color: #3A312A;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .cover {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 2px solid #EAE3D9;
            margin-bottom: 30px;
          }
          h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            color: #3A312A;
            margin: 0 0 8px 0;
          }
          .subtitle {
            font-size: 16px;
            color: #8E5B67;
            font-style: italic;
            margin-bottom: 12px;
          }
          .year-badge {
            display: inline-block;
            background: #F5ECEE;
            color: #8E5B67;
            padding: 4px 14px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #E6D3D7;
          }
          .quote-banner {
            margin: 24px auto;
            max-width: 600px;
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 15px;
            color: #7D7267;
            text-align: center;
          }
          .goal-card {
            background: #FFFFFF;
            border: 1px solid #EAE3D9;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .goal-card.top-three {
            border: 2px solid #8E5B67;
            background: #FFFCFC;
          }
          .goal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #EFE9E0;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .goal-title {
            font-family: 'Playfair Display', serif;
            font-size: 18px;
            font-weight: 700;
            color: #3A312A;
          }
          .badge {
            background: #8E5B67;
            color: #FFF;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
          }
          .priority {
            font-size: 13px;
            color: #8E5B67;
            letter-spacing: 2px;
          }
          .goal-text {
            font-size: 14px;
            margin: 0 0 10px 0;
            color: #3A312A;
          }
          .goal-meta {
            font-size: 12.5px;
            color: #5A5048;
            margin-bottom: 6px;
          }
          .milestones-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 10px;
            background: #FAF8F5;
            padding: 10px;
            border-radius: 8px;
          }
          .m-box {
            font-size: 12px;
            color: #4A4038;
          }
          .empty {
            color: #A3988E;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #7D7267;
            border-top: 1px solid #EAE3D9;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <div class="subtitle">Personal Growth & Life Vision</div>
          <h1>My Goals for the Year</h1>
          <div class="year-badge">${state.year} Edition</div>
          <div class="quote-banner">
            "${JOURNAL_QUOTES.yearGoals.text}" — ${JOURNAL_QUOTES.yearGoals.author}
          </div>
        </div>

        <div class="goals-container">
          ${goalsList}
        </div>

        <div class="footer">
          Generated with Reflective E-Journal • ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;
}
