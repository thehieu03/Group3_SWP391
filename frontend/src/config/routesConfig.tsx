const routesConfig  =  {
    home:'/',
    login:'/login',
    productDetails:'/productDetails',
    categoryProducts:'/category',
    deposit:'/deposit',
    register:'/register',
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
    userOrder:'/orders',
    orderReceipt:'/order-receipt',
    getProductDetailsUrl: (id: number) => `/productDetails/${id}`,
    getProductUrl: (id: number) => `/product/${id}`,
    getCategoryProductsUrl: (id: number) => `/category/${id}`,
    getOrderReceiptUrl: (orderId: number) => `/order-receipt/${orderId}`
};


export default routesConfig ;
