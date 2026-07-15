# Báo cáo Săn lỗi — Module Điều phối ca (Cashier POS)

**Ứng dụng:** orderTable — Cashier · **Module:** Điều phối ca
**URL:** https://table1.klkim.com/v2/order/cashier/shift · **Môi trường:** STAGING
**Engine:** Playwright MCP (Chromium) · **Viewport:** 1920×1080
**Tài khoản:** admin / Admin master (không ghi mật khẩu) · **Ngày chạy:** 15-07-2026
**Nguồn chân lý:** requirements/requirements_dieu_phoi_ca.md (8 FLOW · 38 FR-DPC · 19 BR-DPC · 7 NFR)
**Phạm vi:** Toàn bộ 8 flow · **Quyền phá hủy:** CÓ (đã đóng SCR008, mở lại SCR009 — xem task.md)

---

## 1. Tổng hợp (Summary)

**Tổng: 6 lỗi** — 0 Critical · 2 Major · 3 Minor · 1 Trivial. Trong đó **2 mục cần PO xác nhận** (bug #2, #6).

| # | Lỗi | Mã spec | Severity | Priority | Cần PO? |
|---|---|---|---|---|---|
| 1 | Bộ lọc giao dịch trong ca (loại/tìm kiếm/trạng thái) không lọc bảng | BR-DPC-16 | **Major** | High | — |
| 2 | "Tiền mặt trong ca" ở modal (500,000đ) ≠ panel (0đ) cho ca 0 giao dịch | BR-DPC-05/§5.1 | **Major** (nghi ngờ) | High | ✅ |
| 3 | Ghi chú đóng ca: placeholder "tối đa 50" nhưng maxlength=200 (nhập được 61) | BR-DPC-14 | Minor | Medium | — |
| 4 | Bộ đếm ký tự ghi chú đứng yên "0/200" khi nhập | BR-DPC-15 | Minor | Low | — |
| 5 | Phân trang lịch sử ca: aria-label giữ key i18n thô `pagination.previous/next` | NFR-01 | Minor | Low | — |
| 6 | Dòng giao dịch có con trỏ pointer nhưng click không có tác dụng | PO#14 | Trivial | Low | ✅ |

**Excel bàn giao:** `Result/bugs_dieu_phoi_ca_20260715.xlsx` (mẫu 3 cột `id | web/flutter | Bug`).

---

## 2. Chi tiết từng lỗi + Evidence

### BUG-01 · Bộ lọc giao dịch trong ca không lọc bảng — Major/High (BR-DPC-16)
Ca SCR00000004CN2 có 43 giao dịch (22 Phiếu thu + 21 Phiếu bán hàng). Chọn loại "Phiếu bán hàng" → bảng vẫn 43 dòng (chờ >3s); tìm "PC00000073" + Enter → vẫn 43 dòng; bỏ tick "Hoàn thành" → vẫn 43 dòng. Nhãn nút dropdown đổi nhưng dữ liệu không lọc. Cả 3 control (dropdown loại, ô tìm, checkbox) đều vô tác dụng.
Evidence: `dpc_04a_txfilter_baseline_43rows.png`, `dpc_04b_typefilter_banhang_still43.png`, `dpc_04c_search_checkbox_no_effect_still43.png`.

### BUG-02 · Mâu thuẫn "Tiền mặt trong ca" panel vs modal — Major/High · CẦN PO
Ca 0 giao dịch, tiền đầu ca 500,000đ: panel hiển thị "Tổng tiền mặt trong ca = 0đ" nhưng modal "Thông tin đóng ca" và "Đóng và in phiếu" hiển thị "Tiền mặt trong ca = 500,000đ". Đếm 600,000 → Chênh lệch = 100,000đ (=600,000−500,000) thay vì 600,000đ (=600,000−0). Theo BR-DPC-05/§5.1, chỉ số này = Phiếu thu(TM) − Phiếu chi(TM), KHÔNG gồm tiền đầu ca ⇒ phải = 0đ và đồng bộ 2 màn. Có thể là chủ đích (modal tính tổng ngăn kéo = đầu ca + biến động) → cần PO chốt định nghĩa vì ảnh hưởng đối soát tiền.
Evidence: `dpc_05a_dongca_modal_tienmat500k.png`, `dpc_06_dongvainphieu_tienmat_500k.png`, `dpc_05c_chenhlech_onblur_100k.png`.

### BUG-03 · Placeholder "tối đa 50" vs maxlength=200 — Minor/Medium (BR-DPC-14)
Modal đóng ca, ô ghi chú placeholder "Nhập ghi chú (tối đa 50 ký tự)" nhưng DOM maxlength=200 và nhập được 61 ký tự thành công.
Evidence: `dpc_05a_dongca_modal_tienmat500k.png`, `dpc_05b_note61chars_counter0of200.png`.

### BUG-04 · Bộ đếm ký tự ghi chú không cập nhật — Minor/Low (BR-DPC-15)
Nhập 61 ký tự vào ô ghi chú (gõ phím thật) nhưng bộ đếm vẫn "0/200", không nhảy.
Evidence: `dpc_05b_note61chars_counter0of200.png`.

### BUG-05 · Phân trang lộ key i18n thô trong aria-label — Minor/Low (NFR-01)
Với lịch sử >4 ca, phân trang "‹ 1 2 ›". Glyph nhìn thấy đã là ‹ › nhưng aria-label vẫn là `pagination.previous`/`pagination.next` (accessible name = "pagination.next") ⇒ trình đọc màn hình đọc key thô. So với SRS (mô tả hiển thị key thô) thì phần hiển thị đã sửa, còn tồn ở aria-label.
Evidence: `dpc_02_history_pagination.png` (+ DOM `aria-label="pagination.next"`).

### BUG-06 · Dòng giao dịch pointer nhưng không hành động — Trivial/Low · CẦN PO (PO#14)
Bảng giao dịch: hover dòng → con trỏ pointer (gợi ý click) nhưng click không mở gì (không chi tiết, không điều hướng, không modal). Cần PO quyết định: mở chi tiết chứng từ hay bỏ style pointer.
Evidence: quan sát trực tiếp (không có modal/điều hướng sau click).

---

## 3. Khác biệt so với SRS — đã được sửa (KHÔNG còn là bug)

- **BR-DPC-17 (mở ca thiếu tiền đầu ca — trước đây "im lặng"):** Nay khi bỏ trống tiền đầu ca và bấm "Mở ca ngay", server vẫn trả **HTTP 422** (`POST .../shift/open-shift`) nhưng UI **đã có toast** "Tiền đầu ca phải là một số." → lỗi "422 im lặng, không phản hồi UI" trong SRS **không còn tái hiện**. (Lưu ý nhỏ: nội dung toast "phải là một số" hơi lệch cho trường hợp bỏ trống — hợp lý hơn là "Vui lòng nhập tiền đầu ca"; mức Trivial, không tính thành bug riêng.)
  Evidence: `dpc_08a_openshift_empty_422_now_has_toast.png`.

---

## 4. Đã kiểm chứng ĐÚNG spec (không lỗi)

FLOW-01 popover breakdown (FR-DPC-03) · FLOW-02 ngày/tháng tương lai disabled (FR-07), "Áp dụng" khóa khi thiếu mốc→mở khi đủ (FR-08), phân trang client-side URL không đổi (FR-10) · FLOW-03 modal Chi tiết ca đầy đủ + BR-DPC-09 (1,000,000+16,796,446=17,796,446đ) · FLOW-05 toast "Vui lòng nhập tiền giao thực tế" (FR-21), ô tiền chỉ nhận số (BR-11), Chênh lệch tính on-blur (BR-06), dialog xác nhận chênh lệch (FR-22), hủy không giữ dữ liệu (BR-18), đóng ca → lịch sử ghi tiền bàn giao 600,000đ (FR-23/BR-08) · FLOW-07 In phiếu kích hoạt in trình duyệt → about:blank (FR-26) · FLOW-08 Giờ vào disabled auto-fill (BR-03), mã ca tự tăng SCR008→SCR009 (BR-02), mở ca thành công (FR-30).

---

## 5. Điểm cần PO xác nhận (ngoài bug #2, #6)
- Bảng "Nguồn Đơn" trong modal Chi tiết ca đang rỗng và tái dùng header "Tên Phương Thức/Tổng Tiền" (PO#15).
- Ánh xạ checkbox "Hoàn thành"/"Đã hủy" với trạng thái hiển thị "Đã thanh toán" (PO#9).
- Quy ước prefix mã: `PC...` = Phiếu thu, `POS...` = Phiếu bán hàng (PO#5).

## 6. Giới hạn & giả định (Limitations)
- Chỉ 1 tài khoản test (admin/Admin master) ⇒ **chưa kiểm chứng phân quyền** (cashier xem/mở/đóng ca hộ người khác — PO#6).
- **FLOW-07 In phiếu:** đã xác nhận kích hoạt luồng in (tab → about:blank) nhưng nội dung phiếu in chưa đọc được (in trình duyệt chặn tự động hóa; đã tạm chặn window.print để khảo sát, không đọc được layout phiếu). Cần kiểm tra thủ công có máy in/preview.
- Bug #2 và #6 mang tính **nghi ngờ/cần PO xác nhận** (có thể là chủ đích thiết kế), đã đánh dấu rõ.
- Không gặp CAPTCHA/OTP/2FA; không có mục BLOCKED.

## 7. Thao tác phá hủy đã thực hiện (chi tiết ở task.md)
1. 22:01:58 15-07-2026 — ĐÓNG ca SCR00000008CN2 (đếm 600,000đ, chênh lệch 100,000đ, ghi chú `AUTO_DPC_close_SCR008_150726`).
2. 22:03:05 15-07-2026 — MỞ ca mới SCR00000009CN2 (đầu ca 500,000đ, ghi chú `AUTO_DPC_reopen_150726_restore`).
→ Trạng thái "có 1 ca đang mở" được khôi phục sau phiên.
