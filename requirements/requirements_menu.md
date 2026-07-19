# Tài liệu Yêu cầu — Module Menu (Quản lý hàng hóa / Danh sách menu)

| Mục | Nội dung |
|---|---|
| **Module** | Menu — "Danh sách menu" (quản lý hàng hóa/món ăn) |
| **Hệ thống** | ERP/POS quản lý cửa hàng F&B (đa cửa hàng) |
| **Khu vực** | Thu ngân (Cashier) |
| **URL** | `https://table1.klkim.com/v2/order/cashier/menu` (danh sách phân trang: `/v2/menu/list?page=N`) |
| **Cách truy cập** | Đăng nhập → chọn vai trò **Thu ngân** → nhấn **Ctrl+F9** để hiện mục **Menu** trên thanh điều hướng → click **Menu** |
| **Tài khoản khảo sát** | Store `thientester` (Ẩm thực 86) / `admin` / `12345678` |
| **Nguồn dữ liệu** | Inspect DOM thực tế qua Playwright MCP (viewport 1920×1080) |
| **Ngày khảo sát** | 2026-07-08 |

> ⚠️ **Lưu ý phạm vi khảo sát:** Đã inspect chi tiết: luồng truy cập, panel Bộ lọc, bảng danh sách + hành động, và form **Tạo mới → Hàng hóa thường** (tab Chi tiết/Thuộc tính/Topping). **Chưa** inspect sâu: form **Set Menu / Combo**, form **Chỉnh sửa**, **Nâng cao**, **Công thức chế biến**, **Sao chép** — được liệt kê ở mục Câu hỏi/Phạm vi mở rộng.

---

## 1. Tổng quan (Overview)

Module **Menu** cho phép nhân sự khu vực Thu ngân **quản lý danh mục hàng hóa/món ăn** của cửa hàng: xem danh sách, lọc/tìm kiếm, tạo mới, chỉnh sửa, sao chép, bật/tắt trạng thái, sắp xếp thứ tự và xóa (khi không còn được sử dụng). Mỗi hàng hóa có nhiều thuộc tính nghiệp vụ (giá bán, giá vốn, đơn vị tính, thuế suất, chi nhánh áp dụng, topping, thuộc tính, quy đổi đơn vị...).

Đặc thù quan trọng: mục **Menu không hiển thị mặc định** trên thanh điều hướng của Thu ngân — người dùng phải nhấn tổ hợp phím **Ctrl+F9** để hiện nó ra, sau đó mới click vào được. (Cần PO xác nhận đây là tính năng có chủ đích hay shortcut nội bộ.)

---

## 2. Yêu cầu Chức năng (Functional Requirements)

### FR-01 — Truy cập module Menu qua phím tắt
> **Là một** Thu ngân, **tôi muốn** mở module Menu bằng Ctrl+F9 **để** quản lý hàng hóa mà không chiếm chỗ cố định trên thanh nav.

**Acceptance Criteria:**
- AC-01.1: Ở màn hình Thu ngân, mục "Menu" không hiển thị trên thanh nav ở trạng thái mặc định.
- AC-01.2: Nhấn **Ctrl+F9** → mục "Menu" xuất hiện trên thanh nav (link tới `/v2/order/cashier/menu`).
- AC-01.3: Click "Menu" → điều hướng tới trang "Danh sách menu".

### FR-02 — Xem danh sách hàng hóa (Menu List)
> **Là một** Thu ngân, **tôi muốn** xem danh sách hàng hóa dạng bảng có phân trang **để** tra cứu nhanh.

**Acceptance Criteria:**
- AC-02.1: Bảng hiển thị các cột: chọn (checkbox), STT, Mã hàng hóa, Tên hàng hóa, Nhóm hàng hóa, Loại hàng hóa, VAT, ĐVT, Giá bán, Định mức, Trạng thái, Hành động.
- AC-02.2: Hỗ trợ phân trang (khảo sát thấy 22 trang, 10 dòng/trang).
- AC-02.3: Sắp xếp được theo các cột có icon sort: Tên hàng hóa, Nhóm hàng hóa, Loại hàng hóa, Giá bán.
- AC-02.4: Có checkbox "chọn tất cả" ở header để chọn hàng loạt.

### FR-03 — Lọc & tìm kiếm hàng hóa
> **Là một** Thu ngân, **tôi muốn** lọc/tìm hàng hóa theo nhiều tiêu chí **để** thu hẹp kết quả.

