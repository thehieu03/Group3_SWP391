import { useEffect, useState } from "react";
import Button from "@components/Button/Button";
import { FaFacebook, FaClock, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { supportTicketServices } from "@/services/SupportTicketServices";
import type { SupportTicketResponse } from "@/models/modelResponse/SupportTicketResponse";

export default function Share() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch admin OData list and display full attributes
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await supportTicketServices.getAllAdminAsync({
          top: 20,
          skip: 0,
          count: true,
          orderby: "createdAt desc",
        });
        setTickets(res.value || []);
        setTotal(res["@odata.count"]);
      } catch {
        // ignore for this demo section
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !subject || !content) {
        window.alert("Vui lòng nhập email, chủ đề và nội dung.");
        return;
      }

      await supportTicketServices.createAsync({
        email,
        phone: phone || undefined,
        title: subject,
        content,
      });

      window.alert("Đã gửi hỗ trợ. Chúng tôi sẽ phản hồi sớm nhất.");
      setEmail("");
      setPhone("");
      setSubject("");
      setContent("");
    } catch {
      window.alert("Gửi thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Liên hệ hỗ trợ */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Liên hệ hỗ trợ
          </h2>

          <ul className="space-y-4 text-green-700">
            <li>
              <a href="#faqs" className="hover:underline text-emerald-700">
                Câu hỏi thường gặp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaFacebook className="text-green-600" />
              <a href="#facebook" className="hover:underline text-emerald-700">
                Tạp hóa MMO
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaPaperPlane className="text-green-600" />
              <a href="#chat" className="hover:underline text-emerald-700">
                Chat với hỗ trợ viên
              </a>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <FaEnvelope />
              <span>support@taphoammo.net</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <FaClock />
              <span>Mon-Sat 08:00am - 10:00pm</span>
            </li>
          </ul>

          <p className="mt-6 text-sm text-gray-600 leading-6">
            Nhân viên hỗ trợ của chúng tôi sẽ cố gắng xử lý khiếu nại và giải
            quyết thắc mắc của các bạn nhanh nhất có thể.
          </p>
        </div>

        {/* Right: Form */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Tin nhắn
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Số điện thoại"
                className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              type="text"
              placeholder="Chủ đề"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Nội dung"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <Button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Gửi
            </Button>
          </form>
        </div>
      </div>

      {/* Admin OData list preview */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Danh sách ticket (OData)
        </h2>
        {loading ? (
          <div className="text-gray-600">Đang tải...</div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Tổng (odata.count): {total ?? tickets.length}
            </div>
            <div className="space-y-4">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        #{t.id} - {t.title}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        <div>
                          <strong>Email:</strong> {t.email}
                        </div>
                        {t.phone && (
                          <div>
                            <strong>SĐT:</strong> {t.phone}
                          </div>
                        )}
                        <div>
                          <strong>Trạng thái:</strong> {t.status}
                        </div>
                        <div>
                          <strong>Thời gian:</strong> {t.createdAt}
                        </div>
                        {typeof t.accountId === "number" && (
                          <div>
                            <strong>AccountId:</strong> {t.accountId}
                          </div>
                        )}
                        {t.account && (
                          <div className="mt-1">
                            <strong>Tài khoản:</strong> {t.account.username} (
                            {t.account.email})
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded p-3 mt-3 text-sm text-gray-800">
                        {t.content}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
