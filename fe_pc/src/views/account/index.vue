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
          <template slot-scope="scope">
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

    <el-dialog title="导入会员" :visible.sync="batchVisible">
      <el-form>
        <el-form-item label="会员文件" label-width="120px">
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

        <el-button @click="batchVisible = false">取 消</el-button>
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
        //此处可以是先校验文件，然后再做插入。目前的策略是直接导入文件，然后返回结果
        this.$refs.uploadFile.submit();
      },
      async importSuccHandler(resp) {
        this.$message({
          type: 'success',
          message: `会员总数：${resp.data.total},
        成功上传：${resp.data.success}`
        })
        this.batchVisible = false;
        this.getDataList();
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
