import { useToast } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";

export const runInAsync = async (func: any) => func();
export const handleErrorWithToast =
  (toast: ReturnType<typeof useToast>) => (error: any) => {
    console.error(error);
    toast({
      title: "Error",
      description: error?.message,
      duration: 1000,
      status: "error",
    });
  };

export const weiToEth = (wei: BigNumber) => ethers.utils.formatEther(wei);

export function useStateWithSessionStorage<T>(
  defaultValue: T,
  sessionStorageKey: string
): [T, (nextState: T) => void, () => void] {
  let value = null;
  const json = sessionStorage.getItem(sessionStorageKey);
  if (json === null) {
    value = defaultValue;
  } else {
    try {
      value = JSON.parse(json);
      if (value === "" || Object.is(value, {}) || value?.length === 0) {
        value = defaultValue;
      }
    } catch {
      value = defaultValue;
    }
  }

  const [state, setState] = useState<T>(value || defaultValue);

  const wrappedSetState = (nextState: T) => {
    setState(nextState);
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(nextState));
  };
  const reset = () => {
    sessionStorage.removeItem(sessionStorageKey);
    setState(defaultValue);
  };
  return [state, wrappedSetState, reset];
}

export function useStateWithLocalStorage<T>(
  defaultValue: T,
  localStorageKey: string
): [T, (nextState: T) => void, () => void] {
  let value = null;
  const json = localStorage.getItem(localStorageKey);
  if (json === null) {
    value = defaultValue;
  } else {
    try {
      value = JSON.parse(json);
      if (value === "" || Object.is(value, {}) || value?.length === 0) {
        value = defaultValue;
      }
    } catch {
      value = defaultValue;
    }
  }

  const [state, setState] = useState<T>(value || defaultValue);

  const wrappedSetState = (nextState: T) => {
    setState(nextState);
    localStorage.setItem(localStorageKey, JSON.stringify(nextState));
  };
  const reset = () => {
    localStorage.removeItem(localStorageKey);
    setState(defaultValue);
  };

  return [state, wrappedSetState, reset];
}
