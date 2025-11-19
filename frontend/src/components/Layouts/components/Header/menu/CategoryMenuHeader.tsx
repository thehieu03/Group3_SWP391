import { type FC, useEffect, useState } from "react";
import type { CategoriesResponse } from "@models/modelResponse/CategoriesResponse.ts";
import { categoryServices } from "@services/CategoryServices.ts";
import TippyHeadless from "@tippyjs/react/headless";
import Tippy from "@tippyjs/react";
import type { Tools } from "@models/Tools.ts";
import Button from "@components/Button/Button.tsx";
import routesConfig from "@config/routesConfig.ts";

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
  "block w-full text-left py-1.5 px-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors";

const DROPDOWN_CONTAINER_CLASS =
  "z-50 w-[400px] bg-white rounded-md shadow-xl ring-1 ring-black ring-black/5 p-6 max-h-[500px] overflow-y-auto";

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

  // Function to refresh categories
  const refreshCategories = async () => {
    try {
      const data = await categoryServices.getAllCategoryAsync();
      // Filter out inactive categories for the menu
      const activeCategories = data.filter((category) => category.isActive);
      setCategoriesItems(activeCategories);
    } catch {
      // Error refreshing categories
    }
  };

  useEffect(() => {
    void refreshCategories();
  }, []);

  // Listen for category updates from admin page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "categoryUpdated" && e.newValue) {
        refreshCategories();
        localStorage.removeItem("categoryUpdated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const mid = Math.ceil(categoriesItems.length / 2);
  const firstCol = categoriesItems.slice(0, mid);
  const secondCol = categoriesItems.slice(mid);

  const DropdownContent = () => (
    <div className={DROPDOWN_CONTAINER_CLASS}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Danh mục sản phẩm
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <div className="space-y-1">
          {firstCol.map((item) => (
            <Button
              key={item.id}
              to={`/category/${item.id}`}
              className={DROPDOWN_ITEM_CLASS}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <div className="space-y-1">
          {secondCol.map((item) => (
            <Button
              key={item.id}
              to={`/category/${item.id}`}
              className={DROPDOWN_ITEM_CLASS}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>
      {categoriesItems.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">Đang tải danh mục...</p>
        </div>
      )}
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
        <Tippy content="Nạp tiền" placement="bottom-end">
          <Button to={routesConfig.deposit} className={MENU_ITEM_CLASS}>
            Nạp tiền
          </Button>
        </Tippy>
      )}
    </div>
  );
};

export default CategoryMenuHeader;
