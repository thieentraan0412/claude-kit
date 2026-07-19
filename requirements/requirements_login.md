# Tài liệu Yêu cầu — Module Đăng nhập (Login)

| Mục | Nội dung |
|---|---|
| **Module** | Login (Đăng nhập) |
| **Hệ thống** | ERP / POS quản lý cửa hàng F&B (đặt món tại bàn) — kiến trúc đa cửa hàng (multi-tenant) |
| **URL khảo sát** | `https://table1.klkim.com/v2/login` (điều hướng theo ID cửa hàng sang domain tenant, vd `https://table.ordersysvn.com/v2/login`) |
| **Ngôn ngữ giao diện** | Tiếng Việt (mặc định `vi`); hỗ trợ chuyển `en` / `vi` / `kr` |
| **Nguồn dữ liệu** | Inspect DOM thực tế qua Playwright MCP (viewport 1920×1080), tài khoản `test18 / admin / 12345678` |
| **Ngày khảo sát** | 2026-07-08 |

---

## 1. Tổng quan (Overview)

Module **Đăng nhập** là cổng xác thực người dùng vào hệ thống ERP/POS bán hàng F&B. Đây là hệ thống **đa cửa hàng (multi-tenant)**: người dùng phải nhập **ID cửa hàng** để xác định cửa hàng (tenant) của mình, sau đó nhập **tên đăng nhập** và **mật khẩu**.

Điểm đặc thù quan trọng: **ID cửa hàng quyết định domain của tenant**. Khi đăng nhập từ `table1.klkim.com` với ID `test18`, hệ thống điều hướng người dùng sang domain riêng của cửa hàng đó (`table.ordersysvn.com`).

Sau khi xác thực thành công, người dùng **không vào thẳng ứng dụng** mà tới màn hình **chọn phương thức làm việc / vai trò** (`/v2/login-methods`): **Nhân viên**, **Thu ngân**, hoặc **Quản lý** — mỗi vai trò dẫn tới một khu vực chức năng khác nhau.

Form được xử lý phía server (POST `/v2/login`, có CSRF token của Laravel); các ràng buộc bắt buộc và thông báo lỗi được trả về từ server (không có validation HTML5 phía client).

---

## 2. Yêu cầu Chức năng (Functional Requirements)

### FR-01 — Đăng nhập vào hệ thống
> **Là một** nhân sự cửa hàng (Nhân viên / Thu ngân / Quản lý),
> **tôi muốn** đăng nhập bằng ID cửa hàng, tên đăng nhập và mật khẩu,
> **để** truy cập vào hệ thống quản lý/bán hàng của cửa hàng mình.

**Tiêu chí chấp nhận (Acceptance Criteria):**
- AC-01.1: Cả 3 trường **ID cửa hàng**, **Tên đăng nhập**, **Mật khẩu** đều bắt buộc; bỏ trống trường nào sẽ hiển thị thông báo bắt buộc tương ứng ngay dưới trường đó.
- AC-01.2: Nhập đúng ID cửa hàng + tên đăng nhập + mật khẩu → xác thực thành công, chuyển sang màn hình chọn vai trò (`/v2/login-methods`).
- AC-01.3: Nhập sai mật khẩu (với tài khoản có tồn tại) → hiển thị "**Mật khẩu không chính xác**" dưới ô Mật khẩu; các giá trị đã nhập được giữ lại.
- AC-01.4: Nhập tên đăng nhập không tồn tại → hiển thị "**Tài khoản không tồn tại**" dưới ô Tên đăng nhập.
- AC-01.5: Nhập ID cửa hàng hợp lệ → hệ thống điều hướng sang domain tenant tương ứng với ID cửa hàng đó.

### FR-02 — Ghi nhớ đăng nhập (Remember me)
> **Là một** người dùng thường xuyên, **tôi muốn** chọn "Ghi nhớ đăng nhập" **để** không phải nhập lại thông tin ở các lần sau.

**Tiêu chí chấp nhận:**
- AC-02.1: Checkbox "Ghi nhớ đăng nhập" mặc định **không được tích**.
- AC-02.2: Người dùng có thể tích/bỏ tích trước khi đăng nhập.

### FR-03 — Hiện/Ẩn mật khẩu
> **Là một** người dùng, **tôi muốn** xem được mật khẩu đang nhập **để** kiểm tra tránh gõ sai.

**Tiêu chí chấp nhận:**
- AC-03.1: Bấm icon con mắt cạnh ô Mật khẩu → đổi kiểu ô từ ẩn (`password`) sang hiện (`text`) và ngược lại.

