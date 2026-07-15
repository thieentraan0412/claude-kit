---
name: manual-testing-techniques
description: Skill tham chiếu toàn diện về Manual Testing — test levels, test types, static/dynamic testing, kỹ thuật thiết kế test case (EP, BVA, Decision Table, State Transition, Pairwise, Use Case, Error Guessing), quy trình Exploratory Testing, viết Bug Report (Severity vs Priority, bug lifecycle), và checklist chất lượng. Dùng khi cần kiến thức nền tảng/phương pháp kiểm thử thủ công, chọn kỹ thuật phù hợp, hoặc chuẩn hóa cách test & báo lỗi.
---

# Manual Testing Techniques

## Description

Đây là **Skill kiến thức nền tảng (reference)** về kiểm thử thủ công. Skill KHÔNG sinh ra bộ test case cụ thể — thay vào đó nó cung cấp **phương pháp, kỹ thuật và tiêu chuẩn** để một QA thực hiện manual testing bài bản: hiểu đúng cần test cái gì (levels/types), thiết kế test case bằng kỹ thuật phù hợp, chạy exploratory hiệu quả, và báo lỗi đúng chuẩn.

Skill này là **bạn đồng hành** cho các skill sinh test case của bộ QA kit: khi cần *áp dụng* kiến thức để tạo TC thì chuyển sang các skill sinh test case tương ứng.

---

## When to Use

Sử dụng skill này khi:

- Cần **hiểu / giải thích** một kỹ thuật kiểm thử (EP, BVA, Decision Table, State Transition, Pairwise...) kèm ví dụ
- Cần **chọn kỹ thuật thiết kế test case phù hợp** cho một bài toán cụ thể
- Cần **quy trình chạy Exploratory Testing** bài bản (charter, session, tours)
- Cần **viết / review Bug Report** đúng chuẩn, phân biệt Severity vs Priority
- Cần **checklist chất lượng** (UI/UX, Functional, Compatibility, Security cơ bản, Data)
- Cần thiết lập **entry/exit criteria**, hiểu test levels & test types
- Đào tạo / onboard QA mới về nền tảng manual testing

**KHÔNG** dùng skill này (dùng skill khác) khi:

- Cần **sinh ra bộ test case** từ requirements → `/rbt-manual-testing` (QUICK) hoặc `/generate-manual-testcases-rbt` (FULL RBT)
- Cần **sinh nhanh TC** từ requirement rõ ràng → `/generate-testcases-from-requirements`
- Cần **phân tích tài liệu yêu cầu** → `/analyze-requirement-document` / `/requirements-analyzer`
- Cần **sinh test data** → `/generate-test-data` / `/test-data-generator`
- Cần **automation / locator / API test** → `/qa-automation-engineer`, `/smart-locator-agent`, `/generate-api-tests-from-swagger`

---

## 7 Nguyên tắc kiểm thử (nền tảng tư duy)

Mọi hoạt động manual testing đều dựa trên các nguyên tắc sau:

1. **Testing cho thấy sự hiện diện của lỗi**, không chứng minh "không còn lỗi".
2. **Không thể test toàn bộ (Exhaustive testing)** — phải chọn lọc bằng kỹ thuật & rủi ro.
3. **Test sớm (Early testing)** — càng phát hiện sớm càng rẻ (shift-left).
4. **Lỗi tụ cụm (Defect clustering)** — ~80% lỗi nằm ở ~20% module → tập trung vào vùng rủi ro.
5. **Nghịch lý thuốc trừ sâu (Pesticide paradox)** — lặp lại y hệt bộ test sẽ hết hiệu quả → phải rà soát, làm mới test case.
6. **Testing phụ thuộc ngữ cảnh** — app ngân hàng test khác app tin tức.
7. **Ngộ nhận "không lỗi" (Absence-of-errors fallacy)** — hệ thống không lỗi nhưng sai nhu cầu người dùng thì vẫn vô dụng.

> Dùng các nguyên tắc này để **giải thích quyết định test** với team/PO, không chỉ liệt kê case.

---

## 1. Test Levels — Kiểm thử theo cấp độ

Xác định *đang test ở tầng nào* để chọn phạm vi và loại lỗi cần soi.

