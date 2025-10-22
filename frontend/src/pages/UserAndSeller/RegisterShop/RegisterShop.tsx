import { useState } from "react";
import axios from "axios";

export default function RegisterShop() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bankName: "TPBank",
    bankAccountNumber: "",
    bankAccountName: "",
    citizenId: "",
    idCardFrontImage: "",
    idCardBackImage: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên shop.";

    if (!/^0\d{9}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0).";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email không hợp lệ.";

    if (!/^[\p{L}\s]+$/u.test(formData.bankAccountName.trim()))
      newErrors.bankAccountName = "Tên chủ tài khoản chỉ được chứa chữ cái.";

    if (!formData.bankAccountNumber.trim())
      newErrors.bankAccountNumber = "Vui lòng nhập số tài khoản ngân hàng.";

    if (!/^\d{9,12}$/.test(formData.citizenId))
      newErrors.citizenId = "Số CMND/CCCD chỉ được chứa số (9–12 chữ số).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, [name]: reader.result as string });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post("/api/registershop", formData);
      setMessage(" Đăng ký cửa hàng thành công!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        bankName: "TPBank",
        bankAccountNumber: "",
        bankAccountName: "",
        citizenId: "",
        idCardFrontImage: "",
        idCardBackImage: "",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-8 tracking-wide">
        Đăng ký cửa hàng trên <span className="text-green-600">TapHoaMMO</span>
      </h1>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-gray-100">
        <div className="bg-green-50 p-10 flex flex-col justify-center border-r border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cơ hội hợp tác</h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed text-[15px]">
            <li>Thông tin của bạn được <b>bảo mật tuyệt đối</b>.</li>
            <li>Kết nối và phát triển cộng đồng bán hàng online uy tín.</li>
            <li>Tối ưu hóa hoạt động kinh doanh cùng đội ngũ hỗ trợ chuyên nghiệp.</li>
            <li>Đẩy thông báo Telegram để không bỏ lỡ khách hàng.</li>
            <li>Kích hoạt bảo mật 2 lớp (2FA) và xác thực E-KYC.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Thông tin cửa hàng</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên shop</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="VD: Shop Kỹ Thuật Số"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0xxxxxxxxx"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="shop@gmail.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ngân hàng</label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="TPBank">TPBank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MBBank">MB Bank</option>
                <option value="BIDV">BIDV</option>
                <option value="VCB">Vietcombank</option>
                <option value="VietinBank">VietinBank</option>
                <option value="VPBank">VPBank</option>
                <option value="Agribank">Agribank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Số tài khoản</label>
              <input
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="1903456789"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.bankAccountNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên chủ tài khoản
              </label>
              <input
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleChange}
                placeholder="Nguyen Van A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.bankAccountName && (
                <p className="text-red-500 text-sm mt-1">{errors.bankAccountName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Số CMND / CCCD</label>
              <input
                name="citizenId"
                value={formData.citizenId}
                onChange={handleChange}
                placeholder="079123456789"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
              {errors.citizenId && <p className="text-red-500 text-sm mt-1">{errors.citizenId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ảnh CMND (mặt trước)
              </label>
              <input
                type="file"
                accept="image/*"
                name="idCardFrontImage"
                onChange={handleFileChange}
                className="w-full text-sm border border-gray-300 rounded-lg p-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ảnh CMND (mặt sau)
              </label>
              <input
                type="file"
                accept="image/*"
                name="idCardBackImage"
                onChange={handleFileChange}
                className="w-full text-sm border border-gray-300 rounded-lg p-1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-4 shadow-md hover:shadow-lg"
          >
            {loading ? "⏳ Đang xử lý..." : "Đăng ký"}
          </button>

          {message && (
            <p
              className={`text-center text-sm font-medium mt-2 ${
                message.includes("thành công") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}