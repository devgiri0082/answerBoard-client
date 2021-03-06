import { db } from "../firebaseConfig";
import {
  CURRENT_STUDENT,
  ERROR,
  LOADING,
  SESSION_INFO,
  SET_TEACHER,
  STUDENTS,
  STUDENT_LINK,
  SYNCING,
  USER_EXISTS,
} from "./ActionType";

export let loading = () => ({
  type: LOADING,
});
export let error = (value) => ({
  type: ERROR,
  payload: value,
});
export let setStudents = (allStudents) => ({
  type: STUDENTS,
  payload: allStudents,
});
export let sessionInfo = (value) => ({
  type: SESSION_INFO,
  payload: value,
});
export let setStudentLink = (id) => ({
  type: STUDENT_LINK,
  payload: id,
});
export let userExists = (value) => ({
  type: USER_EXISTS,
  payload: value,
});
export let setTeacher = (value) => ({
  type: SET_TEACHER,
  payload: value,
});
export let currentStudent = (value) => ({
  type: CURRENT_STUDENT,
  payload: value,
});
export let syncing = (value) => ({
  type: SYNCING,
  payload: value,
});
export const getStudents = (email) => {
  return async (dispatch) => {
    console.log("I am here");
    try {
      let response = await db
        .collection(email.split(".").join("_"))
        .doc(email.split(".").join("_"))
        .get();
      console.log(response);
      if (!response.exists) return;
      let data = await response.data();
      console.log(data);
      await dispatch(setStudents(data.students));
      dispatch(setStudentLink(data.link));
      // dispatch(loading());
    } catch (err) {
      // console.log(err);
      dispatch(error(err));
    }
  };
};

export const endSession = (email, studentId, students) => {
  return async (dispatch) => {
    try {
      console.log(email);
      let teacherId = email.split(".").join("_");
      console.log("deleting value");
      dispatch(sessionInfo("Ending Session..."));
      await db
        .collection(teacherId)
        .doc(teacherId)
        .collection("studentsMessage")
        .doc("studentsMessage")
        .delete();
      await db.collection(teacherId).doc(teacherId).delete();
      await db.collection("studentId").doc(studentId).delete();
      dispatch(setStudents([]));
      dispatch(error(""));
      dispatch(sessionInfo("ended"));
    } catch (err) {
      console.log(err);
      dispatch(error(err));
      dispatch(sessionInfo("error", err));
    }
  };
};
export const studentLink = (id, email) => {
  return async (dispatch) => {
    try {
      await db.collection("studentId").doc(id)?.set({ teacher: email });
      dispatch(setStudentLink(id));
    } catch (err) {
      console.log(err);
    }
  };
};

export const findTeacher = (id) => {
  return async (dispatch) => {
    try {
      let response = await db.collection("studentId").doc(id).get();
      console.log(response);
      if (!response.exists) return dispatch(userExists(false));
      let data = await response.data();
      dispatch(userExists(true));
      dispatch(setTeacher(data.teacher));
    } catch (err) {
      console.log(err);
    }
  };
};

export const saveChanges = (teacher, student, text) => {
  return async (dispatch) => {
    try {
      let updatingField = {};
      updatingField[student] = text;
      await db
        .collection(teacher.split(".").join("_"))
        .doc(teacher.split(".").join("_"))
        .collection("studentsMessage")
        .doc("studentsMessage")
        .update(updatingField);
    } catch (err) {
      console.log(err);
    }
  };
};
export const clearStudentsFields = (students, teacher) => {
  return async (dispatch) => {
    try {
      let updatingFields = {};
      students.forEach((elem) => (updatingFields[elem] = ""));
      await db
        .collection(teacher.split(".").join("_"))
        .doc(teacher.split(".").join("_"))
        .collection("studentsMessage")
        .doc("studentsMessage")
        .update(updatingFields);
    } catch (err) {
      console.log(err);
    }
  };
};

export const createRoom = (email, students, studentId) => {
  return async (dispatch) => {
    try {
      await db
        .collection(email.split(".").join("_"))
        .doc(email.split(".").join("_"))
        .set({ students: students, link: studentId });
      dispatch(setStudents(students));
      let studentsObj = {};
      students.forEach((elem) => (studentsObj[elem] = ""));
      await db
        .collection(email.split(".").join("_"))
        .doc(email.split(".").join("_"))
        .collection("studentsMessage")
        .doc("studentsMessage")
        .set(studentsObj);
    } catch (err) {
      console.log(err);
    }
  };
};
