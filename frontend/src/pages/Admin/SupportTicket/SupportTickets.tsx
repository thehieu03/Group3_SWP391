import { useState, useEffect } from "react";
import type {
  SupportTicketResponse,
  SupportTicketStatsResponse,
  TicketStatus,
} from "@models/modelResponse/SupportTicketResponse.ts";
import { adminSupportTicketServices } from "@services/AdminSupportTicketServices.ts";
import TicketStats from "./TicketStats.tsx";
import TicketFilters from "./TicketFilters.tsx";
import TicketList from "./TicketList.tsx";
import PageSizeControl from "./PageSizeControl.tsx";
import PaginationControls from "./PaginationControls.tsx";
import ReplyModal from "./ReplyModal.tsx";
import TicketDetailModal from "./TicketDetailModal.tsx";

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

  const handleCloseReplyModal = () => {
    if (!sendingReply) {
      setReplyingTicket(null);
      setReplyMessage("");
    }
  };

  const handleReplyFromDetail = () => {
    if (selectedTicket) {
      setReplyingTicket(selectedTicket);
      setSelectedTicket(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
      </div>

      <TicketStats stats={stats} />

      <TicketFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
      />

      <PageSizeControl
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <TicketList
        tickets={paginatedTickets}
        searchTerm={searchTerm}
        updatingId={updatingId}
        onViewDetail={setSelectedTicket}
        onReply={setReplyingTicket}
        onClose={(id) => updateTicketStatus(id, "CLOSED")}
        onClearSearch={() => setSearchTerm("")}
      />

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ReplyModal
        ticket={replyingTicket}
        replyMessage={replyMessage}
        sendingReply={sendingReply}
        onClose={handleCloseReplyModal}
        onMessageChange={setReplyMessage}
        onSubmit={submitReply}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        updatingId={updatingId}
        onClose={() => setSelectedTicket(null)}
        onReply={handleReplyFromDetail}
        onCloseTicket={(id) => updateTicketStatus(id, "CLOSED")}
      />
    </div>
  );
};

export default SupportTickets;
