import Button from "../../Button/Button.tsx";
import routesConfig from "../../../config/routesConfig.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons";
const handleLogin=()=>{
    console.log("login");
}
const handleGoogleLogin=()=>{
    console.log("google login");
}
const LoginMenu = () => (
    <div className="bg-white shadow-md rounded-md p-4 w-[220px]">
        <h3 className="font-semibold text-center mb-2">Đăng nhập</h3>
        <input type="text" placeholder="Email" className="border w-full p-1 rounded mb-2"/>
        <input type="password" placeholder="Mật khẩu" className="border w-full p-1 rounded mb-2"/>
        <div className="flex justify-between text-sm mb-2">
            <label><input type="checkbox" /> Ghi nhớ</label>
            <Button to={routesConfig.forgotPassword} className="text-blue-500 cursor-pointer">Quên mật khẩu</Button>
        </div>
        <Button className="w-full bg-green-600 text-white py-1 rounded text-center" onClick={handleLogin}>Đăng nhập</Button>
        <Button className="w-full bg-blue-500 text-white py-1 mt-2 rounded text-center" leftIcon={<FontAwesomeIcon icon={faGoogle}/>} onClick={handleGoogleLogin}>Google Login</Button>
        <div className="text-center mt-2 text-sm">
            <Button to={routesConfig.register} className="text-blue-500 cursor-pointer">Đăng ký</Button>
        </div>
    </div>
);

export default LoginMenu;