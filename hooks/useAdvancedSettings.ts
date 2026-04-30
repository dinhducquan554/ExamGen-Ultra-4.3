import { useContext } from "react";
import { AdvancedSettingsContext } from "../contexts/AdvancedSettingsContext";

export const useAdvancedSettings = () => {
  const context = useContext(AdvancedSettingsContext);
  if (!context) {
    throw new Error("useAdvancedSettings must be used within an AdvancedSettingsProvider");
  }
  return context;
};
