import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Container,
  Divider,
  Flex,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  Spinner,
  Textarea,
  Toast,
  useToast,
} from "@chakra-ui/react";
import { BigNumber, ethers, utils } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useEthereum } from "./hooks/useEthereum";
import {
  handleErrorWithToast,
  runInAsync,
  useStateWithLocalStorage,
  useStateWithSessionStorage,
  weiToEth,
} from "./utils";

interface IEthInputProps {
  defaultDecimals?: number;
  value: ethers.BigNumber;
  onChange: (value: ethers.BigNumber) => void;
}

const EthInput: React.FC<IEthInputProps> = (props) => {
  const [decimals, setDecimals] = useState<number>(props.defaultDecimals || 0);
  const [value, setValue] = useState<ethers.BigNumber>(props.value);
  const formattedValue = useMemo(
    () => ethers.utils.formatUnits(value, decimals),
    [value, decimals]
  );
  return (
    <>
      <InputGroup gap="2">
        <Input
          onChange={(e) => {
            const nextValue = ethers.utils.parseUnits(e.target.value, decimals);
            setValue(nextValue);
            props.onChange(nextValue);
          }}
          value={formattedValue}
        ></Input>

        <Select
          onChange={(e) => {
            setDecimals(parseInt(e.target.value as any));
          }}
          value={decimals.toString()}
          defaultValue={"0"}
        >
          <option value="18">ether</option>
          <option value="9">gwei</option>
          <option value="0">wei</option>
        </Select>
      </InputGroup>
    </>
  );
};

interface IContract {
  name: string;
  address: string;
  abi: string;
}

function Main() {
  const { provider, loadProvider, signerAddress, signer, signerBalance } =
    useEthereum();
  const [contracts, setContracts, resetContracts] = useStateWithLocalStorage<
    Record<string, IContract>
  >({}, "contracts");
  const [sessionName, setSessionName, resetSessionName] =
    useStateWithSessionStorage<string>("", "session_name");
  const [contractAddress, setContractAddress, resetContractAddress] =
    useStateWithSessionStorage<string>("", "contract_addresss");
  const [abiString, setAbiString, resetAbiString] =
    useStateWithSessionStorage<string>("", "abi_string");
  const [abi, setAbi] = useState<utils.Interface>();
  const [msgValue, setMsgValue] = useState<BigNumber>(BigNumber.from(0));
  const [gasLimit, setGasLimit] = useState<BigNumber>(BigNumber.from(3000000));

  const toast = useToast();

  const [
    currentContractName,
    setCurrentContractName,
    resetCurrentContractName,
  ] = useStateWithSessionStorage<string>("", "current_contract_name");

  const functions = useMemo<[string, FunctionFragment][]>(() => {
    return abi ? Object.entries(abi.functions) : [];
  }, [abi]);
  useEffect(() => {
    document.title = sessionName;
  }, [sessionName]);

  const loadContract = (name: string) => {
    if (name) {
      const c = contracts[name];
      setAbiString(c.abi);
      setSessionName(c.name);
      setContractAddress(c.address);
    }
  };

  return (
    <Container p="4" maxW="80vw">
      <SimpleGrid columns={2} gap="8">
        <Flex direction={"column"} gap="2">
          <FormLabel>
            Select Contract
            <Select
              value={currentContractName}
              onChange={(e) => {
                setCurrentContractName(e.target.value);
                loadContract(e.target.value);
              }}
            >
              <option value=""></option>
              {Object.entries(contracts).map(([name, contract]) => {
                return (
                  <option value={name} key={name}>
                    {contract.name}
                  </option>
                );
              })}
            </Select>
          </FormLabel>
          <FormLabel>
            Contract Name
            <Input
              value={sessionName}
              defaultValue={sessionName}
              onChange={(e) => {
                setSessionName(e.target.value);
              }}
            ></Input>
          </FormLabel>
          <Button
            onClick={() => {
              resetAbiString();
              resetContractAddress();
              resetSessionName();
            }}
            colorScheme="cyan"
          >
            New Contract
          </Button>
          <Button
            onClick={() => {
              setContracts({
                ...contracts,
                [sessionName]: {
                  abi: abiString,
                  address: contractAddress,
                  name: sessionName,
                },
              });

              setCurrentContractName(sessionName);
              toast({
                status: "success",
                title: `contract ${sessionName} saved`,
              });
            }}
            colorScheme="blue"
          >
            Save Contract
          </Button>
          <Button
            onClick={() => {
              if (currentContractName) {
                const nextContracts = { ...contracts };
                delete nextContracts[currentContractName];
                setContracts(nextContracts);
              }

              resetCurrentContractName();
              resetContractAddress();
              resetSessionName();
              resetAbiString();
            }}
            colorScheme="orange"
          >
            Delete Contract
          </Button>
          <Button
            onClick={() => {
              resetContracts();
            }}
          >
            Reset
          </Button>
          <Button onClick={loadProvider}>Load Accounts</Button>
          <FormLabel>
            Signer Address
            <Input readOnly value={signerAddress}></Input>
          </FormLabel>
          <FormLabel>
            Signer Balance
            <Input readOnly value={signerBalance?.toString()}></Input>
          </FormLabel>
          <FormLabel>
            SignerBalance to ETH
            <Input
              readOnly
              value={signerBalance ? weiToEth(signerBalance) + " ETH" : ""}
            ></Input>
          </FormLabel>
          <Divider />
          <FormLabel>
            Contract Address
            <Input
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            ></Input>
          </FormLabel>
          <FormLabel>
            ABI
            <Textarea
              spellCheck="false"
              placeholder="ABI"
              value={abiString}
              onChange={(e) => setAbiString(e.target.value)}
              rows={20}
            ></Textarea>
          </FormLabel>
          <FormLabel>
            msg.value
            <EthInput
              value={ethers.BigNumber.from(0)}
              onChange={(value) => {
                setMsgValue(value);
              }}
            ></EthInput>
          </FormLabel>
          <FormLabel>
            gasLimit
            <Input
              value={gasLimit.toString()}
              onChange={(e) => {
                setGasLimit(BigNumber.from(e.target.value));
              }}
            ></Input>
          </FormLabel>
          <Button
            onClick={() => {
              runInAsync(() => {
                const itf = new utils.Interface(abiString as unknown as any);
                setAbi(itf);
              }).catch(handleErrorWithToast(toast));
            }}
            colorScheme="green"
          >
            PARSE
          </Button>
          <Button
            onClick={() => {
              runInAsync(() => {
                const itf = new utils.Interface(abiString as unknown as any);
                setAbi(itf);
              }).catch(handleErrorWithToast(toast));
            }}
            colorScheme="gray"
          >
            SAVE SESSION
          </Button>
        </Flex>
        <SimpleGrid>
          <Flex direction="column" gap="2">
            {functions?.map(([name, fragment]) => {
              return (
                <FunctionController
                  key={name}
                  contractAddress={contractAddress}
                  contractInterface={abi}
                  name={name}
                  fragment={fragment}
                  msgValue={msgValue}
                  gasLimit={gasLimit}
                />
              );
            })}
          </Flex>
        </SimpleGrid>
      </SimpleGrid>
    </Container>
  );
}

