import  {type FormEvent, useState} from 'react';
import logoMenu from "../../assets/logoMenu.jpg";
import Button from "../Button/Button.tsx";
import {FaSearch} from "react-icons/fa";
import TippyHeadless from "@tippyjs/react/headless";

const HomeSearch = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: wire this to your real search action
        console.log("Searching for:", searchQuery);
    };
    return (
        <div>
            {/*search*/}
            <TippyHeadless interactive={true} offset={[0, 8]} placement="bottom-end" delay={[0, 100]} appendTo={() => document.body}>
                <div className="relative w-full">
                    <img
                        src={logoMenu}
                        alt="Menu background"
                        className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="w-full max-w-5xl">
                            {/* Search form */}
                            <form
                                onSubmit={handleSearchSubmit}
                                className="mx-auto w-full max-w-3xl"
                            >
                                <div className="flex items-stretch gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm sản phẩm"
                                        className="flex-1 rounded-md border border-gray-300 bg-white/95 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-400"
                                        aria-label="Từ khóa tìm kiếm"
                                    />
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
            </TippyHeadless>
            {/* Search from end */}
        </div>
    );
};

export default HomeSearch;
