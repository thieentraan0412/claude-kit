# Bản đồ Coverage — phiên săn lỗi Edit Menu (16-07-2026)

Scope phiên này: ĐÀO SÂU validation modal Tạo/Chỉnh sửa hàng hóa (FLOW-MENU-03/05), có chạm FLOW-MENU-07 (xóa) và FLOW-MENU-01 (đăng nhập). Các tab phụ (Nhóm/Thuộc tính/Đơn vị/Thuế/Hoa hồng) và các flow khác KHÔNG nằm trong scope lần này.

| # | Màn/Trang | Element | Thao tác đã thực hiện | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| 1 | /auth-route (Login Flutter) | Store ID / Username / Password / Login | Nhập sai nhãn (admin/thientester) rồi đúng (Thientester/admin) + submit | Sai → 404 "Công ty chưa được đăng ký"; đúng → 200, vào role picker | Bug #6; nhãn prompt bị ngược |
| 2 | Role picker | Thẻ "Cashier" / "Admin" | Bấm "Cashier" | Vào POS shell (/pos-shell-route) | — |
| 3 | POS shell nav | "Menu" | Bấm THƯỜNG | Mở module "Menu list" ngay | Khác BR-MENU-05 (không cần giữ 2s) |
| 4 | Module Menu list | Bảng danh sách, tabs, filter | Xem | 221 records, 12 trang; tabs Menu list/Product groups/Attributes/Units/Taxes/Commissions | Branch = TESTER |
| 5 | Danh sách | "+ Add item" dropdown | Bấm | Hiện "Regular goods" / "Set menu/Combo" | — |
| 6 | Modal "Add new item" | Toàn bộ field tab Details | Đọc cấu trúc | Chỉ Product name*/Sale price*/Branch* có dấu * | Bug #2 |
| 7 | Modal | Nút "Save" (form rỗng) | Submit rỗng | Chỉ "Product name: Required"; Sale price* KHÔNG báo | Bug #3 |
| 8 | Modal | Save (đủ Name+Price, thiếu Nhóm/ĐVT/VAT) | Submit | Backend success:false (3 message) nhưng UI KHÔNG hiển thị | Bug #1 (chính) |
| 9 | Modal | Sale price | Nhập "-50000abc" / "-50000" | Lọc số, bỏ dấu âm, format "50.000" | OK — không phải lỗi |
| 10 | Modal | Description (Mô tả) | Gõ >200 ký tự (thật) | Nhận >200, không có bộ đếm 0/200 | Bug #4 |
| 11 | Modal | Product group / Unit / VAT | Chọn Bò / Lon / nhập 10 | Chọn được; group đổi KHÔNG xóa field (đã kiểm chứng bằng screenshot) | note: đã loại trừ nghi vấn "đổi group xóa field" |
| 12 | Modal | Save (đủ trường hợp lệ) | Submit | success:true "Tạo thành công", modal ĐÓNG, list refresh → 222 | Đối chứng cho Bug #1 |
| 13 | Danh sách | Nút Xóa (thùng rác) item mới | Bấm → mở dialog | Dialog "Delete item \":name\"?" — placeholder chưa nội suy | Bug #5 |
| 14 | Dialog xóa | Nút "Delete" | Xác nhận | 200 OK, xóa item id=223, list về 221 | Cleanup + verify FLOW-07 |

## Điểm chưa/không soi (ngoài scope hoặc chưa tái hiện)
- Tab Attributes/Topping của modal, các tab danh mục phụ, Set Menu/Combo, Công thức chế biến, Nhập/Xuất file: NGOÀI scope lần này.
- Nghi vấn "modal tự nhảy sang tab Attributes" khi thao tác tự động: quan sát 1 lần, CHƯA tái hiện ổn định → cần kiểm chứng tay (không tính là bug).
