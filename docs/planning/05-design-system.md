# MentorHub 디자인 시스템

## 1. 색상 팔레트

### Primary (주요 색상)
| 이름 | HEX | 용도 |
|------|-----|------|
| Primary | #4F46E5 | 주요 버튼, 링크, 강조 |
| Primary Light | #818CF8 | 호버 상태, 보조 강조 |
| Primary Dark | #3730A3 | 활성 상태, 헤더 |

### Secondary (보조 색상)
| 이름 | HEX | 용도 |
|------|-----|------|
| Secondary | #10B981 | 성공, 확인, 매칭 성공 |
| Warning | #F59E0B | 경고, 주의 |
| Error | #EF4444 | 오류, 삭제 |

### Neutral (중립 색상)
| 이름 | HEX | 용도 |
|------|-----|------|
| Gray 50 | #F9FAFB | 배경 |
| Gray 100 | #F3F4F6 | 카드 배경 |
| Gray 300 | #D1D5DB | 구분선, 비활성 |
| Gray 500 | #6B7280 | 보조 텍스트 |
| Gray 700 | #374151 | 본문 텍스트 |
| Gray 900 | #111827 | 제목 텍스트 |

---

## 2. 타이포그래피

| 요소 | 폰트 | 크기 | 두께 | 줄높이 |
|------|------|------|------|--------|
| H1 | Pretendard | 28px | Bold (700) | 36px |
| H2 | Pretendard | 24px | Bold (700) | 32px |
| H3 | Pretendard | 20px | SemiBold (600) | 28px |
| Body L | Pretendard | 16px | Regular (400) | 24px |
| Body M | Pretendard | 14px | Regular (400) | 20px |
| Body S | Pretendard | 12px | Regular (400) | 16px |
| Caption | Pretendard | 11px | Medium (500) | 14px |

---

## 3. 컴포넌트

### Button
| 변형 | 배경 | 텍스트 | 테두리 | 패딩 |
|------|------|--------|--------|------|
| Primary | #4F46E5 | White | none | 12px 24px |
| Secondary | White | #4F46E5 | 1px #4F46E5 | 12px 24px |
| Ghost | transparent | #6B7280 | none | 12px 24px |
| Danger | #EF4444 | White | none | 12px 24px |

### Input
| 상태 | 테두리 | 배경 | 텍스트 |
|------|--------|------|--------|
| Default | 1px #D1D5DB | White | #374151 |
| Focus | 2px #4F46E5 | White | #374151 |
| Error | 1px #EF4444 | #FEF2F2 | #374151 |
| Disabled | 1px #E5E7EB | #F9FAFB | #9CA3AF |

### Card (멘토 카드)
| 속성 | 값 |
|------|-----|
| 배경 | White |
| 테두리 | 1px #E5E7EB |
| 둥근 모서리 | 12px |
| 그림자 | 0 1px 3px rgba(0,0,0,0.1) |
| 패딩 | 16px |

### Badge (카테고리 태그)
| 속성 | 값 |
|------|-----|
| 배경 | #EEF2FF (Primary 10%) |
| 텍스트 | #4F46E5 |
| 둥근 모서리 | 9999px (pill) |
| 패딩 | 4px 12px |
| 폰트 크기 | 12px |

---

## 4. 간격 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| xs | 4px | 아이콘 간격, 인라인 요소 |
| sm | 8px | 카드 내부 요소 간격 |
| md | 16px | 섹션 내부 간격 |
| lg | 24px | 섹션 간 간격 |
| xl | 32px | 페이지 패딩 |
| 2xl | 48px | 큰 섹션 간 간격 |

---

## 5. 반응형

| 브레이크포인트 | 너비 | 대상 |
|--------------|------|------|
| Mobile | < 768px | 스마트폰 (기본) |
| Tablet | 768px ~ 1024px | 태블릿 |
| Desktop | > 1024px | 데스크톱 |

### 반응형 전략
- **Mobile First**: 모바일 기준 설계 후 확장
- 하단 탭 네비게이션은 모바일에서 고정, 데스크톱에서는 사이드바로 전환
- 카드 그리드: 모바일 1열, 태블릿 2열, 데스크톱 3열

---

## 6. 아이콘

- 아이콘 라이브러리: Lucide React (경량, 일관성)
- 아이콘 크기: 20px (기본), 16px (소형), 24px (대형)
