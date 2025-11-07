## Cập nhật FE khi BE chuyển ảnh từ base64 sang URL

Mục tiêu: FE không gửi base64 nữa. FE gửi file ảnh qua multipart/form-data và nhận về URL ảnh để hiển thị.

API base URL ví dụ: `API_BASE`

---

### 1) Cập nhật Profile (Upload avatar)

- Endpoint: `PUT /api/accounts/profile`
- Yêu cầu: `multipart/form-data`
- Trường form:
  - `username` (string, optional)
  - `phone` (string, optional)
  - `avatar` (file, optional)

Ví dụ (React):

```tsx
function UpdateProfileForm() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    if (username) form.append("username", username);
    if (phone) form.append("phone", phone);
    if (avatar) form.append("avatar", avatar);

    await fetch(`${API_BASE}/api/accounts/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };

  return (
    <form onSubmit={submit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### 2) Tạo sản phẩm (Upload ảnh sản phẩm)

- Endpoint: `POST /api/products`
- Yêu cầu: `multipart/form-data`
- Trường form: các field của `ProductRequest` + `image` (file, optional)

Ví dụ (React):

```tsx
function CreateProductForm() {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", name);
    if (price !== "") form.append("price", String(price));
    if (image) form.append("image", image);

    await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="number"
        value={price}
        onChange={(e) =>
          setPrice(e.target.value === "" ? "" : Number(e.target.value))
        }
        placeholder="Price"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

Ràng buộc phía BE khi upload: `image/*`, kích thước ≤ 10MB.

---

### 3) Đăng ký shop (Upload 2 ảnh CMND/CCCD)

- Endpoint: `POST /api/shops/register`
- Yêu cầu: `multipart/form-data`
- Trường form (bắt buộc):
  - `name` (string)
  - `phone` (string)
  - `description` (string)
  - `identificationF` (file) – mặt trước
  - `identificationB` (file) – mặt sau

Ví dụ (React):

```tsx
function RegisterShopForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", name);
    form.append("phone", phone);
    form.append("description", description);
    if (front) form.append("identificationF", front);
    if (back) form.append("identificationB", back);

    await fetch(`${API_BASE}/api/shops/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  };

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Shop name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFront(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBack(e.target.files?.[0] || null)}
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

Ràng buộc phía BE khi upload: `image/*`, kích thước mỗi file ≤ 10MB.

---

### 4) Hiển thị ảnh từ URL trả về

- BE trả về `imageUrl` dạng đường dẫn tương đối: ví dụ `/Images/Accounts/xxx.jpg`.
- Nếu FE cùng origin với API: dùng trực tiếp.

```tsx
<img src={user.imageUrl ?? "/placeholder-avatar.png"} alt="avatar" />
```

- Nếu FE khác origin: ghép `API_BASE` + `imageUrl`.

```tsx
const src = user.imageUrl
  ? `${API_BASE}${user.imageUrl}`
  : "/placeholder-avatar.png";
<img src={src} alt="avatar" />;
```

---

### 5) Dọn dẹp FE cũ (từ base64 sang file)

- Bỏ các đoạn `FileReader`/`toBase64` và JSON chứa base64.
- Gửi `FormData` thay vì JSON; không set thủ công `Content-Type` (trình duyệt tự set khi dùng `FormData`).
- Với Axios:

```ts
await axios.put(`${API_BASE}/api/accounts/profile`, formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});
```

---

### 6) Mapping tên trường quan trọng

- Profile: `username`, `phone`, `avatar`
- Product: các field của `ProductRequest`, thêm `image`
- Shop register: `name`, `phone`, `description`, `identificationF`, `identificationB`

---

Ghi chú: BE đã lưu ảnh theo thư mục theo loại: `Accounts`, `Products`, `Shops`. Khi cập nhật ảnh mới, ảnh cũ (nếu có) sẽ được xóa.

---

## 7) Miêu tả thay đổi ở các API liên quan đến ảnh trả về

Mô tả dưới đây nêu rõ SỰ KHÁC NHAU giữa bản cũ (base64) và bản mới (URL) cho từng API liên quan ảnh.

### 7.1 Accounts

- GET danh sách/từng tài khoản: `GET /api/accounts` (OData) và các API trả `UserResponse`

  - Trước đây: field ảnh có thể là chuỗi base64 trong payload.
  - Hiện tại: trả về đường dẫn URL tương đối trong field `imageUrl`.
  - Ví dụ (mới):

  ```json
  {
    "id": 12,
    "username": "john",
    "email": "john@example.com",
    "imageUrl": "/Images/Accounts/2b1f...a7.jpg",
    "imageUploadedAt": "2025-11-05T12:34:56Z",
    "roles": ["USER"]
  }
  ```

  - Ghi chú: khi FE render cần ghép `API_BASE` nếu FE khác origin: `${API_BASE}${imageUrl}`.

- Cập nhật hồ sơ: `PUT /api/accounts/profile`

  - Input: multipart/form-data với `avatar` (file). Không còn nhận base64.
  - Output: hiện trả về `{ message: string }`. Ảnh mới được lưu và đường dẫn có thể xem khi gọi lại APIs lấy thông tin tài khoản (ví dụ `GET /api/accounts`).

- Đăng nhập/đăng ký Google: `POST /api/accounts/google`
  - Input: có thể gửi `image` là URL (không cần base64). BE tự tải và lưu vào `Accounts` nếu hợp lệ.
  - Output: trả `tokens`. Ảnh đã lưu sẽ hiển thị qua các API lấy tài khoản sau đó với `imageUrl` (URL tương đối).

### 7.2 Products

- Tạo sản phẩm: `POST /api/products`

  - Input: multipart/form-data, kèm `image` (file, optional). Không còn nhận base64.
  - Output: hiện trả về 200/400 không kèm body chi tiết. Ảnh đã lưu sẽ xuất hiện khi gọi APIs lấy sản phẩm.

- Lấy sản phẩm: `GET /api/products` (và các biến thể)
  - Trước đây: ảnh có thể là base64 trong `imageUrl`/`imageData` (tùy bản cũ).
  - Hiện tại: trả `ProductResponse` với `imageUrl` là URL tương đối.
  - Ví dụ (mới):
  ```json
  {
    "id": 101,
    "name": "iPhone 15",
    "imageUrl": "/Images/Products/8d93...ff.png",
    "imageUploadedAt": "2025-11-05T10:22:33Z",
    "minPrice": 1000,
    "maxPrice": 1200
  }
  ```

### 7.3 Shops

- Đăng ký shop: `POST /api/shops/register`

  - Input: multipart/form-data với 2 file: `identificationF`, `identificationB` (không nhận base64).
  - Output: `{ message, shopId }`. Ảnh CMND/CCCD đã lưu vào thư mục `Shops`.

- Lấy shop: `GET /api/shops`/`GET /api/shops/{id}` (trả `ShopResponse`)
  - Trước đây: có thể trả base64 các ảnh giấy tờ (tùy bản cũ).
  - Hiện tại: trả URL tương đối trong `identificationFurl`, `identificationBurl` (nếu có).
  - Ví dụ (mới):
  ```json
  {
    "id": 5,
    "name": "Tech Store",
    "ownerUsername": "john",
    "identificationFurl": "/Images/Shops/1234...front.jpg",
    "identificationBurl": "/Images/Shops/1234...back.jpg"
  }
  ```

---

### 7.4 Tóm tắt thay đổi chung (Response)

- KHÔNG còn trả base64 trong các field ảnh.
- CÁC field ảnh bây giờ là URL tương đối dạng: `/Images/{Category}/{FileName}`.
- FE cần hiển thị bằng `<img src={API_BASE + imageUrl} />` nếu khác origin, hoặc dùng trực tiếp `imageUrl` nếu cùng origin.
