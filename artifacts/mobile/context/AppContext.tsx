import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Exam {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  description?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  examId: string;
  score: number;
  feedback?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
}

interface AppContextType {
  exams: Exam[];
  grades: Grade[];
  notifications: AppNotification[];
  isLoading: boolean;
  addExam: (exam: Omit<Exam, "id">) => void;
  deleteExam: (id: string) => void;
  setGrade: (
    studentId: string,
    examId: string,
    score: number,
    feedback?: string
  ) => void;
  getGrade: (studentId: string, examId: string) => Grade | undefined;
  sendNotification: (title: string, message: string) => void;
  deleteNotification: (id: string) => void;
  getStudentGrades: (studentId: string) => (Grade & { exam: Exam })[];
}

const AppContext = createContext<AppContextType>({} as AppContextType);

const KEYS = {
  EXAMS: "@englishapp_exams",
  GRADES: "@englishapp_grades",
  NOTIFICATIONS: "@englishapp_notifications",
};

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [e, g, n] = await Promise.all([
          AsyncStorage.getItem(KEYS.EXAMS),
          AsyncStorage.getItem(KEYS.GRADES),
          AsyncStorage.getItem(KEYS.NOTIFICATIONS),
        ]);
        if (e) setExams(JSON.parse(e));
        if (g) setGrades(JSON.parse(g));
        if (n) setNotifications(JSON.parse(n));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveExams = (data: Exam[]) =>
    AsyncStorage.setItem(KEYS.EXAMS, JSON.stringify(data));
  const saveGrades = (data: Grade[]) =>
    AsyncStorage.setItem(KEYS.GRADES, JSON.stringify(data));
  const saveNotifications = (data: AppNotification[]) =>
    AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data));

  const addExam = (exam: Omit<Exam, "id">) => {
    const updated = [...exams, { ...exam, id: genId() }];
    setExams(updated);
    saveExams(updated);
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    saveExams(updated);
    const updatedGrades = grades.filter((g) => g.examId !== id);
    setGrades(updatedGrades);
    saveGrades(updatedGrades);
  };

  const setGrade = (
    studentId: string,
    examId: string,
    score: number,
    feedback?: string
  ) => {
    const exists = grades.find(
      (g) => g.studentId === studentId && g.examId === examId
    );
    let updated: Grade[];
    if (exists) {
      updated = grades.map((g) =>
        g.studentId === studentId && g.examId === examId
          ? { ...g, score, feedback }
          : g
      );
    } else {
      updated = [...grades, { id: genId(), studentId, examId, score, feedback }];
    }
    setGrades(updated);
    saveGrades(updated);
  };

  const getGrade = (studentId: string, examId: string) =>
    grades.find((g) => g.studentId === studentId && g.examId === examId);

  const sendNotification = (title: string, message: string) => {
    const updated = [
      { id: genId(), title, message, date: new Date().toISOString() },
      ...notifications,
    ];
    setNotifications(updated);
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  };

  const getStudentGrades = (studentId: string) =>
    grades
      .filter((g) => g.studentId === studentId)
      .map((g) => ({ ...g, exam: exams.find((e) => e.id === g.examId)! }))
      .filter((g) => !!g.exam);

  return (
    <AppContext.Provider
      value={{
        exams,
        grades,
        notifications,
        isLoading,
        addExam,
        deleteExam,
        setGrade,
        getGrade,
        sendNotification,
        deleteNotification,
        getStudentGrades,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
