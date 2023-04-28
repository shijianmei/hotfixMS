<template>
  <div class="container">
    <div class="title">热修复管理</div>
    <div class="add-button">
      <el-button type="primary" @click="handleAdd()" v-permission="'新增热修复包'"> 添加热修复</el-button>
    </div>
    <div class="table-container">
      <el-table :data="contentList">
        <el-table-column label="ID" width="60" align="center" prop="id"></el-table-column>
        <el-table-column label="平台" prop="platform" width="100">
          <template #default="scope">
            {{ platformType[scope.row.platform] }}
          </template>
        </el-table-column>
        <el-table-column label="资源名称" prop="package" width="150"></el-table-column>
        <el-table-column label="资源类型" prop="type" width="60"></el-table-column>
        <el-table-column label="资源状态" prop="status" width="100">
          <template #default="scope">
            {{ statusDict[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="版本号" prop="version" width="100"></el-table-column>
        <el-table-column label="修复描述" prop="desc"></el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="scope">
            <el-button
              @click="handlePublic(scope.row)"
              v-permission="{ permission: '更新热修复包状态', type: 'disabled' }"
              >发布</el-button
            >
            <el-button
              @click="handlePause(scope.row)"
              v-permission="{ permission: '更新热修复包状态', type: 'disabled' }"
              v-if="scope.row.status == 1"
              >暂停</el-button
            >
            <el-button
              @click="handleResume(scope.row)"
              v-permission="{ permission: '更新热修复包状态', type: 'disabled' }"
              v-else-if="scope.row.status == 2"
              >继续</el-button
            >
            <el-button
              @click="handleEnd(scope.row)"
              v-permission="{ permission: '更新热修复包状态', type: 'disabled' }"
              type="danger"
              :disabled="scope.row.status === 0"
              >结束</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          @size-change="sizeChange"
          @current-change="pageChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 40, 100]"
          :page-size="size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          small
        >
        </el-pagination>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      width="600px"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="resetForm"
    >
      <el-form ref="form" :model="temp" label-width="90px" :rules="rules">
        <el-form-item label="平台:" prop="platform">
          <el-radio-group v-model="temp.platform">
            <el-radio-button label="1">Android</el-radio-button>
            <el-radio-button label="0">iOS</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="修复包:" prop="file">
          <el-upload
            class="upload-demo"
            :action="uploadFileUrl"
            :headers="headers"
            :multiple="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :file-list="fileList"
            accept=".mg"
            ref="fileUpload"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">支持扩展名：.mg，且不超过 1M</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="目标版本:" prop="version">
          <el-col :span="13">
            <el-input v-model="temp.version" placeholder="如:1.0.1"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="修复描述:" prop="desc">
          <el-col :span="13">
            <el-input
              type="textarea"
              placeholder="请填写修复描述，最大字数200"
              show-word-limit
              :rows="3"
              v-model="temp.desc"
            ></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHotFixClose()">取 消</el-button>
        <el-button type="primary" @click="addHotFixAdd()">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" v-model="showDeleteDialog" center width="400px">
      <span class="dialog-title">确认停止该热修复</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDeleteDialog = false">取 消</el-button>
        <el-button type="danger" @click="confirmDelete()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { HotFixModel } from '@/model/hotFix'
import { getToken } from '@/lin/util/token'

export default {
  name: 'List',
  data() {
    const validateFile = (rule, value, callback) => {
      // 验证器
      if (!this.checkImgSuccess) {
        callback(new Error('请上传热修复包'))
      } else {
        callback()
      }
    }
    return {
      contentList: [],
      currentPage: 1,
      currentsize: 10,
      total: 100,
      platformType: {
        0: 'iOS',
        1: 'Android',
      },
      statusDict: {
        0: '已停止',
        1: '发布中',
        2: '已暂停',
        3: '已就绪',
      },
      dialogTitle: '',
      dialogVisible: false,
      showDeleteDialog: false,
      current_page: 2,
      temp: {
        id: null,
        package: null,
        type: null,
        platform: 0,
        status: null,
        desc: null,
        version: null,
        pubdate: '',
        path: '',
      },
      // 文件上传
      uploadList: [],
      uploadFileUrl: `${process.env.VUE_APP_BASE_URL}cms/file/`, // 上传文件服务器地址
      headers: {
        Authorization: getToken('access_token'),
      },
      fileList: [],
      // 规则
      rules: {
        file: [{ required: true, validator: validateFile, trigger: 'change' }],
        version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
      },
      checkImgSuccess: true,
    }
  },
  created() {
    this.getContentList()
  },
  methods: {
    // 发布热修复
    handlePublic(row) {
      this.temp.id = row.id
      this.temp.status = 1
      this.editHotFixStatus()
    },
    // 暂停热修复
    handlePause(row) {
      this.temp.id = row.id
      this.temp.status = 2
      this.editHotFixStatus()
    },
    // 继续热修复
    handleResume(row) {
      this.temp.id = row.id
      this.temp.status = 1
      this.editHotFixStatus()
    },
    // 停止热修复
    confirmDelete() {
      this.temp.status = 0
      this.temp.type = ''
      this.editHotFixStatus()
    },
    handleEnd(row) {
      this.showDeleteDialog = true
      this.temp.id = row.id
    },
    handleAdd() {
      this.dialogTitle = '添加热修复'
      this.dialogVisible = true
    },
    resetForm() {
      this.$refs.form.resetFields()
    },
    addHotFixClose() {
      this.fileList = []
      this.uploadList = []
      this.temp.package = ''
      this.resetForm()
      this.dialogVisible = false
    },
    // 获取热修复包列表
    async getContentList() {
      const res = await HotFixModel.getHotFixList(this.currentsize, this.currentPage)
      this.contentList = res.items
      this.total = res.total
    },

    // 更新热修复包状态
    async editHotFixStatus() {
      const { id } = this.temp
      this.showDeleteDialog = false
      delete this.temp.id
      const res = await HotFixModel.editHotFix(id, this.temp.status)
      this.$message.success(res.message) // 提示信息
      await this.getContentList()
    },
    // 添加热修复包
    async addHotFixAdd() {
      this.temp.status = 3 // 更新状态为就绪
      this.$refs.form.validate(async valid => {
        if (valid) {
          delete this.temp.id
          const res = await HotFixModel.addHotFix(this.temp)
          this.$refs.form.resetFields('fileUpload')
          this.fileList = []
          this.uploadList = []
          this.dialogVisible = false
          this.$message.success(res.message) // 提示信息
          await this.getContentList() // 刷新列表
        }
      })
    },
    // 文件上传相关
    handleExceed() {
      this.$message.warning('仅能上传一个文件')
    },
    // 上传成功回调
    handleUploadSuccess(response, file) {
      // console.log(response);
      if (file.status === 'success') {
        const fileUrl = `${process.env.VUE_APP_BASE_URL}assets/${response[0].path}`
        console.log(`jianmei_fileurl:${fileUrl}`)
        this.uploadList.push({ name: file.name, url: fileUrl })
        this.fileList = this.uploadList
        this.temp.package = file.name
        this.temp.path = response[0].path
        this.temp.type = file.name.substring(file.name.lastIndexOf('.') + 1) // 后缀名
        this.$refs.form.clearValidate(['fileUpload'])
        this.checkImgSuccess = true
      } else {
        this.$message.error('上传失败')
        this.$refs.fileUpload.handleRemove(file)
      }
    },
    beforeUpload(file) {
      const extName = file.name.substring(file.name.lastIndexOf('.') + 1) // 后缀名
      const isMg = extName === 'mg'
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isMg) {
        this.$message.error('上传文件只能是 mg 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 1MB!')
      }
      return isMg && isLt2M
    },
    // 分页
    sizeChange(val) {
      this.currentsize = val
      // size变化时，默认定位到第一页
      this.currentPage = 1
      this.getContentList()
    },
    pageChange(val) {
      this.currentPage = val
      this.getContentList()
    },
  },
}
</script>

<style scoped lang="scss">
.container {
  .title {
    height: 59px;
    line-height: 59px;
    color: $parent-title-color;
    font-size: 16px;
    font-weight: 500;
    text-indent: 40px;
    border-bottom: 1px solid #dae1ec;
  }
  .add-button {
    padding: 20px 40px;
  }
  .table-container {
    padding: 0 40px 20px 40px;
  }
  .pagination {
    display: flex;
    justify-content: center;
    margin: 20px;
  }
  .dialog-title {
    display: flex;
    align-content: top;
    justify-content: center;
    font-size: 16px;
  }
  .dialog-footer {
    display: flex;
    justify-content: center;
    margin-bottom: 0px;
    margin-top: 20px;
  }
}
</style>
