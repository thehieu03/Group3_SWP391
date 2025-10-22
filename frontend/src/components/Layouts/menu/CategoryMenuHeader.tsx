import { type FC, useEffect, useState } from "react";
import type { CategoriesResponse } from "../../../models/modelResponse/CategoriesResponse";
import { categoryServices } from "../../../services/CategoryServices";
import TippyHeadless from "@tippyjs/react/headless";
import Tippy from "@tippyjs/react";
import type { Tools } from "../../../models/Tools.tsx";
import Button from "../../Button/Button.tsx";
import routesConfig from "../../../config/routesConfig.tsx";


const tools: Tools[] = [
  {
    id: 1,
    name: "2FA",
  },
  {
    id: 2,
    name: "Check Live Facebook",
  },
];
const MENU_ITEM_CLASS =
  "h-full px-4 flex items-center text-white font-medium cursor-pointer hover:bg-emerald-600/90 transition-colors";

const DROPDOWN_ITEM_CLASS =
  "block w-full text-left py-2 text-[15px] text-gray-700 hover:text-emerald-600 cursor-pointer transition-colors";

const DROPDOWN_CONTAINER_CLASS =
  "z-50 w-[300px] bg-white rounded-md shadow-xl ring-1 ring-black ring-black/5 p-6";

const ChevronIcon = () => (
  <svg
    className="ml-1 h-4 w-4 opacity-80"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
  </svg>
);

type CategoryMenuHeaderProps = {
  isLogin: boolean;
};

const CategoryMenuHeader: FC<CategoryMenuHeaderProps> = ({ isLogin }) => {
  const [categoriesItems, setCategoriesItems] = useState<CategoriesResponse[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await categoryServices.getAllCategoryAsync();
      setCategoriesItems(data);
    };
    void fetchData();
  }, []);
  
  const mid = Math.ceil(categoriesItems.length / 2);
  const firstCol = categoriesItems.slice(0, mid);
  const secondCol = categoriesItems.slice(mid);

  const DropdownContent = () => (
    <div className={DROPDOWN_CONTAINER_CLASS}>
      <div className="grid grid-cols-2 gap-x-12 gap-y-3">
        <div>
          {firstCol.map((item) => (
            <Button key={item.id} to={`/category/${item.id}`} className={DROPDOWN_ITEM_CLASS}>
              {item.name}
            </Button>
          ))}
        </div>
        <div>
          {secondCol.map((item) => (
            <Button key={item.id} to={`/category/${item.id}`} className={DROPDOWN_ITEM_CLASS}>
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const DropdownTools = () => (
    <div className={DROPDOWN_CONTAINER_CLASS}>
      <div className="grid gap-y-3">
        <div>
          {tools.map((item) => (
            <div key={item.id} className={DROPDOWN_ITEM_CLASS}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex items-center text-white font-medium cursor-pointer transition-colors gap-2">
      <TippyHeadless
        render={DropdownContent}
        interactive={true}
        offset={[0, 8]}
        placement="bottom-start"
        delay={[0, 100]}
        appendTo={() => document.body}
      >
        <div className={MENU_ITEM_CLASS}>
          Sản phẩm
          <ChevronIcon />
        </div>
      </TippyHeadless>

      <Tippy content="Hỗ trợ" placement="bottom-end">
        <Button to={routesConfig.support} className={MENU_ITEM_CLASS}>
          Hỗ trợ
        </Button>
      </Tippy>
      <Tippy content="Chia sẻ" placement="bottom-end">
        <Button to={routesConfig.share} className={MENU_ITEM_CLASS}>
          Chia sẻ
        </Button>
      </Tippy>

      <TippyHeadless
        render={DropdownTools}
        interactive={true}
        offset={[0, 8]}
        placement="bottom-start"
        delay={[0, 100]}
        appendTo={() => document.body}
      >
        <div className={MENU_ITEM_CLASS}>
          Công cụ
          <ChevronIcon />
        </div>
      </TippyHeadless>

      <Tippy content="FAQS" placement="bottom-end">
        <Button to={routesConfig.faqs} className={MENU_ITEM_CLASS}>
          FAQS
        </Button>
      </Tippy>

      {isLogin && (
        <Button to={routesConfig.deposit} className={MENU_ITEM_CLASS}>
          Nạp tiền
        </Button>
      )}
    </div>
  );
};

export default CategoryMenuHeader;
