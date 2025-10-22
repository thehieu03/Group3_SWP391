import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const goToPage = (path: string) => navigate(path);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/supporttickets");
        const ticketsWithStatus = res.data.map((t: any) => ({
          ...t,
          status: t.status || "Chờ xử lý",
        }));
        setTickets(ticketsWithStatus);
        setFilteredTickets(ticketsWithStatus);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải danh sách hỗ trợ từ server");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = [...tickets];

    if (filterStatus === "done") filtered = filtered.filter((t) => t.status === "Đã xử lý");
    if (filterStatus === "deleted") filtered = filtered.filter((t) => t.status === "Đã xóa");

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(term) ||
          t.content?.toLowerCase().includes(term) ||
          t.email?.toLowerCase().includes(term) ||
          t.username?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [filterStatus, searchTerm, sortOrder, tickets]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteTicket = (id: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Đã xóa" } : t))
    );
  };

  const handleMarkAsDone = (id: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Đã xử lý" } : t))
    );
    setSelectedTicket(null);
  };

  if (loading)
    return <p className="p-6 text-gray-600">Đang tải dữ liệu...</p>;

  if (error)
    return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="flex bg-[#f9fafb] min-h-screen">
      <div className="w-64 bg-white shadow-md border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold text-green-700 px-5 py-4 border-b border-gray-200">
            TapHoaMMO
          </div>

          <nav className="flex flex-col p-3 space-y-1 text-gray-700">
            <button
              onClick={() => goToPage("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              📊 <span>Dashboard</span>
            </button>
            <button
              onClick={() => goToPage("/users")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              👥 <span>Quản lý người dùng</span>
            </button>
            <button
              onClick={() => goToPage("/shops")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              🏪 <span>Quản lý shop</span>
            </button>
            <button
              onClick={() => goToPage("/categories")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              🗂️ <span>Quản lý danh mục</span>
            </button>
            <button
              onClick={() => goToPage("/transactions")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              💳 <span>Lịch sử giao dịch</span>
            </button>
            <button
              onClick={() => goToPage("/support")}
              className="flex items-center gap-2 px-3 py-2 rounded bg-green-100 text-green-700 font-semibold transition"
            >
              💬 <span>Hỗ trợ khách hàng</span>
            </button>
            <button
              onClick={() => goToPage("/settings")}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition"
            >
              ⚙️ <span>Cài đặt hệ thống</span>
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Hỗ trợ khách hàng</h1>
          <p className="text-sm text-gray-600">
            Tổng: {filteredTickets.length} ticket
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4 mb-6 border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-green-600"
            >
              <option value="all">Tất cả</option>
              <option value="deleted">Đã xóa</option>
              <option value="done">Đã xử lý</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Sắp xếp:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-green-600"
            >
              <option value="desc">Ngày mới nhất</option>
              <option value="asc">Ngày cũ nhất</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Hiển thị:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-green-600"
            >
              <option value={5}>5 ticket</option>
              <option value={10}>10 ticket</option>
              <option value={20}>20 ticket</option>
            </select>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-green-600"
            />
          </div>
        </div>

        {paginatedTickets.length === 0 ? (
          <p className="text-gray-500 text-center">Không có ticket nào phù hợp.</p>
        ) : (
          <div className="space-y-4">
            {paginatedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">{ticket.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${ticket.status === "Đã xử lý"
                        ? "bg-green-100 text-green-700"
                        : ticket.status === "Đã xóa"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p>
                    <strong>Email:</strong> {ticket.email} &nbsp;|&nbsp;
                    <strong>SĐT:</strong> {ticket.phone}
                  </p>
                  <p>
                    <strong>Tài khoản:</strong> {ticket.username || "Ẩn danh"}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{" "}
                    {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{ticket.content}</p>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:opacity-90"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => navigate("/chat")}
                    className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:opacity-90"
                  >
                    Trả lời
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="bg-gray-500 text-white text-sm px-3 py-1 rounded hover:opacity-90"
                  >
                    Đóng ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded text-sm border ${currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">{selectedTicket.title}</h2>
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{selectedTicket.content}</p>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>
                <strong>Email:</strong> {selectedTicket.email}
              </p>
              <p>
                <strong>SĐT:</strong> {selectedTicket.phone}
              </p>
              <p>
                <strong>Tài khoản:</strong> {selectedTicket.username}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleMarkAsDone(selectedTicket.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90"
              >
                Đã xử lý
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:opacity-90"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
