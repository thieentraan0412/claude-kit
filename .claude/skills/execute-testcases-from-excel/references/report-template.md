# Báo Cáo Thực Thi Test Case — `<Tên bộ / Module>`

> Khung mẫu cho `run/report.md`. Thay các `<...>`; xóa dòng không dùng. Bug report bám chuẩn `/manual-testing-techniques` §6.

## 1. Thông tin lần chạy

| Mục | Giá trị |
|---|---|
| Ngày chạy | `<YYYY-MM-DD HH:MM>` |
| Người/agent thực thi | Claude (AI Test Execution) |
| Engine | `<Playwright MCP | Chrome extension>` |
| Môi trường / URL | `<https://...>` |
| Trình duyệt / viewport | `<Chromium 1920×1080>` |
| Tài khoản test | `<user test — KHÔNG ghi mật khẩu>` |
| File test case nguồn | `<đường dẫn .xlsx>` |
| Phạm vi (scope) | `<tất cả | lọc theo Priority/Module/TC ID>` |

## 2. Tổng quan kết quả (Summary)

| Chỉ số | Số lượng |
|---|---|
| Tổng TC chạy | `<N>` |
| ✅ PASS | `<a>` |
| ❌ FAIL | `<b>` |
| ⛔ BLOCKED | `<c>` |
| ⏭️ SKIP | `<d>` |
| **Pass rate** | `<a / (a+b) %>` |

`<Nhận xét 1–2 câu: khu vực ổn định, khu vực nhiều lỗi, rủi ro chính.>`

## 3. Chi tiết từng test case

| TC ID | Tiêu đề | Priority | Status | Kết quả thực tế (tóm tắt) | Bằng chứng | Bug |
|---|---|---|---|---|---|---|
| `<TC01>` | `<...>` | `<P1>` | ✅ PASS | `<...>` | `evidence/TC01_pass.png` | — |
| `<TC03>` | `<...>` | `<P1>` | ❌ FAIL | `<...>` | `evidence/TC03_fail.png` | BUG-01 |
| `<TC05>` | `<...>` | `<P2>` | ⛔ BLOCKED | `<lý do>` | — | — |

## 4. Bug Reports (mỗi TC FAIL = 1 bug, không gộp)

### BUG-01 — `[<Màn hình>] <Hành động> → <Kết quả sai>`

| Trường | Nội dung |
|---|---|
| **Liên kết TC** | `<TC03>` |
| **Environment** | `<Trình duyệt/OS/URL/build/tài khoản test>` |
| **Pre-condition** | `<trạng thái cần có trước khi thực hiện>` |
| **Steps to Reproduce** | 1. `<...>`  2. `<...>`  3. `<...>` (có test data thật) |
| **Expected Result** | `<theo cột Expected của TC>` |
| **Actual Result** | `<quan sát thực tế>` |
| **Attachment** | `evidence/TC03_fail_<mô tả>.png` `<+ console/log nếu có>` |
| **Severity** | `<Critical / Major / Minor / Trivial>` |
| **Priority** | `<Urgent / High / Medium / Low>` |

`<Lặp lại block trên cho mỗi bug.>`

## 5. TC BLOCKED / SKIP & lý do

| TC ID | Trạng thái | Lý do | Cần gì để chạy được |
|---|---|---|---|
| `<TC05>` | ⛔ BLOCKED | `<CAPTCHA / login hỏng / phụ thuộc TC fail>` | `<user thao tác OTP / cấp tài khoản>` |

## 6. Ghi chú & Giới hạn (Limitations)

- `<Phần cần user thao tác tay (OTP/2FA, thanh toán thật...).>`
- `<TC nghi flaky — kết quả dao động khi lặp.>`
- `<Giả định đã đặt ra khi bước mô tả chưa rõ.>`
