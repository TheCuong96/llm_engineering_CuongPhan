// NestJS checks mirroring skill nestjs-standards. / Kiểm tra NestJS, phản chiếu skill nestjs-standards.
import { hits, fileHit, t } from '../lib.mjs';

export default function check(ctx) {
  if (ctx.lang !== 'js') return [];
  const { rel, base, content } = ctx;
  const isRepo = /\.repository\.ts$/.test(base);
  const isController = /\.controller\.ts$/.test(base);
  const isService = /\.service\.ts$/.test(base);
  const isDto = /\.dto\.ts$/.test(base);
  const isSchema = /\.schema\.ts$/.test(base);
  const out = [];

  if (!isRepo && !ctx.isTest)
    out.push(
      ...hits(ctx, /@InjectModel\(/, {
        en: '[model-outside-repository] Only *.repository.ts may inject Mongoose models. Inject the repository into the service instead (nestjs-standards §6).',
        vi: '[model-outside-repository] Chỉ *.repository.ts được inject Mongoose model. Hãy inject repository vào service (nestjs-standards §6).',
      }),
    );
  if (isController)
    out.push(
      ...hits(ctx, /from\s+['"](mongoose|@nestjs\/mongoose)['"]/, {
        en: '[fat-controller] Controllers must not touch the database layer. Call a service method (nestjs-standards §3).',
        vi: '[fat-controller] Controller không được đụng tới tầng dữ liệu. Hãy gọi một method của service (nestjs-standards §3).',
      }),
    );
  if (isService)
    out.push(
      ...hits(ctx, /@(Req|Res)\(|from\s+['"]express['"]/, {
        en: '[http-in-service] Services must not know about HTTP (Request/Response). Pass the needed values as arguments (nestjs-standards §5).',
        vi: '[http-in-service] Service không được biết về HTTP (Request/Response). Hãy truyền giá trị cần thiết qua tham số (nestjs-standards §5).',
      }),
    );
  out.push(
    ...hits(ctx, /@(Body|Query)\([^)]*\)\s*\w+\??\s*:\s*(any\b|\{|Record<|object\b)/, {
      en: '[untyped-input] Request input must be a validated DTO class, not any/inline object/Record (nestjs-standards §4).',
      vi: '[untyped-input] Input của request phải là DTO class đã validate, không phải any/object inline/Record (nestjs-standards §4).',
    }),
    ...hits(ctx, /\bconsole\.(log|error|warn|debug|info)\(/, {
      en: '[use-logger] Use the Nest Logger (structured, with request id) instead of console (nestjs-standards §10).',
      vi: '[use-logger] Dùng Logger của Nest (có cấu trúc, kèm request id) thay cho console (nestjs-standards §10).',
    }, { skipTests: true }),
    ...hits(ctx, /\bforwardRef\(/, {
      en: '[circular-dep] forwardRef usually hides a circular dependency. Prefer extracting a third module or using events (nestjs-standards §15).',
      vi: '[circular-dep] forwardRef thường che giấu phụ thuộc vòng. Ưu tiên tách module thứ ba hoặc dùng event (nestjs-standards §15).',
    }),
  );
  if (!/(^|\/)(config|common\/config)\//.test(rel) && !/(main|app\.module)\.ts$|\.config\.ts$/.test(rel) && !ctx.isTest)
    out.push(
      ...hits(ctx, /process\.env\b/, {
        en: '[use-config] Do not read process.env in feature code. Inject ConfigService / typed config (nestjs-standards §7).',
        vi: '[use-config] Không đọc process.env trong code tính năng. Inject ConfigService / cấu hình có kiểu (nestjs-standards §7).',
      }),
    );
  if (isDto) {
    ctx.lines.forEach((line, i) => {
      if (!/^\s{2}(readonly\s+)?\w+[!?]?\s*:\s*[^=;]+;\s*$/.test(line)) return;
      if (line.includes('hook-ignore') || (i > 0 && ctx.lines[i - 1].includes('hook-ignore-next-line'))) return;
      let j = i - 1;
      while (j >= 0 && ctx.lines[j].trim() === '') j--;
      const prev = j >= 0 ? ctx.lines[j].trim() : '';
      if (/[;{]$/.test(prev) && !/^(\/\/|\*|\/\*)/.test(prev))
        out.push({
          line: i + 1,
          msg: t({
            en: '[dto-decorator] DTO property has no validation/Swagger decorator (class-validator, @ApiProperty) (nestjs-standards §4).',
            vi: '[dto-decorator] Thuộc tính DTO thiếu decorator validation/Swagger (class-validator, @ApiProperty) (nestjs-standards §4).',
          }),
        });
    });
  }
  if (isSchema) {
    out.push(
      ...fileHit(/@Schema\(/.test(content) && !/timestamps/.test(content), {
        en: '[schema-timestamps] Add `timestamps: true` to @Schema (createdAt/updatedAt) (nestjs-standards §6).',
        vi: '[schema-timestamps] Thêm `timestamps: true` vào @Schema (createdAt/updatedAt) (nestjs-standards §6).',
      }),
      ...fileHit(/\bpassword(Hash)?\s*[!?]?\s*:/i.test(content) && !/select:\s*false/.test(content), {
        en: '[schema-password] Password fields must be `select: false` so they never leak into queries/responses (nestjs-standards §6).',
        vi: '[schema-password] Trường mật khẩu phải có `select: false` để không lộ qua query/response (nestjs-standards §6).',
      }),
    );
  }
  return out;
}
