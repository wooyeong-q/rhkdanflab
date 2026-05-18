광물 가상 실험실 배포본

GitHub 저장소 첫 화면에 index.html, assets, api, package.json이 바로 보이도록 업로드하세요.

Vercel 환경변수:
GEMINI_API_KEY = Google AI Studio API 키
GEMINI_MODEL = gemini-2.5-flash  (선택. 기본값도 2.5 Flash)

2.0 Flash가 작동하지 않는 계정 또는 환경을 고려해 api/chat.js는 기본 모델을 gemini-2.5-flash로 사용합니다.
실패하면 gemini-1.5-flash와 gemini-2.0-flash를 순서대로 한 번 더 시도합니다.
