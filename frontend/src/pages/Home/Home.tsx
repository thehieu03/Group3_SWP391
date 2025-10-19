import { useState, type FormEvent } from "react";
import logoMenu from "../../assets/logoMenu.jpg";
import Button from "../../components/Button/Button";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire this to your real search action
    console.log("Searching for:", searchQuery);
  };
  return (
    <div className='bg-red-500 max-w-[1150px] mx-auto'>
      {/*search*/}
        <div className="relative w-full">
          <img src={logoMenu} alt="Menu background" className="w-full h-auto object-cover" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-5xl">
              {/* Search form */}
              <form onSubmit={handleSearchSubmit} className="mx-auto w-full max-w-3xl">
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm gian hàng hoặc người bán"
                    className="flex-1 rounded-md border border-gray-300 bg-white/95 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-400"
                    aria-label="Từ khóa tìm kiếm"
                  />
                  <Button
                  leftIcon={<FaSearch />}
                    className="whitespace-nowrap rounded-md bg-green-600 px-6 py-3 cursor-pointer font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Search from end */}
      {/* List category     */}
      <div>

      </div>
      {/* List đơn hàng đã mua */}



      {/* ghi chú  */}
      <div>
        {/* Tạp hóa MMO - Chuyên mua bán sản phẩm số - Phục vụ cộng đồng MMO (Kiếm tiền online)
Một sản phẩm ra đời với mục đích thuận tiện và an toàn hơn trong các giao dịch mua bán sản phẩm số.

Như các bạn đã biết, tình trạng lừ.a đảo trên mạng xã hội kéo dài bao nhiêu năm nay, mặc dù đã có rất nhiều giải pháp từ cộng đồng như là trung gian hay bảo hiểm, nhưng vẫn rất nhiều người dùng lựa chọn mua bán nhanh gọn mà bỏ qua các bước kiểm tra, hay trung gian, từ đó tạo cơ hội cho s.c.a.m.m.e.r hoạt động. Ở Taphoammo, bạn sẽ có 1 trải nghiệm mua hàng yên tâm hơn rất nhiều, chúng tôi sẽ giữ tiền người bán 3 ngày, kiểm tra toàn bộ sản phẩm bán ra có trùng với người khác hay không, nhắm mục đích tạo ra một nơi giao dịch mà người dùng có thể tin tưởng, một trang mà người bán có thể yên tâm đặt kho hàng, và cạnh tranh sòng phẳng.

Các tính năng trên trang:
Check trùng sản phẩm bán ra: toàn bộ gian hàng cam kết không bán trùng, hệ thống của chúng tôi sẽ kiểm tra từng sản phẩm một, để đảm bảo hàng đến tay người dùng chưa từng được bán cho ai khác trên trang, và hàng bạn đã mua, cũng không thể bán cho ai khác nữa.
Nạp tiền và thanh toán tự động: Bạn chỉ cần nạp tiền đúng cú pháp, số dư của bạn sẽ đc cập nhật sau 1-5 phút. Mọi bước thanh toán và giao hàng đều được thực hiện ngay tức thì.
Giữ tiền đơn hàng 3 ngày: Sau khi bạn mua hàng, đơn hàng đó sẽ ở trạng thái Tạm giữ tiền 3 ngày, đủ thời gian để bạn kiểm tra, đổi pass sản phẩm. Nếu có vấn đề gì, hãy nhanh chóng dùng tính năng "Khiếu nại" nhé.
Tính năng dành cho cộng tác viên (Reseller): Các bạn đọc thêm ở mục "FAQs - Câu hỏi thường gặp" nhé.
Các mặt hàng đang kinh doanh tại Tạp Hóa MMO
Mua bán email: Mua bán gmail, mail outlook, domain... tất cả đều có thể được tự do mua bán trên trang.
Mua bán phần mềm MMO: các phần mềm phục vụ cho kiếm tiền online, như phần mềm youtube, phần mềm chạy facebook, phần mềm PTC, PTU, phần mềm gmail....
Mua bán tài khoản: mua bán facebook, mua bán twitter, mua bán zalo, mua bán instagram.
Các sản phẩm số khác: VPS, key window, key diệt virus, tất cả sản phẩm số không vi phạm chính sách của chúng tôi đều được phép kinh doanh trên trang.
Các dịch vụ tăng tương tác (like, comment, share...), dịch vụ phần mềm, blockchain và các dịch vụ số khác. */}</div>        
    </div>
  );
};

export default Home;
