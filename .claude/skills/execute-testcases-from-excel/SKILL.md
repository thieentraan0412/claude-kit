---
name: execute-testcases-from-excel
description: Đọc bộ test case từ file Excel và THỰC THI trực tiếp trên website để kiểm thử — dùng Chrome extension (Claude in Chrome) hoặc Playwright MCP tùy đặc điểm site — rồi chấm PASS/FAIL/BLOCKED, ghi kết quả ngược vào Excel và sinh báo cáo + bug report. Dùng khi user có sẵn file test case (.xlsx/.xls/.csv) và muốn "chạy thật" để kiểm thử, KHÔNG phải sinh code automation (việc đó dùng /generate-automation-from-testcases).
---

# Workflow: Thực Thi Test Case từ Excel trên Website (AI Test Execution)

> **BẮT BUỘC (MANDATORY SKILLS/RULES):** Nạp và đọc kỹ trước khi bắt đầu:
> - **`/manual-testing-techniques`** (`.claude/skills/manual-testing-techniques/SKILL.md`) — chuẩn PASS/FAIL, cấu trúc Bug Report, Severity vs Priority.
> - **`.claude/rules/locator_strategy.md`** — cách xác định element ổn định khi tương tác live.
> - **`.claude/rules/delivery_checklist.md`** — Definition of Done trước khi bàn giao.
> - Tham khảo **`/test-data-generator`** (`.claude/skills/test-data-generator/SKILL.md`) khi test case cần data unique/traceable.

Skill này giúp agent **đóng vai một QA thực thi thủ công có sự hỗ trợ của AI**: đọc từng test case trong file Excel, tự lái browser thật để làm đúng các bước, quan sát kết quả thực tế, so với **Expected Result**, chấm trạng thái, chụp bằng chứng, ghi kết quả trở lại Excel và xuất báo cáo tổng hợp kèm bug report cho các case FAIL.

## ⚠️ Nguyên tắc thực thi (đọc trước)

- **Tất cả output bằng Tiếng Việt.**
- **Đây là EXECUTION, KHÔNG phải code generation.** Agent *chạy thật* để kiểm thử, không sinh Page Object / test script. Nếu user muốn sinh code automation → chuyển sang `/generate-automation-from-testcases`.
- **KHÔNG "auto-heal code".** Khi kết quả thực tế ≠ Expected → đó là **BUG của sản phẩm**: ghi FAIL + tạo bug report, **KHÔNG** sửa gì để "làm cho pass". (Đây là điểm khác biệt cốt lõi với các skill `generate-automation-*`.)
- **KHÔNG ĐOÁN.** Chỉ chấm PASS/FAIL dựa trên trạng thái quan sát được thật trên UI. Không suy diễn "chắc là chạy được".
- **Mỗi test case độc lập:** reset trạng thái (điều hướng lại / context mới / đăng nhập lại nếu cần) trước mỗi TC — không để TC trước làm bẩn TC sau.
- **Desktop viewport 1920×1080** cho mọi phiên debug/execution UI.
- **Bảo mật:** KHÔNG đọc `.env` để lấy credential đăng nhập app. Cần login → hỏi user hoặc dùng fixture/tài khoản test user cung cấp. Test data phải traceable, không dùng thông tin cá nhân thật.
- **Không có engine browser nào kết nối → DỪNG, báo user** (xem §2). Không tự đoán để chạy tiếp.
- **Artifact `run/` + `task.md`** — tạo để theo dõi tiến độ và lưu bằng chứng.

## Skill này khác gì các skill lân cận?

| | `execute-testcases-from-excel` (skill này) | `generate-automation-from-testcases` | `generate-automation-from-ui-flow` |
|---|---|---|---|
| **Mục tiêu** | **Chạy thật** để kiểm thử & chấm kết quả | Sinh **code** automation (POM + test) | Sinh **code** từ mô tả flow |
| **Input** | File Excel test case có sẵn | File test case (MD/Excel/JSON) | Mô tả UI steps / URL |
| **Output** | Excel đã chấm + báo cáo + bug report | Page Objects + Test scripts | Page Objects + Test scripts |
| **Khi FAIL** | Ghi BUG, không sửa | Auto-heal code đến khi PASS | Auto-heal code đến khi PASS |
| **Còn dùng lại** | Kết quả 1 lần chạy (regression thủ công) | Bộ code chạy lại được | Bộ code chạy lại được |

