---
description: Thực thi test case từ file Excel trực tiếp trên website, chấm PASS/FAIL/BLOCKED, ghi kết quả ngược vào Excel + sinh báo cáo/bug report.
---

Hãy nạp và thực hiện skill **`execute-testcases-from-excel`** (tại `.claude/skills/execute-testcases-from-excel/SKILL.md`).

Lưu ý môi trường máy này:
- KHÔNG có Python → dùng helper Node `.claude/skills/execute-testcases-from-excel/scripts/excel_io.js` thay cho `excel_io.py` (cùng CLI `read`/`write`). Cần `exceljs` (set `NODE_PATH` tới node_modules có exceljs nếu chưa cài cục bộ).
- Lái browser bằng **Playwright MCP** (đã kết nối).

Tham số (nếu người dùng cung cấp sau lệnh): $ARGUMENTS
- Nếu không có, hỏi: đường dẫn file Excel test case, URL môi trường, và phạm vi chạy (tất cả / theo Priority / danh sách TC ID).
- Suite > 15 TC hoặc có thao tác tạo/sửa/xóa dữ liệu thật → DỪNG xác nhận scope với user trước khi lái browser.
