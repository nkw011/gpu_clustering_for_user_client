-- Notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  request_id uuid,
  status text,
  type text,
  title text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 같은 요청/상태/유저에 대해 중복 알림 방지
CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_request_status_user
  ON notifications(user_id, request_id, status); 