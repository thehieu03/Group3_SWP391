const routesConfig  =  {
    home:'/',
    login:'/login',
    products:'/products',
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
    getProductDetailsUrl: (id: number) => `/productDetails/${id}`,
    getProductUrl: (id: number) => `/product/${id}`,
    getCategoryProductsUrl: (id: number) => `/category/${id}`
};


export default routesConfig ;
