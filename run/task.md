# Bug Hunting Progress — Module Edit Menu (Quản lý hàng hóa) · 16-07-2026

- [x] Bước 0: Thu thập input + DỪNG xác nhận scope & quyền phá hủy & engine với user
- [x] Bước 1: Nạp spec làm nguồn chân lý (requirements/requirements_edit_menu.md)
- [x] Bước 2: Chọn engine + kết nối browser (Playwright MCP — đã verify, cả Chrome ext cũng sẵn)
- [x] Bước 3: Login + mở module Edit Menu (/pos-shell-route/menu-list-route)
- [x] Bước 4: Đào sâu validation modal Tạo/Chỉnh sửa + xác nhận xóa → 6 bug (run/bugs.json)
- [x] Bước 5: Xuất bug ra Excel → Result/bugs_edit_menu_20260716_1154.xlsx
- [x] Bước 6: Báo cáo + tóm tắt → run/report.md

## Cấu hình lần chạy (theo lựa chọn user)
- **Scope**: ĐÀO SÂU VALIDATION MODAL Tạo/Chỉnh sửa hàng hóa (không chạy toàn bộ 12 flow).
- **Quyền phá hủy**: CÓ (TEST) — data test gắn nhãn `auto_bughunt_*`, ghi log bên dưới.
- **Engine**: Playwright MCP (viewport 1920×1080).

## Thông tin truy cập (QUAN TRỌNG — prompt ghi NGƯỢC nhãn)
- Prompt/requirements ghi: ID cửa hàng `admin` · Tên đăng nhập `thientester`.
- THỰC TẾ (theo Partital/Enviroment.txt + phản hồi server): **Store ID = `Thientester`**, **Username = `admin`**, mật khẩu 12345678.
- Đăng nhập sai nhãn → API /login trả 404 "Công ty chưa được đăng ký". Đổi đúng (Store ID=Thientester, User=admin) → login 200 OK, hiển thị "Admin master".
- Đường đi module: Login → chọn không gian "Cashier" → bấm "Menu" trên nav → module "Menu list".
  (Lưu ý: bấm THƯỜNG vào "Menu" đã mở được module — KHÁC BR-MENU-05 vốn nói phải nhấn-giữ ~2s.)

## Log thao tác phá hủy (Create/Edit/Delete) — TEST env
| Thời điểm (VN) | Màn hình | Thao tác | Dữ liệu | Kết quả |
|---|---|---|---|---|
| ~11:30 | Modal Tạo HH | POST /menu/store (name `auto_bughunt_valtest_0716`, sale_price=0, thiếu Nhóm/ĐVT/VAT) | data test | success:false — KHÔNG tạo (không sinh rác) |
| ~11:36 | Modal Tạo HH | POST /menu/store (name `auto_bughunt_req_0716`, thiếu Nhóm/ĐVT/VAT) | data test | success:false — KHÔNG tạo |
| ~11:43 | Modal Tạo HH | POST /menu/store (name `auto_bughunt_clr_0716`, Nhóm=Bò, ĐVT=Lon, VAT=10) | data test | success:true — **TẠO** item id=223, code PRO00000222CN2 |
| ~11:45 | Danh sách | POST /menu/delete item id=223 (PRO00000222CN2) | data test | 200 OK — **ĐÃ XÓA**, danh sách về 221 records |

> Kết thúc phiên: môi trường SẠCH (221 records như ban đầu). Không còn dữ liệu test tồn dư.
