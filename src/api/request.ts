import axios from "axios";

export const service = axios.create({
  baseURL: "http://localhost:8081", // 后端地址
  timeout: 5000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

service.interceptors.response.use(response => {
    const res = response.data;
    if (res.code !== 200) {
      console.error("请求失败:", res.message);
      return Promise.reject(res.message);
    }
    return res.data; // ✅ 只返回 data 部分
  }, error => {
    console.error("网络错误:", error.message);
    return Promise.reject(error);
  });
  
