export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GEMINI_API_KEY;
  const { message, mineral, context, records } = req.body || {};
  if (!key) return res.status(200).json({ reply: 'GEMINI_API_KEY가 설정되지 않아 기본 실험 도우미로 답변합니다. Vercel 환경변수에 API 키를 넣어 주세요.' });
  try {
    const prompt = `너는 중학교 2학년 과학 광물 실험 도우미야. 학생에게 짧고 정확하게 한국어로 답해.\n현재 광물: ${mineral}\n광물 정보: ${JSON.stringify(context)}\n실험 기록: ${JSON.stringify(records)}\n질문: ${message}`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('\n') || '답변을 만들지 못했습니다.';
    return res.status(200).json({ reply });
  } catch (e) { return res.status(200).json({ reply: 'AI 연결에 문제가 있어요. 지금은 앱 안의 기본 안내를 사용해 주세요.' }); }
}
