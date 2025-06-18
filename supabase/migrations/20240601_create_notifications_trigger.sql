-- 알림 트리거 함수: expire date가 하루 남았을 때 딱 한 번만 알림 추가
CREATE OR REPLACE FUNCTION notify_on_expire_soon()
RETURNS TRIGGER AS $$
DECLARE
  days_left integer;
BEGIN
  -- 만료 1일 전이면
  days_left := DATE_PART('day', NEW.end_date::date - CURRENT_DATE);
  IF days_left = 1 THEN
    -- 이미 expire_soon 알림이 있는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = NEW.user_id AND request_id = NEW.id AND status = 'expire_soon'
    ) THEN
      INSERT INTO notifications (user_id, request_id, status, type, title, message)
      VALUES (
        NEW.user_id,
        NEW.id,
        'expire_soon',
        'warning',
        'Resource Expiring Soon',
        'Your resource "' || NEW.project_name || '" will expire in 1 day.'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_expire_soon ON resource_requests;
CREATE TRIGGER trigger_notify_on_expire_soon
AFTER UPDATE ON resource_requests
FOR EACH ROW
EXECUTE PROCEDURE notify_on_expire_soon(); 