## Input cần thu thập

| Input | Cách lấy | Ưu tiên |
|---|---|---|
| **File Excel test case** (`.xlsx/.xls/.csv`) | User cung cấp path | ⭐ Bắt buộc |
| **URL / môi trường** ứng dụng cần test | User cung cấp hoặc trong cột Test Data/Pre-Condition | ⭐ Bắt buộc |
| **Phạm vi chạy** (tất cả / lọc theo Priority, Module, danh sách TC ID) | Hỏi user | Nên có |
| **Credentials / tài khoản test** (nếu cần login) | User cung cấp hoặc fixture — KHÔNG đọc `.env` | Tùy chọn |
| **Engine ưu tiên** (Chrome extension / Playwright MCP) | Mặc định auto-detect (§2); user có thể ép | Tùy chọn |

Thiếu input bắt buộc → hỏi trước khi chạy.

## Các bước thực hiện

### Bước 1 — Đọc & Chuẩn hóa Test Case từ Excel

1. **Đọc file** bằng helper `scripts/excel_io.js` (Node — không parse thủ công cho chắc chắn):
   ```bash
   NODE_PATH="<node_modules_có_exceljs>" \
   node .claude/skills/execute-testcases-from-excel/scripts/excel_io.js read \
       "<đường_dẫn_excel>" --sheet "<tên_sheet hoặc bỏ trống>" --out run/testcases.json
   ```
   Helper **tự nhận diện cột** theo alias (Việt + Anh) và trả JSON chuẩn hóa gồm các trường:
   `tc_id, module, risk_level, title, precondition, steps, expected, priority, test_data, _row, _sheet`.

   > Cần package **`exceljs`**. Nếu chưa cài cục bộ: `npm i exceljs`, hoặc set `NODE_PATH` trỏ tới `node_modules` đã có exceljs. File `.csv` cũng đọc được.
   > (Bản Python `excel_io.py` vẫn giữ lại để dùng nếu môi trường có Python + openpyxl.)

2. **Xác nhận schema đọc được** với user nếu có cột không map được, hoặc header lệch. Schema chuẩn của kit:
   `TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data`.

3. **Chốt phạm vi chạy** (scope) — DỪNG hỏi user nếu suite lớn (> 15 TC) hoặc chưa rõ:
   - Chạy tất cả, hay lọc theo `Priority` (VD chỉ P1/High), `Module`, hoặc danh sách `TC ID`?
   - Có TC nào phụ thuộc nhau (login tạo data cho TC sau) → xác định thứ tự.

4. **Tạo artifact theo dõi** `run/task.md`:
   ```markdown
   # Test Execution Progress
   - [x] Bước 1: Đọc test case từ Excel (N cases)
   - [ ] Bước 2: Chọn engine + kết nối browser
   - [ ] Bước 3: Xử lý pre-condition (login/setup)
   - [ ] Bước 4: Thực thi từng TC + chấm điểm
   - [ ] Bước 5: Ghi kết quả vào Excel
   - [ ] Bước 6: Sinh báo cáo + bug report

   ## Scope: <mô tả> — Tổng <N> TC
   | TC ID | Title | Priority | Status |
   |---|---|---|---|
   | TC01 | ... | P1 | ⏳ |
   ```

### Bước 2 — Chọn Engine: Chrome extension hay Playwright MCP (Decision Matrix)

> Mục tiêu: chọn đúng "tay lái" theo đặc điểm website. Auto-detect trước, rồi áp bảng quyết định.

1. **Auto-detect engine khả dụng** (kiểm tra tool đang kết nối):
   - Có tool dạng `mcp__<server>__browser_navigate` / `browser_snapshot` → **Playwright MCP** sẵn sàng.
   - Có tool dạng `mcp__claude-in-chrome__*` (`navigate`, `read_page`/`get_page_text`, `computer`, `find`, `form_input`, `screenshot`) → **Chrome extension** sẵn sàng.
   - **Không có cái nào** → **DỪNG.** Báo user + hướng dẫn bật (xem cuối §2). Tuyệt đối không đoán kết quả test.

