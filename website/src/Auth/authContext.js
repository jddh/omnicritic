import { createContext } from "react";

const authContext = createContext({
  authenticated: false,
  token: '',
  setAuthenticated: (auth) => {},
  setToken: (token) => {}
});

export default authContext;