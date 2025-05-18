<template>
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>个人设置</span>
        </div>
      </template>

      <el-form label-width="120px" :model="form" :rules="rules" ref="formRef" class="settings-form">

        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader-container"
            action=""
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :auto-upload="false"
          >
            <template #trigger>
              <div class="avatar-upload-area">
                <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar-preview" alt="头像" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" class="custom-input" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" class="custom-input" />
        </el-form-item>

        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="不修改可留空"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="save" class="save-button">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, FormInstance, FormRules, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const formRef = ref<FormInstance>();

const form = ref({
  avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d4db2765fd6c36bd42b25e178a.png',
  nickname: '张三',
  email: 'zhangsan@example.com',
  password: '',
});

const emailValidator = (rule: any, value: string, callback: any) => {
    if (!value) {
        return callback(new Error('请输入邮箱'));
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'));
    } else {
        callback();
    }
};

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: emailValidator, trigger: 'blur' }
  ],
  password: [
    { min: 6, message: '密码至少需要 6 位', trigger: 'blur' },
    { max: 20, message: '密码最长 20 位', trigger: 'blur' }
  ],
};

function handleAvatarChange(file: any) {
  const isJpgOrPng = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png';
  const isLt2M = file.raw.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!');
    return false;
  }

  const reader = new FileReader();
  reader.onload = () => {
    form.value.avatarUrl = reader.result as string;
  };
  reader.readAsDataURL(file.raw);
}

function save() {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('准备保存用户信息：', {
        nickname: form.value.nickname,
        email: form.value.email,
        password: form.value.password || undefined,
        avatarUrl: form.value.avatarUrl
      });
      ElMessage.success('用户信息已保存 (模拟)!');

    } else {
      ElMessage.warning('请检查输入项并填写必填项');
    }
  });
}
</script>

<style scoped>
.settings-card {
  padding: 30px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 20px auto;
}

.card-header {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.settings-form {
}

.avatar-uploader-container {
}

.avatar-upload-area {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-upload-area:hover {
  border-color: #409EFF;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-uploader-icon {
  font-size: 30px;
  color: #8c939d;
}

:deep(.custom-input .el-input__wrapper) {
  border-radius: 8px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
   border-color: #409EFF;
   box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.custom-input .el-input__wrapper:hover) {
   border-color: #a0cfff;
}

.save-button {
  min-width: 120px;
  border-radius: 8px;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: opacity 0.3s ease;
}

.save-button:hover {
  opacity: 0.9;
}
</style>