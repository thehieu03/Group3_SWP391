import {
  FaPaperPlane,
  FaFacebook,
  FaEnvelope,
  FaClock,
  FaRss,
  FaYoutube,
} from "react-icons/fa";
import Button from "@components/Button/Button";
import routesConfig from "@config/routesConfig.ts";

const Footer = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Liên hệ</h3>
            <p className="text-sm text-gray-600 mb-4">
              Liên hệ ngay nếu bạn có khó khăn khi sử dụng dịch vụ hoặc cần hợp
              tác.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaPaperPlane className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-600">
                  Chat với hỗ trợ viên
                </span>
              </div>
              <div className="flex items-center">
                <FaFacebook className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-600">Tạp hóa MMO</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-600">
                  hieunthe171211@gmail.com
                </span>
              </div>
              <div className="flex items-center">
                <FaClock className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-600">
                  Mon-Sat 08:00am - 10:00pm
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin</h3>
            <p className="text-sm text-gray-600 mb-4">
              Một ứng dụng nhằm kết nối, trao đổi, mua bán trong cộng đồng kiếm
              tiền online.
            </p>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                • Thanh toán tự động, nhận hàng ngay tức thì.
              </li>
              <li className="text-sm text-gray-600">• Câu hỏi thường gặp</li>
              <li className="text-sm text-gray-600">• Điều khoản sử dụng</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Đăng ký bán hàng
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Tạo một gian hàng của bạn trên trang của chúng tôi. Đội ngũ hỗ trợ
              sẽ liên lạc để giúp bạn tối ưu khả năng bán hàng.
            </p>
            <Button
              to={routesConfig.registerShop}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 mb-4"
            >
              Tham gia
            </Button>
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Theo dõi chúng tôi trên mạng xã hội
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <FaRss className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <FaYoutube className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaFacebook className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
