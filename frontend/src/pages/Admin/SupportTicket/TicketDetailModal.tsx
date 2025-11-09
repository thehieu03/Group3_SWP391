import Button from "@components/Button/Button.tsx";
import type {
  SupportTicketResponse,
  TicketStatus,
} from "@models/modelResponse/SupportTicketResponse.ts";
import { formatDate } from "@/helpers";

interface TicketDetailModalProps {
  ticket: SupportTicketResponse | null;
  updatingId: number | null;
  onClose: () => void;
  onReply: (ticket: SupportTicketResponse) => void;
  onCloseTicket: (id: number) => void;
}

const TicketDetailModal = ({
  ticket,
  updatingId,
  onClose,
  onReply,
  onCloseTicket,
}: TicketDetailModalProps) => {
  if (!ticket) return null;

  const getStatusBadge = (status?: TicketStatus) => {
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
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusClasses}`}
      >
        {statusText}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Chi tiết ticket</h3>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Tiêu đề</h4>
            <p className="text-gray-700">{ticket.title}</p>
          </div>

          {ticket.status && (
            <div>
              <h4 className="font-medium text-gray-900">Trạng thái</h4>
              {getStatusBadge(ticket.status)}
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-900">Thông tin liên hệ</h4>
            <div className="text-sm text-gray-700">
              <p>Email: {ticket.email}</p>
              {ticket.phone && <p>SĐT: {ticket.phone}</p>}
              {ticket.account && (
                <p>
                  Tài khoản: {ticket.account.username} ({ticket.account.email})
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Nội dung</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-gray-700">{ticket.content}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Thời gian tạo</h4>
            <p className="text-gray-700">
              {formatDate(ticket.createdAt || "")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Đóng
          </Button>
          {ticket.status !== "CLOSED" && ticket.status !== "PROCESSING" && (
            <Button
              onClick={() => onReply(ticket)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Trả lời
            </Button>
          )}
          <Button
            onClick={() => onCloseTicket(ticket.id)}
            className={`px-4 py-2 text-white rounded-md ${
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

export default TicketDetailModal;
