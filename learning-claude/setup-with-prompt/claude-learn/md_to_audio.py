"""Chuyển file Markdown tiếng Việt thành file MP3 bằng giọng neural của Edge (edge-tts).

Cách dùng:
    python md_to_audio.py                      # chuyển mọi file .md trong ver3/
    python md_to_audio.py ver3/abc.md          # chỉ chuyển một file
    python md_to_audio.py --rate +15%          # đọc nhanh hơn
    python md_to_audio.py --text-only          # chỉ xuất văn bản đã làm sạch để kiểm tra
"""

import argparse
import asyncio
import re
import sys
from pathlib import Path

import edge_tts

HERE = Path(__file__).parent
DEFAULT_INPUT = HERE / "ver3"
DEFAULT_VOICE = "vi-VN-HoaiMyNeural"
SHORT_CODE_LINES = 2  # code block có tối đa bấy nhiêu dòng thì đọc nguyên văn


def handle_code_block(lang: str, lines: list[str]) -> str:
    """Quyết định đọc gì khi gặp một code block ```lang ... ```.

    lang: ngôn ngữ ghi sau ``` (có thể rỗng), lines: các dòng bên trong block.
    Trả về câu sẽ được đọc (chuỗi rỗng = bỏ qua hoàn toàn).
    """
    code = [l.strip() for l in lines if l.strip()]
    if not code:
        return ""
    if lang == "mermaid":
        return "Có một sơ đồ, xem trong tài liệu"
    kind = f"mã {lang}" if lang and lang not in ("text", "txt", "plain") else "văn bản mẫu"
    if len(code) <= SHORT_CODE_LINES:  # lệnh ngắn như `uv run main.py`: đọc luôn
        return f"Đoạn {kind}: " + "; ".join(clean_inline(l) for l in code)
    return f"Có một đoạn {kind} dài {len(code)} dòng, xem trong tài liệu"


def clean_inline(text: str) -> str:
    """Bỏ ký hiệu markdown trong một dòng, giữ lại chữ cần đọc."""
    text = re.sub(r"<[^>]+>", "", text)                       # thẻ HTML như <a id=...></a>
    text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", "", text)          # ảnh
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)        # [chữ](link) -> chữ
    text = re.sub(r"https?://\S+", "", text)                    # link trần
    text = re.sub(r"`([^`]*)`", r"\1", text)                    # `code` -> code
    text = re.sub(r"(\*\*|__)(.+?)\1", r"\2", text)             # **đậm**
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"\1", text)  # *nghiêng*
    text = text.replace("→", ", ").replace("·", ", ").replace("—", ", ")
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return re.sub(r"\s{2,}", " ", text).strip()


def end_sentence(text: str) -> str:
    """Thêm dấu chấm để giọng đọc ngắt nghỉ giữa các dòng."""
    return text if not text or text[-1] in ".!?:;…" else text + "."


def table_to_speech(rows: list[str]) -> list[str]:
    """Đọc bảng theo từng hàng: 'Cột A: giá trị; Cột B: giá trị.'"""
    cells = [[clean_inline(c) for c in r.strip().strip("|").split("|")] for r in rows]
    cells = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
    if not cells:
        return []
    header, body = cells[0], cells[1:]
    out = []
    for row in body:
        parts = [f"{h}: {v}" if h else v for h, v in zip(header, row) if v]
        out.append(end_sentence("; ".join(parts)))
    return out


def markdown_to_speech(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        fence = re.match(r"^(```|~~~)\s*([\w+-]*)", stripped)
        if fence:
            marker, lang = fence.group(1), fence.group(2)
            body = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith(marker):
                body.append(lines[i])
                i += 1
            i += 1  # bỏ dòng đóng ```
            spoken = handle_code_block(lang, body)
            if spoken:
                out.append(end_sentence(spoken))
            continue

        if stripped.startswith("|"):
            table = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table.append(lines[i])
                i += 1
            out.extend(table_to_speech(table))
            continue

        i += 1
        if not stripped or re.fullmatch(r"[-*_]{3,}", stripped):
            continue

        heading = re.match(r"^#{1,6}\s+(.*)", stripped)
        if heading:
            out.append("")  # dòng trống = ngắt nghỉ dài hơn trước tiêu đề
            out.append(end_sentence(clean_inline(heading.group(1))))
            continue

        stripped = re.sub(r"^>\s?", "", stripped)            # trích dẫn
        stripped = re.sub(r"^[-*+]\s+(\[[ xX]\]\s+)?", "", stripped)  # gạch đầu dòng, checkbox
        text = clean_inline(stripped)
        if text:
            out.append(end_sentence(text))

    return "\n".join(out)


async def convert(md_path: Path, out_dir: Path, voice: str, rate: str, text_only: bool) -> None:
    speech = markdown_to_speech(md_path.read_text(encoding="utf-8"))
    out_dir.mkdir(exist_ok=True)

    txt_path = out_dir / f"{md_path.stem}.txt"
    txt_path.write_text(speech, encoding="utf-8")
    if text_only:
        print(f"  văn bản -> {txt_path.name} ({len(speech):,} ký tự)")
        return

    mp3_path = out_dir / f"{md_path.stem}.mp3"
    print(f"  đang tạo {mp3_path.name} ({len(speech):,} ký tự)...", flush=True)
    await edge_tts.Communicate(speech, voice, rate=rate).save(str(mp3_path))
    print(f"  xong -> {mp3_path}")


async def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # console Windows mặc định cp1252, không in được tiếng Việt
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("paths", nargs="*", type=Path, help="file .md hoặc thư mục (mặc định: ver3/)")
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--rate", default="+0%", help="tốc độ đọc, ví dụ +15%% hoặc -10%%")
    parser.add_argument("--out", type=Path, help="thư mục xuất (mặc định: <thư mục nguồn>/audio)")
    parser.add_argument("--text-only", action="store_true", help="chỉ xuất .txt đã làm sạch, không tạo mp3")
    args = parser.parse_args()

    files: list[Path] = []
    for p in args.paths or [DEFAULT_INPUT]:
        files.extend(sorted(p.glob("*.md")) if p.is_dir() else [p])
    if not files:
        sys.exit("Không tìm thấy file .md nào.")

    # Chạy tuần tự để tránh bị dịch vụ TTS giới hạn tần suất.
    for f in files:
        print(f"[{files.index(f) + 1}/{len(files)}] {f.name}")
        await convert(f, args.out or f.parent / "audio", args.voice, args.rate, args.text_only)


if __name__ == "__main__":
    asyncio.run(main())
