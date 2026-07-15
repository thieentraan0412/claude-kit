# Bug Hunting Progress — Module Điều phối ca

- [x] Bước 0: Thu thập input + xác nhận scope & quyền phá hủy
- [x] Bước 1: Nạp spec làm nguồn chân lý + kỹ thuật test
- [x] Bước 2: Chọn engine + kết nối browser (Playwright MCP)
- [x] Bước 3: Login (phiên có sẵn) + dựng bản đồ coverage → run/coverage.md
- [x] Bước 4: Khám phá & săn lỗi 8 flow → 6 bug (run/bugs.json + evidence)
- [x] Bước 5: Xuất testcase-lỗi ra Excel → Result/bugs_dieu_phoi_ca_20260715.xlsx
- [x] Bước 6: Báo cáo tổng hợp → run/report.md + tóm tắt cho user

## Kết quả: 6 bug (0 Critical · 2 Major · 3 Minor · 1 Trivial); 2 mục cần PO. 8/8 flow đã soi. 0 BLOCKED.

## Scope: Toàn bộ 8 flow (FLOW-DPC-01..08) | Quyền phá hủy: CÓ (đầy đủ) | Engine: Playwright MCP
## Môi trường: STAGING · https://table1.klkim.com/v2/order/cashier/shift · TK: admin (Admin master) · đã đăng nhập sẵn
## Trạng thái ban đầu: ca SCR00000008CN2 ĐANG MỞ (đầu ca 500,000đ, 0 giao dịch); lịch sử có SCR00000007CN2 (đã đóng, 500,000đ)
## Evidence prefix: run/evidence/dpc_*  (tránh đè evidence module Return cũ)

## Log thao tác phá hủy (Create/Edit/Delete)
| Thời điểm | Màn hình | Thao tác | Dữ liệu bị ảnh hưởng |
|---|---|---|---|
| 15-07-2026 22:01:58 | Modal Đóng ca | ĐÓNG ca SCR00000008CN2 (tiền thực tế 600,000đ, chênh lệch 100,000đ, ghi chú `AUTO_DPC_close_SCR008_150726`) | Ca SCR008 chuyển "đã đóng"; lịch sử ghi Tổng tiền mặt 600,000đ |
| 15-07-2026 22:03:05 | Modal Mở ca làm việc | MỞ ca mới SCR00000009CN2 (tiền đầu ca 500,000đ, ghi chú `AUTO_DPC_reopen_150726_restore`) — khôi phục trạng thái "có ca đang mở" | Tạo ca mới SCR009 Đang mở (0 giao dịch) |

> Ghi chú khôi phục: trước phiên có ca SCR008 đang mở → sau phiên có ca SCR009 đang mở (500,000đ, 0 giao dịch). Trạng thái "có 1 ca đang mở" được bảo toàn.
