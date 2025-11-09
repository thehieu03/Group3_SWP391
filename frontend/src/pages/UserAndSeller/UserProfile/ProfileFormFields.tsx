interface ProfileFormFieldsProps {
  formData: {
    username: string;
    email: string;
    phone: string;
  };
  isEditing: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ProfileFormFields = ({
  formData,
  isEditing,
  onInputChange,
}: ProfileFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên đăng nhập
        </label>
        {isEditing ? (
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập tên đăng nhập"
          />
        ) : (
          <p className="text-gray-900 py-2">
            {formData.username || "Chưa có thông tin"}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <p className="text-gray-900 py-2">
          {formData.email || "Chưa có thông tin"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại
        </label>
        {isEditing ? (
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập số điện thoại"
          />
        ) : (
          <p className="text-gray-900 py-2">
            {formData.phone || "Chưa có thông tin"}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileFormFields;
