---
name: explore-and-report-bugs-to-excel
description: Tự KHÁM PHÁ & sử dụng phần mềm web trực tiếp trên browser (Playwright MCP hoặc Chrome extension) để SĂN LỖI — đối chiếu hành vi thật với Requirement/Spec, chủ động phá bằng data xấu/biên, rồi viết mỗi lỗi thành một bug CHI TIẾT TỪNG BƯỚC TÁI HIỆN và XUẤT RA EXCEL theo mẫu 3 cột (id | web/flutter | Bug) kèm evidence. Dùng khi user muốn "tự test phần mềm và ghi lỗi ra Excel" mà CHƯA có bộ test case sẵn (khác execute-testcases-from-excel — skill đó chạy test case có sẵn; khác generate-automation-* — các skill đó sinh code). Trigger: "tự test tìm lỗi", "khám phá phần mềm ghi bug", "viết testcase lỗi ra excel", "săn bug", "exploratory testing ra excel".
---

# Workflow: Khám Phá Phần Mềm → Săn Lỗi → Xuất Testcase-Lỗi ra Excel

> **BẮT BUỘC (MANDATORY SKILLS/RULES):** Nạp & đọc kỹ trước khi bắt đầu:
> - **`/manual-testing-techniques`** (`.claude/skills/manual-testing-techniques/SKILL.md`) — kỹ thuật thiết kế test (EP/BVA/Decision Table/State Transition/Error Guessing), chuẩn PASS/FAIL, cấu trúc Bug Report, Severity vs Priority.
> - **`.claude/rules/locator_strategy.md`** — xác định element ổn định khi tương tác live.
> - **`.claude/rules/delivery_checklist.md`** — Definition of Done trước khi bàn giao.
>
> **TẬN DỤNG (leverage — nạp khi tới bước tương ứng):**
> - **`/explore-website-requirements-by-flow`** hoặc **`/generate-application-test-plan`** — để đi HẾT thao tác/menu/tab/modal/nhánh rẽ, dựng bản đồ coverage (không bỏ sót màn hình).
> - **`/ui-debug-agent`** (`.claude/skills/ui-debug-agent/SKILL.md`) — inspect DOM thật, xác định locator ổn định, debug khi element khó thao tác.
> - **`/generate-test-data`** (`.claude/skills/generate-test-data/SKILL.md`) — sinh data xấu/biên/edge (boundary, invalid, quá dài, ký tự đặc biệt, rỗng) để CHỦ ĐỘNG phá.

Skill này biến agent thành **một tester exploratory có AI hỗ trợ**: tự lái browser thật để dùng phần mềm, đối chiếu hành vi quan sát được với **Requirement/Spec**, chủ động thử các case xấu để phát hiện lỗi, rồi ghi **mỗi lỗi thành một bug chi tiết từng bước tái hiện** và xuất ra **Excel theo mẫu 3 cột `id | web/flutter | Bug`** cùng evidence.

## 📋 Mẫu Excel đích (BẮT BUỘC bám sát)

Excel xuất ra đúng **3 cột**: `id | web/flutter | Bug`. Cột **`Bug`** là 1 khối text nhiều dòng:

```
1. <bước tái hiện 1 — chi tiết, cụ thể: màn hình nào, nút/field nào, nhập gì, phím tắt gì>
2. <bước tái hiện 2>
3. <bước tái hiện 3>
→ Lỗi hiện tại: <hiện tượng lỗi quan sát được trên UI>
→ Kết quả mong đợi: <hành vi đúng theo spec>
```
> Lỗi phân quyền/bảo mật hoặc khi cần đề xuất sửa → thay/thêm dòng `→ Cần fix: <việc cần làm>`.
> Chi tiết cột & cách viết `steps` xem `references/bug-excel-schema.md`.

## ⚠️ Nguyên tắc thực thi (đọc trước)

