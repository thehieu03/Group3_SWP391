import Button from "@components/Button/Button.tsx";
import type { SupportTicketResponse } from "@models/modelResponse/SupportTicketResponse.ts";

interface ReplyModalProps {
  ticket: SupportTicketResponse | null;
  replyMessage: string;
  sendingReply: boolean;
  onClose: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

const ReplyModal = ({
  ticket,
  replyMessage,
  sendingReply,
  onClose,
  onMessageChange,
  onSubmit,
}: ReplyModalProps) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Phản hồi ticket</h3>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={sendingReply}
          >
            ✕
          </Button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Gửi phản hồi đến:{" "}
            <span className="font-medium">{ticket.email}</span>
          </p>
          <textarea
            value={replyMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={6}
            placeholder="Nhập nội dung phản hồi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={sendingReply}
          >
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
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
  );
};

export default ReplyModal;
