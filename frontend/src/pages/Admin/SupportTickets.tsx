import { useState, useEffect } from 'react';
import type { SupportTicketResponse } from '../../models/modelResponse/SupportTicketResponse';

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    setTimeout(() => {
      setTickets([
        {
          id: 1,
          accountId: 1,
          email: 'user1@example.com',
          phone: '0123456789',
          title: 'Không thể đăng nhập',
          content: 'Tôi không thể đăng nhập vào tài khoản của mình. Hệ thống báo lỗi "Invalid credentials".',
          createdAt: '2024-01-15T10:30:00Z',
          account: {
            id: 1,
            username: 'user1',
            email: 'user1@example.com'
          }
        },
        {
          id: 2,
          accountId: 2,
          email: 'seller1@example.com',
          phone: '0987654321',
          title: 'Vấn đề với thanh toán',
          content: 'Tôi đã thanh toán nhưng đơn hàng vẫn chưa được xử lý. Số tiền đã bị trừ khỏi tài khoản.',
          createdAt: '2024-01-14T15:45:00Z',
          account: {
            id: 2,
            username: 'seller1',
            email: 'seller1@example.com'
          }
        },
        {
          id: 3,
          email: 'anonymous@example.com',
          phone: '0555666777',
          title: 'Hỏi về chính sách hoàn tiền',
          content: 'Tôi muốn biết chính sách hoàn tiền của shop. Trong trường hợp nào thì được hoàn tiền?',
          createdAt: '2024-01-13T09:20:00Z'
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleReply = (ticketId: number) => {
    console.log('Replying to ticket:', ticketId);
  };

  const handleClose = (ticketId: number) => {
    console.log('Closing ticket:', ticketId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
        <div className="text-sm text-gray-600">
          Tổng: {tickets.length} ticket
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc email..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Chờ xử lý
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Email:</strong> {ticket.email}</p>
                  {ticket.phone && <p><strong>SĐT:</strong> {ticket.phone}</p>}
                  {ticket.account && <p><strong>Tài khoản:</strong> {ticket.account.username}</p>}
                  <p><strong>Thời gian:</strong> {formatDate(ticket.createdAt || '')}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <p className="text-sm text-gray-700">{ticket.content}</p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => setSelectedTicket(ticket)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => handleReply(ticket.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                >
                  Trả lời
                </button>
                <button
                  onClick={() => handleClose(ticket.id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  Đóng ticket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chi tiết ticket</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Tiêu đề</h4>
                <p className="text-gray-700">{selectedTicket.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Thông tin liên hệ</h4>
                <div className="text-sm text-gray-700">
                  <p>Email: {selectedTicket.email}</p>
                  {selectedTicket.phone && <p>SĐT: {selectedTicket.phone}</p>}
                  {selectedTicket.account && (
                    <p>Tài khoản: {selectedTicket.account.username} ({selectedTicket.account.email})</p>
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
                <p className="text-gray-700">{formatDate(selectedTicket.createdAt || '')}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Đóng
              </button>
              <button
                onClick={() => handleReply(selectedTicket.id)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Trả lời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