| Level | Đối tượng test | QA thủ công quan tâm gì |
|-------|----------------|--------------------------|
| **Unit / Component** | 1 hàm/1 module nhỏ (thường dev test) | Thường không phải việc của manual QA, nhưng cần biết để tránh test trùng |
| **Integration** | Giao tiếp giữa các module/API/DB | Data truyền đúng giữa màn hình A → B, lỗi mapping field, timeout khi gọi service |
| **System** | Toàn bộ hệ thống end-to-end | Nghiệp vụ hoàn chỉnh, luồng người dùng thật, non-functional (UI, hiệu năng cảm nhận) |
| **Acceptance (UAT)** | Nghiệm thu theo góc nhìn người dùng/nghiệp vụ | Đúng nhu cầu thực tế, sẵn sàng go-live, tiêu chí chấp nhận |

**Mẹo:** Đa số công việc manual QA nằm ở **System** và **Acceptance**. Khi thấy lỗi, xác định level giúp gán đúng người xử lý.

---

## 2. Test Types — Kiểm thử theo loại

### 2.1 Functional Testing (chức năng)
Kiểm tra "hệ thống **làm gì**" — đúng theo yêu cầu nghiệp vụ. Bao gồm: happy path, luồng rẽ nhánh, validation, phân quyền, business rules.

### 2.2 Non-functional Testing (phi chức năng)
Kiểm tra "hệ thống **hoạt động như thế nào**":

| Loại | Câu hỏi cốt lõi | Ví dụ kiểm tra thủ công |
|------|-----------------|--------------------------|
| **Usability** | Có dễ dùng không? | Luồng thao tác rối, label mơ hồ, thông báo lỗi khó hiểu |
| **Performance (cảm nhận)** | Có nhanh/ổn không? | Trang tải chậm, spinner treo, thao tác lag khi data lớn |
| **Compatibility** | Chạy đúng trên môi trường khác? | Trình duyệt (Chrome/Firefox/Safari/Edge), OS, độ phân giải, mobile/desktop |
| **Security (cơ bản)** | Có lỗ hổng rõ ràng? | XSS, SQL injection ở input, truy cập URL không phân quyền, lộ thông tin |
| **Reliability** | Có ổn định khi lỗi? | Mất mạng giữa chừng, refresh, back/forward, double-click submit |
| **Accessibility** | Người khuyết tật dùng được? | Điều hướng bằng bàn phím, alt text, tương phản màu, screen reader |

### 2.3 Change-related Testing (khi có thay đổi)

- **Confirmation / Re-test:** Test lại đúng bug đã fix để xác nhận đã hết.
- **Regression:** Test lại vùng liên quan để đảm bảo fix/feature mới **không làm hỏng** chức năng cũ.

> ⚠️ Sau mỗi lần fix bug, luôn làm **Re-test + Regression** vùng ảnh hưởng, không chỉ test đúng cái vừa sửa.

### 2.4 Static vs Dynamic Testing

| | **Static Testing** | **Dynamic Testing** |
|---|---|---|
| Bản chất | Review, không chạy hệ thống | Chạy thật, quan sát hành vi |
| Ví dụ | Review requirements, review test case, đọc mockup/Figma | Thực thi test case trên app |
| Giá trị | Bắt lỗi/ambiguity **sớm**, rẻ | Bắt lỗi hành vi thực tế |

> Static testing (review requirement trước khi code) là cách rẻ nhất để bắt lỗi — đừng bỏ qua.

---

## 3. Kỹ thuật thiết kế Test Case

Chia 3 nhóm: **Black-box** (dựa vào input/output, không cần biết code), **White-box** (dựa vào cấu trúc code), **Experience-based** (dựa vào kinh nghiệm).

### 3.1 Bảng chọn nhanh kỹ thuật

| Tình huống | Kỹ thuật nên dùng |
|------------|-------------------|
| Input chia thành nhiều nhóm giá trị | **Equivalence Partitioning (EP)** |
| Input có giới hạn min/max, độ dài | **Boundary Value Analysis (BVA)** |
| Nhiều điều kiện kết hợp → nhiều kết quả | **Decision Table** |
| Đối tượng có trạng thái, workflow chuyển đổi | **State Transition** |
| Nhiều tham số độc lập, tổ hợp bùng nổ | **Pairwise / Combinatorial** |
| Test theo kịch bản người dùng end-to-end | **Use Case Testing** |
| Muốn test coverage theo code | **Statement / Branch Coverage** (white-box) |
| Dựa vào kinh nghiệm bắt lỗi thường gặp | **Error Guessing** |
| Chưa rõ spec, muốn khám phá & học hệ thống | **Exploratory Testing** |

