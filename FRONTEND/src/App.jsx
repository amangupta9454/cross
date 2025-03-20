import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NavBar from "./Components/NavBar.jsx";
import Home from "./Components/Home.jsx";
import Contact from "./Components/Contact.jsx";
import Registration from "./Components/Registration.jsx";
import Login from "./Components/Login.jsx";
import EventDetail from "./Components/EventDetail.jsx";
import Schedule from "./Components/Schedule.jsx";
import Event from "./Components/Event.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NavBar />
        <Home />
      </>
    ),
  },
  {
    path: "/events",
    element: (
      <>
        <NavBar />
        <Event />
      </>
    ),
  },
  
  {
    path: "/schedule",
    element: (
      <>
        <NavBar />
        <Schedule />
      </>
    ),
  },
  {
    path: "/registration",
    element: (
      <>
        <NavBar />
        <Registration />
      </>
    ),
  },
  {
    path: "/contact",
    element: (
      <>
        <NavBar />
        <Contact />
      </>
    ),
  },
  {
    path: "/login",
    element: (
      <>
        <NavBar />
        <Login />
      </>
    ),
  },
 
  {
    path: "/event/:id",
    element: (
      <>
       <NavBar />
        <EventDetail />
        
      </>
    ),
  },
]);

// Define the App component
const App = () => {
  return <RouterProvider router={router} />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
