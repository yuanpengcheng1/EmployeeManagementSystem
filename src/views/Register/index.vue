<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 注册表单 -->
      <div class="form-header">
        <h2 class="title">欢迎注册</h2>
        <p class="subtitle">Dreamguy's Technologies</p>
      </div>
      <el-form :model="form" :rules="rules" ref="registerFormRef" label-width="auto" class="register-form">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" clearable />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8081/upload/image"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :on-error="handleAvatarError"
            :limit="1"
            :on-exceed="handleExceed"
            accept="image/jpeg,image/png,image/gif"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" alt="头像预览" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" :loading="loading" @click="submitForm(registerFormRef)">立即注册</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import router from '@/router';
import { addUserApi } from '@/api/LoginApi';
import { ElMessage, type FormInstance, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { CreateUserPayload } from '@/api/LoginApi';

const registerFormRef = ref<FormInstance>();
const loading = ref(false);

// 表单数据
const form: CreateUserPayload = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  avatar: ''
});

// 表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度应在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度应在 6 到 30 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的电子邮箱地址', trigger: 'blur' }
  ],
  avatar: [
    { required: true, message: '请上传头像', trigger: 'change' }
  ]
});

// 头像上传处理函数
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  const res = response as { code?: number; msg?: string; data?: string };
  console.log('上传成功响应:', res);
  if (res.code === 200 && res.data) {
    form.avatar = res.data;
    ElMessage.success('头像上传成功');
    registerFormRef.value?.validateField('avatar').catch(() => {});
  } else {
    console.error('头像上传失败:', res.msg);
    ElMessage.error(res.msg || '头像上传失败');
    form.avatar = '';
  }
};

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/');
  const isLt2M = rawFile.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error('上传文件必须是图片格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleAvatarError: UploadProps['onError'] = (error, uploadFile, fileList) => {
  console.error('头像上传请求失败:', error);
  ElMessage.error('头像上传请求失败，请稍后再试');
  form.avatar = '';
};

const handleExceed: UploadProps['onExceed'] = (files, fileList) => {
  ElMessage.warning('最多只能上传一张头像图片');
};

// 表单提交处理函数
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      console.log('表单校验通过，正在发送注册请求...', form);
      try {
        const response = await addUserApi(form);
        if (response.data?.code === 200) {
          console.log('注册成功:', response.data.msg);
          ElMessage.success(response.data.msg || '注册成功');
          router.push('/');
        } else {
          console.error('注册失败:', response.data?.msg);
          ElMessage.error(response.data?.msg || '注册失败，请稍后再试');
        }
      } catch (error: any) {
        console.error('注册请求发生错误:', error);
        ElMessage.error(error.response?.data?.msg || '注册请求失败，请稍后再试');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('表单校验失败');
      ElMessage.warning('请检查表单填写是否正确');
    }
  });
};

// 返回登录页面
const goToLogin = () => {
  router.push('/');
};
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #6b48ff, #ff4b5a);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.register-container::before {
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

.register-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: transform 0.3s ease;
}

.register-card:hover {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-form .el-input__inner {
  border-radius: 25px;
  border-color: #ddd;
  padding: 10px 15px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
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

@media (max-width: 600px) {
  .register-card {
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