### FR-04 — Quên mật khẩu
> **Là một** người dùng quên mật khẩu, **tôi muốn** có liên kết khôi phục **để** đặt lại mật khẩu.

**Tiêu chí chấp nhận:**
- AC-04.1: Bấm "Quên mật khẩu" → điều hướng tới trang `/v2/forgot-password`.

### FR-05 — Chuyển đổi ngôn ngữ
> **Là một** người dùng, **tôi muốn** chọn ngôn ngữ giao diện **để** dùng ngôn ngữ phù hợp.

**Tiêu chí chấp nhận:**
- AC-05.1: Có 3 lựa chọn ngôn ngữ: **en**, **vi**, **kr**.
- AC-05.2: Bấm một ngôn ngữ → điều hướng tới `/v2/lang/{mã}` và áp dụng ngôn ngữ đó cho giao diện.

### FR-06 — Chọn phương thức/vai trò làm việc sau đăng nhập
> **Là một** người dùng đã xác thực, **tôi muốn** chọn vai trò làm việc **để** vào đúng khu vực chức năng của mình.

**Tiêu chí chấp nhận:**
- AC-06.1: Sau đăng nhập, hiển thị màn hình chào mừng kèm tên cửa hàng và combobox chọn cửa hàng.
- AC-06.2: Có 3 vai trò để chọn — **Nhân viên** (→ `/v2/order/staff/show-table`), **Thu ngân** (→ `/v2/order/cashier`), **Quản lý** (→ `/v2/dashboard`).
- AC-06.3: Có nút **Đăng xuất** đưa người dùng trở lại trang Login.

---

## 3. Đặc tả Trường Dữ liệu (Field Specifications)

| # | Tên trường (Label) | HTML `id` / `name` | Loại (Type UI) | Bắt buộc | Ràng buộc / Ghi chú |
|---|---|---|---|---|---|
| 1 | ID cửa hàng | `company_slug` / `company_slug` | Text input | ✅ (server) | Placeholder "ID cửa hàng". Xác định tenant → điều hướng domain. Không thấy ràng buộc `maxlength`/`pattern` phía client. |
| 2 | Tên đăng nhập | `username` / `username` | Text input | ✅ (server) | Placeholder "Tên đăng nhập". Không thấy ràng buộc độ dài phía client. |
| 3 | Mật khẩu | `password` / `password` | Password input | ✅ (server) | Placeholder "Mật khẩu". Có nút hiện/ẩn (`#show_password`) đổi giữa `password` ↔ `text`. |
| 4 | Ghi nhớ đăng nhập | `remember` / `remember` | Checkbox | ❌ | Giá trị `on`; mặc định **không tích**. |
| 5 | Đăng nhập | — | Button (submit) | — | Gửi form POST `/v2/login`. |
| 6 | Quên mật khẩu | — | Link | — | → `/v2/forgot-password`. |
| 7 | Ngôn ngữ (en/vi/kr) | — | Link × 3 | — | → `/v2/lang/{en\|vi\|kr}`. |

**Trường ẩn (hidden) trong form:**

| Tên | Giá trị mẫu | Ý nghĩa |
|---|---|---|
| `_token` | (chuỗi ngẫu nhiên) | CSRF token (Laravel) — bắt buộc để submit hợp lệ. |
| `trial` | `0` | Cờ trạng thái (dùng thử) — mặc định 0. |
| `autoLogin` | `0` | Cờ tự động đăng nhập — mặc định 0. |

---

## 4. Các luồng xử lý và Báo lỗi (Business Rules & Validations)

### 4.1. Bảng thông báo lỗi đã quan sát thực tế

| Kịch bản | Thông báo hiển thị | Vị trí |
|---|---|---|
| Bỏ trống ID cửa hàng | `Trường store id là bắt buộc.` | Dưới ô ID cửa hàng |
| Bỏ trống Tên đăng nhập | `Trường Tên đăng nhập là bắt buộc.` | Dưới ô Tên đăng nhập |
| Bỏ trống Mật khẩu | `Trường Mật khẩu là bắt buộc.` | Dưới ô Mật khẩu |
| Tên đăng nhập không tồn tại | `Tài khoản không tồn tại` | Dưới ô Tên đăng nhập |
| Sai mật khẩu (tài khoản có tồn tại) | `Mật khẩu không chính xác` | Dưới ô Mật khẩu |

> ⚠️ **Lưu ý bảo mật:** Hệ thống phân biệt rõ giữa "Tài khoản không tồn tại" và "Mật khẩu không chính xác" → có thể bị dò tên đăng nhập (username enumeration). Cần ghi nhận và làm rõ với PO xem đây có phải hành vi mong muốn không.

