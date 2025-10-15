import type { FC } from "react";
// import Image from "../../components/Image";
import Button from "../../components/Button/Button";
import ProductCard from "../../components/ProductCard/ProductCard";
import type { ProductCardData } from "../../components/ProductCard/ProductCard";

type Product = ProductCardData;

const mockProducts: Product[] = [
    {
        id: "1",
        name: "Gmail NEW - Live Strong - Random IP",
        seller: "nhaianhvn8",
        category: "Gmail",
        rating: 4,
        reviews: 2348,
        sold: 5074441,
        complaintRate: 0,
        stock: 64717,
        minPrice: 3000,
        maxPrice: 4300,
        descriptionItems: [
            "Gmail Live trâu",
            "GMAIL NEW 7-30 days | Random IP",
        ],
        imageLetter: "M",
        gradient: "bg-gradient-to-br from-black via-zinc-700 to-zinc-500",
    },
    {
        id: "2",
        name: "Gmail New SLL Mỗi Ngày | Giá Rẻ - Live Trâu - Chưa Qua Dịch Vụ",
        seller: "shopnhung",
        category: "Gmail",
        rating: 3,
        reviews: 6,
        sold: 1455,
        complaintRate: 0.4,
        stock: 127,
        minPrice: 1,
        maxPrice: 2900,
        descriptionItems: [
            "Hoàn tiền với mỗi đánh giá",
            "Gmail VN New | Ngâm >15 ngày",
        ],
        imageLetter: "M",
        gradient:
            "bg-[conic-gradient(at_50%_50%,#4285f4,#34a853,#ea4335,#fbbc05,#4285f4)]",
    },
    {
        id: "3",
        name: "Gmail VN Trắng | Reg Tay Phone Thật",
        seller: "liam_ccqkm2",
        category: "Gmail",
        rating: 0,
        reviews: 0,
        sold: 39,
        complaintRate: 0,
        stock: 36,
        minPrice: 1000,
        maxPrice: 8000,
        descriptionItems: [
            "Gmail VN Trắng | Reg tay trên Phone khác nhau",
            "Android, iOS | IP khác nhau",
        ],
        imageLetter: "G",
        gradient:
            "bg-[conic-gradient(at_50%_50%,#4285f4,#ea4335,#34a853,#fbbc05,#4285f4)]",
    },
    {
        id: "4",
        name: "Yahoo Mail Premium - Live Strong - 2FA Enabled",
        seller: "mailprovider",
        category: "YahooMail",
        rating: 4,
        reviews: 45,
        sold: 892,
        complaintRate: 0.2,
        stock: 156,
        minPrice: 5000,
        maxPrice: 12000,
        descriptionItems: [
            "Yahoo Mail 2FA bảo mật cao",
            "Premium | Business | Plus Storage",
        ],
        imageLetter: "YAHOO",
        gradient: "bg-gradient-to-br from-indigo-400 to-purple-700",
    },
];

const Products: FC = () => {
    return (
        <div className="mx-auto max-w-6xl px-4 py-5">
            <div className="mb-4 rounded-lg bg-white p-4 shadow">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full rounded-md border-2 border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500"
                    />
                    <Button className="w-full rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 md:w-auto">
                        Tìm kiếm
                    </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-b border-gray-200 pb-2 text-sm">
                    <Button className="rounded-md px-3 py-2 font-medium text-emerald-600">
                        Phổ biến
                    </Button>
                    <Button className="rounded-md px-3 py-2 text-gray-600 hover:text-emerald-600">
                        Giá tăng dần
                    </Button>
                    <Button className="rounded-md px-3 py-2 text-gray-600 hover:text-emerald-600">
                        Giá giảm dần
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-5 md:flex-row">
                <aside className="w-full shrink-0 md:w-64">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <h3 className="mb-1 text-lg font-semibold text-gray-800">Bộ lọc</h3>
                        <p className="mb-3 text-sm text-gray-500">Chọn 1 hoặc nhiều danh mục</p>
                        <div className="flex flex-col gap-2 text-sm">
                            {[
                                ["gmail", "Gmail"],
                                ["hotmail", "HotMail"],
                                ["outlook", "OutlookMail"],
                                ["rumail", "RuMail"],
                                ["domain", "DomainMail"],
                                ["yahoo", "YahooMail"],
                                ["proton", "ProtonMail"],
                                ["other", "Loại Mail Khác"],
                            ].map(([id, label]) => (
                                <label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-2">
                                    <input id={id} type="checkbox" className="h-4 w-4" defaultChecked={id === "gmail"} />
                                    <span className="text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                        <Button className="mt-3 w-full rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 md:w-auto">
                            Tìm kiếm
                        </Button>
                    </div>
                </aside>

                <section className="min-w-0 flex-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mockProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Products;


