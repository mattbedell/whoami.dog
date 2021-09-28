import { useReducer } from "react";

export const defaultStatusState = {
  error: false,
  loading: false,
  done: false,
};

const reducer = (state, newState) => {
  let { error, loading, done } = state;
  if (newState.done) {
    loading = false;
    done = true;
  }

  if (newState.loading) {
    error = false;
    done = false;
    loading = true;
  }

  if (newState.error) {
    loading = false;
    done = true;
    error = true;
  }

  return { error, loading, done };
}

export default (initialState = defaultStatusState) => {
  const [status, dispatch] = useReducer(reducer, { ...defaultStatusState, ...initialState});
  return [status, dispatch];
}
