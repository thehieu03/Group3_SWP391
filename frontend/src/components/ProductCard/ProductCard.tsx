import type { FC, ReactNode } from "react";
import Button from "../Button/Button";

export type ProductCardData = {
    id: string;
    name: string;
    seller: string;
    category: string;
    rating: number; // 0..5
    reviews: number;
    sold: number;
    complaintRate: number;
    stock: number;
    minPrice: number;
    maxPrice: number;
    descriptionItems: string[];
    imageLetter?: string;
    gradient?: string;
    leftExtra?: ReactNode; // optional badge stack area (top-left of image)
};

const Stars: FC<{ value: number }> = ({ value }) => {
    return (
        <span className="select-none text-[13px] leading-none">
            {"★★★★★".split("").map((s, i) => (
                <span key={i} className={i < value ? "text-amber-400" : "text-gray-300"}>{s}</span>
            ))}
        </span>
    );
};

const ProductCard: FC<{ product: ProductCardData; className?: string }> = ({ product, className }) => {
    return (
        <div className={`rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow ${className ?? ""}`}>
            <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-md text-white ${product.gradient ?? "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
                        <span className="text-lg font-bold">{product.imageLetter ?? "G"}</span>
                    </div>
                    {product.leftExtra && (
                        <div className="absolute -left-1 -top-1 flex flex-col gap-1">
                            {product.leftExtra}
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-[15px] font-bold text-emerald-700">{product.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                        <Stars value={product.rating} />
                        <span className="text-xs text-gray-500">{product.reviews} Reviews | Đã bán: {product.sold.toLocaleString()} | Khiếu nại: {product.complaintRate}%</span>
                    </div>

                    <div className="mt-1 text-[13px]">
                        <span className="text-gray-500">Người bán:</span>
                        <Button to="#" className="ml-1 px-0 text-blue-600 hover:underline">{product.seller}</Button>
                    </div>
                    <div className="text-[13px]">
                        <span className="text-gray-500">Sản phẩm:</span>
                        <span className="ml-1 text-emerald-600">{product.category}</span>
                    </div>

                    <div className="mt-2 text-[13px] text-gray-700">
                        {product.descriptionItems.slice(0, 2).map((line, idx) => (
                            <div key={idx} className="">• {line}</div>
                        ))}
                    </div>

                    <div className="my-2 h-px w-full bg-gray-100" />

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">Tồn kho: <span className="font-semibold text-gray-700">{product.stock}</span></div>
                        <div className="text-right text-sm font-bold text-gray-900">
                            {product.minPrice.toLocaleString()} đ - {product.maxPrice.toLocaleString()} đ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;


