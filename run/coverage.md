# Bản đồ Coverage — Module Điều phối ca (phiên 15-07-2026)

Engine: Playwright MCP · Viewport 1920×1080 · TK admin (Admin master) · STAGING
Nguồn chân lý: requirements/requirements_dieu_phoi_ca.md (8 FLOW, 38 FR-DPC, 19 BR-DPC, 7 NFR)

| FLOW | Màn/Thao tác đã soi | Kết quả đối chiếu spec | Bug? |
|---|---|---|---|
| 01 | Card ca đang mở (SCR009); 4 thẻ tổng hợp; popover "Công nợ"/"Thanh toán khác"; badge "Đang mở" | Popover mở đúng (FR-DPC-03), 1 popover/lần. Khớp spec | — |
| 02 | Bộ lọc Thời gian: mở picker, ngày/tháng tương lai disabled (FR-07), Áp dụng disabled khi thiếu mốc→enable khi đủ (FR-08); lọc khoảng 01-06→15-07; phân trang ‹1 2›; chuyển trang client-side (URL không đổi, FR-10) | Phần lớn khớp spec. **Lỗi:** aria-label phân trang giữ key i18n thô `pagination.previous/next` (NFR-01) | BUG (NFR-01) |
| 03 | Click card SCR004 → panel phải; modal "Chi tiết ca" đầy đủ (Thông tin ca, Bán hàng, Thu/Chi, PTTT: CK 3,861,067đ + TM 16,427,410đ) | Khớp FR-DPC-13; BR-DPC-09 (1,000,000+16,796,446=17,796,446) đúng. Bảng "Nguồn Đơn" rỗng + header tái dùng "Tên Phương Thức/Tổng Tiền" (PO#15) | Minor/PO |
| 04 | Ca SCR004 (43 GD): dropdown loại→"Phiếu bán hàng"; ô tìm "PC00000073"+Enter; bỏ tick "Hoàn thành"; click dòng giao dịch | **Lỗi:** cả 3 control lọc không tác động bảng (luôn 43 dòng) — BR-DPC-16. Click dòng (pointer) không hành động (PO#14) | BUG (BR-16) + Minor(PO#14) |
| 05 | Modal "Thông tin đóng ca": placeholder ghi chú vs maxlength; bộ đếm ký tự; toast tiền trống; ô tiền chỉ số; chênh lệch on-blur; hủy-không-giữ; ĐÓNG ca thật SCR008 | Toast "Vui lòng nhập tiền giao thực tế" (FR-21) OK; ô tiền non-numeric→0 (BR-11) OK; chênh lệch on-blur (BR-06) OK; dialog xác nhận chênh lệch (FR-22) OK; hủy không giữ dữ liệu (BR-18) OK; đóng ca→lịch sử 600,000đ (FR-23) OK. **Lỗi:** placeholder "tối đa 50" vs maxlength=200/nhập 61 ký tự (BR-14); bộ đếm đứng "0/200" (BR-15); "Tiền mặt trong ca"=500,000đ ở modal ≠ 0đ ở panel (mâu thuẫn/PO) | BUG (BR-14, BR-15) + Major/PO (mâu thuẫn tiền) |
| 06 | Modal "Thông tin đóng ca và in phiếu" (mở + hủy, không submit) | Cấu trúc form tương tự modal đóng ca (FR-25) OK. Cùng hiển thị "Tiền mặt trong ca"=500,000đ (mâu thuẫn như FLOW-05) | (gộp vào Major/PO) |
| 07 | Nút "In phiếu" trên card lịch sử → kích hoạt in trình duyệt | Tab chuyển `about:blank` (document.write+print), khớp FR-26. In chặn tự động hóa (đã chặn window.print để khảo sát) | — (hành vi in) |
| 08 | Trạng thái "Chưa mở ca" + panel phải "Không tìm thấy dữ liệu phù hợp" (FR-27); modal "Mở ca làm việc": Giờ vào disabled auto-fill (BR-03); mở ca thiếu tiền→422; mở ca thật SCR009 (đầu ca 500,000đ) | Giờ vào disabled (BR-03) OK; mã tự tăng SCR008→SCR009 (BR-02) OK; mở ca thành công (FR-30) OK. **Khác SRS:** mở ca thiếu tiền nay CÓ toast "Tiền đầu ca phải là một số." (BR-DPC-17 "im lặng" đã được sửa) | Không còn bug (BR-17 đã fix); wording toast hơi lệch (nhỏ) |

**Độ phủ:** 8/8 FLOW đã thao tác thật tới trạng thái kết thúc. 2 thao tác phá hủy (đóng SCR008, mở SCR009) đã log ở task.md. Không còn element tương tác trong scope chưa chạm.
