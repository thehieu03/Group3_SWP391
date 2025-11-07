import type { ReactNode } from "react";

interface AdminLayoutNoHeaderProps {
  children?: ReactNode;
}

const AdminLayoutNoHeader = ({ children }: AdminLayoutNoHeaderProps) => {
  return <>{children}</>;
};

export default AdminLayoutNoHeader;