- **Tất cả output bằng Tiếng Việt.**
- **Đây là EXECUTION + BUG HUNTING, KHÔNG sinh code.** Agent *dùng thật* phần mềm để tìm lỗi; không sinh Page Object / test script. Muốn sinh code → `/generate-automation-from-ui-flow`.
- **Nguồn chân lý là SPEC.** Lỗi được xác định khi **hành vi thật ≠ Requirement/Spec**. Khi một hành vi không có trong spec, dùng heuristic/kỹ thuật test để phán đoán và **đánh dấu là "nghi ngờ — cần PO xác nhận"**, không kết luận vội.
- **KHÔNG ĐOÁN, KHÔNG auto-heal.** Chỉ ghi lỗi dựa trên trạng thái quan sát THẬT trên UI. Không sửa gì để "làm cho hết lỗi".
- **Mỗi lỗi độc lập & tái hiện được:** viết **CHI TIẾT TỪNG BƯỚC** từ điểm xuất phát rõ ràng (đăng nhập → màn hình → thao tác), nêu đúng tên nút/field/phím tắt và dữ liệu cụ thể — đủ để dev làm theo y hệt. 1 lỗi = 1 dòng Excel, không gộp.
- **Desktop viewport 1920×1080** cho mọi phiên khám phá/UI.
- **Bảo mật:** KHÔNG đọc `.env` để lấy credential. Login → lấy từ file môi trường user cung cấp (VD `prompt/Enviroment.txt`) hoặc hỏi user. Test data traceable, không dùng thông tin cá nhân thật.
- **Thao tác phá hủy (Create/Edit/Delete):** ĐƯỢC PHÉP để test sâu, nhưng **DỪNG xác nhận user 1 lần trước khi bắt đầu**, chỉ chạy trên môi trường **TEST/STAGING**, và **ghi log mọi thao tác phá hủy** vào `run/task.md`.
- **Không có engine browser nào kết nối → DỪNG, báo user** (xem Bước 2). Tuyệt đối không đoán locator/không suy diễn kết quả.
- **Artifact `run/` + Excel ở `Result/`** — tạo để theo dõi tiến độ, lưu evidence và bàn giao.

## Skill này khác gì các skill lân cận?

| | `explore-and-report-bugs-to-excel` (skill này) | `execute-testcases-from-excel` | `explore-website-requirements-by-flow` |
|---|---|---|---|
| **Input** | Spec + URL (KHÔNG cần test case sẵn) | File Excel test case **có sẵn** | URL / module |
| **Việc làm** | Tự khám phá + **săn lỗi** | Chạy đúng các TC đã viết | Khám phá để **sinh requirements** |
| **Output** | **Excel testcase-lỗi** + report + evidence | Excel đã chấm + report | Tài liệu Requirements (BA) |
| **Trọng tâm** | Tìm ra lỗi CHƯA ai viết TC | Xác nhận TC pass/fail | Mô tả hệ thống |

## Bước 0 — Thu thập Input & DỪNG hỏi user (BẮT BUỘC)

> Skill này cần vài thông tin không suy ra được. **Liệt kê thiếu gì và DỪNG hỏi user** trước khi chạy. Không tự đoán để chạy một mạch.

**Input bắt buộc — hỏi nếu thiếu:**

| Input | Vì sao cần | Gợi ý lấy |
|---|---|---|
| **URL + Môi trường** ứng dụng cần test | Điểm xuất phát khám phá | File môi trường (VD `prompt/Enviroment.txt`) hoặc user |
| **Tài khoản test (tk/mk)** nếu cần login | Vào được app | File môi trường / user cung cấp — KHÔNG đọc `.env` |
| **Requirement/Spec** (file, link, hoặc mô tả) | **Nguồn chân lý** để đối chiếu ra lỗi | User cung cấp; nếu không có → xem lưu ý ↓ |
| **Phạm vi khám phá (scope)** | Toàn app hay 1 vài module? | Hỏi user; mặc định hỏi rõ nếu app lớn |
| **Cho phép thao tác phá hủy?** | Xác nhận trước khi Create/Edit/Delete | Hỏi 1 lần; mặc định chờ user OK |
| **Đường dẫn Excel output** | Nơi ghi kết quả | Mặc định `Result/bugs_<app>_<ngày>.xlsx` |

**Nếu KHÔNG có Spec/Requirement:** báo user rằng skill được cấu hình để **đối chiếu spec**. Đề nghị 1 trong 2:
1. User cung cấp spec (dù chỉ mô tả ngắn các quy tắc nghiệp vụ / acceptance criteria), **hoặc**
2. Cho phép skill **tự dựng baseline kỳ vọng** bằng `/explore-website-requirements-by-flow` rồi **user xác nhận** baseline đó trước khi dùng làm chuẩn so sánh. Không tự bịa spec.

