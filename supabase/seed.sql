-- MentorHub 시드 데이터: 카테고리
insert into public.categories (id, name, icon, sort_order) values
  (gen_random_uuid(), '음악', '🎵', 1),
  (gen_random_uuid(), '프로그래밍', '💻', 2),
  (gen_random_uuid(), '요리', '🍳', 3),
  (gen_random_uuid(), '운동/피트니스', '💪', 4),
  (gen_random_uuid(), '외국어', '🌍', 5),
  (gen_random_uuid(), '미술/디자인', '🎨', 6),
  (gen_random_uuid(), '사진/영상', '📷', 7),
  (gen_random_uuid(), '글쓰기', '✍️', 8),
  (gen_random_uuid(), '비즈니스', '💼', 9),
  (gen_random_uuid(), '수학/과학', '🔬', 10),
  (gen_random_uuid(), '공예/DIY', '🛠️', 11),
  (gen_random_uuid(), '원예/농업', '🌱', 12);
