import { readFileSync } from 'node:fs';

const sourceUrl = new URL('../index.html', import.meta.url);
let cachedHtml = '';
let patchStatus = 'unknown';

function buildMobileHtml() {
  if (cachedHtml) return cachedHtml;

  let html = readFileSync(sourceUrl, 'utf8');

  const oldBounds = "left=clamp(left,sm.width/2,sr.width-sm.width/2);top=clamp(top,-oy,sr.height-sm.height-oy);";
  const newBounds = "const isMobile=window.matchMedia('(max-width:760px)').matches;const sideKeep=isMobile?sm.width*.05:sm.width*.35;const verticalOverflow=isMobile?sm.height*.28:sm.height*.12;left=clamp(left,sideKeep,sr.width-sideKeep);top=clamp(top,-oy-verticalOverflow,sr.height-sm.height-oy+verticalOverflow);";

  const oldContact = "const contactX=clamp(sampleRect.left+sampleRect.width*.5,plateRect.left+10,plateRect.right-10);const contactY=clamp(sampleRect.top+sampleRect.height*.76,plateRect.top+10,plateRect.bottom-10);";
  const newContact = "const contactX=clamp(e.clientX,plateRect.left+8,plateRect.right-8);const preferredContactY=sampleRect.top+sampleRect.height*.76;const contactY=clamp(preferredContactY,plateRect.top+8,plateRect.bottom-8);";

  const hasBounds = html.includes(oldBounds);
  const hasContact = html.includes(oldContact);

  if (hasBounds) html = html.replace(oldBounds, newBounds);
  if (hasContact) html = html.replace(oldContact, newContact);

  patchStatus = hasBounds && hasContact ? 'applied' : 'partial';
  html = html.replace('</body>', '<!-- MOBILE_DRAG_RANGE_V3 -->\n</body>');
  cachedHtml = html;
  return cachedHtml;
}

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const html = buildMobileHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400');
    res.setHeader('X-Mobile-Drag-Patch', patchStatus);
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(html);
  } catch (error) {
    console.error('Failed to build mobile mineral lab page:', error);
    return res.status(500).send('광물 실험실을 불러오지 못했습니다.');
  }
}
