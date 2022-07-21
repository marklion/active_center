<template>
  <div class="app-container">
    <tableToolBar
      :btnList="btnList"
      @click_btn_list="handleBtnsClick"
      @click_reset="getDataList"
      @click_search="handleSearch"></tableToolBar>

    <el-row :gutter="10">
      <el-col :span="19">
        <el-card style="margin-top:20px;">
          <div slot="header" class="clearfix">
            <span>用户列表</span>
            <el-button-group style="float: right">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="batchHandler('tag')">修改标签</el-button>
<!--              <el-button type="primary" size="mini" icon="el-icon-warning-outline" @click="batchHandler('black')">加黑</el-button>-->
              <el-button type="primary" size="mini" icon="el-icon-delete" @click="batchHandler('del')">删除</el-button>
            </el-button-group>
          </div>

          <el-table :data="contactList"
                    @selection-change="handleSelectionChange"
                    stripe style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>

            <el-table-column prop="mobile" label="手机号" align="center"></el-table-column>

            <el-table-column prop="name" label="姓名" align="center"></el-table-column>

            <el-table-column prop="gender" label="性别" align="center">
              <template slot-scope="scope">
                {{scope.row.gender === 1 ? '男': (scope.row.gender === 0 ? '女' : '') }}
              </template>
            </el-table-column>

            <el-table-column prop="birthday" label="生日" align="center">
              <template slot-scope="scope">
                {{scope.row.birthday | formatDate}}
              </template>
            </el-table-column>

            <el-table-column prop="tags" label="标签" align="center">
              <template slot-scope="scope">
                <el-tag size="small" v-for="tag in scope.row.tags">{{getTagName(tag)}}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="comment" label="备注" align="center"></el-table-column>

            <el-table-column
              fixed="right"
              label="操作"
              width="100">
              <template slot-scope="scope">
                <el-button @click="editContactHandler(scope.row)" type="text" size="small">编辑</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-popconfirm title="确定删除这个号码？" @confirm="delByIdHandler(scope.row._id)">
                  <el-button slot="reference" type="text" size="small">删除</el-button>
                </el-popconfirm>

              </template>
            </el-table-column>
          </el-table>

        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card style="margin-top:20px;">
          <div slot="header" class="clearfix">
            <el-button-group style="float: right">
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="addTag">新建标签</el-button>
            </el-button-group>
          </div>
          <div><el-tag
            v-for="tag in tagList"
            :key="tag.name"
            closable @close="removeTag(tag._id)">
            {{tag.name}}（{{tag.ref_count}}）
          </el-tag></div>
        </el-card>
      </el-col>
    </el-row>


    <el-dialog title="添加通讯录" :visible.sync="singleVisible">
      <el-form :model="form" :rules="contactRules" ref="contactForm">
        <el-form-item label="姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
          <el-input type="number" v-model="form.mobile"></el-input>
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth">
          <el-select v-model="form.gender">
            <el-option value="1" label="男">男</el-option>
            <el-option value="0" label="女">女</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生日" :label-width="formLabelWidth">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择出生年月">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="标签" :label-width="formLabelWidth">
          <el-select v-model="form.tags" multiple placeholder="请选择标签">
            <el-option v-for="item in tagList" :value="item._id" :label="item.name">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="form.comment" type="textarea" rows="2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddContactItem">取 消</el-button>
        <el-button type="primary" @click="addContactItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入通讯录" :visible.sync="batchVisible">
      <el-form>
        <el-form-item label="通讯录文件" :label-width="formLabelWidth">
          <el-upload
            :auto-upload="false" ref="uploadContact"
            :on-success="importSuccHandler"
            drag :limit="1" :with-credentials="true" accept=".xls, .xlsx"
            action="/api/v1/upload/contact">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              请上传excel（.xls、.xlsx）文件，一次最多5万条号码<br>
              姓名和号码拦为必填项，如果有多个标签请用逗号（,）分割<br>
              文件中的标签如果不存在，会自动创建<br>
              <el-link icon="el-icon-download" type="primary" @click="downloadTemplate">导入模板下载</el-link>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">

        <el-button @click="batchVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitContactFile">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改标签" :visible.sync="tagEditVisible">
      <el-form>
        <el-form-item label="标签" :label-width="formLabelWidth">
          <el-select v-model="tagEditForm" multiple placeholder="请选择标签">
            <el-option v-for="item in tagList" :value="item._id" :label="item.name">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelTagEdit">取 消</el-button>
        <el-tooltip placement="top" effect="light">
          <div slot="content">将会<b>删除</b>原通讯录标签，<br/><b>更新</b>为本次选中的标签</div>
          <el-button type="primary" @click="tagUpdateHandler('cover')">覆 盖</el-button>
        </el-tooltip>
        <el-tooltip placement="bottom" effect="light">
          <div slot="content">将会在原通讯录标签的基础上<b>追加</b>本次的选中的标签，<br/>重复标签不作添加</div>
          <el-button type="primary" @click="tagUpdateHandler('append')">追 加</el-button>
        </el-tooltip>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import tableToolBar from '@/components/TableToolBar'

  import * as tagApi from '@/api/tag'
  import * as contactApi from '@/api/contact'

  export default {
    name: 'index',
    components:{
      tableToolBar
    },
    async created(){
      await this.refreshView();
    },
    data(){
      return {
        btnList : [{title : '新增'}, {title : '批量导入', icon : 'el-icon-document-add'}],
        singleVisible : false,
        formLabelWidth : '120px',
        form : {
          name : '',
          mobile : '',
          gender : '',
          birthday : '',
          tags : [],
          comment : ''
        },
        contactRules: {
          name : [{required:true, message:'请输入客户姓名', trigger: 'blur'}],
          mobile : [
            {required: true, message:'请输入手机号码', trigger: 'blur'},
            {min: 11, max: 11, message:'请输入正确格式的手机号码', trigger: 'blur'}
            ]
        },

        tagEditVisible : false,
        tagEditForm : [],

        batchVisible :false,


        tagMap:{},
        tagList:[],
        contactList :[],
        selectedContacts : []
      }
    },
    methods : {
      async refreshView(){
        await this.loadTags();
        this.loadContacts();
      },
      getTagName(tagId){
        return this.tagMap[tagId].name;
      },
      async loadContacts(){
        this.contactList = await contactApi.getList();
      },
      async loadTags(){
        this.tagList = await tagApi.getList();
        this.tagList.map(tag => {this.tagMap[tag._id] = tag});
      },
      async removeTag(id){
        try{
          await tagApi.remove(id)
          this.loadTags();
          this.$message({
            type: 'success',
            message: '删除成功'
          });
        }catch(err){
          // this.$message({
          //   type: 'error',
          //   message: err
          // });
        }
      },
      async handleBtnsClick(index){
        if(index === 0){
          //single add
          this.singleVisible = true;
          this.resetContactForm();
        }
        if(index === 1){
          //batch import
          this.batchVisible = true;
        }
      },
      async editContactHandler(data){
        this.form = _.cloneDeep(data)
        this.singleVisible = true;
      },
      async delByIdHandler(id){
        await contactApi.remove(id);
        this.$message({type : 'success', message: '删除成功'})
        this.refreshView();
      },
      async addContactItem(){
        this.$refs.contactForm.validate(async valid => {
          if(valid){
            if(this.form._id){
              await contactApi.updateById(this.form._id, this.form);
            }else{
              await contactApi.add(this.form);
            }
            this.refreshView();
            this.$message({
              type: 'success',
              message: '添加成功'
            });
            this.singleVisible = false;
          }else{
            return false;
          }
        })
      },
      async submitContactFile(){
        //此处可以是先校验文件，然后再做插入。目前的策略是直接导入号码文件，然后返回结果
        this.$refs.uploadContact.submit();
      },
      async importSuccHandler(resp){
        this.$message({
          type : 'success',
          message : `号码总数：${resp.data.total},
        成功上传：${resp.data.success}`})
        this.batchVisible = false;
        this.refreshView();
      },
      cancelAddContactItem(){
        this.resetContactForm()
        this.singleVisible = false;
      },
      async addTag(){
        this.$prompt('请输入标签名', '新建', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(async  ({ value }) => {
          await tagApi.add({
            name : value
          });
          this.loadTags();
          this.$message({
            type: 'success',
            message: '添加成功'
          });
        }).catch((err) => {
          // this.$message({
          //   type: 'error',
          //   message: err
          // });
        });
      },
      getDataList(){
        this.refreshView();
      },
      async handleSearch(key){
        this.contactList = await contactApi.getList(key ? {mobile : key} : undefined);
      },
      handleSelectionChange(val){
        this.selectedContacts = val;
      },
      resetContactForm(){
        this.form = {
          name : '',
          mobile : '',
          gender : '',
          birthday : '',
          tags : [],
          comment : ''
        }
      },
      async batchHandler(type){
        if(this.selectedContacts.length === 0){
          return this.$message({type : 'error', message: '没有选中的条目'})
        }
        switch(type){
          case 'tag':{
            this.tagEditVisible = true;
            break;
          }
          case 'black':{
            break;
          }
          case 'del':{
            let ids = this.selectedContacts.map(item => item._id)
            this.doBatchDel(ids)
            break;
          }
        }
      },
      async doBatchDel(ids){
        await contactApi.removeBatch(ids);
        this.refreshView();
      },
      cancelTagEdit(){
        this.tagEditVisible = false;
      },
      async tagUpdateHandler(type){
        let ids = this.selectedContacts.map(item => item._id)
        await contactApi.updateBatch({
          ids, type, tags : this.tagEditForm
        });
        this.$message({type : 'success', message : '更新标签成功'})
        this.tagEditVisible = false;
        this.refreshView();

        this.tagEditForm = [];
      },
      downloadTemplate(){
        contactApi.downloadTmpl();
      }
    }
  }
</script>

<style scoped>
  /*.el-tag + .el-tag {*/
  /*  margin-left: 10px;*/
  /*  margin-bottom: 10px;*/
  /*}*/
  .el-tag{
    margin-right: 10px;
    margin-bottom: 10px;
  }
</style>
