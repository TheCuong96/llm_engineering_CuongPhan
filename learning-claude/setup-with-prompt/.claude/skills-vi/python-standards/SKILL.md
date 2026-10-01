---
name: python-standards
description: Python standards for this repository's Python service/worker - project layout, typing, ruff/mypy tooling, FastAPI and Pydantic v2 patterns, async rules, MongoDB access (PyMongo/Beanie), error handling, logging, background jobs, integration with the NestJS API, packaging with uv/poetry, and pytest testing. Use this skill whenever creating or modifying Python code, scripts, workers, data/AI processing, FastAPI routes, Pydantic models, or when the user mentions Python, FastAPI, pytest, pip, or the Python service, even for small scripts. Always combine with backend-standards.
---

<!-- BẢN TIẾNG VIỆT. Phần description giữ tiếng Anh để Claude kích hoạt skill chính xác. Chỉ dùng MỘT bản (Anh hoặc Việt) cho mỗi skill, không cài cả hai. -->

# Chuẩn Python

Xây trên `backend-standards` (phân lớp, thiết kế API, MongoDB, bảo mật) và `project-standards` (quy trình, contract). File này nói về thực hành đặc thù của Python.

Đọc `pyproject.toml`, lockfile và `.python-version` trước. Theo lựa chọn công cụ của repo (uv / Poetry / pip-tools, FastAPI / Flask / Celery) thay vì đưa vào cái khác. Hướng dẫn dưới đây giả định **FastAPI + Pydantic v2** cho service HTTP; hãy điều chỉnh nếu repo dùng thứ khác.

## 1. Cấu trúc dự án và công cụ

```
services/python/
  pyproject.toml  uv.lock | poetry.lock  .python-version
  src/<package>/
    main.py            # app factory / điểm vào
    api/ routers/      # transport: route, schema request/response, dependency
    services/          # logic nghiệp vụ
    repositories/      # truy cập MongoDB
    models/ schemas/   # model nghiệp vụ, schema Pydantic
    core/              # config, logging, lỗi, bảo mật
    workers/           # consumer của queue / job
  tests/ unit/ integration/ conftest.py
```

- Dùng cấu trúc `src/` để test import package đã cài, không phải thư mục làm việc.
- **Một trình quản lý dependency, một lockfile, được commit.** Ghim phiên bản Python. Tách dependency runtime và dev.
- Công cụ (cấu hình trong `pyproject.toml`, chạy ở CI):
  - **Ruff** cho lint và format (thay flake8, isort, black).
  - **mypy** hoặc **pyright** ở chế độ gần strict để kiểm tra kiểu.
  - **pytest** (+ `pytest-asyncio` hoặc `anyio`, `pytest-cov`) cho test.
  - **pre-commit** hook chạy ruff và kiểm tra kiểu.
- Không bao giờ `pip install` tuỳ tiện vào môi trường dự án; thêm vào manifest rồi lock lại.

## 2. Phong cách và thực hành ngôn ngữ

- Theo PEP 8 qua Ruff; đừng tranh cãi với formatter. Độ dài dòng theo cấu hình repo.
- Đặt tên: hàm/biến/module `snake_case`, class `PascalCase`, hằng số `UPPER_SNAKE`, `_đầu_gạch` cho private.
- **Type hint cho mọi hàm, method và thuộc tính class công khai.** Dùng cú pháp hiện đại (`list[str]`, `dict[str, int]`, `X | None`) theo phiên bản Python của dự án. Tránh `Any`; ưu tiên `Protocol`, `TypedDict`, generic, hoặc `object`.
- Ưu tiên `dataclass(slots=True)` hoặc model Pydantic hơn dict lỏng lẻo cho dữ liệu có cấu trúc.
- Dùng `pathlib.Path` thay cho chuỗi đường dẫn; f-string thay cho `%`/`format`; `enum.Enum`/`StrEnum` cho tập giá trị cố định.
- Dùng context manager (`with`/`async with`) cho file, kết nối, lock và tài nguyên tạm.
- Comprehension và generator cho biến đổi đơn giản; vòng lặp thường khi logic không tầm thường. Dùng generator/iterator cho dữ liệu lớn để khỏi nạp hết vào bộ nhớ.
- Không dùng tham số mặc định thay đổi được (`def f(x=[])`); dùng `None` và tạo bên trong.
- Không import dấu `*`. Thứ tự import do Ruff lo: stdlib, bên thứ ba, nội bộ.
- Không dùng `except:` trần; bắt exception cụ thể. Dùng `raise NewError(...) from err` để giữ nguyên nhân.
- Dùng `logging`, không dùng `print`, trong code ứng dụng.
- Docstring (kiểu Google hoặc NumPy theo repo) cho module, class công khai và hàm không hiển nhiên; giải thích *vì sao* và hợp đồng (raises, side effect), không nhắc lại chữ ký.

