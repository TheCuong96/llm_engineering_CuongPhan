---
name: python-standards
description: Tiêu chuẩn Python cho Python service/worker của repository này - bố cục project, typing, công cụ ruff/mypy, pattern FastAPI và Pydantic v2, quy tắc async, truy cập MongoDB (PyMongo/Beanie), xử lý lỗi, logging, background job, tích hợp với NestJS API, đóng gói bằng uv/poetry và kiểm thử pytest. Dùng skill này khi tạo hoặc sửa Python code, script, worker, xử lý dữ liệu/AI, FastAPI route, Pydantic model, hoặc khi người dùng nhắc Python, FastAPI, pytest, pip hay Python service, kể cả script nhỏ. Luôn kết hợp với backend-standards.
---

# Tiêu chuẩn Python

Kế thừa `backend-standards` (phân lớp, thiết kế API, MongoDB, bảo mật) và `project-standards` (quy trình, contract). File này nêu quy tắc riêng cho Python.

Đọc `pyproject.toml`, lockfile và `.python-version` trước. Làm theo công cụ repo chọn (uv / Poetry / pip-tools, FastAPI / Flask / Celery), không tự thêm lựa chọn khác. Hướng dẫn dưới đây giả định HTTP service dùng **FastAPI + Pydantic v2**; điều chỉnh idiom nếu repo dùng công nghệ khác.

## 1. Bố cục dự án và công cụ

```text
services/python/
  pyproject.toml  uv.lock | poetry.lock  .python-version
  src/<package>/
    main.py            # app factory / entrypoint
    api/ routers/      # transport: routes, request/response schemas, dependencies
    services/          # business logic
    repositories/      # MongoDB access
    models/ schemas/   # domain models, Pydantic schemas
    core/              # config, logging, errors, security
    workers/           # queue consumers / jobs
  tests/ unit/ integration/ conftest.py
```

- Dùng bố cục `src/` để test import package đã cài, không phải thư mục làm việc.
- **Một dependency manager, một lockfile và phải commit lockfile.** Pin phiên bản Python. Tách dependency runtime và dev.
- Công cụ (cấu hình trong `pyproject.toml`, chạy ở CI):
  - **Ruff** cho lint và format (thay flake8, isort, black).
  - **mypy** hoặc **pyright** ở chế độ khá nghiêm ngặt cho type check.
  - **pytest** (+ `pytest-asyncio` hoặc `anyio`, `pytest-cov`) cho test.
  - Hook **pre-commit** chạy ruff và type check.
- Không `pip install` tùy tiện vào môi trường dự án; thêm vào manifest và cập nhật lockfile.

## 2. Phong cách và cách viết Python

- Theo PEP 8 qua Ruff; không tranh cãi với formatter. Độ dài dòng theo config repo.
- Đặt tên: function/variable/module `snake_case`, class `PascalCase`, hằng số `UPPER_SNAKE`, tên bắt đầu `_` cho thành phần private.
- **Type hint cho mọi public function, method và class attribute.** Dùng cú pháp hiện đại (`list[str]`, `dict[str, int]`, `X | None`) phù hợp Python version của dự án. Tránh `Any`; ưu tiên `Protocol`, `TypedDict`, generics hoặc `object`.
- Ưu tiên `dataclass(slots=True)` hoặc Pydantic model thay cho dict lỏng lẻo để biểu diễn dữ liệu có cấu trúc.
- Dùng `pathlib.Path` thay cho string path; f-string thay `%`/`format`; `enum.Enum`/`StrEnum` cho tập giá trị cố định.
- Dùng context manager (`with`/`async with`) cho file, connection, lock và tài nguyên tạm.
- Comprehension/generator cho biến đổi đơn giản; dùng loop thường khi logic không tầm thường. Dùng generator/iterator với dữ liệu lớn để tránh nạp hết vào bộ nhớ.
- Không dùng mutable default argument (`def f(x=[])`); dùng `None` rồi khởi tạo bên trong.
- Không wildcard import. Ruff quản lý thứ tự import: stdlib, third-party, first-party.
- Không dùng bare `except:`; bắt exception cụ thể. Dùng `raise NewError(...) from err` để giữ nguyên nguyên nhân.
- Dùng `logging`, không dùng `print` trong application code.
- Viết docstring (Google hoặc NumPy style theo repo) cho module, class và function không hiển nhiên; giải thích *lý do* và contract (exception, side effect), không chép lại chữ ký hàm.

