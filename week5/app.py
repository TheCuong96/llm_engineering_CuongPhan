import gradio as gr  # Nhập Gradio để xây dựng giao diện trò chuyện trên web.
from dotenv import load_dotenv  # Nhập hàm đọc các biến môi trường từ tệp .env.

from implementation.answer import answer_question  # Nhập hàm xử lý câu hỏi bằng pipeline RAG.

load_dotenv(override=True)  # Nạp lại các biến môi trường, chẳng hạn OPENAI_API_KEY.


def format_context(context):  # Định dạng các tài liệu được truy xuất để hiển thị trong giao diện.
    result = "<h2 style='color: #ff7800;'>Ngữ cảnh liên quan</h2>\n\n"  # Tạo tiêu đề cho khu vực hiển thị ngữ cảnh.
    for doc in context:  # Duyệt qua từng tài liệu được tìm thấy.
        result += f"<span style='color: #ff7800;'>Nguồn: {doc.metadata['source']}</span>\n\n"  # Thêm tên nguồn của tài liệu.
        result += doc.page_content + "\n\n"  # Thêm nội dung tài liệu vào kết quả hiển thị.
    return result  # Trả về chuỗi HTML chứa toàn bộ ngữ cảnh liên quan.


def chat(history):  # Xử lý câu hỏi mới nhất và cập nhật lịch sử trò chuyện.
    last_message = history[-1]["content"]  # Lấy tin nhắn mới nhất của người dùng.
    prior = history[:-1]  # Lấy toàn bộ lịch sử trước tin nhắn hiện tại.
    answer, context = answer_question(last_message, prior)  # Gọi pipeline RAG để tạo câu trả lời và lấy ngữ cảnh.
    history.append({"role": "assistant", "content": answer})  # Thêm câu trả lời của trợ lý vào lịch sử.
    return history, format_context(context)  # Trả về lịch sử mới và ngữ cảnh đã được định dạng.


def main():  # Khởi tạo và chạy ứng dụng web Gradio.
    def put_message_in_chatbot(message, history):  # Thêm tin nhắn mới của người dùng vào khung trò chuyện.
        return "", history + [{"role": "user", "content": message}]  # Xóa ô nhập và trả về lịch sử có tin nhắn mới.

    theme = gr.themes.Soft(font=["Inter", "system-ui", "sans-serif"])  # Tạo giao diện với chủ đề Soft và font dự phòng.

    with gr.Blocks(title="Trợ lý chuyên gia Insurellm", theme=theme) as ui:  # Tạo vùng chứa chính của ứng dụng.
        gr.Markdown("# 🏢 Trợ lý chuyên gia Insurellm\nHãy hỏi tôi bất cứ điều gì về Insurellm!")  # Hiển thị tiêu đề và lời hướng dẫn trên giao diện.

        with gr.Row():  # Chia giao diện thành một hàng gồm các cột.
            with gr.Column(scale=1):  # Tạo cột hiển thị cuộc trò chuyện và ô nhập câu hỏi.
                chatbot = gr.Chatbot(  # Tạo khung hiển thị lịch sử trò chuyện.
                    label="💬 Cuộc trò chuyện", height=600, type="messages", show_copy_button=True  # Đặt nhãn, chiều cao, định dạng message và nút sao chép.
                )  # Hoàn tất cấu hình khung trò chuyện.
                message = gr.Textbox(  # Tạo ô để người dùng nhập câu hỏi.
                    label="Câu hỏi của bạn",  # Đặt nhãn cho ô nhập câu hỏi.
                    placeholder="Hãy hỏi bất cứ điều gì về Insurellm...",  # Hiển thị gợi ý trong ô nhập.
                    show_label=False,  # Ẩn nhãn riêng vì giao diện đã có placeholder.
                )  # Hoàn tất cấu hình ô nhập.

            with gr.Column(scale=1):  # Tạo cột hiển thị ngữ cảnh được truy xuất.
                context_markdown = gr.Markdown(  # Tạo vùng Markdown để hiển thị tài liệu liên quan.
                    label="📚 Ngữ cảnh được truy xuất",  # Đặt nhãn cho khu vực ngữ cảnh.
                    value="*Ngữ cảnh được truy xuất sẽ hiển thị tại đây*",  # Hiển thị nội dung mặc định trước khi có câu hỏi.
                    container=True,  # Đặt vùng ngữ cảnh trong một khung giao diện.
                    height=600,  # Đặt chiều cao bằng khung trò chuyện.
                )  # Hoàn tất cấu hình vùng hiển thị ngữ cảnh.

        message.submit(  # Đăng ký sự kiện khi người dùng nhấn Enter trong ô nhập.
            put_message_in_chatbot, inputs=[message, chatbot], outputs=[message, chatbot]  # Thêm tin nhắn vào lịch sử và xóa nội dung ô nhập.
        ).then(chat, inputs=chatbot, outputs=[chatbot, context_markdown])  # Sau đó gọi trợ lý và cập nhật câu trả lời cùng ngữ cảnh.

    ui.launch(inbrowser=True)  # Khởi chạy ứng dụng và mở giao diện trong trình duyệt.


if __name__ == "__main__":  # Chỉ chạy ứng dụng khi file được thực thi trực tiếp.
    main()  # Khởi động giao diện trợ lý Insurellm.
