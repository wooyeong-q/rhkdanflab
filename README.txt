광물 가상 실험실 Vercel 배포용 최종본

필수 구조:
index.html
assets/minerals/*.png
api/chat.js
package.json
.env.example

Gemini 챗봇 설정:
1. Vercel 프로젝트 Settings → Environment Variables 이동
2. GEMINI_API_KEY 추가
3. 저장 후 Deployments → Redeploy 실행

api/chat.js는 @google/genai의 GoogleGenAI 방식을 사용합니다.
