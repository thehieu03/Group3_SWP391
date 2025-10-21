import type {FC} from "react";

type SidebarProps = {
    types:boolean;
};
const Sidebar:FC<SidebarProps> = ({types}) => {
    return (
        <div>
            {types&&<h1>Sidebar</h1>}
        </div>
    );
};

export default Sidebar;