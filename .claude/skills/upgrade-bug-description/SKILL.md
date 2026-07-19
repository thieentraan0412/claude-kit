---
name: upgrade-bug-description
description: NÂNG CẤP đoạn text bug thô/sơ sài thành mô tả CHI TIẾT TỪNG BƯỚC tái hiện — như một guide giúp dev/tester phát hiện đúng bug — theo format chuẩn cột `Bug` của repo (bước đánh số → "→ Lỗi hiện tại:" → "→ Kết quả mong đợi:"), đối chiếu REQUIREMENT làm nguồn chân lý. Hỗ trợ nâng cấp HÀNG LOẠT cột `Bug` trong file Excel — thêm cột mới `Bug (chi tiết)` ngay cạnh cột gốc, giữ nguyên cột gốc. Đây là TEXT REWRITE OFFLINE — KHÔNG chạy browser, KHÔNG săn bug mới (việc đó dùng explore-and-report-bugs-to-excel), KHÔNG thực thi test case (việc đó dùng execute-testcases-from-excel). Trigger: "nâng cấp bug", "nâng cấp mô tả bug", "viết lại bug chi tiết", "chuẩn hóa cột Bug", "upgrade text thành các bước tái hiện", "làm rõ bước tái hiện bug".
---

# Workflow: Nâng Cấp Text Bug Thô → Mô Tả Chi Tiết Từng Bước Tái Hiện

> **BẮT BUỘC (MANDATORY SKILL):** Nạp và đọc kỹ **`/manual-testing-techniques`**
> (`.claude/skills/manual-testing-techniques/SKILL.md`) — cấu trúc Bug Report chuẩn,
> Severity vs Priority, tiêu chí một bug report tốt.
>
> **TẬN DỤNG (leverage — nạp khi có input tương ứng):**
> - **`/analyze-requirement-document`** (`.claude/skills/analyze-requirement-document/SKILL.md`)
>   — khi user cung cấp file requirement: bóc tách thành danh sách màn hình, nút/field,
>   FR/BR, thông báo lỗi kỳ vọng → dùng làm nguồn chân lý cho "Kết quả mong đợi" và tên element.

Skill này biến một đoạn text bug **thô, sơ sài** (vd: "bấm lưu bị lỗi", "menu không hiện khi search")
thành một **guide phát hiện bug chính xác**: các bước tái hiện đánh số từ điểm xuất phát rõ ràng,
đủ chi tiết để dev/tester làm theo y hệt và quan sát được đúng lỗi.

## 📋 Format đích (BẮT BUỘC — đúng mẫu cột `Bug` của repo)

```
1. <bước 1 — cụ thể: đăng nhập/màn hình nào, nút/field nào, nhập gì, phím tắt gì>
2. <bước 2>
3. <bước 3...>
→ Lỗi hiện tại: <hiện tượng lỗi quan sát được trên UI>
→ Kết quả mong đợi: <hành vi đúng theo requirement — kèm mã FR/BR nếu có>
```

(Lỗi phân quyền/bảo mật hoặc khi cần đề xuất sửa → thay/thêm dòng `→ Cần fix: <việc cần làm>`.)

## ⚠️ Nguyên tắc vàng — TRUNG THỰC, KHÔNG BỊA

- Mọi chi tiết bổ sung vào bước tái hiện phải có **căn cứ** từ 1 trong 3 nguồn:
  (a) text bug gốc, (b) requirement đã bóc tách, (c) các cột khác trong Excel (module, màn hình, id...).
- Chi tiết cần thiết nhưng **không có căn cứ** (tên nút chính xác, giá trị nhập, điều kiện dữ liệu...)
  → vẫn viết bước nhưng đánh dấu **`[Cần xác nhận]`** ngay tại chỗ đó. KHÔNG suy diễn thành sự thật.
- KHÔNG chạy browser, KHÔNG đoán locator, KHÔNG "tự tái hiện" để kết luận thêm — đây là nâng cấp văn bản.
- KHÔNG đổi ý nghĩa bug gốc: hiện tượng lỗi giữ đúng như text gốc mô tả, chỉ làm rõ và chuẩn hóa.
- Text gốc gộp nhiều lỗi trong 1 đoạn → tách thành nhiều block bug, báo user biết.

