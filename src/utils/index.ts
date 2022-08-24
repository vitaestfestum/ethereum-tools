import { useToast } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";

export const runInAsync = async (func: any) => func();
export const handleErrorWithToast =
  (toast: ReturnType<typeof useToast>) => (error: any) => {
    toast({
      title: "Error",
      description: error?.message,
      duration: 1000,
      status: "error",
    });
  };

export const weiToEth = (wei: BigNumber) => ethers.utils.formatEther(wei);