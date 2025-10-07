import React from "react";

export default function LoginRegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                {/* Đăng nhập */}
                <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring focus:ring-green-200"
                    />

                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded-md p-2 mb-2 focus:outline-none focus:ring focus:ring-green-200"
                    />

                    <div className="text-green-600 text-sm mb-3 cursor-pointer">
                        Quên mật khẩu
                    </div>

                    <div className="flex items-center mb-4">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-gray-600 text-sm">Ghi nhớ đăng nhập</span>
                    </div>

                    <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-md font-semibold mb-4">
                        Đăng nhập
                    </button>

                    <div className="text-center text-gray-600 mb-2">Or</div>

                    <button className="flex items-center justify-center gap-2 border border-gray-300 w-full py-2 rounded-md hover:bg-gray-100">
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        <span className="font-medium text-gray-700">Login with Google</span>
                    </button>
                </div>

                {/* Đăng ký */}
                <div className="bg-white rounded-2xl shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký</h2>

                    <p className="text-sm mb-6">
            <span className="text-green-600">
              Chú ý: Nếu bạn sử dụng các chương trình
            </span>{" "}
                        <span className="text-red-500">Bypass Captcha</span>{" "}
                        <span className="text-green-600">
              có thể không đăng ký tài khoản được.
            </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Tài khoản
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Nhập lại mật khẩu
                            </label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-green-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center mt-4 mb-6">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-600">
              Tôi đã đọc và đồng ý với{" "}
                            <span className="text-green-600 font-medium">
                Điều khoản sử dụng Tạp Hóa MMO
              </span>
            </span>
                    </div>

                    <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-md font-semibold">
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
}
