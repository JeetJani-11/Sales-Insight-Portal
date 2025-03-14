import "./index.css";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes"; // Import your router setup
import { Provider } from "react-redux";
import { store } from "./store/store";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactFlowProvider>
        <RouterProvider router={router} />
      </ReactFlowProvider>
    </Provider>
  </React.StrictMode>
);
