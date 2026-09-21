import gradio as gr  # Nhập Gradio để xây dựng giao diện đánh giá trên web.
import pandas as pd  # Nhập pandas để tạo bảng dữ liệu cho biểu đồ.
from collections import defaultdict  # Nhập defaultdict để nhóm điểm theo danh mục.
from dotenv import load_dotenv  # Nhập hàm nạp biến môi trường từ tệp .env.

from evaluation.eval import evaluate_all_retrieval, evaluate_all_answers  # Nhập các hàm đánh giá truy xuất và câu trả lời.

load_dotenv(override=True)  # Nạp lại các biến môi trường cần thiết cho ứng dụng.

# Ngưỡng màu cho phần đánh giá truy xuất.
MRR_GREEN = 0.9  # MRR từ mức này trở lên được hiển thị màu xanh.
MRR_AMBER = 0.75  # MRR từ mức này đến dưới mức xanh được hiển thị màu cam.
NDCG_GREEN = 0.9  # nDCG từ mức này trở lên được hiển thị màu xanh.
NDCG_AMBER = 0.75  # nDCG từ mức này đến dưới mức xanh được hiển thị màu cam.
COVERAGE_GREEN = 90.0  # Độ bao phủ từ 90% trở lên được hiển thị màu xanh.
COVERAGE_AMBER = 75.0  # Độ bao phủ từ 75% đến dưới 90% được hiển thị màu cam.

# Ngưỡng màu cho phần đánh giá câu trả lời theo thang điểm 1-5.
ANSWER_GREEN = 4.5  # Điểm từ mức này trở lên được hiển thị màu xanh.
ANSWER_AMBER = 4.0  # Điểm từ mức này đến dưới mức xanh được hiển thị màu cam.


def get_color(value: float, metric_type: str) -> str:
    """Chọn màu dựa trên giá trị và loại chỉ số."""
    if metric_type == "mrr":  # Xử lý chỉ số MRR.
        if value >= MRR_GREEN:  # Kiểm tra điểm có đạt ngưỡng tốt hay không.
            return "green"  # Trả về màu xanh cho kết quả tốt.
        elif value >= MRR_AMBER:  # Kiểm tra điểm có đạt ngưỡng trung bình hay không.
            return "orange"  # Trả về màu cam cho kết quả cần theo dõi.
        else:  # Xử lý kết quả dưới ngưỡng trung bình.
            return "red"  # Trả về màu đỏ cho kết quả thấp.
    elif metric_type == "ndcg":  # Xử lý chỉ số nDCG.
        if value >= NDCG_GREEN:  # Kiểm tra điểm có đạt ngưỡng tốt hay không.
            return "green"  # Trả về màu xanh cho kết quả tốt.
        elif value >= NDCG_AMBER:  # Kiểm tra điểm có đạt ngưỡng trung bình hay không.
            return "orange"  # Trả về màu cam cho kết quả cần theo dõi.
        else:  # Xử lý kết quả dưới ngưỡng trung bình.
            return "red"  # Trả về màu đỏ cho kết quả thấp.
    elif metric_type == "coverage":  # Xử lý chỉ số độ bao phủ từ khóa.
        if value >= COVERAGE_GREEN:  # Kiểm tra độ bao phủ có đạt ngưỡng tốt hay không.
            return "green"  # Trả về màu xanh cho kết quả tốt.
        elif value >= COVERAGE_AMBER:  # Kiểm tra độ bao phủ có đạt ngưỡng trung bình hay không.
            return "orange"  # Trả về màu cam cho kết quả cần theo dõi.
        else:  # Xử lý độ bao phủ dưới ngưỡng trung bình.
            return "red"  # Trả về màu đỏ cho kết quả thấp.
    elif metric_type in ["accuracy", "completeness", "relevance"]:  # Xử lý các chỉ số chất lượng câu trả lời.
        if value >= ANSWER_GREEN:  # Kiểm tra điểm câu trả lời có đạt ngưỡng tốt hay không.
            return "green"  # Trả về màu xanh cho kết quả tốt.
        elif value >= ANSWER_AMBER:  # Kiểm tra điểm câu trả lời có đạt ngưỡng trung bình hay không.
            return "orange"  # Trả về màu cam cho kết quả cần theo dõi.
        else:  # Xử lý điểm câu trả lời dưới ngưỡng trung bình.
            return "red"  # Trả về màu đỏ cho kết quả thấp.
    return "black"  # Trả về màu mặc định nếu loại chỉ số không được nhận diện.


