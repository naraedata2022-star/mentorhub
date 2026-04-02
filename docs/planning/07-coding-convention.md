# MentorHub 코딩 컨벤션

## 1. 파일 구조

```
mentorhub/
├── public/                    # 정적 파일
│   └── images/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 라우트 그룹
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/            # 메인 레이아웃 그룹
│   │   │   ├── page.tsx       # 홈 (/)
│   │   │   ├── category/
│   │   │   ├── mentoring/
│   │   │   ├── search/
│   │   │   ├── matching/
│   │   │   ├── chat/
│   │   │   └── profile/
│   │   ├── onboarding/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/            # 재사용 컴포넌트
│   │   ├── ui/                # 기본 UI (Button, Input, Card)
│   │   ├── layout/            # 레이아웃 (Header, TabBar, Footer)
│   │   └── features/          # 기능별 컴포넌트
│   │       ├── auth/
│   │       ├── mentoring/
│   │       ├── chat/
│   │       ├── matching/
│   │       └── profile/
│   ├── lib/                   # 유틸리티, 설정
│   │   ├── supabase/          # Supabase 클라이언트
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/                 # 커스텀 훅
│   ├── types/                 # TypeScript 타입
│   └── stores/                # 상태 관리 (Zustand)
├── supabase/                  # Supabase 설정
│   ├── migrations/            # DB 마이그레이션
│   └── seed.sql               # 초기 데이터
├── .env.local                 # 환경변수
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `getUserProfile`, `isLoading` |
| 컴포넌트 | PascalCase | `MentorCard`, `ChatRoom` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 파일 (컴포넌트) | PascalCase | `MentorCard.tsx` |
| 파일 (유틸) | camelCase | `formatDate.ts` |
| 폴더 | kebab-case | `mentor-card/`, `chat-room/` |
| CSS 클래스 | Tailwind 유틸리티 | `className="flex items-center gap-2"` |
| DB 테이블 | snake_case | `user_skills`, `chat_rooms` |
| DB 컬럼 | snake_case | `created_at`, `user_id` |
| 타입/인터페이스 | PascalCase | `User`, `MentoringSession` |

---

## 3. 컴포넌트 작성 규칙

### 기본 구조
```tsx
// 1. 임포트
import { useState } from 'react'

// 2. 타입 정의
interface MentorCardProps {
  name: string
  skills: string[]
}

// 3. 컴포넌트 (함수 선언문)
export default function MentorCard({ name, skills }: MentorCardProps) {
  // 4. 상태/훅
  const [isOpen, setIsOpen] = useState(false)

  // 5. 핸들러
  function handleClick() {
    setIsOpen(true)
  }

  // 6. 렌더링
  return (
    <div onClick={handleClick}>
      {name}
    </div>
  )
}
```

### 규칙
- 컴포넌트당 하나의 파일
- `export default` 사용 (Next.js App Router 호환)
- Props 타입은 컴포넌트 파일 내에서 정의
- 공유 타입은 `types/` 폴더에 분리

---

## 4. Lint/Formatter

### ESLint
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

### Prettier
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## 5. Git 커밋 메시지

### Conventional Commits
```
<type>(<scope>): <description>

feat(auth): add Google social login
fix(chat): resolve message ordering issue
docs(readme): update installation guide
style(ui): adjust button padding
refactor(matching): simplify scoring algorithm
test(chat): add unit tests for message sending
chore(deps): update supabase-js to v2.45
```

### 타입
| 타입 | 용도 |
|------|------|
| feat | 새 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 포맷팅 (동작 변경 없음) |
| refactor | 리팩토링 (동작 변경 없음) |
| test | 테스트 추가/수정 |
| chore | 빌드, 설정, 의존성 등 |

---

## 6. Supabase 규칙

### 클라이언트 사용
```tsx
// lib/supabase/client.ts - 브라우저용
import { createBrowserClient } from '@supabase/ssr'

// lib/supabase/server.ts - 서버용
import { createServerClient } from '@supabase/ssr'
```

### 쿼리 패턴
```tsx
// 조회
const { data, error } = await supabase
  .from('mentoring_sessions')
  .select('*')
  .eq('status', 'active')

// 삽입
const { error } = await supabase
  .from('messages')
  .insert({ chat_room_id, sender_id, content })
```

---

## 7. 환경변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- `NEXT_PUBLIC_` 접두사: 브라우저에서 접근 가능
- 접두사 없음: 서버에서만 접근 가능
- `.env.local`은 `.gitignore`에 포함