**Acceptance Criteria:**
- AC-03.1: Lọc theo **Chi nhánh** (Tất cả / TESTER / TESTER 2).
- AC-03.2: Tìm **theo hàng hóa** bằng ô nhập "Nhập tên, mã".
- AC-03.3: Lọc **theo nhóm hàng hóa** (danh sách ~45 nhóm: Khai vị, Gỏi, Salad, ... Món khác).
- AC-03.4: Lọc **theo loại hàng hóa**: Hàng bán / Nguyên phụ liệu / Hàng hóa chế biến (mặc định cả 3 đều tích).
- AC-03.5: Lọc **theo trạng thái**: Hoạt động / Không hoạt động (mặc định cả 2 đều tích).

### FR-04 — Tạo mới hàng hóa
> **Là một** Thu ngân, **tôi muốn** thêm hàng hóa mới **để** bổ sung vào menu.

**Acceptance Criteria:**
- AC-04.1: Nút **Tạo mới** mở menu 2 lựa chọn: **Hàng hóa thường** và **Set Menu / Combo**.
- AC-04.2: Chọn "Hàng hóa thường" → mở dialog **Thêm mới** gồm 3 tab: **Chi tiết**, **Thuộc tính**, **Topping**.
- AC-04.3: Các trường bắt buộc có dấu `*`: Mã hàng hóa, Nhóm hàng hóa, Tên hàng hóa, Giá bán, Đơn vị tính, Lĩnh vực kinh doanh, Thuế suất, Chi nhánh.
- AC-04.4: **Mã hàng hóa** để trống → tự sinh (ô "Mã tự động", disabled).
- AC-04.5: Bấm **Xác nhận** khi thiếu trường bắt buộc → không lưu, hiển thị cảnh báo (nội dung cần PO xác nhận — xem mục 6).
- AC-04.6: Bấm **Đóng** / **Close** → hủy thao tác, không tạo bản ghi.

### FR-05 — Chỉnh sửa / Sao chép / Xóa / Đổi trạng thái / Sắp xếp
> **Là một** Thu ngân, **tôi muốn** thao tác trên từng dòng hàng hóa **để** bảo trì menu.

**Acceptance Criteria:**
- AC-05.1: Mỗi dòng có action: **Chỉnh sửa**, **Công thức chế biến**, **Sao chép**, **Xóa**.
- AC-05.2: Nút **Xóa** bị vô hiệu khi hàng hóa đang được sử dụng, tooltip: "Không thể xóa, đối tượng muốn xóa đang được sử dụng".
- AC-05.3: Cột **Trạng thái** có toggle bật/tắt trực tiếp trên dòng (hoạt động/không hoạt động).
- AC-05.4: Nút **up/down** cho phép sắp xếp thứ tự hiển thị của hàng hóa.

### FR-06 — Quản lý Thuộc tính & Topping của hàng hóa
> **Là một** Thu ngân, **tôi muốn** khai báo thuộc tính và topping cho món **để** phục vụ đặt món linh hoạt.

**Acceptance Criteria:**
- AC-06.1: Tab **Thuộc tính** cho phép "Thêm thuộc tính" cho hàng hóa.
- AC-06.2: Tab **Topping** có quy tắc "Cho phép chọn nhiều topping", chọn theo nhóm danh mục và theo hàng hóa/topping, nút "Thêm".

---

## 3. Đặc tả Trường Dữ liệu (Field Specifications)

### 3.1. Panel Bộ lọc (Filter)

| Tên trường | Loại UI | Bắt buộc | Ràng buộc / Ghi chú |
|---|---|---|---|
| Chi nhánh | Listbox (chọn) | ❌ | Tất cả (mặc định) / TESTER / TESTER 2 |
| Theo hàng hóa | Text input | ❌ | Placeholder "Nhập tên, mã" — tìm theo tên hoặc mã |
| Theo nhóm hàng hóa | Listbox nhiều lựa chọn | ❌ | ~45 nhóm (Khai vị, Gỏi, Salad, ..., Món khác) |
| Theo loại hàng hóa | Checkbox × 3 | ❌ | Hàng bán / Nguyên phụ liệu / Hàng hóa chế biến (mặc định tích cả 3) |
| Trạng thái | Checkbox × 2 | ❌ | Hoạt động / Không hoạt động (mặc định tích cả 2) |

### 3.2. Bảng danh sách — Cột & Hành động

