# 01. Ôn nhanh: gọi LLM và prompt cơ bản

## Ý chính cần nhớ

- Bài gốc nhận một URL, trích text website, đóng gói text vào `messages`, gọi LLM và render summary bằng Markdown.
- `OpenAI()` là client gọi HTTP endpoint, không phải model GPT chạy trên máy bạn.
- `system` định hướng nhiệm vụ/giọng điệu; `user` mang yêu cầu và dữ liệu cụ thể.
- Gọi API trong bài là **inference**. Không có training hay thay đổi parameters của model.
- Một summary nghe tốt chưa đủ: cần kiểm tra nó có trung thực, đủ ý, đúng định dạng và đáng chi phí hay không.

## Thuật ngữ quan trọng

| Thuật ngữ | Ghi nhớ ngắn |
| --- | --- |
| API endpoint | Địa chỉ nhận request và trả response |
| Client library | Lớp bọc giúp Python gọi HTTP dễ hơn |
| `messages` | `list` các `dict` có `role` và `content` |
| System prompt | Hướng dẫn cách model nên xử lý request |
| User prompt | Yêu cầu/dữ liệu cụ thể đưa vào model |
| Inference | Dùng model đã có để tạo output |
| Training | Cập nhật trọng số model từ dữ liệu |
| Evaluation | Kiểm tra chất lượng theo tiêu chí, không chỉ theo cảm giác |

## Luồng xử lý chính

```text
URL
  -> fetch_website_contents(url)
  -> website text
  -> messages_for(website)
  -> openai.chat.completions.create(...)
  -> response.choices[0].message.content
```

## Code cốt lõi

**[Trích từ nguồn, rút gọn]** [Week 1 Day 1](../week1/day1.ipynb):

```python
def messages_for(website):
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt_prefix + website},
    ]

def summarize(url):
    website = fetch_website_contents(url)
    response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages_for(website),
    )
    return response.choices[0].message.content
```

`fetch_website_contents` ở [scraper.py](../week1/scraper.py) lấy title/text HTML, bỏ vài thẻ không cần thiết và cắt còn tối đa 2.000 ký tự.

## Nhầm lẫn dễ mắc

- Chạy cell không theo thứ tự rồi sửa sai code khi lỗi thực ra là `NameError` do kernel thiếu biến.
- Nghĩ OpenAI SDK là model, hoặc nghĩ mỗi API call là training.
- Dán API key vào code/Markdown.
- Kỳ vọng scraper HTML đơn giản đọc được mọi ứng dụng React render bằng JavaScript.
- Tin output cũ trong notebook là kết quả vừa được bạn kiểm chứng.
- Đổi prompt, URL và model cùng lúc rồi không biết thay đổi nào ảnh hưởng kết quả.

## Câu hỏi gợi nhớ

1. `messages_for` nhận gì và trả gì?
2. Dữ liệu text website nằm ở message có role nào?
3. `[:2_000]` giới hạn gì, và không giới hạn được gì hoàn toàn?
4. Khi summary sai, vì sao cần kiểm tra text đã scrape trước khi đổ lỗi cho model?
5. Muốn dùng local model, bạn cần thay đổi endpoint/model ở đâu theo [Guide 9](../guides/09_ai_apis_and_ollama.ipynb)?

## Việc làm ngay

Không gọi API: tạo `sample_website`, chạy `messages_for(sample_website)` và kiểm tra xem kết quả có đúng hai message `system`/`user` không. Sau đó mở [bài chi tiết](01-goi-llm-va-prompt-co-ban-chi-tiet.md) để làm bài tập thay đổi prompt.