def format_metric_html(
    label: str,
    value: float,
    metric_type: str,
    is_percentage: bool = False,
    score_format: bool = False,
) -> str:
    """Định dạng một chỉ số kèm màu sắc biểu thị chất lượng."""
    color = get_color(value, metric_type)  # Xác định màu dựa trên giá trị chỉ số.
    if is_percentage:  # Kiểm tra chỉ số có cần hiển thị dưới dạng phần trăm hay không.
        value_str = f"{value:.1f}%"  # Định dạng giá trị với một chữ số thập phân và ký hiệu phần trăm.
    elif score_format:  # Kiểm tra chỉ số có thuộc thang điểm 1-5 hay không.
        value_str = f"{value:.2f}/5"  # Định dạng điểm với hai chữ số thập phân trên tổng điểm 5.
    else:  # Xử lý các chỉ số dạng số thập phân thông thường.
        value_str = f"{value:.4f}"  # Định dạng giá trị với bốn chữ số thập phân.
    return f"""
    <div style="margin: 10px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px; border-left: 5px solid {color};">
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">{label}</div>
        <div style="font-size: 28px; font-weight: bold; color: {color};">{value_str}</div>
    </div>
    """


def run_retrieval_evaluation(progress=gr.Progress()):
    """Chạy đánh giá truy xuất và cập nhật tiến trình."""
    total_mrr = 0.0  # Khởi tạo tổng điểm MRR.
    total_ndcg = 0.0  # Khởi tạo tổng điểm nDCG.
    total_coverage = 0.0  # Khởi tạo tổng độ bao phủ từ khóa.
    category_mrr = defaultdict(list)  # Tạo nơi lưu điểm MRR theo từng danh mục.
    count = 0  # Khởi tạo bộ đếm số bài kiểm tra.

    for test, result, prog_value in evaluate_all_retrieval():  # Duyệt qua kết quả đánh giá từng bài kiểm tra truy xuất.
        count += 1  # Tăng số lượng bài kiểm tra đã xử lý.
        total_mrr += result.mrr  # Cộng điểm MRR hiện tại vào tổng.
        total_ndcg += result.ndcg  # Cộng điểm nDCG hiện tại vào tổng.
        total_coverage += result.keyword_coverage  # Cộng độ bao phủ hiện tại vào tổng.

        category_mrr[test.category].append(result.mrr)  # Lưu điểm MRR vào danh mục tương ứng.

        progress(prog_value, desc=f"Đang đánh giá bài kiểm tra {count}...")  # Cập nhật thanh tiến trình.

    avg_mrr = total_mrr / count  # Tính MRR trung bình của toàn bộ bài kiểm tra.
    avg_ndcg = total_ndcg / count  # Tính nDCG trung bình của toàn bộ bài kiểm tra.
    avg_coverage = total_coverage / count  # Tính độ bao phủ trung bình của toàn bộ bài kiểm tra.

    # Tạo HTML tóm tắt các chỉ số cuối cùng.
    final_html = f"""
    <div style="padding: 0;">
        {format_metric_html("Xếp hạng đối ứng trung bình (MRR)", avg_mrr, "mrr")}
        {format_metric_html("DCG chuẩn hóa (nDCG)", avg_ndcg, "ndcg")}
        {format_metric_html("Độ bao phủ từ khóa", avg_coverage, "coverage", is_percentage=True)}
        <div style="margin-top: 20px; padding: 10px; background-color: #d4edda; border-radius: 5px; text-align: center; border: 1px solid #c3e6cb;">
            <span style="font-size: 14px; color: #155724; font-weight: bold;">✓ Đã hoàn tất đánh giá: {count} bài kiểm tra</span>
        </div>
    </div>
    """

    category_data = []  # Tạo danh sách dữ liệu cho biểu đồ cột cuối cùng.
    for category, mrr_scores in category_mrr.items():  # Duyệt qua điểm MRR của từng danh mục.
        avg_cat_mrr = sum(mrr_scores) / len(mrr_scores)  # Tính MRR trung bình của danh mục hiện tại.
        category_data.append({"Category": category, "Average MRR": avg_cat_mrr})  # Thêm dữ liệu danh mục vào danh sách.

    df = pd.DataFrame(category_data)  # Chuyển dữ liệu danh mục thành DataFrame cho Gradio.

    return final_html, df  # Trả về HTML chỉ số và dữ liệu biểu đồ.


