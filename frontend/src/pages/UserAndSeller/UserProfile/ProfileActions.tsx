import Button from "@/components/Button/Button.tsx";

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileActions = ({
  isSaving,
  onSave,
  onCancel,
}: ProfileActionsProps) => {
  return (
    <div className="flex space-x-4 pt-6 border-t">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className={`font-medium py-2 px-6 rounded-md transition-colors duration-200 ${
          isSaving
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
      <Button
        onClick={onCancel}
        disabled={isSaving}
        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Hủy
      </Button>
    </div>
  );
};

export default ProfileActions;
