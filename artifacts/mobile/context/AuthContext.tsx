import React, { createContext, useContext, useState } from "react";
import { STUDENTS, TEACHER_PASSWORD } from "@/constants/students";

interface AuthContextType {
  role: "teacher" | "student" | null;
  studentId: string | null;
  isAuthenticated: boolean;
  login: (
    role: "teacher" | "student",
    code: string
  ) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const login = (selectedRole: "teacher" | "student", code: string) => {
    if (selectedRole === "teacher") {
      if (code === TEACHER_PASSWORD) {
        setRole("teacher");
        return { success: true };
      }
      return { success: false, error: "كلمة المرور غير صحيحة" };
    } else {
      const student = STUDENTS.find(
        (s) => s.code === code.trim().toUpperCase()
      );
      if (student) {
        setRole("student");
        setStudentId(student.id);
        return { success: true };
      }
      return { success: false, error: "رمز الطالب غير صحيح" };
    }
  };

  const logout = () => {
    setRole(null);
    setStudentId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        studentId,
        isAuthenticated: role !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
