import React, { useState, useMemo } from "react";

export default function ProductList() {
    const initialProducts = [
        {
            id: 1,
            image: "https://via.placeholder.com/80",
            name: "Email",
            shop: "Thanhthanh",
            createdAt: "2025-10-10",
            description: "Email free",
        },
        {
            id: 2,
            image: "https://via.placeholder.com/80",
            name: "ChatGPT",
            shop: "Bean",
            createdAt: "2025-09-25",
            description: "ChatGPT 1 month",
        },

    ];

    const [products, setProducts] = useState(initialProducts);
    const [searchShop, setSearchShop] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [sortDir, setSortDir] = useState("asc");

    const filtered = useMemo(() => {
        let list = products.filter((p) =>
            p.shop.toLowerCase().includes(searchShop.toLowerCase())
        );

        if (sortBy === "name") {
            list.sort((a, b) =>
                sortDir === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            );
        } else if (sortBy === "createdAt") {
            list.sort((a, b) =>
                sortDir === "asc"
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        return list;
    }, [products, searchShop, sortBy, sortDir]);

    const toggleSort = (field) => {
        if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortBy(field);
            setSortDir("asc");
        }
    };

    const handleDetail = (p) => {
        alert(`Detail ${p.name}`);
    };

    const handleGrant = (p) => {
        const ok = confirm(`Cấp quyền cho sản phẩm \"${p.name}\"?`);
        if (ok) alert(`Đã cấp quyền cho ${p.name}`);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Danh sách sản phẩm</h1>

    <div className="flex gap-3 mb-4 items-center">
    <input
        value={searchShop}
    onChange={(e) => setSearchShop(e.target.value)}
    placeholder="Search shop..."
    className="border px-3 py-2 rounded w-48"
    />

    <div className="flex items-center gap-2">
    <button
        onClick={() => toggleSort("createdAt")}
    className="px-3 py-2 border rounded"
        >
        Sort ngày tạo {sortBy === "createdAt" ? `(${sortDir})` : ""}
    </button>

    <button
    onClick={() => toggleSort("name")}
    className="px-3 py-2 border rounded"
        >
        Sort tên {sortBy === "name" ? `(${sortDir})` : ""}
    </button>
    </div>
    </div>

    <div className="overflow-x-auto bg-white rounded shadow">
    <table className="min-w-full table-auto">
    <thead>
        <tr className="text-left bg-gray-50">
    <th className="p-3">Ảnh</th>
        <th className="p-3">Tên sản phẩm</th>
    <th className="p-3">Shop</th>
        <th className="p-3">Ngày tạo</th>
    <th className="p-3">Mô tả</th>
    <th className="p-3">Action</th>
        </tr>
        </thead>
        <tbody>
        {filtered.map((p) => (
                <tr key={p.id} className="border-t">
            <td className="p-3">
            <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded" />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.shop}</td>
                <td className="p-3">{p.createdAt}</td>
                <td className="p-3">{p.description}</td>
                <td className="p-3">
            <div className="flex gap-2">
            <button onClick={() => handleDetail(p)} className="px-3 py-1 border rounded">Detail</button>
        <button onClick={() => handleGrant(p)} className="px-3 py-1 border rounded">Cấp quyền</button>
    </div>
    </td>
    </tr>
))}
    </tbody>
    </table>
    </div>
    </div>
);
}