## 3. Cấu hình

- Dùng **`pydantic-settings`** (`BaseSettings`) để nạp và validate biến môi trường một lần lúc khởi động thành đối tượng settings có kiểu, bất biến. Fail nhanh với thông báo nêu đúng tên biến bị thiếu.
- Cache việc truy cập bằng hàm `get_settings()` (`functools.lru_cache`) và inject bằng dependency của FastAPI; không đọc `os.environ` khắp nơi.
- Bí mật dùng `SecretStr` để không lộ trong log hay repr.

## 4. Mẫu FastAPI

- **App factory** `create_app()` đăng ký router, middleware, exception handler và lifespan (khởi động/tắt) để test dựng app gọn. Dùng context manager `lifespan` để tạo và đóng Mongo client cùng tài nguyên khác; không kết nối ở cấp module.
- **Router** mỏng: khai báo model request/response có kiểu, gọi service qua dependency injection, trả response model. Không logic nghiệp vụ hay gọi database trong hàm route.
- Dùng `Depends()` cho service, repository, settings và người dùng hiện tại. Override dependency trong test (`app.dependency_overrides`).
- Khai báo `response_model`, `status_code`, `tags`, `summary` và `responses` cho các mã lỗi để OpenAPI chính xác và phía NestJS dùng được.
- Đánh phiên bản route (`/v1/...`) nhất quán với nền tảng.
- **Validate mọi thứ bằng Pydantic v2**: ràng buộc field (`Field(min_length=1, max_length=200)`, `conint`, `EmailStr`, `Literal`, enum); đặt `model_config = ConfigDict(extra="forbid")` trên model input để từ chối field lạ.
- Tách **input**, **domain/lưu trữ** và **output**. Không trả document database; dựng response model tường minh.
- Kiểu chữ trên đường truyền: dùng `alias_generator=to_camel` với `populate_by_name=True` để JSON là `camelCase` còn Python vẫn là `snake_case` (khớp contract trong `project-standards`).
- Dùng API Pydantic v2 (`model_validate`, `model_dump`, `field_validator`, `model_validator`). Không trộn idiom v1 đã deprecated (`.dict()`, `@validator`, `class Config`) trừ khi repo ở v1.
- Thêm middleware truyền request-id (`x-request-id`) và access log.
- Xác thực lệnh gọi giữa các service (secret chung / token ký qua dependency); đừng để endpoint nội bộ mở.

## 5. Async và đồng thời

- Chọn theo từng service: **async từ đầu đến cuối** (FastAPI + driver Mongo async + `httpx.AsyncClient`) hoặc **sync từ đầu đến cuối**. Đừng trộn bừa.
- **Không bao giờ chặn event loop** trong `async def`: không `time.sleep`, `requests`, driver DB đồng bộ, vòng lặp CPU nặng, hay đọc file lớn. Dùng bản async tương đương, `await asyncio.to_thread(...)` cho lệnh blocking, hoặc process pool/worker cho việc nặng CPU.
- Hàm route `def` thường chạy trong threadpool của FastAPI; chấp nhận được cho thư viện đồng bộ, nhưng nhớ tới kích thước pool.
- Chạy song song I/O độc lập bằng `asyncio.gather` / `TaskGroup`, giới hạn bằng semaphore để tránh quá tải. Luôn await hoặc theo dõi task đã tạo; không fire-and-forget mà không xử lý lỗi.
- Đặt **timeout** cho mọi lệnh gọi ra ngoài (`httpx.Timeout`) và xử lý huỷ đúng cách (không nuốt `asyncio.CancelledError`).
- Tái sử dụng một `httpx.AsyncClient` cho cả app (tạo trong lifespan), không tạo mới mỗi request.
- Việc nặng CPU/ML thuộc về process worker hoặc job queue, không nằm trong handler request.

## 6. Truy cập MongoDB

