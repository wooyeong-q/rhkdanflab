import { GoogleGenAI } from "@google/genai";

function fallbackReply(message, mineral, context, records) {
  const name = mineral || "선택한 광물";
  const data = context || {};
  const q = String(message || "");

  if (q.includes("조흔")) {
    return `${name}의 조흔색은 ${data.streak || "실험으로 확인해 보세요"}입니다. 조흔판 도구를 선택한 뒤 광물을 조흔판 위에서 문지르면 확인할 수 있어요.`;
  }
  if (q.includes("염산") || q.includes("기포") || q.includes("거품")) {
    return `${name}의 묽은 염산 반응은 ${data.acid || "실험으로 확인해 보세요"}입니다. 방해석처럼 탄산염 성분이 있는 광물은 묽은 염산에 기포가 생길 수 있어요.`;
  }
  if (q.includes("굳기") || q.includes("쇠못") || q.includes("긁")) {
    return `${name}의 굳기 반응은 ${data.hardness || "실험으로 확인해 보세요"}입니다. 쇠못 도구를 선택한 뒤 실제 광물 부분을 누른 채 드래그해 보세요.`;
  }
  if (q.includes("자석") || q.includes("자성")) {
    return `${name}의 자석 반응은 ${data.magnet || "실험으로 확인해 보세요"}입니다. 자철석은 자석에 끌려오는 대표적인 광물입니다.`;
  }

  return `${name}의 현재 정보입니다.\n겉보기색: ${data.color || "-"}\n조흔색: ${data.streak || "-"}\n굳기: ${data.hardness || "-"}\n염산 반응: ${data.acid || "-"}\n자석 반응: ${data.magnet || "-"}`;
}

function extractGeminiText(response) {
  if (!response) return "";
  if (typeof response.text === "string") return response.text.trim();
  if (typeof response.text === "function") return String(response.text() || "").trim();
  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts.map(part => part?.text || "").join("\n").trim();
}

function buildPrompt({ message, mineral, context, records }) {
  return `
당신은 중학교 과학 교사이며 현재 '광물 가상 실험실'에서 학생의 실험을 돕고 있습니다.

[현재 상황]
선택된 광물: ${mineral || "없음"}
광물 정보: ${JSON.stringify(context || {})}
학생의 현재 실험 기록: ${JSON.stringify(records || {})}

[학생 질문]
${message || ""}

[답변 규칙]
- 한국어로 답변하세요.
- 중학교 2학년 수준으로 설명하세요.
- 친절하지만 너무 길게 쓰지 말고 3~6문장 정도로 답하세요.
- 필요한 경우 돋보기, 조흔판, 쇠못, 묽은 염산, 자석 도구 사용법을 안내하세요.
- 실험으로 확인해야 하는 내용은 단정하기보다 "실험으로 확인해 보자"처럼 말하세요.
`.trim();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, mineral, context, records } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    return res.status(200).json({
      source: "missing_api_key",
      reply:
        "Gemini API 키가 아직 연결되지 않았습니다. Vercel 프로젝트의 Settings → Environment Variables에서 GEMINI_API_KEY를 추가하고 Redeploy 해 주세요.\n\n" +
        fallbackReply(message, mineral, context, records)
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const prompt = buildPrompt({ message, mineral, context, records });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.45,
        maxOutputTokens: 512
      }
    });

    const reply = extractGeminiText(response) || fallbackReply(message, mineral, context, records);
    return res.status(200).json({ reply, source: "gemini_sdk", model });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const details = error?.message || String(error || "unknown error");
    return res.status(200).json({
      source: "gemini_sdk_error",
      reply:
        `Gemini API 연결 오류가 발생했습니다. 원인: ${details}\n\n` +
        "확인할 것: Vercel의 GEMINI_API_KEY 값이 정확한지, 저장 후 Redeploy 했는지 확인해 주세요.\n\n" +
        fallbackReply(message, mineral, context, records)
    });
  }
}
