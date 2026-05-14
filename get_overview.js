const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '        {/* --- 🧭 1. Top Section --- */}\n        {(activeTab === "home" || activeTab === "overview") && (';
const endMarker = '            </div>\n\n          </div>\n        )}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  const endIndex = content.indexOf(endMarker, startIndex);
  if (endIndex !== -1) {
    console.log("Found chunk, lines:", content.substring(0, startIndex).split('\n').length, "to", content.substring(0, endIndex + endMarker.length).split('\n').length);
  } else {
    console.log("End marker not found");
  }
} else {
  console.log("Start marker not found");
}
