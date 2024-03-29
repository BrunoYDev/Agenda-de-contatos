import { ReactNode, createContext, useState,useEffect } from "react";
import { LoginData } from "../components/loginModal/validator";
import { api } from "../services/api";
import { RegisterData } from "../components/registerModal/RegisterSchema";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

interface UserProviderProps {
  children: ReactNode;
}


interface UserContextValues {
  signIn: (data: LoginData) => void;
  registerUser: (data: RegisterData) => void;
  logOut: () => void;
  deleteUser: () => void;
  token: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextValues>(
  {} as UserContextValues
);

export const UserProvider = ({ children }: UserProviderProps) => {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("@Agenda:Token");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("@Agenda:Token");

    if (!token) {
        setIsLoading(false)
        return
    }
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setIsLoading(false)
}, [])

  const logOut = () => {
    window.localStorage.clear();
    navigate("/");
  };

  const deleteUser = async () => {
    const userId = jwtDecode(token!).sub;
    await api.delete(`/clients/${userId}`)
    window.localStorage.clear();
    toast.success("Usuario deletado com sucesso!", {
      autoClose: 2000,
      theme: "dark",
    });
    navigate("/")

  }

  const signIn = async (data: LoginData) => {
    try {
      toast.info("Entrando na conta..", {
        autoClose: 2000,
        theme: "dark",
      });
      const response = await api.post("/login", data);
      const { token } = response.data;

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("@Agenda:Token", token)
      navigate("dashboard");
    } catch (error: any) {
      toast.error("Usuario ou senha incorretos!", {
        autoClose: 1500,
        theme: "dark",
      });
    }
  };

  const registerUser = async (data: RegisterData) => {
    try {
      toast.info("Cadastrando usuario!", {
        autoClose: 2000,
        theme: "dark",
      });
      const response = await api.post("/clients", data);
      const { status } = response;
      if (status === 201) {
        toast.success("Usuario criado com sucesso!!", {
          autoClose: 1500,
          theme: "dark",
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message, {
        autoClose: 1500,
        theme: "dark",
      });
    }
  };

  return (
    <UserContext.Provider value={{ signIn, registerUser,isLoading,setIsLoading,logOut,token, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};
