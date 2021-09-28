import React from "react";
import regeneratorRuntime from "regenerator-runtime";
import ReactDom from "react-dom";

import { BrowserRouter } from "react-router-dom";

import App from "./components/app.jsx";

ReactDom.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
