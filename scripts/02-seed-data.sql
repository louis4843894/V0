-- Insert sample data for testing
INSERT INTO profiles (email, password, display_name, role, phone, room) VALUES
('admin@community.com', 'admin123', '管理員', 'committee', '0912345678', 'A101'),
('resident@community.com', 'resident123', '住戶王小明', 'resident', '0987654321', 'B202'),
('vendor@community.com', 'vendor123', '維修廠商', 'vendor', '0911111111', '');

INSERT INTO announcements (title, content, author, options, votes) VALUES
('社區管理費調整通知', '因應物價上漲，管理費將於下月起調整為每坪150元，請住戶配合。', '管委會', '["同意", "反對"]', '{"同意": 5, "反對": 2}'),
('電梯維護公告', '本週六上午9-12點進行電梯維護，請住戶多加留意。', '管委會', '["已知悉"]', '{"已知悉": 8}'),
('中秋節活動通知', '社區將於中秋節當天舉辦烤肉活動，歡迎住戶參加。', '管委會', '["參加", "不參加"]', '{"參加": 12, "不參加": 3}');

INSERT INTO maintenance (equipment, item, handler, cost, status, assignee) VALUES
('電梯', '按鈕故障', '王師傅', 1500, 'closed', '維修廠商'),
('停車場', '照明燈泡更換', '', 300, 'open', ''),
('游泳池', '過濾系統清潔', '李師傅', 2000, 'progress', '清潔公司');

INSERT INTO fees (room, amount, due, paid) VALUES
('A101', 3000, '2025-02-01', true),
('A102', 3000, '2025-02-01', false),
('B201', 2800, '2025-02-01', true),
('B202', 2800, '2025-02-01', false);

INSERT INTO residents (name, room, phone, email, role) VALUES
('王小明', 'A101', '0912345678', 'wang@example.com', 'resident'),
('李小華', 'A102', '0923456789', 'li@example.com', 'resident'),
('張委員', 'B201', '0934567890', 'zhang@example.com', 'committee'),
('陳住戶', 'B202', '0945678901', 'chen@example.com', 'resident');

INSERT INTO visitors (name, room, "in", "out") VALUES
('訪客A', 'A101', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('訪客B', 'B202', NOW() - INTERVAL '30 minutes', NULL);

INSERT INTO packages (courier, tracking, room, received_at, picked_at, picker) VALUES
('宅配通', 'TC123456789', 'A101', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', '王小明'),
('黑貓宅急便', 'BM987654321', 'B202', NOW() - INTERVAL '3 hours', NULL, '');

INSERT INTO meetings (topic, time, location, notes) VALUES
('月例會議', NOW() + INTERVAL '1 week', '社區活動中心', '討論管理費調整事宜'),
('年度大會', NOW() + INTERVAL '1 month', '社區活動中心', '選舉新任管委會');
