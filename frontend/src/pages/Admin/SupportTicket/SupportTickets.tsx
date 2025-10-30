import { useState, useEffect } from "react";
import type {
  SupportTicketResponse,
  SupportTicketStatsResponse,
  TicketStatus,
} from "@models/modelResponse/SupportTicketResponse.ts";
import Button from "@components/Button/Button.tsx";
import { formatDate } from "@/helpers";
import { adminSupportTicketServices } from "@services/AdminSupportTicketServices.ts";

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SupportTicketStatsResponse>({
    totalTickets: 0,
    pending: 0,
    processing: 0,
    closed: 0,
  });
  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicketResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [replyingTicket, setReplyingTicket] =
    useState<SupportTicketResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // OData params removed (backend endpoint returns a wrapper; we filter client-side)

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminSupportTicketServices.getAllTicketsAsync();
      setTickets(res.value);
      setStats(res.stats);
    } catch (err) {
      console.error("Error fetching support tickets:", err);
      setError("Không thể tải danh sách ticket. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  // Client-side filtering & pagination
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  const filteredTickets = tickets.filter((t) => {
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch =
      s === "" ||
      t.title.toLowerCase().includes(s) ||
      t.content.toLowerCase().includes(s) ||
      t.email.toLowerCase().includes(s);
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // no-op placeholder removed

  const submitReply = async () => {
    if (!replyingTicket || !replyMessage.trim()) return;
    try {
      setSendingReply(true);
      await adminSupportTicketServices.postReplyAsync(replyingTicket.id, {
        message: replyMessage.trim(),
      });
      // Optional: move to PROCESSING after reply
      await updateTicketStatus(replyingTicket.id, "PROCESSING");
      setReplyMessage("");
      setReplyingTicket(null);
    } catch (e) {
      console.error("Reply failed", e);
      setError("Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setSendingReply(false);
    }
  };

  const refreshData = async () => {
    const res = await adminSupportTicketServices.getAllTicketsAsync();
    setTickets(res.value);
    setStats(res.stats);
  };

  const updateTicketStatus = async (id: number, status: TicketStatus) => {
    try {
      setUpdatingId(id);
      await adminSupportTicketServices.updateStatusAsync(id, status);
      await refreshData();
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (e) {
      console.error("Update status failed", e);
      setError("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số ticket
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalTickets}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.processing}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã đóng</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {stats.closed}
              </p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="flex items-center flex-1 space-x-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc email..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trạng thái</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | TicketStatus)
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Đang lọc theo từ khóa
          </div>
        )}
      </div>

      {/* Controls: page size + range (client-side) */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
          <span className="text-sm text-gray-600">bản ghi mỗi trang</span>
        </div>
        <div className="text-sm text-gray-600">
          {totalItems > 0
            ? `Hiển thị ${startIndex} - ${endIndex} trên ${totalItems} bản ghi`
            : "Không có bản ghi"}
        </div>
      </div>

      <div className="space-y-4">
        {paginatedTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "Không tìm thấy ticket nào" : "Không có ticket nào"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Chưa có ticket nào trong hệ thống"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          paginatedTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {ticket.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : ticket.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.status === "PENDING"
                        ? "Chờ xử lý"
                        : ticket.status === "PROCESSING"
                        ? "Đang xử lý"
                        : "Đã đóng"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>
                      <strong>Email:</strong> {ticket.email}
                    </p>
                    {ticket.phone && (
                      <p>
                        <strong>SĐT:</strong> {ticket.phone}
                      </p>
                    )}
                    {ticket.account && (
                      <p>
                        <strong>Tài khoản:</strong> {ticket.account.username}
                      </p>
                    )}
                    <p>
                      <strong>Thời gian:</strong>{" "}
                      {formatDate(ticket.createdAt || "")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <p className="text-sm text-gray-700">{ticket.content}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Xem chi tiết
                  </Button>
                  {ticket.status !== "CLOSED" &&
                    ticket.status !== "PROCESSING" && (
                      <Button
                        onClick={() => setReplyingTicket(ticket)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                      >
                        Trả lời
                      </Button>
                    )}
                  <Button
                    onClick={() => updateTicketStatus(ticket.id, "CLOSED")}
                    className={`px-4 py-2 text-white rounded-md text-sm ${
                      updatingId === ticket.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                    disabled={updatingId === ticket.id}
                  >
                    {updatingId === ticket.id ? "Đang đóng..." : "Đóng ticket"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (client-side) */}
      {totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border text-sm ${
                page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Trước
            </button>
            {(() => {
              const start = Math.max(1, page - 2);
              const end = Math.min(totalPages, page + 2);
              const pages: number[] = [];
              for (let p = start; p <= end; p++) pages.push(p);
              return pages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1 rounded-md border text-sm ${
                    page === pageNumber
                      ? "bg-green-500 text-white border-green-500"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ));
            })()}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border text-sm ${
                page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Phản hồi ticket
              </h3>
              <Button
                onClick={() => {
                  if (!sendingReply) {
                    setReplyingTicket(null);
                    setReplyMessage("");
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Gửi phản hồi đến:{" "}
                <span className="font-medium">{replyingTicket.email}</span>
              </p>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                placeholder="Nhập nội dung phản hồi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  if (!sendingReply) {
                    setReplyingTicket(null);
                    setReplyMessage("");
                  }
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </Button>
              <Button
                onClick={submitReply}
                className={`px-4 py-2 text-white rounded-md ${
                  sendingReply
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                disabled={sendingReply || !replyMessage.trim()}
              >
                {sendingReply ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Chi tiết ticket
              </h3>
              <Button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Tiêu đề</h4>
                <p className="text-gray-700">{selectedTicket.title}</p>
              </div>

              {selectedTicket.status && (
                <div>
                  <h4 className="font-medium text-gray-900">Trạng thái</h4>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTicket.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedTicket.status === "PROCESSING"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedTicket.status === "PENDING"
                      ? "Chờ xử lý"
                      : selectedTicket.status === "PROCESSING"
                      ? "Đang xử lý"
                      : "Đã đóng"}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">Thông tin liên hệ</h4>
                <div className="text-sm text-gray-700">
                  <p>Email: {selectedTicket.email}</p>
                  {selectedTicket.phone && <p>SĐT: {selectedTicket.phone}</p>}
                  {selectedTicket.account && (
                    <p>
                      Tài khoản: {selectedTicket.account.username} (
                      {selectedTicket.account.email})
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Nội dung</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-gray-700">{selectedTicket.content}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Thời gian tạo</h4>
                <p className="text-gray-700">
                  {formatDate(selectedTicket.createdAt || "")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Đóng
              </Button>
              {selectedTicket.status !== "CLOSED" &&
                selectedTicket.status !== "PROCESSING" && (
                  <Button
                    onClick={() => setReplyingTicket(selectedTicket)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Trả lời
                  </Button>
                )}
              <Button
                onClick={() => updateTicketStatus(selectedTicket.id, "CLOSED")}
                className={`px-4 py-2 text-white rounded-md ${
                  updatingId === selectedTicket.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
                disabled={updatingId === selectedTicket.id}
              >
                {updatingId === selectedTicket.id
                  ? "Đang đóng..."
                  : "Đóng ticket"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