**Tạo artifact theo dõi** `run/task.md`:
```markdown
# Bug Hunting Progress
- [x] Bước 0: Thu thập input + xác nhận scope & quyền phá hủy
- [ ] Bước 1: Nạp spec làm nguồn chân lý + kỹ thuật test
- [ ] Bước 2: Chọn engine + kết nối browser
- [ ] Bước 3: Login + dựng bản đồ coverage (explore)
- [ ] Bước 4: Khám phá & săn lỗi từng màn hình
- [ ] Bước 5: Xuất testcase-lỗi ra Excel (Result/)
- [ ] Bước 6: Báo cáo + tóm tắt

## Scope: <mô tả>  |  Quyền phá hủy: <có/không>  |  Engine: <...>
## Log thao tác phá hủy
| Thời điểm | Màn hình | Thao tác | Dữ liệu bị ảnh hưởng |
|---|---|---|---|
```

## Bước 1 — Nạp Spec làm Nguồn Chân Lý + Bộ Kỹ Thuật Test

1. **Nạp & bóc tách Spec** thành danh sách **quy tắc kiểm chứng được** (mỗi quy tắc có mã: `FR-xx`, `BR-xx`): field bắt buộc, ràng buộc định dạng/độ dài, giá trị biên, luồng trạng thái hợp lệ, thông báo lỗi kỳ vọng, phân quyền… Đây là danh sách "Expected" để đối chiếu.
2. **Chọn kỹ thuật săn lỗi** theo `/manual-testing-techniques` cho từng loại input/luồng:
   - **EP + BVA** cho ô nhập số/ngày/độ dài (min-1, min, max, max+1, rỗng, âm…).
   - **Decision Table** cho tổ hợp điều kiện (VD combo trạng thái đơn × loại khách).
   - **State Transition** cho luồng có trạng thái (nháp→gửi→duyệt→hủy…), thử chuyển trạng thái không hợp lệ.
   - **Error Guessing** cho các "cú đấm bẩn": ký tự đặc biệt, emoji, chuỗi rất dài, khoảng trắng, nhập nhanh double-click, back/refresh giữa chừng, bỏ trống field bắt buộc.
3. **Chuẩn bị data xấu/biên** bằng `/generate-test-data` (mục negative/boundary/edge): email sai định dạng, số âm, ngày quá khứ/tương lai, vượt maxlength, SQL/HTML-ish string (kiểm tra escaping, KHÔNG nhằm khai thác thật).

## Bước 2 — Chọn Engine: Auto-detect (Playwright MCP / Chrome extension)

1. **Auto-detect engine đang kết nối:**
   - Có tool `mcp__<server>__browser_navigate` / `browser_snapshot` → **Playwright MCP** sẵn sàng (ưu tiên: tái lập tốt, snapshot accessibility ổn định).
   - Có tool `mcp__claude-in-chrome__*` (`navigate`, `read_page`/`get_page_text`, `computer`, `find`, `form_input`, `screenshot`) → **Chrome extension** (hợp SSO/2FA/phiên thật).
   - **Không có cái nào → DỪNG, báo user** + hướng dẫn bật (cuối bước). Không đoán kết quả test.
2. **Tie-breaker:** cả hai khả dụng → **ưu tiên Playwright MCP**, trừ khi site cần phiên đăng nhập THẬT/SSO/MFA hoặc bị bot-detection → dùng **Chrome extension**.
3. **Thứ tự bắt buộc khi mở (Playwright):** `browser_navigate(url)` → `browser_resize(1920,1080)` → `browser_snapshot()`.
4. **Ánh xạ hành động ↔ tool theo engine:**

   | Hành động | Playwright MCP | Chrome extension |
   |---|---|---|
   | Mở trang | `browser_navigate(url)` | `navigate(url)` |
   | Set viewport | `browser_resize(1920,1080)` | `resize_window` (nếu có) |
   | Đọc cấu trúc trang | `browser_snapshot()` | `read_page` / `get_page_text` |
   | Tìm element | ref từ snapshot | `find(...)` |
   | Click | `browser_click(element, ref)` | `computer` (click) |
   | Nhập text | `browser_type(...)` | `form_input` / `computer` |
   | Chọn dropdown | `browser_select_option(...)` | `form_input` / `computer` |
   | Chờ điều kiện | `browser_wait_for(text/…)` | poll bằng `read_page` (không hard-sleep) |
   | Chụp bằng chứng | `browser_take_screenshot(path)` | `screenshot` |

