광물 가상 실험실 최종 배포본

1. GitHub 저장소 첫 화면에 index.html, assets, api, package.json이 바로 보이도록 업로드하세요.
2. Vercel에서 해당 GitHub 저장소를 Import 합니다.
3. Vercel Settings → Environment Variables에 GEMINI_API_KEY를 등록합니다.
4. 환경변수 등록 후 Redeploy를 눌러야 챗봇 API가 적용됩니다.
5. api/chat.js는 @google/genai SDK를 사용하는 Vercel 서버리스 함수입니다.