- Theo driver repo đang dùng. Với code mới, ưu tiên **API async gốc của PyMongo (`AsyncMongoClient`)**; thư viện **Motor** cũ đã bị MongoDB deprecate. Nếu repo dùng Beanie hoặc ODMantic, giữ nhất quán và kiểm tra tương thích driver trước khi nâng cấp.
- Tạo **một client cho mỗi process** trong lifespan và inject collection vào repository. Không bao giờ kết nối ở cấp module hay theo từng request.
- **Chỉ qua repository.** Service không đụng trực tiếp collection. Repository nhận và trả model có kiểu, chuyển `ObjectId` <-> `str` ở biên.
- Luôn dùng filter có kiểu, tham số hoá, dựng từ giá trị đã validate. Không bao giờ truyền dict do người dùng cung cấp làm filter (NoSQL injection); từ chối key toán tử.
- Dùng projection và limit; áp phân trang; đảm bảo truy vấn có index (`explain`). Tạo index qua migration/script khởi động của repo, không tuỳ tiện.
- Dùng toán tử nguyên tử (`update_one` với `$set`/`$inc`, `find_one_and_update`) thay vì đọc-sửa-ghi. Chỉ dùng session/transaction khi cần và giữ ngắn.
- Lưu datetime UTC có múi giờ (`datetime.now(UTC)`); cấu hình client với `tz_aware=True`. Không bao giờ dùng datetime naive.
- **Collection dùng chung:** theo quy tắc chủ sở hữu trong `backend-standards`. Nếu Python ghi vào collection do NestJS sở hữu (hoặc ngược lại), hãy dừng và hỏi; lệch schema giữa các service là lỗi hay gặp nhất ở đây. Tên field và kiểu do Python ghi phải khớp chính xác schema Mongoose của NestJS (timestamp là `Date`, id là `ObjectId`, cùng enum).
- Xử lý tường minh `DuplicateKeyError` và `PyMongoError` rồi dịch sang lỗi nghiệp vụ.

## 7. Xử lý lỗi

- Định nghĩa một hệ phân cấp nhỏ các exception nghiệp vụ (`AppError` -> `NotFoundError`, `ConflictError`, `ValidationFailed`, `UpstreamError`) trong `core/errors.py`.
- Đăng ký **exception handler** chuyển chúng sang cấu trúc lỗi chuẩn (`statusCode`, `error`, `message`, `details`, `requestId`). Chuyển lỗi validation của Pydantic/FastAPI sang cùng cấu trúc với `details[{ field, issue }]`.
- Exception bất ngờ: log kèm stack trace và request id, trả `500` chung chung. Không bao giờ lộ nội bộ.
- Cụ thể trong khối `try`: bọc câu lệnh nhỏ nhất có thể, xử lý exception bạn hành động được, để phần còn lại lan ra.
- Chỉ dùng `contextlib.suppress` cho exception thật sự bỏ qua được.

## 8. Logging và observability

- Cấu hình logging JSON có cấu trúc một lần lúc khởi động (`structlog` hoặc `logging` với JSON formatter, theo repo). Gồm tên service, level, timestamp và `request_id` qua context variable (`contextvars`).
- Dùng `logger = logging.getLogger(__name__)`; truyền dữ liệu dưới dạng field có cấu trúc hoặc tham số `%s` thay vì dựng f-string sớm trong lệnh log.
- Che bí mật và dữ liệu cá nhân. Log exception bằng `logger.exception(...)` bên trong khối `except`.
- Cung cấp endpoint `/health` và `/ready` (ping Mongo ở readiness).

## 9. Worker, job và xử lý dữ liệu/AI

- Handler **idempotent**; chống trùng lặp message bằng khoá khử trùng hoặc upsert.
- Job nhận id/payload nhỏ và tải dữ liệu mới; kết quả được ghi lại qua API của service sở hữu hoặc collection mình sở hữu.
- Retry có giới hạn với exponential backoff và jitter; message độc đi vào kho dead-letter kèm ngữ cảnh.
- Việc chạy lâu hoặc nặng báo cáo tiến độ/trạng thái theo cách API NestJS phơi ra được.
- Nạp model và tài nguyên lớn một lần lúc khởi động (lifespan/khởi tạo worker), không theo từng request. Ghim phiên bản model và thư viện; làm cho xử lý tất định khi có thể (seed ngẫu nhiên).
- Stream hoặc chia lô dữ liệu lớn; không nạp cả collection vào bộ nhớ. Đặt giới hạn bộ nhớ và thời gian cho task.
- Validate và giới hạn kích thước mọi thứ từ người dùng hoặc file (loại, kích thước, nội dung) trước khi xử lý; không bao giờ `pickle.load`, `eval`, hay `exec` dữ liệu không tin cậy. Dùng `yaml.safe_load`, `subprocess` với danh sách tham số (không bao giờ `shell=True` với input người dùng).

## 10. Bảo mật đặc thù

