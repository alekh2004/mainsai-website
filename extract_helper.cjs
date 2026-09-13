const fs = require('fs');
const py = fs.readFileSync(
  'C:/Users/alekh/.gemini/antigravity/brain/faaeb4e9-abd5-4981-89a2-66ebb8e86170/scratch/write_stats_overview.py',
  'utf8'
);
const marker = 'content = r"""';
const start = py.indexOf(marker) + marker.length;
const end = py.lastIndexOf('"""');
const jsx = py.slice(start, end);
fs.writeFileSync('src/components/dashboard/StatsOverview.jsx', jsx, 'utf8');
console.log('Done. Bytes written:', Buffer.byteLength(jsx, 'utf8'));
const firstLines = jsx.split('\n').slice(0, 3).join('\n');
console.log('First 3 lines:\n' + firstLines);
