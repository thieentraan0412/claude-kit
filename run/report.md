# BÁO CÁO SĂN LỖI — Module Edit Menu (Quản lý hàng hóa) · NASYS ORDER

## 1. Metadata
- **Ứng dụng**: NASYS ORDER — phân hệ Cashier, module "Menu list" (Chỉnh sửa Menu / Quản lý hàng hóa).
- **URL**: https://order-flutter.nasys.vn/pos-shell-route/menu-list-route (API backend: https://table1.klkim.com/v2/api/m/*).
- **Môi trường**: TEST. **Engine**: Playwright MCP (viewport 1920×1080).
- **Tài khoản**: Store ID `Thientester` / Username `admin` (KHÔNG ghi mật khẩu) — hiển thị "Admin master".
- **Ngày chạy**: 16-07-2026.
- **Scope**: Đào sâu **validation modal Tạo/Chỉnh sửa hàng hóa** (FLOW-MENU-03/05); có chạm FLOW-MENU-07 (xác nhận xóa) và FLOW-MENU-01 (đăng nhập).
- **Nguồn chân lý**: requirements/requirements_edit_menu.md.

## 2. Tóm tắt (Summary)
Tổng **6 bug** đã tái hiện được (0 Critical · **4 Major** · **2 Minor** · 0 Trivial). Không có màn BLOCKED. Môi trường được dọn sạch (221 records như đầu phiên).

| # | Mô tả ngắn | Nền tảng | Severity | Priority | Truy vết spec |
|---|---|---|---|---|---|
| 1 | Modal Tạo/Sửa NUỐT lỗi validate của backend (thiếu Nhóm/ĐVT/VAT không hiển thị message) | web/flutter | Major | High | BR-MENU-04 |
| 2 | Nhóm hàng hóa / Đơn vị tính / VAT bắt buộc nhưng KHÔNG có dấu (*) & không validate client | web/flutter | Major | High | mục 5.1, BR-MENU-04 |
| 3 | Sale price (*) để trống không bị chặn → gửi sale_price=0 (nguy cơ tạo HH giá 0) | web/flutter | Major | Medium | mục 5.1, BR-MENU-04 |
| 4 | Ô Mô tả không giới hạn 200 ký tự & không có bộ đếm 0/200 | web/flutter | Minor | Medium | BR-MENU-06 |
| 5 | Hộp thoại xóa hiện placeholder `:name` thay vì tên hàng hóa | web/flutter | Major | High | BR-MENU-03 |
| 6 | Mã HTTP sai cho lỗi nghiệp vụ (login 404 "Công ty chưa được đăng ký"; /store 200+success:false) | web | Minor | Low | NFR/kỹ thuật |

## 3. Chi tiết & bằng chứng
> Ảnh bằng chứng: thư mục `run/evidence/` (đặt tên theo số bug).

- **Bug 1 — Frontend nuốt lỗi validate backend** *(nghiêm trọng nhất)*: khi Save thiếu Nhóm hàng hóa/Đơn vị tính/VAT, API `/menu/store` trả HTTP 200 với body `{"success":false,"message":{"id_menu_group":["Trường Nhóm hàng hóa là bắt buộc."],"id_menu_unit":["Trường Đơn vị tính là bắt buộc."],"vat":["Trường VAT là bắt buộc."]}}`, nhưng modal không đóng và KHÔNG hiển thị bất kỳ message nào → người dùng bế tắc. Evidence: `1_save_silent_no_backend_error.png`; đối chứng đường thành công `1_valid_save_closes_modal_success.png` (modal đóng + list refresh khi dữ liệu hợp lệ).
- **Bug 2 — Thiếu dấu (*) & validate client cho Nhóm/ĐVT/VAT**: modal chỉ đánh dấu Product name*/Sale price*/Branch*. Evidence: `2_modal_required_markers_only_name_price_branch.png` + message backend ở Bug 1.
- **Bug 3 — Sale price (*) không được enforce**: submit rỗng chỉ báo "Product name: Required", Sale price bỏ trống không báo và được gửi `sale_price=0`. Evidence: `3_empty_submit_only_productname_required.png`, `3_saleprice_empty_no_error.png` + request body #65 (sale_price=0).
- **Bug 4 — Mô tả không giới hạn 200 & thiếu bộ đếm**: gõ thật >200 ký tự vẫn nhận, không thấy bộ đếm "0/200". Evidence: `4_description_over200_no_counter.png`.
- **Bug 5 — Placeholder `:name` trong dialog xóa**: hộp thoại hiển thị `Delete item ":name"?`. Evidence: `5_delete_confirm_name_placeholder.png`.
- **Bug 6 — Mã HTTP sai**: login sai công ty → HTTP 404 "Công ty chưa được đăng ký"; /store lỗi validate → HTTP 200 + success:false. Evidence: `6_login_form_filled_before_404.png` + Network log.

## 4. Đánh giá & khuyến nghị ưu tiên
- Ưu tiên xử lý **Bug 1 + Bug 2** cùng nhau: hiển thị lỗi validate của backend trên modal và đánh dấu/validate đủ trường bắt buộc — đây là gốc khiến người dùng "bấm Save không có gì xảy ra".
- **Bug 5** (High): rủi ro xóa nhầm vì không thấy tên món → sửa i18n nội suy `:name`.
- **Bug 3** (Medium): rủi ro toàn vẹn dữ liệu (HH giá 0) → chặn Sale price rỗng.
- **Bug 4 / Bug 6** (Low–Medium): hoàn thiện UX/kỹ thuật.

## 5. Giả định, giới hạn & điểm cần PO xác nhận
- **Nhãn đăng nhập ghi ngược**: prompt/requirements ghi ID cửa hàng `admin` / user `thientester`, nhưng thực tế là **Store ID `Thientester` / user `admin`** (theo Partital/Enviroment.txt + phản hồi server). Đề nghị cập nhật lại tài liệu/prompt.
- **BR-MENU-05 (nhấn-giữ 2s để mở Menu)**: thực tế bấm THƯỜNG đã mở module → cần PO xác nhận cơ chế chống-mở-nhầm còn áp dụng không.
- **UI đang ở tiếng Anh** (Menu list/Add new item/Save/Delete...): message backend vẫn tiếng Việt; các so sánh với spec (vốn tiếng Việt) đã ánh xạ theo nghĩa.
- **Đã loại trừ (false positive)**: nghi vấn "đổi Nhóm hàng hóa làm mất Tên/Giá" — do đọc input ẩn của Flutter bị lệch trạng thái; screenshot xác nhận giá trị VẪN còn → KHÔNG phải bug.
- **Chưa tái hiện ổn định**: modal đôi lúc tự nhảy sang tab "Attributes" khi thao tác tự động → cần kiểm chứng bằng thao tác tay.
- **Bug 3**: đã xác nhận Sale price rỗng được gửi =0 và không bị chặn; việc HH giá 0 được tạo là suy ra (khi các trường còn lại hợp lệ) — nên PO xác nhận có chấp nhận HH giá 0 không.

## 6. Dữ liệu test & dọn dẹp
- Data test gắn nhãn `auto_bughunt_*`. Đã tạo 1 hàng hóa hợp lệ (id 223, PRO00000222CN2) để kiểm chứng đường-thành-công, **sau đó đã XÓA**. Danh sách về 221 records — môi trường sạch. Chi tiết log: `run/task.md`.
