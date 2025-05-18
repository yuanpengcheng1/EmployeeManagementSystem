import axios, { type AxiosPromise } from "axios";

// 定义后端响应数据的基础结构
interface CommonResult<T = any> {
  code: number;
  msg: string;
  data?: T;
}

// 用户登录请求的 payload 类型
interface UserLoginPayload {
  username: string;
  password: string;
}

// 用户登录成功后返回的数据类型
interface UserLoginSuccessData {
  id: number;
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  status?: number;
  avatar?: string;
  del?: number;
  createTime?: Date;
  updateTime?: Date;
  token?: string;
}

// 添加用户 (注册) 请求的 payload 类型
interface CreateUserPayload {
  username: string;
  password: string;
  phone: string;
  email: string;
  avatar: string;
}

// 添加用户 (注册) 成功后返回的数据类型
type CreateUserSuccessData = boolean;

// 重置密码请求的 payload 类型
interface ResetPasswordPayload {
  newPassword: string;
  lastFourDigits: string;
}

// 重置密码成功后返回的数据类型
type ResetPasswordSuccessData = boolean;

// Axios 实例
export const service = axios.create({
  baseURL: "http://localhost:8081",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

// 用户登录 API
export function loginApi(data: UserLoginPayload): AxiosPromise<CommonResult<UserLoginSuccessData>> {
  console.log("Sending login data:", data);
  return service({
    url: `/user/login?username=${encodeURIComponent(data.username)}&password=${encodeURIComponent(data.password)}`,
    method: "post"
  });
}

// 添加用户 (注册) API
export function addUserApi(data: CreateUserPayload): AxiosPromise<CommonResult<CreateUserSuccessData>> {
  console.log("Sending add user data:", data);
  return service({
    url: "/user/register",
    method: "post",
    data: data
  });
}

// 重置密码 API
export function resetPasswordApi(id: number | string, payload: ResetPasswordPayload): AxiosPromise<CommonResult<ResetPasswordSuccessData>> {
  console.log(`Sending reset password request for user ID ${id} with payload:`, payload);
  return service({
    url: `/user/resetPassword/${id}?newPassword=${encodeURIComponent(payload.newPassword)}&lastFourDigits=${encodeURIComponent(payload.lastFourDigits)}`,
    method: "put"
  });
}