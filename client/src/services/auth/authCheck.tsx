import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie'


const isTokenExpired = (token:any) => {
    if (!token) return true;
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken?.exp && decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
};

const authCheck = (navigate: (arg0: string) => void, setAuth: (arg0: boolean) => void) => {
    let token = Cookies.get("token");
          if (isTokenExpired(token) || token === undefined) {
            Cookies.remove("token");
            setAuth(false);
            navigate("/login")
          } else {
            setAuth(true);
          }
}

export default authCheck;