def run_answer_evaluation(progress=gr.Progress()):
    """Chạy đánh giá câu trả lời và cập nhật tiến trình."""
    total_accuracy = 0.0  # Khởi tạo tổng điểm chính xác.
    total_completeness = 0.0  # Khởi tạo tổng điểm đầy đủ.
    total_relevance = 0.0  # Khởi tạo tổng điểm liên quan.
    category_accuracy = defaultdict(list)  # Tạo nơi lưu điểm chính xác theo từng danh mục.
    count = 0  # Khởi tạo bộ đếm số bài kiểm tra.

    for test, result, prog_value in evaluate_all_answers():  # Duyệt qua kết quả đánh giá từng câu trả lời.
        count += 1  # Tăng số lượng bài kiểm tra đã xử lý.
        total_accuracy += result.accuracy  # Cộng điểm chính xác hiện tại vào tổng.
        total_completeness += result.completeness  # Cộng điểm đầy đủ hiện tại vào tổng.
        total_relevance += result.relevance  # Cộng điểm liên quan hiện tại vào tổng.

        category_accuracy[test.category].append(result.accuracy)  # Lưu điểm chính xác vào danh mục tương ứng.

        progress(prog_value, desc=f"Đang đánh giá bài kiểm tra {count}...")  # Cập nhật thanh tiến trình.

    avg_accuracy = total_accuracy / count  # Tính điểm chính xác trung bình.
    avg_completeness = total_completeness / count  # Tính điểm đầy đủ trung bình.
    avg_relevance = total_relevance / count  # Tính điểm liên quan trung bình.

    # Tạo HTML tóm tắt các chỉ số cuối cùng.
    final_html = f"""
    <div style="padding: 0;">
        {format_metric_html("Độ chính xác", avg_accuracy, "accuracy", score_format=True)}
        {format_metric_html("Độ đầy đủ", avg_completeness, "completeness", score_format=True)}
        {format_metric_html("Mức độ liên quan", avg_relevance, "relevance", score_format=True)}
        <div style="margin-top: 20px; padding: 10px; background-color: #d4edda; border-radius: 5px; text-align: center; border: 1px solid #c3e6cb;">
            <span style="font-size: 14px; color: #155724; font-weight: bold;">✓ Đã hoàn tất đánh giá: {count} bài kiểm tra</span>
        </div>
    </div>
    """

    category_data = []  # Tạo danh sách dữ liệu cho biểu đồ cột cuối cùng.
    for category, accuracy_scores in category_accuracy.items():  # Duyệt qua điểm chính xác của từng danh mục.
        avg_cat_accuracy = sum(accuracy_scores) / len(accuracy_scores)  # Tính điểm chính xác trung bình của danh mục.
        category_data.append({"Category": category, "Average Accuracy": avg_cat_accuracy})  # Thêm dữ liệu danh mục vào danh sách.

    df = pd.DataFrame(category_data)  # Chuyển dữ liệu danh mục thành DataFrame cho Gradio.

    return final_html, df  # Trả về HTML chỉ số và dữ liệu biểu đồ.