**Chưa có engine — hướng dẫn user bật:**
- **Playwright MCP:** `claude mcp add playwright npx @playwright/mcp@latest` rồi khởi động lại (Desktop: Settings → Developer → Edit config).
- **Chrome extension:** bật "Claude in Chrome" và cho phép truy cập tab đang mở.

## Bước 3 — Login + Dựng Bản Đồ Coverage (Explore)

1. **Login** bằng tk/mk từ file môi trường/user. CAPTCHA/OTP/2FA không tự vượt → nhờ user thao tác; nếu không được → ghi màn hình đó **BLOCKED** kèm lý do.
2. **Xác nhận quyền phá hủy** (nếu user đã đồng ý ở Bước 0) — chỉ trên TEST/STAGING.
3. **Dựng bản đồ coverage** bằng `/explore-website-requirements-by-flow` (hoặc `/generate-application-test-plan` mode PLAN): liệt kê mọi màn hình/menu/tab/modal/nút/field trong scope. Đây là danh sách nơi cần đi soi lỗi — để **không bỏ sót thao tác**. Ghi vào `run/coverage.md`.

## Bước 4 — Khám Phá & Săn Lỗi Từng Màn Hình (vòng lặp chính)

> Duyệt từng mục trong bản đồ coverage. Mỗi màn hình/luồng chạy chu trình sau. Mỗi TC/thử nghiệm độc lập — reset trạng thái trước khi thử case mới.

Với mỗi màn hình / field / luồng:

1. **Đọc trạng thái thật** (`snapshot`/`read_page`) → xác định các input, nút, luồng, thông báo.
2. **Sinh loạt phép thử** từ Bước 1: kết hợp happy-path (để lấy baseline) + các case xấu/biên/negative theo kỹ thuật phù hợp với loại field/luồng.
3. **Thực hiện phép thử trên UI:** nhập data, click, submit, chuyển trạng thái… Dùng smart wait (chờ text/element). **CẤM hard-sleep.** Element khó thao tác → nhờ `/ui-debug-agent` inspect DOM, chọn locator theo `locator_strategy.md`.
4. **Đối chiếu Actual vs Spec (Expected):**

   | Tình huống | Kết luận |
   |---|---|
   | Actual **mâu thuẫn** một quy tắc spec (`FR/BR`) | ❌ **BUG** → tạo testcase-lỗi (mục dưới) |
   | Actual **khớp** spec | ✅ OK — không ghi (hoặc ghi vắn tắt vào coverage) |
   | Hành vi **không có trong spec** nhưng rõ ràng vô lý (crash, mất data, số âm tồn kho…) | ⚠️ **BUG nghi ngờ** → ghi + đánh dấu "cần PO xác nhận" |
   | Không thực thi được (login hỏng/trang chết/CAPTCHA) | ⛔ **BLOCKED** → ghi lý do, không tính là bug |

5. **Khi phát hiện BUG → tạo 1 bug record** (append vào `run/bugs.json`, theo `references/bug-excel-schema.md`). Đúng mẫu Excel 3 cột:
   - `id` (số thứ tự), `platform` (nền tảng: `flutter` / `web/flutter` / `web`…), `steps` (**mảng các bước tái hiện — CHI TIẾT TỪNG BƯỚC**), `actual` (→ Lỗi hiện tại), `expected` (→ Kết quả mong đợi, theo spec). Lỗi phân quyền/bảo mật hoặc khi cần đề xuất sửa → thêm `fix` (→ Cần fix).
   - **`steps` phải chi tiết:** bắt đầu từ điểm xuất phát ("Đăng nhập vào Cashier, mở giao diện Edit menu"), mỗi phần tử 1 hành động đơn, nêu đúng tên màn hình/nút/field/phím tắt + dữ liệu cụ thể đã nhập. Đủ để dev làm theo y hệt, không phải đoán.
   - **Chụp evidence ngay tại bước lỗi** → `run/evidence/<id>_<mô-tả>.png` (ghi vào `run/report.md`; mẫu Excel không có cột evidence).
   - **Severity/Priority** vẫn đánh giá theo `/manual-testing-techniques` §6.2 và ghi trong `run/report.md` (mẫu Excel không có cột này) để phân loại/ưu tiên.
