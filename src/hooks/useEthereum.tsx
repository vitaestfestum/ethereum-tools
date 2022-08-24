import { useToast } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

interface IEthereumContext {
  provider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;
  signerAddress: string | undefined;
  signerBalance: BigNumber | undefined;
  loadProvider: any;
}

const EthereumContext = createContext<IEthereumContext>({
  provider: undefined,
  signer: undefined,
  signerAddress: undefined,
  signerBalance: undefined,
  loadProvider: () => {},
});

export const EthereumContextProvider = (props: PropsWithChildren) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [signerAddress, setSignerAddress] = useState<string>();
  const [signerBalance, setSignerBalance] = useState<BigNumber>();
  useEffect(() => setSigner(provider?.getSigner()), [provider]);
  useEffect(() => {
    signer
      ?.getAddress()
      .then((address) => (address ? setSignerAddress(address) : null));
    signer?.getBalance().then((balance) => setSignerBalance(balance));
  }, [signer]);

  const toast = useToast();
  const loadProvider = () => {
    try {
      let ethereum = window["ethereum" as any] as any;
      ethereum.request({ method: "eth_requestAccounts" });
      let p = new ethers.providers.Web3Provider(ethereum);
      setProvider(p);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error,
        duration: 1000,
        status: "error",
      });
      console.error(error);
    }
  };

  useEffect(() => {
    loadProvider();
    let ethereum = window["ethereum" as any] as any;
    ethereum.on("accountsChanged", loadProvider);
  }, []);

  const context: IEthereumContext = {
    provider,
    signer,
    signerAddress,
    signerBalance,
    loadProvider,
  };

  return (
    <EthereumContext.Provider value={context}>
      {props.children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => {
  return useContext(EthereumContext);
};
