

const ChangePassword = () => {
  return (
    <div className="w-full flex justify-center bg-gray-50 py-10">
      <div className="w-full max-w-4xl bg-white shadow border rounded-lg">
        {/* Header */}
        <div className="border-b bg-gray-100 p-6 rounded-t-lg">
          <h5 className="text-[20px] font-semibold text-gray-700">
            Đổi mật khẩu
          </h5>
        </div>

        <div className="p-8">
          <form className="space-y-6">
            {/* Mật khẩu cũ */}
            <div className="flex flex-col">
              <label
                htmlFor="oldPassword"
                className="text-gray-700 font-medium mb-2"
              >
                Mật khẩu cũ
              </label>
              <input
                id="oldPassword"
                type="password"
                placeholder="Nhập mật khẩu cũ"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor="newPassword"
                  className="text-gray-700 font-medium mb-2"
                >
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-medium mb-2"
                >
                  Nhập lại mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-md transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