## Quy trình 4 bước

### Bước 1 — Nạp nguồn chân lý
- Có file requirement → dùng `/analyze-requirement-document` bóc tách: tên màn hình/menu, nút/field,
  ràng buộc validation, luồng trạng thái, thông báo kỳ vọng, mã FR/BR. KHÔNG sinh test case.
- Không có requirement → vẫn nâng cấp được, nhưng "Kết quả mong đợi" viết theo common sense
  và đánh dấu `[Cần xác nhận — không có requirement đối chiếu]`.

### Bước 2 — Phân tích text thô
Với mỗi đoạn text, bóc tách 3 thành phần: **hành động** (user đã làm gì), **hiện tượng** (lỗi gì
xuất hiện), **kỳ vọng ngầm** (đáng lẽ phải thế nào). Thiếu thành phần nào → tra requirement để bù,
không bù được → `[Cần xác nhận]`.

### Bước 3 — Viết lại theo format đích
Checklist chất lượng cho TỪNG bug (Definition of Done):
- [ ] Bước 1 luôn là điểm xuất phát rõ ràng (đăng nhập → điều hướng tới màn hình → thao tác).
- [ ] Tên màn hình/nút/field đúng theo requirement (không dùng tên chung chung "nút đó", "trang kia").
- [ ] Dữ liệu nhập cụ thể (giá trị, độ dài, ký tự đặc biệt...) nếu bug liên quan input.
- [ ] "→ Lỗi hiện tại:" mô tả đúng hiện tượng trong text gốc, quan sát được trên UI.
- [ ] "→ Kết quả mong đợi:" đối chiếu requirement, kèm mã FR/BR nếu bóc tách được.
- [ ] Người chưa từng thấy bug đọc xong làm theo được y hệt.

### Bước 4 — Mode Excel (nâng cấp hàng loạt cột `Bug`)
Khi input là file Excel có cột `Bug`:

1. **Đọc** dữ liệu ra JSON (script tự tìm sheet/hàng header chứa cột `Bug`):
   ```
   python .claude/skills/upgrade-bug-description/scripts/apply_bug_upgrades.py read "<file.xlsx>" [--sheet "<tên sheet>"]
   ```
2. Nâng cấp từng dòng theo Bước 2–3. Dòng `Bug` trống → bỏ qua, ghi chú trong báo cáo.
3. **Ghi** kết quả vào JSON (`run/bug_upgrades.json`, schema ở dưới) rồi chạy:
   ```
   python .claude/skills/upgrade-bug-description/scripts/apply_bug_upgrades.py write "<file.xlsx>" run/bug_upgrades.json
   ```
   Script sẽ: **backup file gốc vào `run/backup/`** → thêm cột **`Bug (chi tiết)`** ngay bên phải
   cột `Bug` (đã tồn tại thì ghi đè nội dung cột đó, idempotent) → wrap text + set độ rộng cột.
   Cột `Bug` gốc GIỮ NGUYÊN.

Schema `run/bug_upgrades.json`:
```json
{
  "sheet": "<tên sheet — lấy từ output lệnh read>",
  "col_name": "Bug (chi tiết)",
  "upgrades": [
    { "row": 2, "text": "1. ...\n2. ...\n→ Lỗi hiện tại: ...\n→ Kết quả mong đợi: ..." }
  ]
}
```
`row` = số dòng Excel thật (lấy từ output lệnh read). Cần package `openpyxl`
(thiếu thì `pip install openpyxl --break-system-packages`).

## OUTPUT (Tiếng Việt)

- Text đơn lẻ → trả block đã nâng cấp ngay trong chat.
- Excel → file gốc có thêm cột `Bug (chi tiết)` + báo cáo tóm tắt: số dòng đã nâng cấp / bỏ qua (trống),
  danh sách điểm `[Cần xác nhận]`, bug bị tách (nếu có), đường dẫn backup.
- Trước khi bàn giao: đối chiếu `.claude/rules/delivery_checklist.md`.
