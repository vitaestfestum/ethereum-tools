import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
const config = {
  initialColorMode: "dark",
};

// 3. extend the theme
const theme = extendTheme({ config });
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <>
    <ColorModeScript
      initialColorMode={"dark"}
    ></ColorModeScript>
    <App />
  </>
);
