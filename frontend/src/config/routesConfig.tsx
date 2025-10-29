<<<<<<< Updated upstream
const routesConfig  =  {
    home:'/',
    login:'/login',
    products:'/products',
    productDetails:'/productDetails',
    deposit:'/deposit',
    register:'/register',
    account:'/account',
    orders:'/orders',
    paymentHistory:'/paymentHistory',
    contentManager:'/contentManager',
    changePassword:'/change-password',
    support:'/support',
    share:'/share',
    faqs:'/faqs',
    forgotPassword:'/forgotPassword',
<<<<<<< Updated upstream
    registerShop:'/registerShop'
=======
    infoAccount:'/infoAccount',
    userProfile:'/userProfile',
    registerShop:'/registerShop',
    getProductDetailsUrl: (id: number) => `/productDetails/${id}`,
    getProductUrl: (id: number) => `/product/${id}`,
    getCategoryProductsUrl: (id: number) => `/category/${id}`
>>>>>>> Stashed changes
};

export default routesConfig ;
=======
const routesConfig = {
  home: "/",
  login: "/login",
  products: "/products",
  productDetails: "/productDetails",
  categoryProducts: "/category",
  deposit: "/deposit",
  register: "/register",
  account: "/account",
  paymentHistory: "/paymentHistory",
  contentManager: "/contentManager",
  changePassword: "/changePassword",
  support: "/support",
  share: "/share",
  faqs: "/faqs",
  forgotPassword: "/forgotPassword",
  infoAccount: "/infoAccount",
  userProfile: "/userProfile",
  getProductDetailsUrl: (id: number) => `/productDetails/${id}`,
  getProductUrl: (id: number) => `/product/${id}`,
  getCategoryProductsUrl: (id: number) => `/category/${id}`,
  changePasswordUrl: "/changePassword",
  userOrder: "/userOrder",
};

export default routesConfig;
>>>>>>> Stashed changes
