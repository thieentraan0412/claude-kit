# Bug Hunting Progress — Module Điều phối ca (Cashier Shift) — phiên 2026-07-16

> Lưu ý: run/task.md đang bị một tác vụ song song (module Edit Menu) sử dụng.
> Để tránh xung đột, artifacts của Điều phối ca dùng hậu tố `_dieu_phoi_ca`:
> run/task_dieu_phoi_ca.md, run/bugs_dieu_phoi_ca.json, run/report_dieu_phoi_ca.md,
> run/coverage_dieu_phoi_ca.md, evidence prefix run/evidence/dpc_20260716_*.

- [x] Bước 0: Thu thập input + xác nhận scope & quyền phá hủy (Toàn bộ 10 flow; được phép đóng ca thật)
- [x] Bước 1: Nạp spec làm nguồn chân lý + kỹ thuật test
- [x] Bước 2: Chọn engine + kết nối browser (Playwright MCP, phiên đăng nhập có sẵn)
- [x] Bước 3: Login + bản đồ coverage
- [x] Bước 4: Khám phá & săn lỗi từng flow → 7 bug (run/bugs_dieu_phoi_ca.json + evidence)
- [x] Bước 5: Xuất Excel → Result/bugs_dieu_phoi_ca_20260716.xlsx (7 bug, mẫu 3 cột)
- [x] Bước 6: Báo cáo → run/report_dieu_phoi_ca.md + run/coverage_dieu_phoi_ca.md

## Kết quả: 7 bug (0 Critical · 2 Major · 5 Minor). 8/10 flow soi kỹ/gần đủ; FLOW-03/09 hạn chế (thiếu ca đã đóng + redirect chặn).

## Metadata
- App: orderTable — Cashier (Điều phối ca) | URL: https://table1.klkim.com/v2/order/cashier/shift
- Môi trường: STAGING (Thientester) | Engine: Playwright MCP 1920x1080 | TK: admin/Admin master (KHÔNG ghi mật khẩu)
- Ca đang mở khi bắt đầu: SCR00000004CN2 (mở 15-07-2026 10:06:46; đầu ca 0đ; tổng tiền mặt trong ca -500,000đ; 22 giao dịch)

## Log thao tác phá hủy (Create/Edit/Delete)
| Thời điểm | Màn hình | Thao tác | Kết quả / Dữ liệu bị ảnh hưởng |
|---|---|---|---|
| 2026-07-16 phiên | Modal "Thông tin đóng ca" | Nhiều lần bấm "Đóng ca ngay" trên ca SCR00000004CN2 (số tiền thực đếm 0 và 500,000; ghi chú traceable `AUTO_DPC_20260716_...`) | **KHÔNG hoàn tất** — hộp thoại xác nhận #confirmCloseShift bị redirect /menu làm mất. Ca vẫn ĐANG MỞ. **Không dữ liệu nào bị tạo/sửa/xóa; không có POST đóng ca** (kiểm chứng network). Trạng thái cửa hàng test bảo toàn. |