### 3.2 Equivalence Partitioning (EP)
Chia miền input thành các **nhóm tương đương** — giá trị trong cùng nhóm được xử lý giống nhau → chỉ cần test 1 đại diện mỗi nhóm.

*Ví dụ:* Ô "Tuổi" hợp lệ 18–60.
- Nhóm hợp lệ: `18–60` (test đại diện: `30`)
- Nhóm không hợp lệ dưới: `< 18` (test: `10`)
- Nhóm không hợp lệ trên: `> 60` (test: `70`)
- Nhóm sai kiểu: chữ, ký tự đặc biệt, rỗng

### 3.3 Boundary Value Analysis (BVA)
Lỗi hay nằm ở **ranh giới**. Với khoảng `min–max`, test: `min-1, min, min+1, ..., max-1, max, max+1`.

*Ví dụ:* Trường Name tối đa 255 ký tự → test `0, 1, 254, 255, 256` ký tự.

> EP + BVA thường đi cùng nhau: EP chọn nhóm, BVA soi biên của nhóm.

### 3.4 Decision Table (Bảng quyết định)
Dùng khi kết quả phụ thuộc **tổ hợp nhiều điều kiện**. Liệt kê mọi tổ hợp condition → action.

*Ví dụ:* Giảm giá theo (Thành viên VIP?) × (Đơn ≥ 1 triệu?).

| Rule | VIP | Đơn ≥ 1tr | Kết quả |
|------|-----|-----------|---------|
| R1 | Có | Có | Giảm 20% |
| R2 | Có | Không | Giảm 10% |
| R3 | Không | Có | Giảm 5% |
| R4 | Không | Không | Không giảm |

### 3.5 State Transition (Chuyển trạng thái)
Dùng cho đối tượng có **trạng thái & workflow**. Vẽ các state và sự kiện chuyển đổi, test cả chuyển đổi **hợp lệ** và **không hợp lệ**.

*Ví dụ:* Đơn hàng `Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành` (+ `Hủy`). Test: chuyển hợp lệ, và chuyển cấm (vd: `Hoàn thành → Đang giao`).

### 3.6 Pairwise / Combinatorial
Khi có nhiều tham số (vd: 4 tham số × 3 giá trị = 81 tổ hợp), test **mọi cặp giá trị (pairwise)** thay vì toàn bộ — giảm mạnh số case mà vẫn phủ phần lớn lỗi tương tác.

> Cần sinh ma trận tổ hợp thực tế → dùng `/generate-cross-module-test-plan` + `/generate-combinatorial-test-data`.

### 3.7 Use Case Testing
Thiết kế test theo **kịch bản người dùng thật** (actor → mục tiêu → các bước → luồng chính/phụ/ngoại lệ). Phù hợp test end-to-end nghiệp vụ.

### 3.8 White-box (tham khảo)
- **Statement Coverage:** mọi dòng lệnh được chạy ít nhất 1 lần.
- **Branch/Decision Coverage:** mọi nhánh true/false của điều kiện đều được test.
- Manual QA ít dùng trực tiếp, nhưng hiểu để phối hợp với dev và đánh giá độ phủ.

### 3.9 Experience-based
- **Error Guessing:** dựa kinh nghiệm đoán điểm dễ lỗi (rỗng, null, 0, số âm, ký tự đặc biệt, ngày 29/02, double-click...).
- **Checklist-based:** test theo checklist chuẩn (xem mục 6).
- **Exploratory:** xem mục 4.

---

## 4. Exploratory Testing — Kiểm thử khám phá

Test **song song việc học hệ thống, thiết kế và thực thi test** cùng lúc. Rất mạnh khi spec thiếu/mờ hoặc thời gian ngắn. Không phải "test bừa" — cần có cấu trúc.

