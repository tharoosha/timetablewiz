import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import makeApi from "./../../config/axiosConfig";

const api = makeApi();

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/register`, userData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while registering.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/login`, credentials);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while logging in.");
    }
  }
);

export const getFaculties = createAsyncThunk("auth/getFaculties", async () => {
  try {
    const response = await api.get(`/faculty/faculties`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const getYears = createAsyncThunk("auth/getYears", async () => {
  try {
    const response = await api.get(`/year/years`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const addYear = createAsyncThunk("auth/addYear", async (yearData) => {
  try {
    const response = await api.post(`/year/add`, yearData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const updateYear = createAsyncThunk(
  "auth/updateYear",
  async (yearData) => {
    try {
      const response = await api.put(`/year/update`, yearData);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

export const deleteYear = createAsyncThunk(
  "auth/deleteYear",
  async (yearId) => {
    try {
      const response = await api.delete(`/year/delete/${yearId}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

// export const logout = createAsyncThunk("auth/logout", async () => {
//   try {
//   } catch (error) {
//     console.error(error);
//   }
// });
