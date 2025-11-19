import Button from "@components/Button/Button.tsx";
import type { SupportTicketResponse } from "@models/modelResponse/SupportTicketResponse.ts";
import { formatDate } from "@/helpers";

interface TicketCardProps {
  ticket: SupportTicketResponse;
  updatingId: number | null;
  onViewDetail: (ticket: SupportTicketResponse) => void;
  onReply: (ticket: SupportTicketResponse) => void;
  onClose: (id: number) => void;
}

const TicketCard = ({
  ticket,
  updatingId,
  onViewDetail,
  onReply,
  onClose,
}: TicketCardProps) => {
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusClasses =
      status === "PENDING"
        ? "bg-yellow-100 text-yellow-800"
        : status === "PROCESSING"
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-800";

    const statusText =
      status === "PENDING"
        ? "Chờ xử lý"
        : status === "PROCESSING"
        ? "Đang xử lý"
        : "Đã đóng";

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses}`}
      >
        {statusText}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {ticket.title}
            </h3>
            {getStatusBadge(ticket.status)}
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
              <strong>Thời gian:</strong> {formatDate(ticket.createdAt || "")}
            </p>
          </div>

          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-700">{ticket.content}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <Button
            onClick={() => onViewDetail(ticket)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Xem chi tiết
          </Button>
          {ticket.status !== "CLOSED" && ticket.status !== "PROCESSING" && (
            <Button
              onClick={() => onReply(ticket)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              Trả lời
            </Button>
          )}
          <Button
            onClick={() => onClose(ticket.id)}
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
  );
};

export default TicketCard;