2. **Bảng quyết định (khi có nhiều lựa chọn):**

   | Đặc điểm website / tình huống | Engine nên dùng |
   |---|---|
   | Site public / staging / môi trường test, không cần phiên đăng nhập sẵn | **Playwright MCP** |
   | Cần môi trường **sạch, tái lập** (mỗi TC một context mới) — regression | **Playwright MCP** |
   | Login được bằng **tài khoản test / fixture** (user cung cấp) | **Playwright MCP** |
   | Cần chạy lặp, nhiều viewport, hoặc headless | **Playwright MCP** |
   | Site yêu cầu **phiên đăng nhập THẬT đang mở sẵn** (SSO doanh nghiệp, MFA/2FA/OTP) | **Chrome extension** |
   | **App nội bộ** sau VPN/corp-auth mà Playwright khó login | **Chrome extension** |
   | Cần dùng **profile/cookie/extension thật** của user | **Chrome extension** |
   | Site có **bot-detection** chặn automation nhưng cho phép Chrome thật | **Chrome extension** |
   | User muốn **xem trực tiếp** thao tác trên Chrome của họ; chạy 1 lần thủ công | **Chrome extension** |

3. **Tie-breaker:** khi cả hai đều khả thi → **ưu tiên Playwright MCP** (tái lập tốt hơn, snapshot accessibility ổn định), **trừ khi** rơi vào các dòng "Chrome extension" ở trên.

4. **Cho phép user ép engine:** nếu user chỉ định rõ → tôn trọng lựa chọn đó (kể cả trái với bảng), miễn engine đó đang kết nối.

5. **Ánh xạ hành động ↔ tool theo engine** (dùng ở Bước 4):

   | Hành động | Playwright MCP | Chrome extension (Claude in Chrome) |
   |---|---|---|
   | Mở trang | `browser_navigate(url)` | `navigate(url)` |
   | Set viewport | `browser_resize(1920,1080)` | `resize_window` (nếu có) |
   | Đọc cấu trúc trang | `browser_snapshot()` (accessibility tree) | `read_page` / `get_page_text` |
   | Tìm element | từ ref trong snapshot | `find(...)` |
   | Click | `browser_click(element, ref)` | `computer` (click) |
   | Nhập text | `browser_type(element, ref, text)` | `form_input` / `computer` (type) |
   | Chọn dropdown | `browser_select_option(...)` | `form_input` / `computer` |
   | Chờ điều kiện | `browser_wait_for(text/…)` | poll bằng `read_page` (không hard-sleep) |
   | Chụp bằng chứng | `browser_take_screenshot(path)` | `screenshot` |

   > Tên tool có thể khác nhẹ theo cấu hình của user — bám theo tool **thực tế đang kết nối**, đừng gọi tool không tồn tại.

**Nếu chưa có engine nào — hướng dẫn user bật:**
- **Playwright MCP (Claude Code hoặc Claude Desktop):** thêm server rồi khởi động lại.
  `claude mcp add playwright npx @playwright/mcp@latest` — hoặc Desktop: *Settings → Developer → Edit config* (`%APPDATA%\Claude\claude_desktop_config.json`), thêm `@playwright/mcp@latest`.
- **Chrome extension:** bật extension "Claude in Chrome" và cho phép truy cập tab đang mở.

### Bước 3 — Xử lý Pre-Condition (Login / Setup / Data)

1. **Gộp pre-condition** từ các TC: đăng nhập, seed data, điều hướng tới trạng thái xuất phát.
2. **Login (nếu cần):**
   - Playwright MCP → đăng nhập bằng tài khoản test/fixture do user cung cấp.
   - Chrome extension → tận dụng phiên đã đăng nhập sẵn trên Chrome thật; nếu chưa login, nhờ user đăng nhập giúp rồi tiếp tục.
   - **CAPTCHA / OTP / 2FA** không tự vượt được → nhờ user thao tác, hoặc đánh TC liên quan là **BLOCKED** kèm lý do.
