# Kalchakra Project Notebook (Deep Detail)

यह डॉक्यूमेंट आपके पूरे सेटअप, लिये गये फ़ैसले, कमांड्स, और हर सर्विस की भूमिका को एक ही जगह ट्रैक करता है। इसे VS Code या ब्राउज़र में खोलकर “Print → Save as PDF” से PDF बना सकते हैं।

---

## 1) आर्किटेक्चर ओवरव्यू
- **Frontend**: Next.js 14 (TypeScript) → Vercel पर डिप्लॉय  
  - यूआई, कोर्स लिस्ट/डिटेल, ऑथ बटन, Razorpay फ्लो।
- **Backend**: Express + MongoDB (Mongoose) → Render Web Service पर डिप्लॉय  
  - Auth (JWT + Google OAuth), Courses CRUD, Payment endpoints।
- **Database**: MongoDB Atlas (क्लस्टर `kalchakra`)  
  - Users, Courses, Modules, Lessons संग्रह।
- **OAuth**: Google (OAuth2)  
  - Redirect backend: `/api/auth/google/callback`
- **Payments**: Razorpay (फ्रंट में key placeholder; backend में अभी test/disabled).
- **Fallback Demo**: DB डाउन/खाली होने पर 1 demo course + YouTube वीडियो लौटाता।

## 2) URLs (Live)
- Frontend: `https://frontend-chi-eosin-36.vercel.app`
- Backend: `https://kalchakra-backend.onrender.com`
- Demo course (video visible): `https://frontend-chi-eosin-36.vercel.app/courses/demo-1`
- Health/course API: `https://kalchakra-backend.onrender.com/api/courses`

## 3) Env Vars (Render Backend)
| Key | Why / किसलिए | Current Value (prod) |
| --- | --- | --- |
| `MONGO_URI` | MongoDB Atlas कनेक्शन; DB चालू तो असली डेटा | Render डैशबोर्ड में सेट (URI कॉपी वहीं से) |
| `JWT_SECRET` | JWT साइनिंग सीक्रेट | Render डैशबोर्ड में सेट |
| `JWT_EXPIRE` | टोकन वैधता | `30d` |
| `FRONTEND_URL` | CORS + OAuth redirect base | `https://frontend-chi-eosin-36.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google Console → OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Google Console → OAuth Client Secret |

## 4) Env Vars (Vercel Frontend)
| Key | Why | Value (prod) |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | API base URL | `https://kalchakra-backend.onrender.com/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | फ्रंट बटन में client id | Google Console → OAuth Client ID |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | टेस्ट recaptcha key | Google test key (public) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay frontend key | अपने Razorpay Dashboard से |

> नोट: Env बदलने के बाद Render/Vercel में “Redeploy” ज़रूर करें।

## 5) Google OAuth सेटअप (क्यों & कैसे)
- **क्यों**: Google खाते से 1‑क्लिक लॉगिन, पासवर्ड मैनेजमेंट की ज़रूरत घटती है।
- **Redirect URI** (Google Console → Credentials):  
  `https://kalchakra-backend.onrender.com/api/auth/google/callback`
- **Authorized JS origin**:  
  `https://frontend-chi-eosin-36.vercel.app`
- Test user whitelisted: `harshukbhai09@gmail.com`
- Backend flow: `GET /api/auth/google` → Google consent → callback पर JWT बनता → फ्रंट पर redirect `?token=...&provider=google`।

## 6) Code Changes (मुख्य कमिट)
- Commit `3e6273a` (15 Mar 2026) — “Fix Google OAuth redirect and demo video embed”
  - **Backend**
    - `routes/auth.js`: Google OAuth में `session:false`, failure redirect query param।
    - `authController.js`: callback में JWT जनरेट, frontend पर `?token=` से भेजता; null‑safety।
    - `courseController.js`: Demo course fallback; DB डाउन हो तो 200 + demo data; single course fallback; preview video link set.
  - **Frontend**
    - `AuthContext.tsx`: Google button अब सीधे `/auth/google` पर जाता (preflight हटाया)।
    - `courses/[id]/page.tsx`: YouTube URL को embed में auto‑convert (watch/shorts/youtu.be) → iframe src ठीक।

