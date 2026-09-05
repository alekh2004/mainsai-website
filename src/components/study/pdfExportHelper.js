import html2pdf from 'html2pdf.js';

/**
 * Direct Fast Colorful PDF Exporter for UPSC / BPSC Mains Notes
 * 1. Instantly downloads clean .pdf file directly to user's downloads folder.
 * 2. Or opens isolated popup containing STRICTLY ONLY the note content (ZERO dashboard elements).
 */

export async function exportNoteToColorPdf(noteData, isHi = false) {
  if (!noteData) return;

  const topicTitle = (noteData.topic || 'UPSC_BPSC_Mains_Notes').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const paperName = noteData.paper || `${noteData.examType || 'UPSC'} MAINS`;
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Create clean isolated DOM element
  const printWrapper = document.createElement('div');
  printWrapper.id = 'pure-mains-note-pdf';
  printWrapper.style.width = '750px';
  printWrapper.style.padding = '20px 24px';
  printWrapper.style.background = '#ffffff';
  printWrapper.style.color = '#0f172a';
  printWrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  printWrapper.style.fontSize = '12px';
  printWrapper.style.lineHeight = '1.5';

  printWrapper.innerHTML = `
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border: 2px solid #93c5fd; border-radius: 12px; padding: 16px 20px; margin-bottom: 14px;">
      <div style="margin-bottom: 6px;">
        <span style="background: #2563eb; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
          ${paperName}
        </span>
        <span style="color: #64748b; font-size: 10.5px; font-weight: 600; margin-left: 8px;">
          UPSC / BPSC Mains High-Yield Notes • ${formattedDate}
        </span>
      </div>
      <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0;">
        ${topicTitle}
      </h1>
      <p style="font-size: 12px; color: #1e293b; margin: 0; font-weight: 500; line-height: 1.45;">
        ${noteData.executiveSummary || ''}
      </p>
    </div>

    ${noteData.constitutionalAndData?.length ? `
    <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 6px;">
        ⚡ Constitutional Articles & Core Data
      </div>
      <ul style="margin: 0; padding-left: 18px;">
        ${noteData.constitutionalAndData.map(p => `<li style="margin-bottom: 3px; color: #334155; font-weight: 500; font-size: 11.5px;">${p}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${noteData.dimensions?.length ? noteData.dimensions.map(dim => `
    <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="font-size: 11.5px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin-bottom: 6px;">
        ❖ ${dim.title}
      </div>
      <ul style="margin: 0; padding-left: 18px;">
        ${(dim.points || []).map(p => `<li style="margin-bottom: 3px; color: #334155; font-weight: 500; font-size: 11.5px;">${p}</li>`).join('')}
      </ul>
    </div>`).join('') : ''}

    ${noteData.bottlenecksAndChallenges?.length ? `
    <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #be123c; text-transform: uppercase; margin-bottom: 6px;">
        ⚠️ Bottlenecks & Critical Challenges
      </div>
      <ul style="margin: 0; padding-left: 18px;">
        ${noteData.bottlenecksAndChallenges.map(b => `<li style="margin-bottom: 3px; color: #881337; font-weight: 500; font-size: 11.5px;">${b}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${noteData.schemesAndCommittees?.length ? `
    <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #15803d; text-transform: uppercase; margin-bottom: 6px;">
        ★ Committee Recommendations & Government Schemes
      </div>
      <ul style="margin: 0; padding-left: 18px;">
        ${noteData.schemesAndCommittees.map(s => `<li style="margin-bottom: 3px; color: #14532d; font-weight: 500; font-size: 11.5px;">${s}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${noteData.diagramSchematic ? `
    <div style="background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #4338ca; text-transform: uppercase; margin-bottom: 6px;">
        📊 High-Scoring Diagram & Flowchart Blueprint (+1.5 Marks)
      </div>
      <pre style="font-family: monospace; background: #ffffff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 8px 12px; font-size: 10.5px; color: #312e81; margin: 0; white-space: pre-wrap; font-weight: 600;">${noteData.diagramSchematic}</pre>
    </div>` : ''}

    ${noteData.pyqsAsked?.length ? `
    <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 6px;">
        🎯 Real PYQs Asked in UPSC / BPSC Mains
      </div>
      ${noteData.pyqsAsked.map(q => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="background: #eff6ff; color: #1d4ed8; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
              ${q.exam || 'UPSC CSE'} ${q.year || ''}
            </span>
            <span style="color: #b45309; background: #fef3c7; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ${q.marks ? `${q.marks} Marks` : 'PYQ'}
            </span>
          </div>
          <p style="font-size: 11px; color: #0f172a; margin: 0; font-weight: 600;">
            ${q.questionText || ''}
          </p>
        </div>
      `).join('')}
    </div>` : ''}

    ${noteData.topperConclusion ? `
    <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px;">
      <div style="font-size: 11.5px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin-bottom: 4px;">
        🏁 Topper Model Forward-Looking Conclusion
      </div>
      <p style="margin: 0; color: #1e3a8a; font-weight: 600; font-size: 11.5px;">
        ${noteData.topperConclusion}
      </p>
    </div>` : ''}

    <div style="text-align: center; padding-top: 10px; margin-top: 10px; border-top: 1px solid #e2e8f0; font-size: 9.5px; color: #94a3b8; font-weight: 600;">
      UPSC / BPSC Mains AI Evaluator & Notes Synthesizer • Prepared for Aspirants
    </div>
  `;

  // Attach off-screen
  document.body.appendChild(printWrapper);

  const cleanFilename = `${topicTitle.replace(/\s+/g, '_')}_Mains_Notes.pdf`;

  const opt = {
    margin: [8, 10, 8, 10],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    // Generate and download directly
    await html2pdf().set(opt).from(printWrapper).save();
  } catch (err) {
    console.warn('html2pdf direct failed, opening clean isolated print window:', err);
    openIsolatedPrintWindow(printWrapper.innerHTML, topicTitle);
  } finally {
    if (document.body.contains(printWrapper)) {
      document.body.removeChild(printWrapper);
    }
  }
}

/**
 * Fallback to isolated clean popup window with ZERO app background or dashboard
 */
function openIsolatedPrintWindow(innerHtml, title) {
  const printWin = window.open('', '_blank', 'width=850,height=900');
  if (!printWin) return;

  printWin.document.open();
  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Mains Notes</title>
        <style>
          @page { size: A4; margin: 10mm 12mm 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 16px; background: #ffffff; }
        </style>
      </head>
      <body>
        ${innerHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