- Validate mọi input bằng Pydantic; từ chối field lạ.
- Không `eval`/`exec`, không `shell=True` với input được nội suy, không giải tuần tự hoá không an toàn (`pickle`, `yaml.load` không an toàn).
- Bí mật chỉ nằm trong môi trường/secret manager; không bao giờ trong mã nguồn, notebook hay fixture test.
- Dùng `secrets` (không phải `random`) cho token; `hmac.compare_digest` để so sánh bí mật.
- Giữ dependency được audit (`pip-audit` / audit của `uv` / công cụ quét ở CI); ghim phiên bản qua lockfile.
- Hạn chế request ra ngoài sinh từ input người dùng (SSRF): allowlist host, chặn dải mạng nội bộ.

## 11. Tích hợp với API NestJS

- Schema OpenAPI của service Python là contract mà adapter phía NestJS được viết theo. Mọi thay đổi route, tên field, kiểu, enum hay cấu trúc lỗi đều là **thay đổi contract**: cập nhật client/DTO NestJS, test và tài liệu trong cùng một lần thay đổi.
- Response dùng JSON `camelCase` và cấu trúc lỗi chuẩn; ngày là ISO 8601 UTC; id là chuỗi; tiền là số nguyên đơn vị nhỏ nhất.
- Tôn trọng `x-request-id` ở đầu vào và truyền/echo nó vào log và các lệnh gọi ra.
- Phản hồi nhanh: với thao tác quá vài giây, nhận job (`202`) và xử lý bất đồng bộ.

## 12. Kiểm thử (pytest)

- Bố cục: `tests/unit` (logic thuần, service với đồ giả), `tests/integration` (repository trên MongoDB thật, API qua `TestClient`/`httpx.AsyncClient`).
- Dùng **fixture** (`conftest.py`) cho app, client, database và factory; giữ chúng nhỏ và ghép được. Dùng `pytest.mark.parametrize` cho ca theo bảng.
- **MongoDB thật** cho test repository qua Testcontainers hoặc một instance test local, với database riêng cho mỗi lần chạy và dọn giữa các test. Không mock driver cho test truy vấn. Không bao giờ trỏ test vào DB dùng chung hay production; cấu hình test phải từ chối URI không phải test.
- Override dependency của FastAPI cho auth và adapter ngoài; mock HTTP gọi ra bằng `respx` hoặc `pytest-httpx`.
- Kiểm soát thời gian và ngẫu nhiên (`freezegun`/`time-machine`, đồng hồ được inject, RNG có seed).
- Cấu hình test async nhất quán (`asyncio_mode = "auto"` hoặc đánh dấu tường minh).
- Test đường lỗi: lỗi validation, khoá trùng, upstream timeout, truy cập trái phép.
- Coverage là tín hiệu, không phải mục tiêu; logic quan trọng cần test có ý nghĩa, không chỉ chạy qua dòng code.

## 13. Lỗi thường gặp

- Lệnh blocking trong `async def` (âm thầm làm đứng cả service khi tải cao).
- Tạo Mongo client hay HTTP client cho mỗi request.
- Datetime naive và lệch múi giờ so với dữ liệu NestJS ghi.
- Trả document thô (lộ `_id`/`ObjectId`, vốn không serialize được thành JSON) thay vì response model.
- Để Python và NestJS cùng ghi một collection với hình dạng khác nhau.
- Tham số mặc định thay đổi được và state cấp module dùng chung giữa các request.
- Nuốt exception bằng `except Exception: pass` rộng.
- Quên `extra="forbid"` nên lỗi gõ sai trong payload bị bỏ qua âm thầm.
- Dependency không ghim hoặc không lock dẫn tới build không tái lập được.
- Việc nặng ML/CPU chạy trong đường request.

## 14. Checklist trước khi hoàn thành

- [ ] Type hint đầy đủ; `ruff check`, `ruff format --check` và trình kiểm tra kiểu đều qua
- [ ] Router mỏng, service không có chi tiết HTTP/DB, repository sở hữu mọi truy cập Mongo
- [ ] Model input từ chối field lạ; output dùng response model `camelCase`
- [ ] Không có lệnh blocking trong code async; có timeout ở mọi lệnh gọi ra ngoài
- [ ] Datetime có múi giờ UTC; id/enum/tiền khớp contract dùng chung
- [ ] Lỗi dùng cấu trúc chuẩn; log có cấu trúc kèm request id và không bí mật
- [ ] Thay đổi contract đã lan sang NestJS; test (unit + integration, gồm đường lỗi) đều qua
