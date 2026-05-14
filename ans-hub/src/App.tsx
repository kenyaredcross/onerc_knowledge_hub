import { FrappeProvider } from "frappe-react-sdk";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { UserProvider } from "./contexts/UserProvider";

function App() {
  return (
    <div className="App">
      <FrappeProvider>
        <UserProvider>
          <Outlet />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#011E41",
                border: "1px solid #e5e7eb",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </UserProvider>
      </FrappeProvider>
    </div>
  );
}

export default App;
