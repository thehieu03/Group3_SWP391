interface ProfileMessageProps {
  message: {
    type: "success" | "error";
    text: string;
  } | null;
}

const ProfileMessage = ({ message }: ProfileMessageProps) => {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-md ${
        message.type === "success"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      {message.text}
    </div>
  );
};

export default ProfileMessage;
