import { useAuth } from "@/hooks/useAuth";
import Button from "@components/Button/Button";
import Image from "@/components/Image";
import { useRef, useState } from "react";
import { shopServices } from "@services/ShopServices.ts";
import type { RegisterShopRequest } from "@models/modelRequest/RegisterShopRequest";
import { useNavigate } from "react-router-dom";
import routesConfig from "@config/routesConfig.ts";

export default function RegisterShop() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);
  const handleFile = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (s: string) => void
  ) => {
    if (!file) {
      setFile(null);
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview((e.target?.result as string) || "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!name.trim() || !phone.trim() || !description.trim()) {
      setMessage("Vui lòng nhập đầy đủ tên shop, số điện thoại và miêu tả");
      return;
    }
    if (!frontFile || !backFile) {
      setMessage("Vui lòng tải lên đủ 2 ảnh CMND/CCCD (mặt trước và mặt sau)");
      return;
    }
    try {
      setSubmitting(true);
      const payload: RegisterShopRequest = {
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim(),
        identificationF: frontFile as File,
        identificationB: backFile as File,
      };
      await shopServices.registerShopAsync(payload);
      window.alert("Đăng ký shop thành công, chờ duyệt");
      navigate(routesConfig.home);
      setName("");
      setPhone("");
      setDescription("");
      setFrontFile(null);
      setBackFile(null);
      setFrontPreview("");
      setBackPreview("");
    } catch {
      setMessage("Gửi đăng ký thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 mb-4 text-amber-800">
          Vui lòng đăng nhập để đăng ký bán hàng.
        </div>
        <Button
          to="/login"
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký bán hàng</h1>
      <div className="rounded-md bg-white shadow p-4 space-y-4">
        {message && (
          <div className="text-sm p-2 rounded border border-gray-200 text-gray-700">
            {message}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên shop
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Nhập tên shop"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miêu tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            placeholder="Mô tả về shop của bạn"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CMND/CCCD - Mặt trước
            </label>
            <div className="border rounded p-2 bg-gray-50">
              <div
                className="mb-2 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => frontInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    frontInputRef.current?.click();
                }}
              >
                <Image
                  src={frontPreview}
                  alt="Front"
                  className="w-full h-52 object-contain"
                />
              </div>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFile(
                    e.target.files?.[0] ?? null,
                    setFrontFile,
                    setFrontPreview
                  )
                }
              />
              <Button
                className="mt-2"
                onClick={() => frontInputRef.current?.click()}
              >
                Chọn ảnh
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CMND/CCCD - Mặt sau
            </label>
            <div className="border rounded p-2 bg-gray-50">
              <div
                className="mb-2 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => backInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    backInputRef.current?.click();
                }}
              >
                <Image
                  src={backPreview}
                  alt="Back"
                  className="w-full h-52 object-contain"
                />
              </div>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleFile(
                    e.target.files?.[0] ?? null,
                    setBackFile,
                    setBackPreview
                  )
                }
              />
              <Button
                className="mt-2"
                onClick={() => backInputRef.current?.click()}
              >
                Chọn ảnh
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Đang gửi..." : "Gửi đăng ký"}
          </Button>
        </div>
      </div>
    </div>
  );
}
