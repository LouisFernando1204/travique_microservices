import axios from "axios";

const USER_SERVICE_URL = `http://localhost:3500/service/user-service`;

export async function register(name, email, password, avatar) {
  try {
    const res = await axios.post(`${USER_SERVICE_URL}/register`, {
      name: name,
      email: email,
      password: password,
      avatar: avatar,
    });
    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.response?.status,
      message: error.response?.data?.message,
    };
  }
}

export async function login(email, password) {
  try {
    const res = await axios.post(`${USER_SERVICE_URL}/login`, {
      email: email,
      password: password,
    });
    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.response?.status,
      message: error.response?.data?.message,
    };
  }
}

export async function editProfile(id, name, email, password, avatar) {
  try {
    const res = await axios.patch(`${USER_SERVICE_URL}/edit_profile/${id}`, {
      name: name,
      email: email,
      password: password,
      avatar: avatar,
    });
    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.response?.status,
      message: error.response?.data?.message,
    };
  }
}