| Cột | Kiểu | Ghi chú |
|---|---|---|
| (chọn) | Checkbox | Có "chọn tất cả" ở header |
| STT | Số | Số thứ tự dòng |
| Mã hàng hóa | Text (link) | Ví dụ `PRO00000220CN2`, click được |
| Tên hàng hóa | Text (sortable) | |
| Nhóm hàng hóa | Text (sortable) | |
| Loại hàng hóa | Text (sortable) | Hàng bán / Nguyên phụ liệu / ... |
| VAT | Text | Ví dụ "1.00% / 0.50%" hoặc trống |
| ĐVT | Text | Đơn vị tính (Gói, Lon, Phần, Bịch...) |
| Giá bán | Số (sortable) | Định dạng có phân tách nghìn (35,000) |
| Định mức | Text | Thường "-" |
| Trạng thái | Toggle | Bật/tắt hoạt động ngay trên dòng |
| Hành động | Icon nhóm | up/down, Chỉnh sửa, Công thức chế biến, Sao chép, Xóa (disabled khi đang dùng) |

### 3.3. Form "Thêm mới → Hàng hóa thường" — Tab Chi tiết

**Cột trái (ảnh + cấu hình bật/tắt):**

| Trường | Loại UI | Mặc định | Ghi chú |
|---|---|---|---|
| Hình ảnh | File upload | (trống) | "Tải lên" / Choose File |
| Loại hàng hóa | Radio | **Hàng bán** | Hàng bán / Nguyên phụ liệu |
| Trạng thái | Toggle | Bật | Hoạt động/không |
| In tem | Toggle | Bật | |
| Trừ kho | Toggle | Bật | |
| Hàng bán chế biến | Toggle | Tắt | |
| Báo bếp | Toggle | Bật | |
| In phiếu tổng | Toggle | Bật | |
| Đặt hàng qua mã QR | Toggle | Bật | |

**Cột phải (thông tin hàng hóa):**

| Trường | Loại UI | Bắt buộc | Ràng buộc / Ghi chú |
|---|---|---|---|
| Mã hàng hóa | Text (disabled) | ✅ | "Mã tự động" — hệ thống tự sinh, không nhập tay |
| Bar/Qr Code | Text + 2 nút | ❌ | Placeholder "Mã vạch"; kèm nút quét/tạo mã |
| Nhóm hàng hóa | Combobox tìm kiếm | ✅ | "Chọn nhóm danh mục" |
| Tên hàng hóa | Text | ✅ | Placeholder "Tên hàng hóa" |
| Giá bán | Text (số) | ✅ | Giá bán ra |
| Giá vốn | Text (số) | ❌ | Giá vốn |
| Đơn vị tính | Combobox | ✅ | Phần / Lon / Chai / Đĩa / Cái / Bịch / Gói / Kilogam / Gam |
| Lĩnh vực kinh doanh | Combobox | ✅ | 4 lựa chọn (Phân phối cung cấp hàng hóa; Dịch vụ, xây dựng...; Vận tải, sản xuất...; Hoạt động KD khác) |
| Thuế suất | Combobox | ✅ | Mặc định "Chọn" (danh sách thuế suất — có thể phụ thuộc Lĩnh vực KD, cần PO xác nhận) |
| Khóa nhóm sử dụng | Listbox nhiều | ❌ | Sale / Nhập hàng |
| Chi nhánh | Listbox nhiều | ✅ | TESTER / TESTER 2 (mặc định chọn cả 2) |
| Thẻ của món | Listbox nhiều | ❌ | Mới / Bán chạy |
| Định mức | 2 spinbutton (số) | ❌ | "Thấp nhất" ~ "Cao nhất" (khoảng min–max) |
| Mô tả | Textarea | ❌ | **Tối đa 200 ký tự** (bộ đếm 0/200) |
| Quy đổi đơn vị hàng hóa | Nhóm mở rộng | ❌ | Nút "Thêm" để khai báo quy đổi đơn vị |

**Tab Thuộc tính:** khối "Thuộc tính hàng hóa" + nút **Thêm thuộc tính**.
**Tab Topping:** quy tắc "Cho phép chọn nhiều topping"; chọn theo nhóm danh mục và theo hàng hóa/topping; nút **Thêm**.

**Nút dialog:** Đóng (hủy) · Xác nhận (lưu).

---

## 4. Các luồng xử lý (Business/User Flows)

