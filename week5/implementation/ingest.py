import os  # Nhập os để kiểm tra thư mục cơ sở dữ liệu và xử lý đường dẫn hệ thống.
import glob  # Nhập glob để tìm tất cả thư mục con trong knowledge-base.
from pathlib import Path  # Nhập Path để tạo đường dẫn độc lập với hệ điều hành.
from langchain_community.document_loaders import DirectoryLoader, TextLoader  # Nhập loader để đọc nhiều tệp Markdown trong một thư mục.
from langchain_text_splitters import RecursiveCharacterTextSplitter  # Nhập bộ tách văn bản thành các đoạn nhỏ phù hợp cho truy xuất.
from langchain_chroma import Chroma  # Nhập Chroma để lưu và truy vấn các vector embedding.
from langchain_huggingface import HuggingFaceEmbeddings  # Nhập embedding Hugging Face nếu muốn chạy embedding cục bộ.
from langchain_openai import OpenAIEmbeddings  # Nhập embedding OpenAI đang được sử dụng trong pipeline này.


from dotenv import load_dotenv  # Nhập hàm đọc biến môi trường từ tệp .env.

MODEL = "gpt-4.1-nano"  # Đặt tên mô hình ngôn ngữ dùng chung trong dự án.

DB_NAME = str(Path(__file__).parent.parent / "vector_db")  # Tạo đường dẫn đến thư mục vector_db nằm cạnh thư mục week5.
KNOWLEDGE_BASE = str(Path(__file__).parent.parent / "knowledge-base")  # Tạo đường dẫn đến thư mục chứa dữ liệu Markdown nguồn.

# Có thể bỏ comment dòng này để dùng embedding Hugging Face cục bộ thay cho OpenAI.
# embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")  # Tạo embedding cục bộ nếu kích hoạt dòng này.

load_dotenv(override=True)  # Nạp các biến cấu hình, chẳng hạn OPENAI_API_KEY, từ tệp .env.

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")  # Khởi tạo mô hình embedding OpenAI để chuyển văn bản thành vector.


def fetch_documents():  # Đọc toàn bộ tài liệu Markdown từ knowledge-base.
    folders = glob.glob(str(Path(KNOWLEDGE_BASE) / "*"))  # Tìm tất cả thư mục con đại diện cho các loại tài liệu.
    documents = []  # Tạo danh sách rỗng để gom toàn bộ tài liệu đã đọc.
    for folder in folders:  # Duyệt qua từng thư mục tài liệu.
        doc_type = os.path.basename(folder)  # Lấy tên thư mục để ghi nhận loại tài liệu trong metadata.
        loader = DirectoryLoader(
            folder, glob="**/*.md", loader_cls=TextLoader, loader_kwargs={"encoding": "utf-8"}  # Chỉ định thư mục, mẫu tệp và encoding UTF-8.
        )  # Hoàn tất cấu hình loader đọc tài liệu.
        folder_docs = loader.load()  # Đọc nội dung các tệp và chuyển thành các đối tượng Document.
        for doc in folder_docs:  # Duyệt qua các tài liệu vừa đọc trong thư mục hiện tại.
            doc.metadata["doc_type"] = doc_type  # Gắn loại tài liệu vào metadata để dùng về sau.
            documents.append(doc)  # Thêm tài liệu hiện tại vào danh sách tổng.
    return documents  # Trả về toàn bộ tài liệu đã đọc từ knowledge-base.


def create_chunks(documents):  # Chia tài liệu thành các đoạn nhỏ để truy xuất hiệu quả.
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=200)  # Tạo bộ tách với kích thước đoạn và phần chồng lấn đã chọn.
    chunks = text_splitter.split_documents(documents)  # Chia tài liệu thành các đoạn nhỏ nhưng vẫn giữ metadata gốc.
    return chunks  # Trả về danh sách các đoạn văn bản để tạo embedding.


def create_embeddings(chunks):  # Tạo embedding và lưu các đoạn văn bản vào Chroma.
    if os.path.exists(DB_NAME):  # Kiểm tra vector store cũ có tồn tại hay không.
        Chroma(persist_directory=DB_NAME, embedding_function=embeddings).delete_collection()  # Xóa collection cũ để tái tạo từ dữ liệu mới.

    vectorstore = Chroma.from_documents(
        documents=chunks, embedding=embeddings, persist_directory=DB_NAME  # Tạo vector store từ các đoạn văn bản và embedding tương ứng.
    )  # Hoàn tất việc tạo vector store Chroma.

    collection = vectorstore._collection  # Lấy collection nội bộ để kiểm tra số lượng và kích thước vector.
    count = collection.count()  # Đếm tổng số vector đã lưu trong collection.

    sample_embedding = collection.get(limit=1, include=["embeddings"])["embeddings"][0]  # Lấy một embedding mẫu để suy ra số chiều của vector.
    dimensions = len(sample_embedding)  # Tính số chiều từ vector mẫu.
    print(f"There are {count:,} vectors with {dimensions:,} dimensions in the vector store")  # In thống kê để xác nhận quá trình tạo vector store.
    return vectorstore  # Trả về vector store vừa tạo.


if __name__ == "__main__":
    documents = fetch_documents()  # Đọc toàn bộ tài liệu nguồn từ knowledge-base.
    chunks = create_chunks(documents)  # Chia tài liệu thành các đoạn nhỏ để truy xuất hiệu quả hơn.
    create_embeddings(chunks)  # Tạo embedding và lưu các đoạn vào Chroma.
    print("Ingestion complete")  # Thông báo quá trình ingest đã hoàn tất.
