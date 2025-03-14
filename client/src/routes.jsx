import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Contacts from "./Contacts";
import CaseStudy from "./CaseStudy";
import FlowPage from "./components/ui/FlowPage";

export default createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/contact",
    element: <Contacts />,
  },
  {
    path: "case-study",
    element: <CaseStudy />,
  },
  {
    path: "flow",
    element: <FlowPage />,
  },
]);