### 4.1. Luồng truy cập Menu
1. Đăng nhập `thientester/admin/12345678` → màn hình chọn vai trò.
2. Chọn **Thu ngân** → `/v2/order/cashier` (sơ đồ bàn).
3. Nhấn **Ctrl+F9** → mục **Menu** xuất hiện trên nav.
4. Click **Menu** → `/v2/order/cashier/menu` (Danh sách menu).

### 4.2. Luồng tạo mới hàng hóa thường
1. Bấm **Tạo mới** → chọn **Hàng hóa thường**.
2. Dialog "Thêm mới" mở ở tab **Chi tiết**.
3. Nhập các trường bắt buộc (Tên, Nhóm, Giá bán, ĐVT, Lĩnh vực KD, Thuế suất, Chi nhánh); mã hàng hóa tự sinh.
4. (Tùy chọn) khai báo tab **Thuộc tính**, **Topping**, ảnh, quy đổi đơn vị.
5. Bấm **Xác nhận** → hệ thống kiểm tra hợp lệ → lưu và cập nhật danh sách.

### 4.3. Luồng ngoại lệ
- Thiếu trường bắt buộc khi Xác nhận → không lưu, cảnh báo (nội dung cần PO xác nhận).
- Xóa hàng hóa đang được sử dụng → nút Xóa bị vô hiệu + tooltip "Không thể xóa, đối tượng muốn xóa đang được sử dụng".

---

## 5. Yêu cầu Phi chức năng (Non-functional — quan sát được)

- **Đa chi nhánh:** hàng hóa gắn với một hoặc nhiều chi nhánh (TESTER/TESTER 2).
- **Đa ngôn ngữ:** hệ thống hỗ trợ en/vi/kr (nút ngôn ngữ ở header).
- **Hiệu năng danh sách:** dữ liệu lớn (22 trang) → dùng phân trang phía server (`/v2/menu/list?page=N`).
- **Tính toàn vẹn dữ liệu:** chặn xóa đối tượng đang được tham chiếu/sử dụng.
- **Console:** trang Menu ghi nhận 2 errors + 2 warnings ở console khi tải (cần dev kiểm tra — có thể ảnh hưởng ổn định).

---

## 6. Câu hỏi / Làm rõ với PO-User & Phạm vi mở rộng

**Cần làm rõ nghiệp vụ:**
1. **Ctrl+F9**: là tính năng chính thức hay shortcut nội bộ? Có phím tắt/điều kiện quyền nào khác để hiện Menu không?
2. **Thông báo validation** khi thiếu trường bắt buộc: nội dung cụ thể từng trường? (Khảo sát không bắt được text lỗi inline — có thể là viền đỏ/toast thoáng qua.)
3. **Giá bán / Giá vốn**: định dạng cho phép (số nguyên? thập phân? tối đa bao nhiêu chữ số? có cho 0/âm không?).
4. **Tên hàng hóa**: giới hạn độ dài? ký tự đặc biệt? trùng tên có chặn không?
5. **Thuế suất**: danh sách giá trị đầy đủ? có phụ thuộc "Lĩnh vực kinh doanh" đã chọn không?
6. **Định mức** (min ~ max): quy tắc (min ≤ max, số dương)?
7. **Mô tả**: giới hạn 200 ký tự — hành vi khi vượt (chặn nhập hay báo lỗi)?
8. **Chi nhánh** trong form mặc định chọn cả 2 — có bắt buộc chọn ≥1 không?
9. Quyền của **Thu ngân** với module Menu: được tạo/sửa/xóa hay chỉ xem? (thường Menu thuộc quyền Quản lý)

**Phạm vi chưa khảo sát (đề xuất làm bổ sung):**
- Form **Set Menu / Combo** (Tạo mới → Set Menu/Combo).
- Form **Chỉnh sửa** hàng hóa (field & prefill).
- Chức năng **Nâng cao**, **Công thức chế biến**, **Sao chép**.
- Hành vi **sắp xếp** (up/down) và **chọn hàng loạt** (bulk actions).

---

> **Ghi chú nguồn:** Toàn bộ đặc tả được trích xuất từ DOM thực tế qua Playwright MCP (không suy đoán). Ảnh chụp module Menu lưu tại `.playwright-mcp/menu-module.png`. Không tạo/sửa/xóa dữ liệu thật trong quá trình khảo sát (form Tạo mới chỉ mở để đọc field và đã Đóng, không lưu).
