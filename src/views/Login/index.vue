<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 登录表单 -->
      <div class="form-header">
        <h2 class="title">欢迎登录</h2>
        <p class="subtitle">Dreamguy's Technologies</p>
      </div>
      <el-form :model="form" label-width="auto" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" :loading="loading" @click="handleLogin">立即登录</el-button>
          <el-button @click="goToRegister">去注册</el-button>
          <el-button type="text" @click="openResetDialog" class="forgot-password">忘记密码?</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetDialogVisible"
      title="重置密码"
      width="500px"
      :before-close="closeResetDialog"
      custom-class="reset-dialog"
    >
      <el-form :model="resetForm" ref="resetFormRef" :rules="resetRules" label-width="auto" class="reset-form">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.number="resetForm.userId" placeholder="请输入您的用户ID" clearable />
        </el-form-item>
        <el-form-item label="手机号后四位" prop="lastFourDigits">
          <el-input v-model="resetForm.lastFourDigits" placeholder="请输入手机号后四位" maxlength="4" clearable />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" placeholder="请输入新密码" show-password clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeResetDialog">取消</el-button>
          <el-button type="primary" :loading="resetLoading" @click="submitResetPasswordForm(resetFormRef)">确认重置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import router from '@/router';
import { loginApi, resetPasswordApi } from '@/api/LoginApi';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

const loginFormRef = ref<FormInstance>();
const resetFormRef = ref<FormInstance>();
const loading = ref(false);
const resetLoading = ref(false);
const resetDialogVisible = ref(false);

// 登录表单状态和规则
const form = reactive({
  username: '',
  password: ''
});

const loginRules: FormRules = reactive({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      console.log('Attempting login with:', form);
      try {
        const response = await loginApi(form);
        if (response.data?.code === 200 && response.data.data) {
          console.log('登录成功:', response.data.msg);
          const userData = response.data.data;
          const userId = userData.id;
          const userName = userData.username;
          const token = userData.token;

          if (token) localStorage.setItem('userToken', token);
          router.push({ path: '/main', query: { id: userId, username: userName } });
          ElMessage.success(response.data.msg || '登录成功');
        } else {
          ElMessage.error(response.data?.msg || '登录失败，请检查账号或密码');
        }
      } catch (error: any) {
        console.error('登录请求发生错误:', error);
        ElMessage.error(error.response?.data?.msg || '登录请求失败，请稍后再试');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请检查输入');
    }
  });
};

const goToRegister = () => {
  router.push('/register');
};

// 重置密码表单状态和规则
const resetForm = reactive({
  userId: null as number | null,
  newPassword: '',
  lastFourDigits: ''
});

const resetRules: FormRules = reactive({
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value === null || value === undefined || value === '' || !Number.isInteger(Number(value)) || Number(value) <= 0) {
        callback(new Error('用户ID必须是大于0的整数'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  lastFourDigits: [
    { required: true, message: '请输入手机号后四位', trigger: 'blur' },
    { pattern: /^\d{4}$/, message: '手机号后四位必须是4位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少6位', trigger: 'blur' }
  ]
});

const openResetDialog = () => {
  resetDialogVisible.value = true;
  if (resetFormRef.value) resetFormRef.value.resetFields();
};

const closeResetDialog = () => {
  resetDialogVisible.value = false;
  if (resetFormRef.value) resetFormRef.value.resetFields();
};

const submitResetPasswordForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      resetLoading.value = true;
      console.log('重置密码表单校验通过:', resetForm);
      try {
        const response = await resetPasswordApi(resetForm.userId!, {
          newPassword: resetForm.newPassword,
          lastFourDigits: resetForm.lastFourDigits
        });
        if (response.data?.code === 200 && response.data.data === true) {
          ElMessage.success(response.data.msg || '密码重置成功');
          closeResetDialog();
        } else {
          ElMessage.error(response.data?.msg || '重置密码失败，请检查信息');
        }
      } catch (error: any) {
        console.error('重置密码请求错误:', error);
        ElMessage.error(error.response?.data?.msg || '重置密码请求失败');
      } finally {
        resetLoading.value = false;
      }
    } else {
      ElMessage.warning('请检查输入');
    }
  });
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #6b48ff, #ff4b5a);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: url('/public/bg1.png') no-repeat center;
  background-size: cover;
  opacity: 0.1;
  animation: float 10s infinite alternate;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(5%, 5%); }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

.form-header {
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-input__inner {
  border-radius: 25px;
  border-color: #ddd;
  padding: 10px 15px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.button-group .el-button {
  flex: 1;
  border-radius: 25px;
  padding: 10px 20px;
}

.button-group .forgot-password {
  font-size: 12px;
  color: #ff4b5a;
  padding: 0;
}

.reset-dialog .el-dialog {
  border-radius: 15px;
}

.reset-form .el-input__inner {
  border-radius: 25px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dialog-footer .el-button {
  border-radius: 25px;
  padding: 10px 20px;
}

@media (max-width: 600px) {
  .login-card {
    padding: 20px;
    margin: 20px;
  }
  .title {
    font-size: 24px;
  }
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  .button-group .el-button {
    width: 100%;
  }
}
</style>