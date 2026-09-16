from pathlib import Path  # Nhập Path để tạo đường dẫn đến vector store theo vị trí của file hiện tại.
from langchain_openai import ChatOpenAI, OpenAIEmbeddings  # Nhập model chat và model embedding của OpenAI.
from langchain_chroma import Chroma  # Nhập Chroma để kết nối tới vector store đã tạo.
from langchain_huggingface import HuggingFaceEmbeddings  # Nhập embedding Hugging Face nếu muốn thay thế bằng embedding cục bộ.
from langchain_core.messages import SystemMessage, HumanMessage, convert_to_messages  # Nhập các kiểu message và hàm chuyển history sang message LangChain.
from langchain_core.documents import Document  # Nhập kiểu Document để chú thích kiểu dữ liệu trả về.

from dotenv import load_dotenv  # Nhập hàm đọc biến môi trường từ tệp .env.


load_dotenv(override=True)  # Nạp OPENAI_API_KEY và các biến cấu hình khác từ tệp .env.

MODEL = "gpt-4.1-nano"  # Chọn model ngôn ngữ dùng để tạo câu trả lời.
DB_NAME = str(Path(__file__).parent.parent / "vector_db")  # Xác định vị trí vector store được tạo bởi ingest.py.

# Có thể bỏ comment dòng này để dùng embedding Hugging Face cục bộ.
# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")  # Tạo embedding cục bộ nếu kích hoạt dòng này.
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")  # Khởi tạo embedding phải tương thích với embedding khi ingest.
RETRIEVAL_K = 10  # Đặt số lượng tài liệu tối đa cần lấy cho mỗi câu hỏi.

SYSTEM_PROMPT = """  # Mẫu prompt hệ thống hướng dẫn vai trò và cách trả lời của trợ lý.
You are a knowledgeable, friendly assistant representing the company Insurellm.
You are chatting with a user about Insurellm.
If relevant, use the given context to answer any question.
If you don't know the answer, say so.
Context:
{context}
"""

vectorstore = Chroma(persist_directory=DB_NAME, embedding_function=embeddings)  # Kết nối tới vector store Chroma đã lưu trên ổ đĩa.
retriever = vectorstore.as_retriever()  # Tạo retriever để tìm các tài liệu liên quan đến câu hỏi.
llm = ChatOpenAI(temperature=0, model_name=MODEL)  # Khởi tạo mô hình chat với temperature bằng 0.


def fetch_context(question: str) -> list[Document]:  # Truy xuất các tài liệu gần nhất với nội dung câu hỏi.
    return retriever.invoke(question, k=RETRIEVAL_K)  # Gọi retriever và giới hạn số tài liệu theo RETRIEVAL_K.


def combined_question(question: str, history: list[dict] = []) -> str:  # Kết hợp câu hỏi mới với lịch sử hội thoại.
    prior = "\n".join(m["content"] for m in history if m["role"] == "user")  # Lấy nội dung các tin nhắn trước đó do người dùng gửi.
    return prior + "\n" + question  # Ghép lịch sử và câu hỏi hiện tại để truy xuất đủ ngữ cảnh.


def answer_question(question: str, history: list[dict] = []) -> tuple[str, list[Document]]:  # Trả lời câu hỏi bằng quy trình RAG.
    combined = combined_question(question, history)  # Kết hợp câu hỏi hiện tại với lịch sử hội thoại.
    docs = fetch_context(combined)  # Tìm các tài liệu liên quan trong vector store.
    context = "\n\n".join(doc.page_content for doc in docs)  # Ghép nội dung tài liệu thành ngữ cảnh duy nhất.
    system_prompt = SYSTEM_PROMPT.format(context=context)  # Điền ngữ cảnh truy xuất vào prompt hệ thống.
    messages = [SystemMessage(content=system_prompt)]  # Bắt đầu danh sách message bằng hướng dẫn hệ thống.
    messages.extend(convert_to_messages(history))  # Thêm lịch sử hội thoại theo định dạng LangChain.
    messages.append(HumanMessage(content=question))  # Thêm câu hỏi hiện tại của người dùng.
    response = llm.invoke(messages)  # Gửi toàn bộ message tới mô hình ngôn ngữ.
    return response.content, docs  # Trả về câu trả lời cùng các tài liệu đã dùng làm ngữ cảnh.
