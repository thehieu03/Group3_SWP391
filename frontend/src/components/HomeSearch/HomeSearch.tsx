import { type FormEvent, useState, useEffect, useRef } from "react";
import logoMenu from "../../assets/logoMenu.jpg";
import Button from "../Button/Button.tsx";
import { FaSearch } from "react-icons/fa";
import TippyHeadless from "@tippyjs/react/headless";
import { useDebounce } from "../../hooks";
import { productServices } from "../../services/ProductServices";
import type { ProductResponse } from "../../models/modelResponse/ProductResponse";
import HomeSearchItem from "./HomeSearchItem";
import { useNavigate } from "react-router-dom";
import routesConfig from "../../config/routesConfig";
import Image from "../Image";

const HomeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (
        debouncedSearchTerm.length > 0 &&
        debouncedSearchTerm.charAt(0) === " "
      ) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (debouncedSearchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await productServices.searchProductsAsync(
            debouncedSearchTerm.trim()
          );
          setSearchResults(results);
          setShowResults(true);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    void searchProducts();
  }, [debouncedSearchTerm]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(routesConfig.getProductUrl(searchResults[0].id));
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(routesConfig.getProductUrl(productId));
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const trimmedValue = value.trimStart();
    if (trimmedValue.length === 0 && value.length > 0) {
      return;
    }
    setSearchQuery(trimmedValue);
  };
  useEffect(() => {
    const updateInputWidth = () => {
      if (inputRef.current) {
        setInputWidth(inputRef.current.offsetWidth);
      }
    };

    updateInputWidth();
    window.addEventListener("resize", updateInputWidth);

    return () => {
      window.removeEventListener("resize", updateInputWidth);
    };
  }, []);

  return (
    <div>
      <div className="relative w-full">
        <Image
          src={logoMenu}
          alt="Menu background"
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full max-w-5xl">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto w-full max-w-3xl"
            >
              <div className="flex items-stretch gap-2">
                <TippyHeadless
                  interactive={true}
                  offset={[0, 4]}
                  placement="bottom-start"
                  delay={[0, 100]}
                  visible={showResults && searchResults.length > 0}
                  render={(attrs) => (
                    <div
                      {...attrs}
                      className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
                      style={{
                        width: inputWidth > 0 ? `${inputWidth}px` : "100%",
                      }}
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          Đang tìm kiếm...
                        </div>
                      ) : (
                        searchResults.map((product) => (
                          <HomeSearchItem
                            key={product.id}
                            product={product}
                            onClick={() => handleProductClick(product.id)}
                          />
                        ))
                      )}
                    </div>
                  )}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowResults(true);
                      }
                    }}
                    placeholder="Tìm sản phẩm"
                    className="flex-1 rounded-md border border-gray-300 bg-white/95 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-400"
                    aria-label="Từ khóa tìm kiếm"
                  />
                </TippyHeadless>
                <Button
                  leftIcon={<FaSearch />}
                  className="whitespace-nowrap rounded-md bg-green-600 px-6 py-3 cursor-pointer font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSearch;