6. **Nếu là thao tác phá hủy** (đã tạo/sửa/xóa data) → ghi 1 dòng vào bảng "Log thao tác phá hủy" trong `run/task.md`.
7. **Nghi flaky** (lặp ra kết quả khác) → chạy lại đúng phép thử đó 1 lần; vẫn dao động → ghi `note="nghi flaky"`.
8. **Cập nhật `run/task.md`** tiến độ màn hình đã soi.

**Bảng xử lý tình huống live** (giống execute skill): trang chưa load → smart wait; modal che → xử lý trước; redirect → đọc lại DOM; element off-screen → scroll; URL chặn/VPN → BLOCKED; bước mơ hồ ảnh hưởng kết quả → hỏi user.

## Bước 5 — Xuất Bug ra Excel theo mẫu 3 cột (folder `Result/`)

Dùng helper để ghi `run/bugs.json` ra Excel:
```bash
NODE_PATH="<node_modules_có_exceljs>" \
node .claude/skills/explore-and-report-bugs-to-excel/scripts/bugs_to_excel.js write \
    run/bugs.json --out "Result/bugs_<app>_<YYYYMMDD>.xlsx"
```
- Nếu môi trường chưa có `exceljs`: `npm i exceljs` (hoặc trỏ `NODE_PATH` tới `node_modules` có sẵn — tham khảo cách skill `execute-testcases-from-excel` dùng).
- Excel gồm sheet **`Bug`** đúng mẫu **3 cột `id | web/flutter | Bug`** (cột `Bug` = các bước đánh số + `→ Lỗi hiện tại:` + `→ Kết quả mong đợi:`/`→ Cần fix:`, wrap text nhiều dòng, header cam nhạt, freeze dòng tiêu đề) và sheet **`Info`** (metadata lần chạy). Chi tiết theo `references/bug-excel-schema.md`.
- **Đặt file vào folder `Result/`** (tạo nếu chưa có). Không đè file cũ — đặt tên có ngày.

## Bước 6 — Báo Cáo Tổng Hợp + Bàn Giao

1. Dựng `run/report.md`: metadata (URL, engine, tài khoản test — KHÔNG ghi mật khẩu, scope, thời lượng); **Summary** (tổng bug, phân bố theo Severity/Priority/Module); **bảng chi tiết** từng bug (link evidence); **màn hình BLOCKED** + lý do; **danh sách thao tác phá hủy** đã thực hiện; **giả định & giới hạn** (bug nghi ngờ cần PO xác nhận, phần cần user thao tác tay, nghi flaky).
2. Đối chiếu `.claude/rules/delivery_checklist.md`: mọi bug có evidence; artifact gọn trong `run/`; Excel trong `Result/`; không lộ credential.
3. **Tóm tắt cho user:** tổng **N bug** (a Critical / b Major / c Minor / d Trivial), số màn hình đã soi / BLOCKED, đường dẫn **Excel trong `Result/`** + `run/report.md`, và các điểm cần PO xác nhận.

## Cấu trúc thư mục artifact

```
run/
├── task.md          # tiến độ + log thao tác phá hủy
├── coverage.md      # bản đồ màn hình/thao tác đã soi
├── bugs.json        # nguồn dữ liệu bug (đưa vào bugs_to_excel.js)
├── report.md        # báo cáo tổng hợp
└── evidence/        # screenshot tại bước lỗi
    └── 1_trang-thai-mon-sql-error.png
Result/
└── bugs_<app>_<YYYYMMDD>.xlsx   # bug xuất ra Excel (mẫu 3 cột)
```

## Output

- **Excel bug** (`Result/bugs_<app>_<date>.xlsx`) — mẫu **3 cột `id | web/flutter | Bug`**; cột `Bug` = các bước tái hiện chi tiết + `→ Lỗi hiện tại:` + `→ Kết quả mong đợi:`/`→ Cần fix:`.
- **Báo cáo `run/report.md`** — summary theo Severity/Module + chi tiết + evidence + limitations.
- **Evidence screenshots** — bằng chứng cho mỗi bug.
- **`run/task.md` + `run/coverage.md`** — tiến độ, phạm vi đã soi, log thao tác phá hủy.
- **Tóm tắt cho user** — số bug theo mức + đường dẫn file + điểm cần PO xác nhận.
