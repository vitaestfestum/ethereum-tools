import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { EthereumContextProvider } from "./hooks/useEthereum";
import Main from "./Main";



function App() {
  return (
    <>
      
      <ChakraProvider>
        <EthereumContextProvider>
          <Main />
        </EthereumContextProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