### 4.2. Quy tắc nghiệp vụ

- **BR-01:** Cả 3 trường ID cửa hàng / Tên đăng nhập / Mật khẩu đều bắt buộc; validation thực thi phía **server**.
- **BR-02:** ID cửa hàng ánh xạ tới một domain tenant riêng; đăng nhập thành công điều hướng sang domain đó.
- **BR-03:** Khi submit lỗi, các giá trị đã nhập ở ID cửa hàng / Tên đăng nhập / Mật khẩu được **giữ lại** để người dùng sửa.
- **BR-04:** Đăng nhập thành công **không** vào thẳng ứng dụng mà qua bước **chọn vai trò** (Nhân viên / Thu ngân / Quản lý).

### 4.3. Luồng chính (Happy Path)

1. Người dùng mở `/v2/login`.
2. Nhập **ID cửa hàng**, **Tên đăng nhập**, **Mật khẩu** (tùy chọn tích "Ghi nhớ đăng nhập").
3. Bấm **Đăng nhập**.
4. Xác thực thành công → điều hướng tới `/v2/login-methods` (màn hình chào mừng + chọn vai trò).
5. Chọn vai trò:
   - **Nhân viên** → `/v2/order/staff/show-table`
   - **Thu ngân** → `/v2/order/cashier`
   - **Quản lý** → `/v2/dashboard`
6. (Tùy chọn) **Đăng xuất** → quay lại `/v2/login`.

### 4.4. Luồng ngoại lệ (Alternate / Error Flows)

- **A1 — Thiếu trường:** Bỏ trống ≥1 trường → hiển thị thông báo "bắt buộc" tương ứng, ở lại trang Login.
- **A2 — Sai mật khẩu:** → "Mật khẩu không chính xác", ở lại trang Login.
- **A3 — Sai/không tồn tại tên đăng nhập:** → "Tài khoản không tồn tại", ở lại trang Login.

---

## 5. Yêu cầu Phi chức năng (Non-functional — quan sát được)

- **Đa ngôn ngữ:** Hỗ trợ 3 ngôn ngữ (en / vi / kr).
- **Bảo mật:** Sử dụng CSRF token (`_token`); ô mật khẩu dạng `password` (che ký tự) mặc định.
- **Tương thích viewport:** Khảo sát ở desktop 1920×1080 hiển thị đầy đủ, bố cục canh giữa.
- **Đa tenant:** Định tuyến theo ID cửa hàng sang domain riêng.

---

## 6. Câu hỏi / Làm rõ với PO-User

Các điểm **chưa kiểm chứng được** từ UI, cần PO xác nhận:

1. **ID cửa hàng không tồn tại/sai định dạng:** Hệ thống xử lý ra sao (thông báo lỗi cụ thể? chặn điều hướng?) — chưa test.
2. **Giới hạn độ dài / ký tự đặc biệt** cho ID cửa hàng, Tên đăng nhập, Mật khẩu (không thấy `maxlength`/`pattern` phía client) — quy tắc phía server là gì?
3. **Chính sách khóa tài khoản (account lockout):** Sau N lần sai mật khẩu có bị khóa/CAPTCHA không?
4. **Phân biệt hoa/thường (case sensitivity)** của Tên đăng nhập và ID cửa hàng?
5. **Trim khoảng trắng** đầu/cuối các trường?
6. **Hành vi "Ghi nhớ đăng nhập":** Thời gian ghi nhớ bao lâu, ảnh hưởng gì tới phiên?
7. **Username enumeration** (mục 4.1): thông báo phân biệt "không tồn tại" vs "sai mật khẩu" có phải yêu cầu mong muốn?
8. **Phân quyền vai trò:** Một tài khoản có luôn thấy đủ 3 vai trò (Nhân viên/Thu ngân/Quản lý) hay tùy quyền? Combobox chọn cửa hàng có nhiều hơn 1 lựa chọn khi tài khoản thuộc nhiều cửa hàng không?
9. **Các trường ẩn `trial` / `autoLogin`:** Kịch bản nào làm giá trị khác `0`?

---

> **Ghi chú nguồn:** Toàn bộ đặc tả trên được trích xuất từ DOM thực tế qua Playwright MCP (không suy đoán). Ảnh chụp trang Login lưu tại `.playwright-mcp/login-page.png`. Các thông báo lỗi được ghi nhận bằng cách thao tác trực tiếp trên giao diện (submit rỗng, sai mật khẩu, sai tài khoản).