3. **Data cần unique** (email/username/mã) → sinh theo `/test-data-generator`, format traceable: `auto_<tc>_<timestamp>`.
4. Ghi nhận môi trường thực tế (URL, browser, tài khoản test) để đưa vào báo cáo.

### Bước 4 — Thực Thi Từng Test Case & Chấm Điểm (vòng lặp chính)

> Lặp qua **từng TC** trong scope. Mỗi TC là một chu trình độc lập.

Với mỗi test case:

1. **Reset trạng thái** đảm bảo độc lập: điều hướng về điểm xuất phát / mở context mới / đăng nhập lại nếu TC trước làm thay đổi.

2. **Thực hiện từng bước trong `Test Steps`:** diễn giải mô tả bằng lời thành hành động cụ thể trên UI (điều hướng, nhập, click, chọn…). Sau mỗi bước quan trọng: đọc lại trạng thái trang (`snapshot`/`read_page`) để xác nhận bước đã xảy ra như mong đợi trước khi sang bước kế.
   - Dùng smart wait — chờ text/element xuất hiện. **CẤM hard-sleep** cố định.
   - Element không thấy → đọc lại DOM, thử cách xác định khác (theo `locator_strategy.md`). Vẫn không được sau vài lần → xử lý theo bảng tình huống bên dưới.

3. **Quan sát kết quả thực tế** và so với **Expected Result** của TC → chấm **verdict**:

   | Verdict | Khi nào | Hành động |
   |---|---|---|
   | ✅ **PASS** | Thực tế **khớp** Expected | Ghi Actual ngắn gọn + ảnh trạng thái cuối |
   | ❌ **FAIL** | Thực tế **mâu thuẫn** Expected (lỗi sản phẩm) | Chụp ảnh lỗi + **tạo bug report** (§Bug) |
   | ⛔ **BLOCKED** | Không thực thi được vì môi trường/pre-condition (login hỏng, trang chết, phụ thuộc TC fail, CAPTCHA/2FA) | Ghi lý do, không tính là bug sản phẩm |
   | ⏭️ **SKIP** | Cố ý không chạy (ngoài scope, N/A lần này) | Ghi lý do |

   > **Nguyên tắc vàng:** thực tế ≠ Expected ⇒ **BUG**, không phải "test viết sai". Không chỉnh sửa gì để ép PASS.

4. **Chụp bằng chứng (evidence)** lưu vào `run/evidence/`:
   - Bắt buộc: ảnh **trạng thái cuối** mỗi TC; ảnh **ngay tại bước lỗi** với mọi TC FAIL.
   - Đặt tên: `<TC_ID>_<pass|fail|blocked>_<mô-tả-ngắn>.png`.

5. **Ghi nhận kết quả TC** (giữ trong bộ nhớ / append vào `run/results.json`): `tc_id, status, actual, evidence[], bug_id (nếu FAIL), note, executed_at, _row, _sheet`.

6. **Cập nhật `run/task.md`** trạng thái TC (⏳→✅/❌/⛔/⏭️) để theo dõi tiến độ.

**Bảng xử lý tình huống khi chạy live:**

| Tình huống | Cách xử lý |
|---|---|
| Trang chưa load xong | Chờ text/element cụ thể (smart wait), không sleep cứng |
| Modal/popup che | Xử lý popup trước rồi tiếp tục flow |
| Redirect/đổi trang | Đọc lại DOM ở trang mới trước khi tương tác |
| Element off-screen | Scroll đến element rồi mới thao tác |
| URL chặn / cần VPN | Đánh TC **BLOCKED**, báo user |
| CAPTCHA / 2FA / OTP | Nhờ user thao tác, hoặc **BLOCKED** kèm lý do |
| Bước không rõ nghĩa / thiếu data | Nếu suy luận được hợp lý thì tiếp; nếu mơ hồ ảnh hưởng kết quả → hỏi user |
| Nghi ngờ flaky (khi lặp ra kết quả khác) | Chạy lại đúng TC đó 1 lần; nếu vẫn dao động → ghi note "nghi flaky" |

