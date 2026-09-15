-- 20260915160100 wrote this subject through a Windows code page, so its em dash
-- reached the database as U+FFFD. Restore it without touching any edited subject.
UPDATE "EmailTemplate"
SET subject = replace(subject, chr(65533), chr(8212))
WHERE name = 'AdminAlert' AND strpos(subject, chr(65533)) > 0;