## 3. Cấu hình

- Dùng **`pydantic-settings`** (`BaseSettings`) để tải và validation environment variable một lần khi khởi động vào typed, immutable settings object. Dừng sớm với message nêu tên biến bị thiếu.
- Cache truy cập bằng hàm `get_settings()` (`functools.lru_cache`) và inject qua FastAPI dependency; không đọc `os.environ` rải rác trong code.
- Secret dùng `SecretStr` để không xuất hiện trong log hoặc repr.

## 4. Pattern FastAPI

- Dùng **App factory** `create_app()` để đăng ký router, middleware, exception handler và lifespan, giúp test dễ tạo app. Dùng context manager `lifespan` để tạo/đóng Mongo client và tài nguyên khác; không tạo connection cấp module.
- **Router** phải mỏng: khai báo request/response model có type, gọi service qua dependency injection, trả response model. Không có business logic hoặc database call trong route function.
- Dùng `Depends()` cho service, repository, settings và current user. Trong test, override dependency bằng `app.dependency_overrides`.
- Khai báo `response_model`, `status_code`, `tags`, `summary`, `responses` cho error code để OpenAPI chính xác và phía NestJS dùng được.
- Version route (`/v1/...`) thống nhất với platform.
- **Validation tất cả bằng Pydantic v2**: giới hạn field (`Field(min_length=1, max_length=200)`, `conint`, `EmailStr`, `Literal`, enum); đặt `model_config = ConfigDict(extra="forbid")` trên input model để từ chối field không biết.
- Tách model **input**, **domain/persistence** và **output**. Không trả database document; khởi tạo response model tường minh.
- Quy ước casing wire format: dùng `alias_generator=to_camel` với `populate_by_name=True` để JSON là `camelCase` trong khi Python dùng `snake_case` (khớp contract trong `project-standards`).
- Dùng API Pydantic v2 (`model_validate`, `model_dump`, `field_validator`, `model_validator`). Không trộn idiom v1 đã deprecated (`.dict()`, `@validator`, `class Config`) trừ khi repo còn dùng v1.
- Thêm middleware truyền request id (`x-request-id`) và access log.
- Xác thực service-to-service (shared secret / signed token qua dependency); không để endpoint nội bộ mở.

## 5. Async và concurrency

- Chọn một cách cho mỗi service: **async xuyên suốt** (FastAPI + async Mongo driver + `httpx.AsyncClient`) hoặc **sync xuyên suốt**. Không trộn tùy tiện.
- **Không bao giờ block event loop** trong `async def`: không `time.sleep`, `requests`, sync DB driver, vòng CPU nặng hoặc đọc file lớn. Dùng API async tương ứng, `await asyncio.to_thread(...)` cho tác vụ blocking hoặc process pool/worker cho tác vụ nặng CPU.
- Route function `def` thông thường chạy trong threadpool của FastAPI; chấp nhận được với thư viện sync nhưng cần lưu ý giới hạn pool.
- Chạy I/O độc lập đồng thời bằng `asyncio.gather` / `TaskGroup`, giới hạn bằng semaphore để tránh quá tải. Luôn await hoặc theo dõi task được tạo; không fire-and-forget nếu không xử lý lỗi.
- Đặt **timeout** cho mọi outbound call (`httpx.Timeout`) và xử lý cancellation đúng cách (không nuốt `asyncio.CancelledError`).
- Tái sử dụng một `httpx.AsyncClient` cho mỗi app (tạo trong lifespan), không tạo một client mỗi request.
- Tác vụ CPU/ML nặng thuộc worker process hoặc job queue, không nằm trong request handler.

## 6. Truy cập MongoDB

