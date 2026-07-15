# Schema `bugs.json` → Excel Bug (mẫu 3 cột)

> Cấu trúc file trung gian mà skill build trong khi săn lỗi, rồi đưa cho
> `scripts/bugs_to_excel.js` để xuất Excel theo **MẪU 3 cột**: `id | web/flutter | Bug`.
> Mỗi phần tử `bugs[]` = **1 lỗi = 1 dòng**. KHÔNG gộp nhiều lỗi vào 1 dòng.

## Mẫu Excel đích (giống ảnh user cung cấp)

| id | web/flutter | Bug |
|---|---|---|
| 1 | flutter | (khối text nhiều dòng — xem dưới) |
| 2 | web/flutter | ... |

Cột **`Bug`** là 1 khối text nhiều dòng, ghép theo đúng thứ tự:

```
1. <bước tái hiện 1 — chi tiết, cụ thể>
2. <bước tái hiện 2>
3. <bước tái hiện 3>
→ Lỗi hiện tại: <hiện tượng lỗi quan sát được>
→ Kết quả mong đợi: <hành vi đúng theo spec>
```

Trường hợp lỗi phân quyền/bảo mật hoặc khi phù hợp, thay dòng cuối bằng đề xuất sửa:
```
→ Cần fix: <việc cần làm để sửa>
```
(Có thể có cả `→ Kết quả mong đợi:` lẫn `→ Cần fix:` nếu cần.)

## Cấu trúc `bugs.json`

```json
{
  "meta": {
    "app": "orderTable — Cashier",
    "url": "https://table1.klkim.com/...",
    "environment": "STAGING",
    "engine": "Playwright MCP",
    "account": "thientester (KHÔNG ghi mật khẩu)",
    "executed_at": "2026-07-12 10:00",
    "scope": "Edit menu",
    "platform": "web/flutter"
  },
  "bugs": [
    {
      "id": 1,
      "platform": "flutter",
      "steps": [
        "Đăng nhập vào Cashier, mở giao diện \"Edit menu\".",
        "Trong danh sách món ăn, chọn một món bất kỳ.",
        "Nhấn vào nút bật/tắt ở cột \"Trạng thái\" của món đó để đổi trạng thái (đang bán ↔ ngừng bán)."
      ],
      "actual": "hệ thống báo lỗi SQL, không đổi được trạng thái.",
      "expected": "trạng thái món được bật/tắt thành công, không báo lỗi, không xóa món đó trong edit menu."
    },
    {
      "id": 5,
      "platform": "web/flutter",
      "steps": [
        "Đăng nhập bằng tài khoản con chỉ được cấp quyền Thu ngân.",
        "Tại màn hình bán hàng, nhấn tổ hợp phím Ctrl + F9."
      ],
      "actual": "tài khoản vẫn mở/xem được trang \"Edit menu\" dù không có quyền.",
      "fix": "ẩn hoàn toàn trang \"Edit menu\" đối với tài khoản chỉ có quyền Thu ngân."
    }
  ]
}
```

## Ý nghĩa từng trường

| Trường | Cột Excel | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | `id` (A) | – | Số thứ tự bug. Bỏ trống → helper tự đánh số 1,2,3… |
| `platform` | `web/flutter` (B) | – | Nền tảng gặp lỗi: `flutter`, `web/flutter`, `web`, `mobile`… Bỏ trống → lấy `meta.platform`, mặc định `web/flutter` |
| `steps` | ghép vào `Bug` (C) | ✔ | **Mảng** các bước tái hiện — mỗi phần tử 1 bước, helper tự đánh số `1. 2. 3.`. Viết **chi tiết, cụ thể** (màn hình nào, nút nào, nhập gì, phím tắt gì) để dev reproduce được ngay |
| `actual` | dòng `→ Lỗi hiện tại:` | ✔ | Hiện tượng lỗi quan sát THẬT trên UI |
| `expected` | dòng `→ Kết quả mong đợi:` | ✔* | Hành vi đúng theo spec (bắt buộc trừ khi dùng `fix`) |
| `fix` | dòng `→ Cần fix:` | – | Đề xuất sửa (dùng cho lỗi phân quyền/bảo mật hoặc khi cần) |

> `steps` cũng nhận **chuỗi đã đánh số sẵn** (khi đó helper giữ nguyên, không tự đánh số).

## Viết `steps` cho tốt (BẮT BUỘC — chi tiết từng bước)

- Bắt đầu từ **điểm xuất phát rõ ràng**: "Đăng nhập vào Cashier, mở giao diện Edit menu".
- Mỗi bước là **một hành động đơn**, nêu đúng **tên màn hình / nút / field / phím tắt** như trên UI thật.
- Nêu **dữ liệu cụ thể** đã nhập (số lượng = -1, để trống lý do, tài khoản chỉ quyền Thu ngân…).
- Đủ để người khác **làm theo y hệt** mà không cần đoán. Không viết chung chung ("thao tác với món ăn").

## Lệnh xuất Excel

```bash
NODE_PATH="<node_modules_có_exceljs>" \
node .claude/skills/explore-and-report-bugs-to-excel/scripts/bugs_to_excel.js write \
    run/bugs.json --out "Result/bugs_<app>_<YYYYMMDD>.xlsx"
```

- Sheet **`Bug`**: đúng 3 cột `id | web/flutter | Bug`, header cam nhạt, freeze dòng tiêu đề, cột `Bug` rộng + wrap text nhiều dòng.
- Sheet **`Info`**: metadata lần chạy (app, URL, engine, tài khoản, scope, tổng bug) — không ảnh hưởng mẫu chính.

## Ghi chú Severity/Priority

Mẫu Excel này KHÔNG có cột Severity/Priority (bám sát ảnh). Vẫn đánh giá Severity/Priority
theo `/manual-testing-techniques` §6.2 và ghi trong `run/report.md` để phân loại/ưu tiên.
