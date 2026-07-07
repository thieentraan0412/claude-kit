# CLAUDE.md — QA Testing Kit trên Claude Code

Repo này là bộ Kit kiểm thử QA (Manual + Automation) chạy trên **Claude Code**. Skills nằm ở `.claude/skills/` (Claude Code tự nhận diện), rules ở `.claude/rules/`, quy trình chuyên sâu ở `plans/` và prompt mẫu ở `prompt_templates/`.

> Chạy Claude ở **thư mục gốc repo**. Nhiều skill và plan tham chiếu đường dẫn cứng `.claude/...` và `plans/...` — sai cwd sẽ khiến các bước preload không đọc được file.

## Gọi skill trong Claude Code

- Claude Code tự nạp 26 skills trong `.claude/skills/<name>/SKILL.md` và tự chọn theo `description`.
- Gọi trực tiếp bằng `/skill-name` (dấu gạch chéo), ví dụ `/generate-manual-testcases-rbt`; hoặc mô tả mục tiêu bằng ngôn ngữ tự nhiên để Claude khớp `description`.
- Phần lớn skill có phụ thuộc bắt buộc kèm đường dẫn tường minh, ví dụ `/rbt-manual-testing (tại .claude/skills/rbt-manual-testing/SKILL.md)` — nếu `/` không resolve, cứ **Read thẳng** file đó.

## Công cụ browser (Playwright MCP)

Một số skill cần inspect DOM thật để thu thập locator / auto-heal. Các tool `browser_*` (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_resize`, `browser_take_screenshot`, `browser_wait_for`, `browser_evaluate`…) **chỉ chạy khi đã kết nối browser/Playwright MCP** → gọi qua `mcp__<server>__browser_*`. Claude **không có sẵn** các tool này; `WebFetch` **không thay thế được** (không render JS, không click/snapshot/điều hướng). Chưa kết nối browser MCP thì **không "đoán locator"** — dừng lại và báo user.

## Quy tắc QA bắt buộc (đọc khi cần)

Chỉ đọc rule liên quan trước khi implement/review automation (tại `.claude/rules/`):

- `.claude/rules/automation_rules.md` — quy ước automation + test data.
- `.claude/rules/locator_strategy.md` — thứ tự ưu tiên locator.
- `.claude/rules/playwright_rules.md` / `selenium_rules.md` / `appium_rules.md` — theo framework đang dùng.
- `.claude/rules/delivery_checklist.md` — Definition of Done, đọc trước khi hoàn tất bàn giao.

## Tài nguyên dùng chung — KHÔNG được xóa

Các skill trong `.claude/skills/` trỏ bằng đường dẫn cứng tới các tài nguyên sau. Giữ nguyên, nếu không các bước preload/tham chiếu sẽ hỏng:

- Toàn bộ `.claude/skills/` và `.claude/rules/`.
- `plans/manual/**/prompt.txt` (6 file, dùng trong FULL RBT) và `plans/automation/project_architecture/README.md`.
- `.claude/skills/qa-automation-engineer/references/` (`PROJECT_CONTEXT.md`, `TEST_STRATEGY.md`, `PROMPT_TEMPLATES.md` — điền theo từng dự án).

## Điều kiện môi trường theo tác vụ

- **Chạy được ngay (không cần thêm gì):** phân tích requirement, sinh test cases (manual / RBT / QUICK), scaffold framework, sinh API tests từ Swagger (mode SPEC), chuyển test cases đã có locator thành script, sinh test data tĩnh, phân tích flaky từ log/code.
- **Cần browser/Playwright MCP:** mọi skill inspect DOM thật / thu thập locator / auto-heal — `generate-application-test-plan`, `generate-automation-from-ui-flow`, `ui-debug-agent`, `locator-healer-agent`, `generate-locator`, `smart-locator-agent`, `generate-requirements-from-website`, `generate-cross-module-test-plan` (BROWSER mode), bước recon DOM của `generate-automation-from-testcases`. Chưa kết nối browser MCP thì **không "đoán locator"** — dừng lại và báo user.
- **Cần Python + pip:** `generate-cross-module-test-plan` (chiến lược Pairwise mặc định cần `allpairspy`); `analyze-flaky-tests` với `--count/--repeat-each` (cần `pytest-repeat`).
- **Cần Node/npm, JDK/Maven:** để chạy suite Playwright-TS / Selenium-TestNG / Appium tương ứng.
- **Jira/Xray** (`jira-integration`, `fetch-jira-requirements`, `import-test-results-xray`): cần bộ script Node `scripts/integrations/` + file `.env` (`JIRA_BASE_URL`, `JIRA_API_TOKEN`/`JIRA_PAT`, `XRAY_PLATFORM`, `XRAY_CLIENT_ID`/`XRAY_CLIENT_SECRET`). **Hiện chưa có trong repo** — phải bổ sung trước khi chạy 3 skill này.

## Quy ước làm việc

- Giao tiếp và báo cáo bằng **Tiếng Việt** (gần như mọi skill yêu cầu output tiếng Việt).
- **Bảo toàn trạng thái Git.** Không chạy `git pull` / `checkout` / `merge` / `rebase` / `reset` trừ khi user yêu cầu; chỉ inspect read-only.
- Ưu tiên locator semantic ổn định + smart waits; không thêm fixed sleep trừ khi user yêu cầu.
- Test data: unique, traceable, deterministic khi seed, không chứa thông tin cá nhân thật. **Không đọc `.env`** để lấy credential đăng nhập app — hỏi user hoặc dùng fixture.
- Các skill manual (`rbt-manual-testing`, `generate-manual-testcases-rbt`) có checkpoint **DỪNG chờ user** (Q&A, review scope) — phải dừng thật, không tự đoán để chạy một mạch.
- Validate code sinh ra bằng lệnh test/lint/compile hẹp nhất phù hợp với dự án đích.
- **Windows:** shell chính là PowerShell 5.1, **không hỗ trợ `&&`** (vd `cd scripts/integrations && npm install`) — chạy chuỗi POSIX qua Bash tool hoặc tách bằng `;`.
