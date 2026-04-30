
import { useContext } from "react";
import { SystemInstructionContext } from "../contexts/SystemInstructionContext";

export const useSystemInstruction = () => {
  const context = useContext(SystemInstructionContext);
  if (!context) {
    throw new Error("useSystemInstruction must be used within a SystemInstructionProvider");
  }
  return context;
};
