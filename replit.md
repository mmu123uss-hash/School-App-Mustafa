# EnglishApp Mustafa Khalid

تطبيق موبايل لإدارة الصف الدراسي — يتيح للأستاذ إدارة الامتحانات والدرجات والتبليغات، وللطلاب متابعة درجاتهم وتبليغات الأستاذ.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo + React Native + Expo Router
- State: React Context + AsyncStorage (no backend needed)
- Build: Expo Go compatible

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/index.tsx` — Login screen
- `artifacts/mobile/app/(teacher)/` — Teacher screens (exams, grades, notifications)
- `artifacts/mobile/app/(student)/` — Student screens (grades, notifications)
- `artifacts/mobile/context/AuthContext.tsx` — Auth state (role, studentId, login/logout)
- `artifacts/mobile/context/AppContext.tsx` — App data (exams, grades, notifications) + AsyncStorage
- `artifacts/mobile/constants/students.ts` — 10 student codes (ENG001–ENG010) + teacher password
- `artifacts/mobile/constants/colors.ts` — Design tokens (blue/gold theme)

## Auth

- **Teacher password:** `2233`
- **Student codes:** ENG001 through ENG010 (10 students pre-configured)
- Students: أحمد (ENG001), سارة (ENG002), عمر (ENG003), فاطمة (ENG004), علي (ENG005), نور (ENG006), ياسين (ENG007), هناء (ENG008), خالد (ENG009), ريم (ENG010)

## Architecture decisions

- Frontend-only with AsyncStorage — no backend required for first version
- Context-based state with AsyncStorage persistence for all data
- Expo Router file-based navigation: `(teacher)` and `(student)` route groups
- All student codes and teacher password defined in `constants/students.ts` for easy modification

## Product

- **Login screen:** Role selector (Student / Teacher) + password/code entry
- **Teacher dashboard:** 3 tabs — امتحانات (manage exams), الدرجات (grade all 10 students per exam), التبليغات (send messages to students)
- **Student dashboard:** 2 tabs — درجاتي (view own grades with progress bar + color coding), التبليغات (view teacher announcements)

## User preferences

- App name: EnglishApp Mustafa Khalid
- Language: Arabic UI
- Theme: Deep blue (#1565C0) + Gold (#F9A825)
- Teacher password: 2233
- Student codes: ENG001–ENG010

## Gotchas

- To add more students: edit `constants/students.ts` — add entries to STUDENTS array
- To change teacher password: edit TEACHER_PASSWORD in `constants/students.ts`
- Data persists via AsyncStorage — clearing app data resets everything
- Always run codegen after OpenAPI spec changes if backend is added later
