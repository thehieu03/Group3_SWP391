import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SupportTickets() {
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/supporttickets", {
          params: { pageNumber: currentPage, pageSize: itemsPerPage },
        });

        // ✅ Backend trả về object: { totalRecords, totalPages, data: [...] }
        const responseData = res.data?.data || [];
        const ticketsWithStatus = responseData.map((t: any) => ({
          ...t,
          status: t.status || "Chờ xử lý",
        }));

        setTickets(ticketsWithStatus);
        setFilteredTickets(ticketsWithStatus);
        setTotalPages(res.data?.totalPages || 1);
        setTotalRecords(res.data?.totalRecords || ticketsWithStatus.length);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải danh sách hỗ trợ từ server");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [currentPage, itemsPerPage]);

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
  }, [filterStatus, searchTerm, sortOrder, tickets]);

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

  const handleSendEmail = (ticket: any) => {
    const subject = encodeURIComponent(`Phản hồi yêu cầu hỗ trợ: ${ticket.title}`);
    const body = encodeURIComponent(
      `Xin chào ${ticket.username || "bạn"},\n\n` +
        `Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn:\n"${ticket.content}"\n\n` +
        `Nội dung phản hồi: (vui lòng nhập câu trả lời tại đây)\n\n` +
        `Trân trọng,\nĐội ngũ hỗ trợ TapHoaMMO`
    );
    window.location.href = `mailto:${ticket.email}?subject=${subject}&body=${body}`;
  };

  if (loading)
    return <p className="p-6 text-gray-600">Đang tải dữ liệu...</p>;

  if (error)
    return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Hỗ trợ khách hàng</h1>
        <p className="text-sm text-gray-600">
          Tổng: {totalRecords} ticket
        </p>
      </div>

      {/* Bộ lọc */}
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
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
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

      {/* Danh sách ticket */}
      {filteredTickets.length === 0 ? (
        <p className="text-gray-500 text-center">Không có ticket nào phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 text-lg">{ticket.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ticket.status === "Đã xử lý"
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
                  onClick={() => handleSendEmail(ticket)}
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

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-6 gap-3">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>

      {/* Popup chi tiết */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              {selectedTicket.title}
            </h2>
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
              {selectedTicket.content}
            </p>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p><strong>Email:</strong> {selectedTicket.email}</p>
              <p><strong>SĐT:</strong> {selectedTicket.phone}</p>
              <p><strong>Tài khoản:</strong> {selectedTicket.username}</p>
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
