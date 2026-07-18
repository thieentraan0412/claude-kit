# Báo cáo Săn lỗi — Module Điều phối ca (Cashier Shift)

## Metadata
- **App / Module:** orderTable — Cashier · Điều phối ca
- **URL:** https://table1.klkim.com/v2/order/cashier/shift
- **Môi trường:** STAGING (Thientester) · **Engine:** Playwright MCP (1920×1080)
- **Tài khoản:** admin / Admin master (không ghi mật khẩu) — phiên đăng nhập có sẵn
- **Ngày chạy:** 2026-07-16
- **Scope:** Toàn bộ 10 flow (FLOW-DPC-01..10) + 9 BR + 7 NFR
- **Nguồn chân lý:** `requirements/requirements_dieu_phoi_ca.md`
- **Ca test:** SCR00000004CN2 (đang mở; đầu ca 0đ; tổng tiền mặt trong ca −500,000đ; 22 giao dịch)

## Tổng quan kết quả
- **Tổng: 7 bug** — 0 Critical · 2 Major · 5 Minor.
- **Màn/flow đã soi:** 8/10 đầy đủ hoặc gần đủ (FLOW-01,04,05,06,07,10 kỹ; 02,08 một phần). **2 flow hạn chế/BLOCKED:** FLOW-03 & FLOW-09 (thiếu ca đã đóng + bị redirect chặn).
- **Điểm nổi bật:** Bộ lọc giao dịch (type/search/status) **đã hoạt động** (khác lần chạy 15-07 báo lỗi lọc). Xuất hiện **2 lỗi điều hướng nghiêm trọng** liên quan trạng thái "tiếp tục đơn đang mở": bấm dòng bán hàng nhảy sang app Flutter (màn đăng nhập) và /shift tự redirect về /menu.

## Bảng bug (Severity / Priority — mẫu Excel không có 2 cột này)
| id | platform | Mô tả ngắn | Severity | Priority | Flow/Rule | Evidence |
|---|---|---|---|---|---|---|
| 1 | web/flutter | Bấm dòng "Phiếu bán hàng" → app Flutter (order-flutter.nasys.vn) hiện màn ĐĂNG NHẬP, mất phiên/SSO | **Major** | High | FR-DPC-16 | dpc_20260716_flutter_after_row_click.png |
| 2 | web | /shift tự redirect về /menu (sau khi bấm dòng bán hàng) → không dùng được màn Điều phối ca, **không hoàn tất được Đóng ca** | **Major** (tác động tới Critical: chặn FLOW-DPC-07 Must) | High | NFR-06, FLOW-07/08 | (mô tả + network) |
| 3 | web | Bộ đếm ký tự ô ghi chú đóng ca đứng yên "0/200" | Minor | Medium | FLOW-07 | dpc_20260716_close_modal_note_counter_stuck.png |
| 4 | web | Giới hạn ô ghi chú không nhất quán (placeholder 50 vs maxlength 200 vs đếm /200) | Minor | Low | BR-DPC-06 | (attr maxlength=200) |
| 5 | web | "Chênh lệch" không cập nhật tức thời (chỉ khi blur); hiển thị giá trị cũ khi xóa ô | Minor | Medium | FR-DPC-20 / BR-DPC-01 | (quan sát live) |
| 6 | web | Lọc/tìm giao dịch ra 0 kết quả nhưng không có thông báo trạng thái rỗng | Minor | Low | FLOW-05 (Mục 10) | dpc_20260716_search_empty_no_message.png |
| 7 | web | Màn hình phụ (secondary-screen) hiển thị trắng rồi tự redirect về /menu | Minor (cần PO) | Medium | FR-DPC-23 / NFR-07 | dpc_20260716_secondary_screen_blank.png |

## Chi tiết đối chiếu Spec
- **FR-DPC-16 (mở chứng từ):** FAIL → bug #1. Spec: bấm dòng bán hàng mở /order/cashier/menu; thực tế: nhảy sang app Flutter, màn đăng nhập.
- **NFR-06 (ổn định /shift):** FAIL (xác nhận nghi vấn của spec) → bug #2. /shift redirect /menu sau thao tác, tái hiện 5+ lần.
- **FR-DPC-20 / BR-DPC-01 (chênh lệch tức thời):** FAIL → bug #5. Chỉ cập nhật khi blur.
- **BR-DPC-06 (ghi chú x/200 vs "tối đa 50"):** FAIL → bug #3 (đếm đứng yên) + bug #4 (giới hạn không nhất quán, maxlength=200).
- **FLOW-05 (lọc/tìm/trạng thái):** PASS phần lọc (type/search/status đều lọc đúng) — nhưng thiếu empty-state → bug #6.
- **FLOW-01 / FLOW-04:** PASS (thông tin ca + breakdown + tổng tiền mặt nhất quán).
- **FR-DPC-04 (bộ số tiền auto phân tách hàng nghìn):** PASS ("500000"→"500,000"); ô số tiền lọc ký tự phi số ("abc-12x3!@#"→"123"): PASS.

## Thao tác phá hủy đã thực hiện (được user cho phép)
- Nhiều lần thử "Đóng ca ngay" trên ca SCR00000004CN2 (số tiền thực đếm 0 và 500,000; ghi chú traceable `AUTO_DPC_20260716_...`). **KHÔNG lần nào hoàn tất** (hộp thoại xác nhận #confirmCloseShift bị redirect /menu làm mất). **Kết quả: ca vẫn ĐANG MỞ, KHÔNG dữ liệu nào bị tạo/sửa/xóa; không có request POST đóng ca nào được gọi** (kiểm chứng qua network). Trạng thái cửa hàng test được bảo toàn.

## Giả định & Giới hạn
- **Trạng thái kết thúc của "Đóng ca"/"Đóng và in phiếu" (Mục 10 Q1) CHƯA kiểm chứng được** — bị chặn bởi bug #2 (redirect). Cần retest khi /shift ổn định (không ở trạng thái "tiếp tục đơn đang mở"), hoặc sau khi xử lý xong đơn POS đang mở.
- **FLOW-03 / FLOW-09 (ca đã đóng, In phiếu, Chi tiết ca):** không có ca đã đóng trong dữ liệu ngày 16-07 và redirect chặn mở rộng lịch sử → chưa soi.
- **Bug #2 có thể liên quan trạng thái "đơn POS đang mở"** do chính thao tác bấm dòng bán hàng (bug #1) kích hoạt; PO cần xác nhận đây là chủ đích hay lỗi. Nếu là chủ đích thì vẫn là UX chặn nghiêm trọng.
- **Bug #1 / #7 (app Flutter, secondary-screen):** đích/nội dung do PO xác nhận (Mục 10 Q7, Q9).
- Một tài nguyên phụ `mlkeyboard@1.0.2` bị chặn tải (net::ERR_BLOCKED_BY_ORB) — ghi nhận, không ảnh hưởng lỗi chính.
- run/ được dùng chung với một tác vụ khác (module Edit Menu) → artifacts Điều phối ca đặt hậu tố `_dieu_phoi_ca` để tránh xung đột.

## Đối chiếu delivery_checklist
- Mỗi bug có bước tái hiện chi tiết + đối chiếu spec; 5/7 bug có ảnh evidence (2 bug còn lại có bằng chứng thuộc tính DOM/network mô tả trong steps).
- Không lộ mật khẩu. Artifact gọn trong `run/` (hậu tố `_dieu_phoi_ca`), Excel trong `Result/`.
- Chỉ ghi lỗi đã tái hiện; các điểm chưa chắc đánh dấu "cần PO xác nhận"; không auto-heal.
