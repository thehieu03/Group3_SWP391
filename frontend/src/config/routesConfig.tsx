const routesConfig  =  {
    home:'/',
    login:'/login',
    registerShop:'/registerShop',
    productDetails:'/productDetails',
    categoryProducts:'/category',
    deposit:'/deposit',
    account:'/account',
    orders:'/orders',
    paymentHistory:'/paymentHistory',
    contentManager:'/contentManager',
    changePassword:'/changePassword',
    support:'/support',
    share:'/share',
    faqs:'/faqs',
    forgotPassword:'/forgotPassword',
    infoAccount:'/infoAccount',
    userProfile:'/userProfile',
    productApproval:'/admin/product-approval',
    // Seller routes
    sellerDashboard:'/seller/dashboard',
    sellerProducts:'/seller/products',
    sellerOrders:'/seller/orders',
    sellerShopInfo:'/seller/shop-info',
    sellerStatistics:'/seller/statistics',
    getProductDetailsUrl: (id: number) => `/productDetails/${id}`,
    getProductUrl: (id: number) => `/product/${id}`,
    getCategoryProductsUrl: (id: number) => `/category/${id}`
};


export default routesConfig ;
