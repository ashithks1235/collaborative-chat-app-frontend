import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [rightPanel, setRightPanel] = useState("members");
  const [activeChannel, setActiveChannel] = useState(null);

  return (
    <UIContext.Provider
      value={{ rightPanel, setRightPanel, activeChannel, setActiveChannel }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