interface IFunctionController {
  contractAddress: string | undefined;
  contractInterface: ethers.utils.Interface | undefined;
  name: string;
  fragment: FunctionFragment;
  gasLimit: BigNumber;
  msgValue?: BigNumber;
}

interface IWriteOverrides {
  gasPrice?: any;
  gasLimit?: any;
  value?: any;
  nonce?: any;
}

interface IReadOverrides {
  from?: any;
  value?: any;
  gasPrice?: any;
  gasLimit?: any;
  blockTag?: any;
}

const callReadContract = async (
  contract: ethers.Contract | undefined,
  functionName: string,
  args: string[],
  overrides: IReadOverrides
): Promise<any> => {
  return contract?.[functionName](...args, overrides);
};

const callWriteContract = async (
  contract: ethers.Contract | undefined,
  functionName: string,
  args: string[],
  overrides: IWriteOverrides
): Promise<ethers.ContractTransaction> => {
  return contract?.[functionName](...args, overrides);
};

const FunctionController: React.FC<IFunctionController> = (props) => {
  const msgValue = props.msgValue || BigNumber.from(0);
  const gasLimit = props.gasLimit;
  const toast = useToast();
  const { signer } = useEthereum();
  const contract: ethers.Contract | undefined = useMemo(() => {
    if (props.contractAddress && props.contractInterface) {
      return new ethers.Contract(
        props.contractAddress,
        props.contractInterface,
        signer
      );
    }
  }, [signer]);
  const [show, setShow] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [inputData, setInputData] = useState<string[]>(
    new Array(props.fragment.inputs.length).fill(undefined)
  );
  const stateMutability: typeof props.fragment.stateMutability =
    props.fragment.stateMutability;

  const handleCall = async () => {
    runInAsync(async () => {
      if (stateMutability === "view") {
        setIsLoading(true);
        const overrides: IReadOverrides = {};
        const callResult = await callReadContract(
          contract,
          props.fragment.name,
          inputData,
          overrides
        );
        setResult(callResult.toString());
        setIsLoading(false);
      } else {
        setIsLoading(true);
        const overrides: IWriteOverrides = {
          value: msgValue,
          gasLimit: gasLimit,
        };
        const callResult = await callWriteContract(
          contract,
          props.fragment.name,
          inputData,
          overrides
        );
        setIsLoading(false);
        const receipt = await callResult.wait();
        toast({
          status: "info",
          title: "Transaction Completed",
          description: receipt.transactionHash,
        });
        console.info(receipt);
      }
    })
      .catch(handleErrorWithToast(toast))
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleToggle = () => setShow(!show);
  return (
    <Box mb={show ? 4 : 0}>
      <Flex gap="2" mb={show ? 4 : 0}>
        <Box flex={1}>
          <Button
            colorScheme={stateMutability === "view" ? "blue" : "red"}
            w="full"
            onClick={handleCall}
          >
            {isLoading ? <Spinner /> : props.fragment.name}
          </Button>
        </Box>
        <Box>
          <Button onClick={handleToggle}>
            {show ? <MinusIcon /> : <AddIcon />}
          </Button>
        </Box>
      </Flex>
      <Collapse in={show} animateOpacity>
        <Flex direction="column" gap="2">
          {props.fragment.inputs.map((input, i) => {
            return (
              <Flex key={input.name} gap="2" alignItems="center">
                <Box flex="1">
                  <FormLabel>{input.name}</FormLabel>
                </Box>
                <Box flex="2">
                  <Input
                    placeholder={input.format().toString()}
                    onChange={(e) => {
                      const nextInputData = [...inputData];
                      nextInputData[i] = e.target.value;
                      setInputData(nextInputData);
                    }}
                  ></Input>
                </Box>
              </Flex>
            );
          })}
        </Flex>
      </Collapse>
      <Collapse in={result}>
        <Box>Result: {result}</Box>
      </Collapse>
    </Box>
  );
};

export default Main;