### 4.1 Session-Based Test Management (SBTM)
- **Charter (điều lệ session):** mục tiêu rõ ràng cho 1 phiên, vd: *"Khám phá chức năng Upload avatar để tìm lỗi liên quan định dạng & dung lượng file, trong 60 phút."*
- **Time-box:** mỗi session 45–90 phút, tập trung.
- **Ghi chú (session notes):** ghi lại đã test gì, phát hiện gì, câu hỏi mới, bug tìm được.
- **Debrief:** tóm tắt kết quả, rủi ro còn lại, khu vực cần đào sâu.

### 4.2 Tours (các "tour" khám phá)
Cách tiếp cận có chủ đích để không bỏ sót:

| Tour | Trọng tâm |
|------|-----------|
| **Feature tour** | Đi qua toàn bộ tính năng để nắm tổng quan |
| **Data tour** | Tập trung vào input/dữ liệu (biên, đặc biệt, rỗng) |
| **Error tour** | Cố tình gây lỗi, xem hệ thống xử lý/thông báo |
| **Interruption tour** | Ngắt giữa chừng: refresh, back, mất mạng, đóng tab |
| **Money/Business tour** | Đi theo luồng nghiệp vụ quan trọng nhất (thanh toán, phân quyền) |

> Kết quả exploratory nên được **chuyển thành test case chính thức** (qua skill sinh TC) nếu là vùng rủi ro cao, để tái sử dụng cho regression.

---

## 5. Quy trình thực thi & Tiêu chí

### 5.1 Vòng đời một đợt test
```
Test Planning → Test Design → Test Execution → Reporting → Closure
```

### 5.2 Entry Criteria (điều kiện bắt đầu test)
- Requirement/spec đã chốt (đủ rõ để test)
- Môi trường test sẵn sàng, có test data
- Build đã deploy & smoke test pass
- Test case đã chuẩn bị & review

### 5.3 Exit Criteria (điều kiện dừng/kết thúc test)
- Đã thực thi ≥ X% test case theo kế hoạch
- Không còn bug **Critical/High** mở
- Độ phủ requirement đạt mục tiêu (traceability)
- Rủi ro còn lại được ghi nhận & chấp nhận bởi stakeholder

### 5.4 Trạng thái thực thi test case
`Pass · Fail · Blocked · Skipped · In Progress · Not Run` — luôn ghi rõ kết quả thực tế khi Fail để dev tái hiện.

---

## 6. Bug Reporting — Báo lỗi đúng chuẩn

Một bug report tốt giúp dev **tái hiện ngay** mà không cần hỏi lại.

### 6.1 Cấu trúc Bug Report

| Trường | Nội dung |
|--------|----------|
| **Title** | Ngắn, rõ: `[Màn hình] Hành động → Kết quả sai`. VD: *"[Đăng ký] Nhập email không có @ vẫn submit thành công"* |
| **Environment** | Trình duyệt/OS/thiết bị/phiên bản build, tài khoản test |
| **Pre-condition** | Trạng thái cần có trước khi thực hiện |
| **Steps to Reproduce** | Các bước đánh số, cụ thể, có test data thật |
| **Expected Result** | Kết quả đúng theo yêu cầu |
| **Actual Result** | Kết quả sai đang gặp |
| **Attachment** | Screenshot/video/log/console error |
| **Severity / Priority** | Xem 6.2 |

### 6.2 Severity vs Priority (dễ nhầm)

- **Severity (mức nghiêm trọng):** tác động **kỹ thuật** của lỗi tới hệ thống — do QA đánh giá.
- **Priority (độ ưu tiên):** mức độ **cần sửa sớm** theo góc nhìn nghiệp vụ — do PO/PM quyết.

| Tổ hợp | Ví dụ |
|--------|-------|
| **High Severity / High Priority** | App crash khi thanh toán |
| **High Severity / Low Priority** | Crash ở tính năng ẩn, hiếm ai dùng |
| **Low Severity / High Priority** | Sai chính tả tên công ty trên trang chủ / logo sai |
| **Low Severity / Low Priority** | Lệch 1px màu nút ở trang phụ |

Thang tham khảo: Severity = `Critical / Major / Minor / Trivial`; Priority = `Urgent / High / Medium / Low`.

### 6.3 Bug Lifecycle (vòng đời lỗi)
```
New → Assigned → Open (In Progress) → Fixed → Retest
   → Verified/Closed
   → Reopen (nếu chưa fix xong)
   → Rejected / Duplicate / Won't Fix / Cannot Reproduce
```