## 7) कौन‑कौन से कमांड/प्रोसेस चले
```
# Repo clone & status
git status --short

# फ़ाइल निरीक्षण
Get-Content bakend/controllers/courseController.js
Get-Content bakend/server.js
Get-Content bakend/connect.js
Get-Content bakend/utils/userStore.js
Get-Content frontend/src/contexts/AuthContext.tsx
Get-Content frontend/src/app/courses/[id]/page.tsx

# कोड एडिट (apply_patch इस्तेमाल)
# - Google OAuth callback fix
# - Demo courses fallback
# - YouTube embed helper

# Commit & push
git add <files>
git commit -m "Fix Google OAuth redirect and demo video embed"
git push origin main
```

## 8) Services क्यों चुने
- **Vercel (Frontend)**: Next.js के लिए zero-config build, automatic HTTPS, preview deployments। तेज़ ग्लोबल CDN।
- **Render (Backend)**: Free tier web service, ऑटो deploy on Git push, env management सरल।
- **MongoDB Atlas**: Managed DB, free tier, आसान connection string; Mongoose models already मौजूद।
- **Google OAuth**: विश्वसनीय पहचान, कम friction signup।
- **Fallback Demo Data**: जब DB/IP whitelist issue हो तो भी साइट खाली न लगे; immediate preview संभव।

## 9) लोकल Dev (क्यों & कैसे)
- **क्यों**: तेज़ iteration, बिना live env बदले testing।
- Backend: `npm run dev` (port 5000) — .env में same keys; localhost redirect जोड़ना हो तो Google Console में `http://localhost:5000/api/auth/google/callback`।
- Frontend: `npm run dev` (port 3000) — `NEXT_PUBLIC_API_URL=http://localhost:5000/api`।
- Mongo: Atlas URI same; या लोकल Mongo चलाना हो तो URI बदलें।

## 10) Courses & Videos जोड़ने की गाइड
- अगर DB कनेक्टेड है:
  - Admin user बनाएँ (`/api/auth/register` → role को DB में `admin` सेट करें)।  
  - `POST /api/courses` (auth token header) → body में `title, description, price, thumbnail, previewVideo, modules[]`.
- अगर DB अभी कनेक्ट नहीं: demo course ही दिखेगा; वीडियो बदलना हो तो `demoCourses.previewVideo` (backend controller) अपडेट करके deploy।
- YouTube लिंक कोई भी हो (watch/shorts/youtu.be) → फ्रंटेंड auto embed कर देगा।

## 11) Troubleshooting चेकलिस्ट
- **Redirect 400 (redirect_uri_mismatch)** → Google Console में redirect URI वही है क्या? (section 5)
- **Courses खाली** → Atlas IP whitelist करें; Render env में सही `MONGO_URI`; Render logs में “MongoDB Connected” देखें।
- **Google login रुक गया** → env में `GOOGLE_CLIENT_ID/SECRET`; Render redeploy; consent screen test user मौजूद।
- **वीडियो न चले** → URL valid? फायरवॉल/Adblock? iframe src में `youtube.com/embed/...` बन रहा है क्या?
- **CORS** → FRONTEND_URL env सही; Render cors में वही origin।

## 12) Deployment पाइपलाइन
- `git push origin main` → Vercel frontend build + Render backend build ऑटो।
- Env change → प्लेटफॉर्म डैशबोर्ड में अपडेट + “Redeploy” क्लिक।
- जरूरत पर rollback → GitHub पर revert commit → push → auto redeploy।

## 13) Security नोट्स
- Secrets (.env) repo में न रखें; सिर्फ Render/Vercel env में।
- JWT secret बदलें तो सब यूज़र्स को दोबारा login करना होगा।
- Atlas IP whitelist में “0.0.0.0/0” लगाने से आसान है पर सिक्योरिटी कम होती है; संभव हो तो Render egress IPs ही allow करें।

---

यह notebook उसी repo में रखा गया है (`PROJECT_NOTEBOOK.md`). इसे खोलकर ब्राउज़र से PDF एक्सपोर्ट कर सकते हैं। कोई और detail चाहिए तो बताइए। 
