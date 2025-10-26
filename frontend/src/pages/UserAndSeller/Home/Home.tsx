import { useEffect, useState } from "react";
import HomeSearch from "@/components/HomeSearch/HomeSearch.tsx";
import CategoryList from "@/components/CategoryHomeList/CategoryList";
import PurchasedProducts from "@/components/PurchasedProducts/PurchasedProducts.tsx";
import { categoryServices } from "@/services/CategoryServices.tsx";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";

const Home = () => {
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await categoryServices.getAllCategoryAsync();
      setCategories(categories);
    };
    void fetchCategories();
  }, []);
  return (
    <div className="max-w-[1150px] mx-auto">
            <HomeSearch/>
      <CategoryList categories={categories} />
      <PurchasedProducts />

      <div className="bg-green-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-green-300 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
              Tạp hóa MMO - Chuyên mua bán sản phẩm số - Phục vụ cộng đồng MMO (Kiếm tiền online)
            </h1>

            <p className="text-lg text-gray-600 text-center mb-8">
              Một sản phẩm ra đời với mục đích thuận tiện và an toàn hơn trong các giao dịch mua bán sản phẩm số.
            </p>

            <div className="space-y-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                Như các bạn đã biết, tình trạng lừa đảo trên mạng xã hội kéo dài bao nhiêu năm nay, mặc dù đã có rất nhiều giải pháp từ cộng đồng như là trung gian hay bảo hiểm, nhưng vẫn rất nhiều người dùng lựa chọn mua bán nhanh gọn mà bỏ qua các bước kiểm tra, hay trung gian, từ đó tạo cơ hội cho scammer hoạt động. Ở Taphoammo, bạn sẽ có 1 trải nghiệm mua hàng yên tâm hơn rất nhiều, chúng tôi sẽ giữ tiền người bán 3 ngày, kiểm tra toàn bộ sản phẩm bán ra có trùng với người khác hay không, nhắm mục đích tạo ra một nơi giao dịch mà người dùng có thể tin tưởng, một trang mà người bán có thể yên tâm đặt kho hàng, và cạnh tranh sòng phẳng.
              </p>

              {isExpanded && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                    Các tính năng trên trang:
                  </h2>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Check trùng sản phẩm bán ra:</strong> toàn bộ gian hàng cam kết không bán trùng, hệ thống của chúng tôi sẽ kiểm tra từng sản phẩm một, để đảm bảo hàng đến tay người dùng chưa từng được bán cho ai khác trên trang, và hàng bạn đã mua, cũng không thể bán cho ai khác nữa.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Nạp tiền và thanh toán tự động:</strong> Bạn chỉ cần nạp tiền đúng cú pháp, số dư của bạn sẽ đc cập nhật sau 1-5 phút. Mọi bước thanh toán và giao hàng đều được thực hiện ngay tức thì.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Giữ tiền đơn hàng 3 ngày:</strong> Sau khi bạn mua hàng, đơn hàng đó sẽ ở trạng thái Tạm giữ tiền 3 ngày, đủ thời gian để bạn kiểm tra, đổi pass sản phẩm. Nếu có vấn đề gì, hãy nhanh chóng dùng tính năng "Khiếu nại" nhé.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Tính năng dành cho cộng tác viên (Reseller):</strong> Các bạn đọc thêm ở mục "FAQs - Câu hỏi thường gặp" nhé.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {isExpanded && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
                    Các mặt hàng đang kinh doanh tại Tạp Hóa MMO
                  </h2>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Mua bán email:</strong> Mua bán gmail, mail outlook, domain... tất cả đều có thể được tự do mua bán trên trang.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Mua bán phần mềm MMO:</strong> các phần mềm phục vụ cho kiếm tiền online, như phần mềm youtube, phần mềm chạy facebook, phần mềm PTC, PTU, phần mềm gmail....
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Mua bán tài khoản:</strong> mua bán facebook, mua bán twitter, mua bán zalo, mua bán instagram.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Các sản phẩm số khác:</strong> VPS, key window, key diệt virus, tất cả sản phẩm số không vi phạm chính sách của chúng tôi đều được phép kinh doanh trên trang.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>
                        <strong>Các dịch vụ tăng tương tác:</strong> (like, comment, share...), dịch vụ phần mềm, blockchain và các dịch vụ số khác.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
