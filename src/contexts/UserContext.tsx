import { createContext, ReactNode, useContext, useState } from "react";

type Right = {
  menu:
    | "Dashboard"
    | "User"
    | "Purpose"
    | "Contact"
    | "Distributor"
    | "Visit"
    | "Order"
    | string;
  create: "1" | "0";
  delete: "1" | "0";
  print: "1" | "0";
  update: "1" | "0";
  view: "1" | "0";
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
  rights: Right[];
}

type UserContextType = {
  user: User | null;
  setUser: (user: User) => void;
  removeUser: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  removeUser: () => {},
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, _setUser] = useState<User | null>(getUser());

  function getUser() {
    let user = localStorage.getItem("sales_pulse_user");
    if (user) {
      return JSON.parse(user);
    }
    return user;
  }

  function setUser(user: User) {
    _setUser(user);
    localStorage.setItem("sales_pulse_user", JSON.stringify(user));
  }

  function removeUser() {
    _setUser(null);
    localStorage.removeItem("sales_pulse_user");
  }

  return (
    <UserContext.Provider value={{ user, setUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
};