### Bước 5 — Ghi Kết Quả Ngược Vào Excel

Dùng helper để ghi trở lại (mặc định tạo bản sao `*_executed.xlsx`, không đè file gốc):
```bash
NODE_PATH="<node_modules_có_exceljs>" \
node .claude/skills/execute-testcases-from-excel/scripts/excel_io.js write \
    "<đường_dẫn_excel_gốc>" --results run/results.json --out "<đường_dẫn>_executed.xlsx"
```
Helper thêm/điền các cột: **Actual Result, Status, Executed At, Evidence, Note/Bug ID**; tô màu theo trạng thái (PASS xanh / FAIL đỏ / BLOCKED xám) để dễ đọc. Khớp dòng theo `_row`/`tc_id`.

> Bỏ `--out` → tự tạo `<tên>_executed.xlsx`. Muốn ghi ĐÈ thẳng file gốc → thêm cờ `--in-place` (hỏi xác nhận user trước vì sẽ mất dữ liệu cũ). Bản Node chỉ ghi `.xlsx`; nếu cần ghi `.csv` thì dùng bản Python `excel_io.py`.

### Bước 6 — Sinh Báo Cáo Tổng Hợp + Bug Report

1. Dựng báo cáo Markdown từ khung `references/report-template.md`, lưu `run/report.md`, gồm:
   - **Metadata:** ngày chạy, engine đã dùng, môi trường/URL, tài khoản test, tổng thời lượng.
   - **Summary:** tổng số TC, số PASS/FAIL/BLOCKED/SKIP, **pass rate**.
   - **Bảng chi tiết:** mỗi TC → Status, Actual (ngắn), link evidence.
   - **Bug reports:** mỗi TC FAIL → một bug report đầy đủ theo chuẩn `/manual-testing-techniques` §6.1 (Title `[Màn hình] Hành động → Kết quả sai`, Environment, Pre-condition, Steps to Reproduce, Expected, Actual, Attachment=ảnh, **Severity/Priority**). 1 lỗi = 1 report, không gộp.
   - **Blocked/Skipped:** liệt kê kèm lý do rõ ràng.

2. **Severity/Priority** theo `/manual-testing-techniques` §6.2: Severity = `Critical/Major/Minor/Trivial`; Priority = `Urgent/High/Medium/Low`.

### Bước 7 — Cleanup & Bàn Giao

Đối chiếu `.claude/rules/delivery_checklist.md`:
- Cập nhật `run/task.md` với kết quả cuối; đảm bảo mọi TC có verdict.
- Bằng chứng nằm gọn trong `run/evidence/`; không để file rác.
- Báo cáo tóm tắt cho user: **X PASS / Y FAIL / Z BLOCKED / W SKIP** (pass rate), danh sách bug đã log (kèm Severity/Priority), các TC BLOCKED và lý do, đường dẫn file Excel đã chấm + `run/report.md`.
- Nêu rõ **limitations** (TC không chạy được, phần cần user thao tác tay, nghi flaky…).

## Cấu trúc thư mục artifact

```
run/
├── task.md               # tiến độ 7 bước + trạng thái từng TC
├── testcases.json        # TC đã chuẩn hóa từ Excel
├── results.json          # kết quả từng TC (nguồn để ghi Excel + báo cáo)
├── report.md             # báo cáo tổng hợp + bug report
└── evidence/             # screenshot bằng chứng theo TC
    ├── TC01_pass_dashboard.png
    └── TC03_fail_email-no-at.png
```

## Output

- **File Excel đã chấm** (`*_executed.xlsx`) — thêm cột Actual/Status/Executed At/Evidence/Note, tô màu theo trạng thái.
- **Báo cáo `run/report.md`** — summary + bảng chi tiết + bug report cho từng FAIL.
- **Evidence screenshots** — bằng chứng cho từng TC (bắt buộc với FAIL).
- **`run/task.md`** — nhật ký tiến độ + trạng thái từng TC.
- **Tóm tắt cho user** — PASS/FAIL/BLOCKED/SKIP + pass rate + danh sách bug + limitations.