> Khi log bug: kiểm tra **trùng lặp** trước, đính kèm bằng chứng, và ghi **chính xác 1 bug/1 report** (không gộp nhiều lỗi).

---

## 7. Checklist chất lượng (Experience-based)

Dùng làm "lưới an toàn" khi test bất kỳ màn hình nào.

**UI / UX**
- Layout đúng trên các độ phân giải; không vỡ khi zoom/resize
- Label, placeholder, thông báo lỗi rõ ràng, đúng chính tả
- Trạng thái nút (disabled/loading), focus, tab order hợp lý
- Thông báo thành công/thất bại nhất quán

**Functional**
- Happy path + tất cả luồng rẽ nhánh/ngoại lệ
- Validation từng field (bắt buộc, min/max, định dạng)
- Phân quyền: user không được phép có làm được không?
- Nút Back/Refresh/Double-click submit/đóng tab giữa chừng

**Data**
- Data lưu đúng & hiển thị lại đúng (persist)
- Ký tự đặc biệt, Unicode/emoji, chuỗi rất dài
- Rỗng/null/0/số âm ở nơi không mong đợi
- Sắp xếp, lọc, phân trang với data lớn

**Compatibility**
- Chrome / Firefox / Safari / Edge
- Desktop / tablet / mobile; portrait/landscape

**Security cơ bản**
- XSS: `<script>alert(1)</script>` ở input text
- SQL injection: `' OR 1=1--`
- Truy cập URL/endpoint không đúng quyền
- Không lộ thông tin nhạy cảm trên URL/log/response

---

## Best Practices

- **Bắt đầu từ rủi ro:** ưu tiên test vùng quan trọng/tiền/bảo mật (Risk-Based).
- **Test data phải cụ thể**, không placeholder ("nhập `KH-2026-0012`", không phải "nhập mã hợp lệ").
- **1 test case kiểm 1 mục tiêu rõ ràng**; validation mỗi field tách riêng.
- **Kết hợp có kịch bản (test case) + không kịch bản (exploratory)** để phủ cả lỗi biết trước lẫn lỗi bất ngờ.
- **Re-test + Regression** sau mỗi fix.
- **Ghi lại bằng chứng** (screenshot/video) ngay khi thấy lỗi.

## Anti-Patterns (nên tránh)

- ❌ Chỉ test happy path, bỏ negative/boundary/exception
- ❌ Dùng chung 1 bộ validation cho mọi loại field (Email ≠ Phone ≠ Date ≠ Text)
- ❌ Test data mơ hồ, chung chung
- ❌ Nhầm Severity với Priority; gộp nhiều lỗi vào 1 bug report
- ❌ Bug report thiếu step tái hiện / thiếu môi trường / thiếu ảnh
- ❌ Exploratory "test bừa" không charter, không ghi chú
- ❌ Fix xong không regression vùng liên quan
- ❌ Lặp lại y hệt bộ test cũ mãi (pesticide paradox) mà không làm mới

---

## Liên kết với các skill khác trong bộ QA kit

| Nhu cầu | Skill dùng |
|---------|------------|
| Sinh bộ test case (nhanh / bài bản RBT) | `/rbt-manual-testing`, `/generate-manual-testcases-rbt`, `/generate-testcases-from-requirements` |
| Phân tích tài liệu yêu cầu | `/analyze-requirement-document`, `/requirements-analyzer` |
| Ma trận tổ hợp / pairwise thực tế | `/generate-cross-module-test-plan`, `/generate-combinatorial-test-data` |
| Sinh test data | `/generate-test-data`, `/test-data-generator` |
| Automation / API / locator | `/qa-automation-engineer`, `/generate-api-tests-from-swagger`, `/smart-locator-agent` |

> **Skill này là phần "biết CÁCH nghĩ"; các skill trên là phần "biết LÀM ra sản phẩm".** Dùng skill này để chọn đúng kỹ thuật & tiêu chuẩn, rồi chuyển sang skill sinh TC để tạo output.

## Output Format

Khi trả lời dựa trên skill này: giải thích bằng **Tiếng Việt**, ưu tiên **bảng + ví dụ cụ thể**, và luôn kèm **khi nào dùng / khi nào không**. Nếu người dùng cần tạo file test case thực tế, đề xuất chuyển sang skill sinh TC phù hợp.
