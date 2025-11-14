<div align="center">
<img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Р—Р°РїСѓСЃРє Рё СЂР°Р·РІРµСЂС‚С‹РІР°РЅРёРµ РїСЂРёР»РѕР¶РµРЅРёСЏ

Р”Р°РЅРЅС‹Р№ СЂРµРїРѕР·РёС‚РѕСЂРёР№ СЃРѕРґРµСЂР¶РёС‚ РІСЃС‘ РЅРµРѕР±С…РѕРґРёРјРѕРµ РґР»СЏ Р»РѕРєР°Р»СЊРЅРѕРіРѕ Р·Р°РїСѓСЃРєР° СЃРѕР·РґР°РЅРЅРѕРіРѕ РЅР°РјРё РІРµР±-РїСЂРёР»РѕР¶РµРЅРёСЏ.

## рџљЂ Р›РѕРєР°Р»СЊРЅС‹Р№ Р·Р°РїСѓСЃРє

**РўСЂРµР±РѕРІР°РЅРёСЏ:**  
- Node.js (Р°РєС‚СѓР°Р»СЊРЅР°СЏ LTS-РІРµСЂСЃРёСЏ)  
- РђРєРєР°СѓРЅС‚ Firebase (РґР»СЏ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё)  

---

## 1. РЈСЃС‚Р°РЅРѕРІРєР° Р·Р°РІРёСЃРёРјРѕСЃС‚РµР№

```bash
npm install

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Configure OpenRouter (LLM access):
   - Create an API key at [openrouter.ai](https://openrouter.ai/keys) and paste it into `.env.local` as `OPENROUTER_API_KEY`.
   - (РћРїС†РёРѕРЅР°Р»СЊРЅРѕ) СѓРєР°Р¶РёС‚Рµ `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`, Р° С‚Р°РєР¶Рµ РјРѕРґРµР»Рё (`OPENROUTER_FAST_MODEL`, `OPENROUTER_THINK_MODEL`, `OPENROUTER_JSON_MODEL`) РµСЃР»Рё С…РѕС‚РёС‚Рµ РїРµСЂРµРѕРїСЂРµРґРµР»РёС‚СЊ Р·РЅР°С‡РµРЅРёСЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.
3. Configure Firebase Authentication:
   - Create a Firebase project and enable **Email/Password** auth.
   - Copy the Web app config values into `.env.local` (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.).
4. Configure Yandex SmartCaptcha:
   - Create a SmartCaptcha in Yandex Cloud and copy the **client key**.
   - Add it to `.env.local` as `SMARTCAPTCHA_CLIENT_KEY`.
5. Run the app:
   `npm run dev`

