# from ... import ... : lấy đúng class/hàm cần dùng từ module (thư viện), giống import có chọn lọc
# BeautifulSoup: parser (bộ phân tích) HTML — biến HTML thô thành cây DOM để truy vấn
from bs4 import BeautifulSoup

# import cả module requests (thư viện HTTP client, giống fetch/axios/HttpClient)
import requests


# headers (tiêu đề HTTP): trình duyệt luôn gửi kèm khi request (yêu cầu) một website
# Nhiều website chặn request không có User-Agent (chuỗi nhận diện trình duyệt)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
}


def fetch_website_contents(url):
    """
    Trả về title (tiêu đề) và contents (nội dung) của website tại url đã cho;
    truncate (cắt ngắn) còn 2.000 characters (ký tự) như một giới hạn hợp lý
    """
    # GET request tới url, kèm headers; response (phản hồi) chứa HTML, status code, ...
    response = requests.get(url, headers=headers)
    # Tạo cây DOM từ HTML trong response.content (bytes của body)
    # "html.parser" là parser có sẵn của Python, không cần cài thêm
    soup = BeautifulSoup(response.content, "html.parser")
    # Toán tử ba ngôi: nếu có thẻ <title> thì lấy .string (text bên trong), không thì chuỗi mặc định
    title = soup.title.string if soup.title else "No title found"
    if soup.body:
        # soup.body([...]): tìm mọi thẻ script/style/img/input bên trong <body>
        # decompose(): gỡ node đó khỏi cây DOM (xóa hẳn), vì chúng không phải nội dung đọc được
        for irrelevant in soup.body(["script", "style", "img", "input"]):
            irrelevant.decompose()
        # get_text(): lấy toàn bộ text còn lại trong <body>
        # separator="\n": chèn xuống dòng giữa các khối text
        # strip=True: bỏ khoảng trắng thừa ở đầu/cuối mỗi đoạn
        text = soup.body.get_text(separator="\n", strip=True)
    else:
        text = ""
    # Nối title + 2 dòng trống + text, rồi cắt [:2_000] (slicing: lấy 2000 ký tự đầu)
    # 2_000 chỉ là cách viết 2000 cho dễ đọc (dấu _ bị Python bỏ qua)
    return (title + "\n\n" + text)[:2_000]


def fetch_website_links(url):
    """
    Trả về các links (liên kết) trên website tại url đã cho
    Tôi biết cách này inefficient (không hiệu quả) vì parse (phân tích) HTML hai lần!
    Để lab (bài thực hành) giữ code đơn giản.
    Bạn cứ thoải mái dùng class và tối ưu!
    """
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    # List comprehension (cú pháp tạo list ngắn gọn, giống map):
    # soup.find_all("a") = tìm mọi thẻ <a>
    # link.get("href") = lấy attribute (thuộc tính) href, có thể là None nếu thiếu
    links = [link.get("href") for link in soup.find_all("a")]
    # Lọc bỏ giá trị falsy (None, "", ...): chỉ giữ link thật sự có nội dung
    return [link for link in links if link]