- Theo driver repo đang dùng. Với code mới, ưu tiên **async API gốc của PyMongo (`AsyncMongoClient`)**; thư viện **Motor** cũ đã bị MongoDB deprecated. Nếu repo dùng Beanie hoặc ODMantic, giữ nhất quán và xác minh driver tương thích trước khi nâng cấp.
- Tạo **một client cho mỗi process** trong lifespan và inject collection vào repository. Không kết nối ở module scope hoặc theo từng request.
- **Chỉ Repository truy cập database.** Service không thao tác collection trực tiếp. Repository nhận/trả typed model và chuyển `ObjectId` <-> `str` ở boundary.
- Luôn dùng filter có type, parameter hóa và tạo từ giá trị đã validation. Không truyền dict do user cung cấp làm filter (NoSQL injection); từ chối operator key.
- Dùng projection và limit; áp dụng pagination; bảo đảm query có index (`explain`). Tạo index bằng migration/startup script mà repo quy định, không tự ý tạo.
- Ưu tiên atomic operator (`update_one` với `$set`/`$inc`, `find_one_and_update`) thay read-modify-write. Chỉ dùng session/transaction khi cần và giữ ngắn.
- Lưu datetime UTC có timezone (`datetime.now(UTC)`); cấu hình client `tz_aware=True`. Không dùng datetime không timezone.
- **Collection dùng chung:** tuân thủ quy tắc owner trong `backend-standards`. Nếu Python ghi collection do NestJS sở hữu (hoặc ngược lại), dừng và hỏi; schema drift giữa các service là lỗi thường gặp nhất. Tên và kiểu field Python ghi phải khớp chính xác Mongoose schema NestJS (timestamp kiểu `Date`, id kiểu `ObjectId`, enum giống nhau).
- Xử lý tường minh `DuplicateKeyError` và `PyMongoError`, chuyển chúng thành domain error.

## 7. Xử lý lỗi

- Định nghĩa hierarchy domain exception nhỏ (`AppError` -> `NotFoundError`, `ConflictError`, `ValidationFailed`, `UpstreamError`) trong `core/errors.py`.
- Đăng ký **exception handler** chuyển chúng thành error shape chuẩn (`statusCode`, `error`, `message`, `details`, `requestId`). Chuyển Pydantic/FastAPI validation error về cùng cấu trúc với `details[{ field, issue }]`.
- Exception không mong đợi: log kèm stack trace và request id, trả `500` chung chung. Không làm lộ chi tiết nội bộ.
- Giữ block `try` cụ thể và nhỏ nhất có thể; xử lý exception có thể giải quyết, để exception khác lan truyền.
- Chỉ dùng `contextlib.suppress` cho exception thực sự có thể bỏ qua.

## 8. Logging và khả năng quan sát

- Cấu hình structured JSON logging một lần lúc khởi động (`structlog` hoặc `logging` với JSON formatter theo repo). Gồm service name, level, timestamp và `request_id` qua context variable (`contextvars`).
- Dùng `logger = logging.getLogger(__name__)`; truyền dữ liệu thành structured field hoặc `%s` argument thay vì tạo f-string sớm trong log call.
- Redact secret và dữ liệu cá nhân. Log exception bằng `logger.exception(...)` bên trong block `except`.
- Cung cấp `/health` và `/ready` (readiness có Mongo ping).

## 9. Worker, job và xử lý dữ liệu/AI

- Handler phải **idempotent**; chống message trùng bằng deduplication key hoặc upsert.
- Job nhận id/payload nhỏ rồi tải dữ liệu mới; ghi kết quả qua API của service sở hữu hoặc collection do mình sở hữu.
- Retry có giới hạn với exponential backoff và jitter; poison message vào dead-letter store kèm context.
- Tác vụ dài/nặng phải báo progress/status theo cách NestJS API có thể cung cấp.
- Tải model và tài nguyên lớn một lần lúc khởi động (lifespan/worker init), không tải theo từng request. Pin version model và thư viện; giữ xử lý deterministic nếu có thể (seed randomness).
- Stream hoặc batch dataset lớn; không nạp toàn bộ collection vào memory. Giới hạn memory và thời gian cho task.
- Validation và giới hạn kích thước mọi input từ user/file (type, size, content) trước xử lý; không `pickle.load`, `eval` hoặc `exec` dữ liệu không tin cậy. Dùng `yaml.safe_load`, gọi `subprocess` bằng danh sách argument (không `shell=True` với input user).

## 10. Chi tiết bảo mật

