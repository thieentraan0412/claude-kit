# Bản đồ Coverage — Module Điều phối ca (phiên 2026-07-16)

Nguồn chân lý: `requirements/requirements_dieu_phoi_ca.md` · Engine: Playwright MCP 1920×1080 · TK: admin/Admin master · Ca: SCR00000004CN2 (đang mở).

| Flow | Trạng thái soi | Kết quả / Ghi chú |
|---|---|---|
| FLOW-01 Xem ca đang mở | ✅ Đầy đủ | Đủ trường (NV, Người mở, Mã ca, Giờ mở, "Đang mở", link Mở màn hình phụ shift_id=4). Số liệu nhất quán: 0 đầu ca + 3,140,000 thu − 3,640,000 chi = −500,000đ. OK. |
| FLOW-02 Lọc lịch sử ca | ◐ Một phần | Bộ lọc Thời gian + Nhân viên (Tất cả/Admin master/staff/cashier/thien) hiển thị đúng. Hiệu lực lọc theo NV/thời gian không đánh giá sâu được (chỉ 1 ca trong ngày). Mở calendar để kiểm biên năm 1950–2026 bị chặn bởi redirect (#2). |
| FLOW-03 Chi tiết ca lịch sử (Master–Detail) | ◐ Hạn chế | Không có "ca đã đóng" trong lịch sử ngày hôm nay để chọn; mở rộng khoảng ngày bị chặn bởi redirect (#2). |
| FLOW-04 Breakdown chỉ tiêu | ✅ Đọc panel | 4 khối (Bán hàng/Trả hàng/Phiếu thu/Phiếu chi) + "Tổng tiền mặt trong ca" hiển thị; số khớp bảng giao dịch. Nút mở rộng có mặt. OK. |
| FLOW-05 Lọc/tìm/trạng thái giao dịch | ✅ Soi kỹ | Type ("Phiếu bán hàng"→5 dòng POS), Search ("POS00000032"→1 dòng), Checkbox trạng thái ("Hoàn thành" bỏ tick→ẩn hết) — ĐỀU HOẠT ĐỘNG (KHÁC lần chạy 2026-07-15). Phát hiện **bug #6** (empty-state không thông báo). |
| FLOW-06 Mở chứng từ (liên module) | ✅ Soi | **bug #1** (bấm dòng Phiếu bán hàng → app Flutter, màn đăng nhập) + **bug #2** (sau đó /shift redirect /menu). |
| FLOW-07 Đóng ca | ✅ Soi modal kỹ | Modal đủ trường; formatting số ✓, chênh lệch đúng (khi blur), ô số tiền lọc ký tự phi số ✓. Phát hiện **bug #3, #4, #5**. Trạng thái kết thúc (commit) bị chặn bởi **bug #2**. |
| FLOW-08 Đóng và in phiếu | ◐ Một phần | Nút tồn tại; luồng mở hộp thoại xác nhận #confirmCloseShift; không hoàn tất được do redirect (#2). |
| FLOW-09 In phiếu / Chi tiết ca đã đóng | ✗ Chưa soi | Không có ca đã đóng trong dữ liệu hôm nay + redirect chặn mở rộng lịch sử. Cần ca đã đóng để test. |
| FLOW-10 Mở màn hình phụ | ✅ Soi | **bug #7** (secondary-screen trắng rồi redirect /menu). |

## Thao tác phá hủy đã thực hiện
- Nhiều lần bấm "Đóng ca ngay" trên ca SCR00000004CN2 (số tiền thực đếm 0 / 500,000; ghi chú traceable `AUTO_DPC_...`). **KHÔNG lần nào hoàn tất** — hộp thoại xác nhận bị redirect làm mất; **ca vẫn ĐANG MỞ, KHÔNG có dữ liệu nào bị tạo/sửa/xóa**. Không có POST đóng ca nào được gọi (kiểm chứng qua network).

## BLOCKED
- **Đóng ca / Đóng và in phiếu (end-state)**: bị chặn bởi redirect /shift→/menu (bug #2). Cần môi trường ổn định (không ở trạng thái "tiếp tục đơn đang mở") để kiểm chứng trạng thái kết thúc.
- **FLOW-03 / FLOW-09 (ca đã đóng)**: thiếu dữ liệu ca đã đóng trong ngày + redirect chặn mở rộng lịch sử.
