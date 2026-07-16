const fs = require('fs');

const path = 'index.html';
let text = fs.readFileSync(path, 'utf8');

if (text.includes('MOBILE_DRAG_RANGE_V3')) {
  console.log('Already patched.');
  process.exit(0);
}

const oldBounds = "left=clamp(left,sm.width/2,sr.width-sm.width/2);top=clamp(top,-oy,sr.height-sm.height-oy);";
const newBounds = "const isMobile=window.matchMedia('(max-width:760px)').matches;const sideKeep=isMobile?sm.width*.05:sm.width*.35;const verticalOverflow=isMobile?sm.height*.28:sm.height*.12;left=clamp(left,sideKeep,sr.width-sideKeep);top=clamp(top,-oy-verticalOverflow,sr.height-sm.height-oy+verticalOverflow);";

const oldContact = "const contactX=clamp(sampleRect.left+sampleRect.width*.5,plateRect.left+10,plateRect.right-10);const contactY=clamp(sampleRect.top+sampleRect.height*.76,plateRect.top+10,plateRect.bottom-10);";
const newContact = "const contactX=clamp(e.clientX,plateRect.left+8,plateRect.right-8);const preferredContactY=sampleRect.top+sampleRect.height*.76;const contactY=clamp(preferredContactY,plateRect.top+8,plateRect.bottom-8);";

if (!text.includes(oldBounds)) throw new Error('Movement boundary code not found.');
if (!text.includes(oldContact)) throw new Error('Streak contact code not found.');

text = text.replace(oldBounds, newBounds);
text = text.replace(oldContact, newContact);
text = text.replace('</body>', '<!-- MOBILE_DRAG_RANGE_V3 -->\n</body>');
fs.writeFileSync(path, text);
console.log('Patched mobile drag range.');