def main():
    """Khởi chạy ứng dụng đánh giá Gradio."""
    theme = gr.themes.Soft(font=["Inter", "system-ui", "sans-serif"])  # Tạo giao diện với chủ đề Soft và font dự phòng.

    with gr.Blocks(title="Bảng điều khiển đánh giá RAG", theme=theme) as app:  # Tạo vùng chứa chính của dashboard.
        gr.Markdown("# 📊 Bảng điều khiển đánh giá RAG")  # Hiển thị tiêu đề dashboard.
        gr.Markdown("Đánh giá chất lượng truy xuất và câu trả lời của hệ thống RAG Insurellm")  # Hiển thị phần mô tả dashboard.

        gr.Markdown("## 🔍 Đánh giá truy xuất")  # Hiển thị tiêu đề phần đánh giá truy xuất.

        retrieval_button = gr.Button("Chạy đánh giá", variant="primary", size="lg")  # Tạo nút bắt đầu đánh giá truy xuất.

        with gr.Row():  # Tạo hàng chứa chỉ số và biểu đồ truy xuất.
            with gr.Column(scale=1):  # Tạo cột hiển thị các chỉ số truy xuất.
                retrieval_metrics = gr.HTML(
                    "<div style='padding: 20px; text-align: center; color: #999;'>Nhấn 'Chạy đánh giá' để bắt đầu</div>"  # Hiển thị thông báo ban đầu cho người dùng.
                )  # Hoàn tất vùng hiển thị chỉ số truy xuất.

            with gr.Column(scale=1):  # Tạo cột hiển thị biểu đồ MRR.
                retrieval_chart = gr.BarPlot(
                    x="Category",  # Chọn cột danh mục làm trục X.
                    y="Average MRR",  # Chọn cột MRR trung bình làm trục Y.
                    title="MRR trung bình theo danh mục",  # Đặt tiêu đề biểu đồ bằng tiếng Việt.
                    y_lim=[0, 1],  # Giới hạn trục Y trong khoảng điểm MRR hợp lệ.
                    height=400,  # Đặt chiều cao biểu đồ.
                )  # Hoàn tất cấu hình biểu đồ truy xuất.

        gr.Markdown("## 💬 Đánh giá câu trả lời")  # Hiển thị tiêu đề phần đánh giá câu trả lời.

        answer_button = gr.Button("Chạy đánh giá", variant="primary", size="lg")  # Tạo nút bắt đầu đánh giá câu trả lời.

        with gr.Row():  # Tạo hàng chứa chỉ số và biểu đồ câu trả lời.
            with gr.Column(scale=1):  # Tạo cột hiển thị các chỉ số câu trả lời.
                answer_metrics = gr.HTML(
                    "<div style='padding: 20px; text-align: center; color: #999;'>Nhấn 'Chạy đánh giá' để bắt đầu</div>"  # Hiển thị thông báo ban đầu cho người dùng.
                )  # Hoàn tất vùng hiển thị chỉ số câu trả lời.

            with gr.Column(scale=1):  # Tạo cột hiển thị biểu đồ độ chính xác.
                answer_chart = gr.BarPlot(
                    x="Category",  # Chọn cột danh mục làm trục X.
                    y="Average Accuracy",  # Chọn cột độ chính xác trung bình làm trục Y.
                    title="Độ chính xác trung bình theo danh mục",  # Đặt tiêu đề biểu đồ bằng tiếng Việt.
                    y_lim=[1, 5],  # Giới hạn trục Y theo thang điểm từ 1 đến 5.
                    height=400,  # Đặt chiều cao biểu đồ.
                )  # Hoàn tất cấu hình biểu đồ câu trả lời.

        # Kết nối các nút với hàm đánh giá tương ứng.
        retrieval_button.click(
            fn=run_retrieval_evaluation,  # Gọi hàm đánh giá truy xuất khi nhấn nút.
            outputs=[retrieval_metrics, retrieval_chart],  # Đưa kết quả vào vùng chỉ số và biểu đồ truy xuất.
        )  # Hoàn tất kết nối sự kiện đánh giá truy xuất.

        answer_button.click(
            fn=run_answer_evaluation,  # Gọi hàm đánh giá câu trả lời khi nhấn nút.
            outputs=[answer_metrics, answer_chart],  # Đưa kết quả vào vùng chỉ số và biểu đồ câu trả lời.
        )  # Hoàn tất kết nối sự kiện đánh giá câu trả lời.

    app.launch(inbrowser=True)  # Khởi chạy dashboard và mở giao diện trong trình duyệt.


if __name__ == "__main__":  # Chỉ chạy dashboard khi file được thực thi trực tiếp.
    main()  # Khởi động ứng dụng đánh giá.
