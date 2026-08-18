/* ============================================
   IRON FORGE GYM — Progress Tracker
   ============================================ */

const PROGRESS_KEY = 'if_progress_entries';

function getProgressEntries(){
  try{ return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || []; }
  catch(e){ return []; }
}

function saveProgressEntry(entry){
  const entries = getProgressEntries();
  entries.push({ id: Date.now(), ...entry });
  entries.sort((a,b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(entries));
  return entries;
}

function deleteProgressEntry(id){
  const entries = getProgressEntries().filter(e => e.id !== id);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(entries));
  return entries;
}

let progressChartInstance = null;

function renderProgressChart(canvasEl, entries, lang){
  if(!window.Chart) return;
  const labels = entries.map(e => e.date);
  const weights = entries.map(e => e.weight);
  if(progressChartInstance) progressChartInstance.destroy();

  const styles = getComputedStyle(document.body);
  const accent = styles.getPropertyValue('--accent').trim() || '#FF4B1F';
  const textDim = styles.getPropertyValue('--text-dim').trim() || '#9AA0A8';
  const border = styles.getPropertyValue('--border').trim() || '#33383F';

  progressChartInstance = new Chart(canvasEl, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: lang === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)',
        data: weights,
        borderColor: accent,
        backgroundColor: 'transparent',
        tension: .35,
        pointBackgroundColor: accent,
        pointRadius: 4,
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: textDim } } },
      scales: {
        x: { ticks: { color: textDim }, grid: { color: border } },
        y: { ticks: { color: textDim }, grid: { color: border } },
      }
    }
  });
}
