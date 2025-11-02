import Image from "@/components/Image";

interface AvatarSectionProps {
  avatar: string | null;
  username: string;
  email: string;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarSection = ({
  avatar,
  username,
  email,
  isEditing,
  onAvatarChange,
}: AvatarSectionProps) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-600">
              {username?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 cursor-pointer hover:bg-green-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {username || "Chưa có tên"}
        </h2>
        <p className="text-gray-600">{email || "Chưa có email"}</p>
        {isEditing && (
          <p className="text-sm text-gray-500 mt-1">
            Nhấn vào icon + để thay đổi avatar
          </p>
        )}
      </div>
    </div>
  );
};

export default AvatarSection;
