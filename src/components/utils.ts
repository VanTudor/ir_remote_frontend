import { AxiosResponse } from "axios";
import { ButtonProps } from "semantic-ui-react";

export type TWrappedAxiosCall<T> = (...args: any[]) => Promise<AxiosResponse<T>>;

export const requestifyButton = <T,K extends TWrappedAxiosCall<T>>(
  args: Parameters<K>,
  requestMethod: K,
  updateState?: () => Promise<void>) => { // use it to re-fetch updated values and update the state after the requestMethod was executed
  return async(e: { preventDefault: () => void}, data: ButtonProps) => {
    e.preventDefault();
    const reqRes = await requestMethod(...args);
    if (updateState) {
      await updateState();
    }
    return reqRes;
  }
}
