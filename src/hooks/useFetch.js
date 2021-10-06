import { useEffect, useState } from "react";
import useFetchStatus from "./useFetchStatus.js";

// TODO: clean this up, statuscode stuff is clumsy
export default (url, options = {}, initialData = {}) => {
  let stopUpdate = false;

  const [status, setStatus] = useFetchStatus();
  const [data, setData] = useState(initialData);
  const [statusCode, setStatusCode] = useState(0);

  useEffect(() => {
    setStatus({ loading: true });
    fetch(url, options)
      .then((response) => {
        setStatusCode(response.status);
        if (response.ok) {
          return response.json();
        }

        throw response.status;
      })
      .then((responseData) => {
        if (stopUpdate) {
          return;
        }
        setData(responseData);
        setStatus({ done: true });
      })
      .catch(() => {
        if (stopUpdate) {
          return;
        }
        setStatus({ error: true });
      });

    return () => {
      stopUpdate = true;
    };
  }, [url]);

  return { data, status, statusCode };
};