- Validation mọi input bằng Pydantic; từ chối field không xác định.
- Không `eval`/`exec`, không `shell=True` với input nội suy, không deserialize không an toàn (`pickle`, `yaml.load` không an toàn).
- Chỉ lưu secret trong environment/secret manager; không đặt trong source, notebook hoặc test fixture.
- Dùng `secrets` (không dùng `random`) để tạo token; dùng `hmac.compare_digest` khi so sánh secret.
- Audit dependency (`pip-audit` / audit của `uv` hoặc CI scanner); pin version trong lockfile.
- Hạn chế outbound request xuất phát từ input user (SSRF): allowlist host, chặn dải IP nội bộ.

## 11. Tích hợp với NestJS API

- OpenAPI schema của Python service là contract mà NestJS adapter dựa vào. Mọi thay đổi route, tên field, type, enum hoặc error shape là **contract change**: cập nhật NestJS client/DTO, test và tài liệu trong cùng change set.
- Response dùng JSON `camelCase` và error shape chuẩn; ngày là ISO 8601 UTC; id là string; tiền là integer ở đơn vị nhỏ nhất.
- Tôn trọng `x-request-id` đầu vào và truyền tiếp vào log/outbound call.
- Trả lời nhanh: tác vụ mất hơn vài giây nên nhận job (`202`) và xử lý bất đồng bộ.

## 12. Kiểm thử (pytest)

- Bố cục: `tests/unit` (logic thuần, service với fake), `tests/integration` (repository dùng MongoDB thật, API qua `TestClient`/`httpx.AsyncClient`).
- Dùng **fixture** (`conftest.py`) cho app, client, database và factory; giữ chúng nhỏ, dễ kết hợp. Dùng `pytest.mark.parametrize` cho các ca dạng bảng.
- Dùng **MongoDB thật** cho repository test qua Testcontainers hoặc instance test cục bộ, mỗi lần chạy test có database riêng và dọn sau đó. Không mock driver để test query. Tuyệt đối không trỏ test vào database dùng chung/production; config test phải từ chối URI không phải test.
- Override FastAPI dependency cho auth và external adapter; mock outbound HTTP bằng `respx` hoặc `pytest-httpx`.
- Kiểm soát thời gian và randomness (`freezegun`/`time-machine`, clock được inject, RNG có seed).
- Cấu hình async test nhất quán (`asyncio_mode = "auto"` hoặc mark tường minh).
- Kiểm thử luồng lỗi: validation error, duplicate key, upstream timeout, truy cập không được phép.
- Xem coverage là tín hiệu, không phải mục tiêu; logic quan trọng cần test có ý nghĩa, không chỉ chạy qua dòng code.

## 13. Lỗi thường gặp

- Lời gọi blocking trong `async def` (âm thầm đóng băng cả service khi tải cao).
- Tạo Mongo client hoặc HTTP client theo từng request.
- Datetime không timezone và lệch timezone so với dữ liệu NestJS ghi.
- Trả raw document (làm lộ `_id`/`ObjectId`, không serialize được JSON) thay vì response model.
- Để Python và NestJS cùng ghi một collection với cấu trúc khác nhau.
- Mutable default argument và shared module-level state giữa các request.
- Nuốt exception bằng `except Exception: pass`.
- Quên `extra="forbid"`, khiến typo trong payload bị bỏ qua âm thầm.
- Dependency không pin hoặc lock, dẫn tới build không thể tái lập.
- Chạy tác vụ ML/CPU nặng trong request path.

## 14. Checklist trước khi hoàn tất

- [ ] Type hint đầy đủ; `ruff check`, `ruff format --check` và type checker đều qua
- [ ] Router mỏng, service không phụ thuộc HTTP/DB, repository sở hữu mọi truy cập Mongo
- [ ] Input model từ chối field lạ; output dùng response model với `camelCase`
- [ ] Không có blocking call trong async code; mọi outbound call đều có timeout
- [ ] Datetime có timezone UTC; id/enum/tiền khớp shared contract
- [ ] Error theo cấu trúc chuẩn; log có cấu trúc với request id và không có secret
- [ ] Contract change đã cập nhật sang NestJS; test (unit + integration, gồm luồng lỗi) đều qua
