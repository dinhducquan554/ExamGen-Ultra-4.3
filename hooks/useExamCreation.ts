import { useContext } from "react";
import { ExamCreationContext } from "../contexts/ExamCreationContext";

export const useExamCreation = () => {
  const context = useContext(ExamCreationContext);
  if (!context) {
    throw new Error("useExamCreation must be used within an ExamCreationProvider");
  }
  return context;
};
