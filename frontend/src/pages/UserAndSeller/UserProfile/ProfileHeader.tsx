import Button from "@/components/Button/Button.tsx";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditClick: () => void;
}

const ProfileHeader = ({ isEditing, onEditClick }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Thông tin cá nhân</h1>
      {!isEditing && (
        <Button
          onClick={onEditClick}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Chỉnh sửa
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;
