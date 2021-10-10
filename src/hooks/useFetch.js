import { useEffect, useState, useReducer } from "react";
import useFetchStatus from "./useFetchStatus.js";

// TODO: clean this up, statuscode stuff is clumsy
export default (url, fetchOptions = {}, hookOptions = {}, initialData = {}) => {
  const [status, setStatus] = useFetchStatus();
  const [data, setData] = useState(initialData);
  const [fetchOpts, setFetchOpts] = useState(fetchOptions);
  const [hookOpts, setHookOpts] = useState(hookOptions);
  const [statusCode, setStatusCode] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    if (hookOpts.doRequest === true) {
      setStatus({ loading: true });
      fetch(url, { ...fetchOpts, signal: abortController.signal })
        .then((response) => {
          setStatusCode(response.status);
          if (response.ok) {
            return response.json();
          }

          throw response.status;
        })
        .then((responseData) => {
          if (abortController.signal.aborted) {
            return;
          }
          setData(responseData);
          setStatus({ done: true });
        })
        .catch(() => {
          if (abortController.signal.aborted) {
            return;
          }
          setStatus({ error: true });
        });
    }

    return () => {
      abortController.abort();
    };
  }, [url, fetchOpts, setStatus, hookOpts]);

  const request = (newFetchOpts) => {
    setFetchOpts({ ...fetchOpts, ...newFetchOpts });
    setHookOpts({ ...hookOpts, doRequest: true });
    console.log({ ...fetchOpts, ...newFetchOpts });
  }

  return [{ data, status, statusCode }, request];
};
