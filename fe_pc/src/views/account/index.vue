<template>
  <div class="app-container">
    <tableToolBar
      :btnList="btnList"
      @click_btn_list="handleBtnsClick"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-card style="margin-top:20px;">
      <div slot="header" class="clearfix">
        <span>账号列表</span>
      </div>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="name" label="名称" align="center">
        </el-table-column>
        <el-table-column prop="account" label="账号" align="center">
        </el-table-column>
        <el-table-column prop="role.name" label="角色" align="center">
        </el-table-column>
        <el-table-column prop="club.name" label="俱乐部" align="center">
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" align="center">
          <template v-slot="scope">
            {{ scope.row.create_time | formatTime }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="goEdit(scope.row._id)" type="text" size="small">编辑</el-button>
            <el-button @click="handleDel(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="导入会员" :visible.sync="batchVisible" custom-class="upload-dialog">
      <el-form>
        <el-form-item label="会员文件">
          <el-upload
            :auto-upload="false" ref="uploadFile"
            :on-success="importSuccHandler"
            drag :limit="1" :with-credentials="true" accept=".xls, .xlsx"
            action="/api/v1/upload/user">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              请上传excel（.xls、.xlsx）文件，一次最多5万条会员记录<br>
              角色和手机号码栏为必填项<br>
              账号，账号名称不填默认为手机号。密码不填默认为手机号后6位<br>
              <el-link icon="el-icon-download" type="primary" @click="downloadTemplate">导入模板下载</el-link>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">

        <el-button @click="onCancelUpload">取 消</el-button>
        <el-button type="primary" @click="submitUserFile">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'
  import { getList, add, remove } from '@/api/account'
  import { downloadTemplate } from "@/api/download";

  export default {
    name: 'account',

    components:{
      tableToolBar
    },

    mounted(){
      this.getDataList();
    },

    data(){
      return {
        btnList :[{title : '新增'}, {title : '批量导入', icon : 'el-icon-document-add'}],
        showAddDialog : false,
        batchVisible : false,

        tableData : [],
        formatDate : {}
      }
    },
    methods : {
      goEdit(id) {
        if (id !== undefined) {
          this.$router.push({path: '/account/edit', query: {id}});
        } else {
          this.$router.push({path: '/account/edit'});
        }
      },
      async getDataList() {
        this.tableData = await getList();
      },
      async handleSearch(keyword) {
        this.$message.success(keyword);
      },
      async handleBtnsClick(index) {
        if (index === 0) {
          //single add
          this.goEdit()
        }
        if (index === 1) {
          //batch import
          this.batchVisible = true;
        }
      },
      downloadTemplate() {
        downloadTemplate({name: 'userTmpl'});
      },
      async submitUserFile() {
        if(this.$refs.uploadFile.uploadFiles.length === 0){
          return this.$message.error('请选择文件后再上传')
        }
        this.$refs.uploadFile.submit();
      },
      onCancelUpload(){
        this.$refs.uploadFile.clearFiles();
        this.batchVisible = false
      },
      async importSuccHandler(resp) {
        if(resp.code === 200){
          if( resp.data.total !== resp.data.success){
            this.$message({
              showClose: true,
              duration: 0,
              type:'warning',
              message: `上传成功，解析账号：${resp.data.total},
                成功保存：${resp.data.success}。
                ${resp.data.message || ''}`
            })

          }else{
            this.$message({
              type:'success',
              message: `上传成功，解析账号：${resp.data.total},
              成功保存：${resp.data.success}。`})
          }
        }else{
          this.$message({
            type: 'error',
            message: resp.msg
          })
        }

        this.$refs.uploadFile.clearFiles();
        this.batchVisible = false;
        await this.getDataList();
      },
      setPermissions() {
      },
      showEditDialog() {
      },
      handleDel(rowData) {
        this.$confirm('该操作将删除此客户数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          await remove(rowData._id);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          await this.getDataList();
        }).catch();
      }
    }
  }
</script>

<style scoped>
</style>
