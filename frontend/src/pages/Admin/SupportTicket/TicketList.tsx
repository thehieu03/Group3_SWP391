import type { SupportTicketResponse } from "@models/modelResponse/SupportTicketResponse.ts";
import TicketCard from "./TicketCard.tsx";

interface TicketListProps {
  tickets: SupportTicketResponse[];
  searchTerm: string;
  updatingId: number | null;
  onViewDetail: (ticket: SupportTicketResponse) => void;
  onReply: (ticket: SupportTicketResponse) => void;
  onClose: (id: number) => void;
  onClearSearch: () => void;
}

const TicketList = ({
  tickets,
  searchTerm,
  updatingId,
  onViewDetail,
  onReply,
  onClose,
  onClearSearch,
}: TicketListProps) => {
  if (tickets.length === 0) {
    return (
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
            onClick={onClearSearch}
            className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          updatingId={updatingId}
          onViewDetail={onViewDetail}
          onReply={onReply}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default TicketList;
