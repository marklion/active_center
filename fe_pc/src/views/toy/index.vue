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
            <span>鸽子列表</span>
            <el-button-group style="float: right">
              <el-button type="primary" size="mini" icon="el-icon-edit" @click="batchHandler('tag')">修改标签</el-button>
<!--              <el-button type="primary" size="mini" icon="el-icon-warning-outline" @click="batchHandler('black')">加黑</el-button>-->
              <el-button type="primary" size="mini" icon="el-icon-delete" @click="batchHandler('del')">删除</el-button>
            </el-button-group>
          </div>

          <el-table :data="toyList"
                    @selection-change="handleSelectionChange"
                    stripe style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>

            <el-table-column prop="ring_no" label="环号" align="center"></el-table-column>

            <el-table-column prop="player.account" label="归属玩家" align="center"></el-table-column>

            <el-table-column prop="leader.account" label="归属团长" align="center">

            </el-table-column>

            <el-table-column prop="club.name" label="俱乐部" align="center">

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
                <el-button @click="editToyHandler(scope.row)" type="text" size="small">编辑</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-popconfirm title="确定删除这只鸽子吗？" @confirm="delByIdHandler(scope.row._id)">
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
            :key="tag._id"
            closable @close="removeTag(tag._id)">
            {{tag.name}}（{{tag.ref_count}}）
          </el-tag></div>
        </el-card>
      </el-col>
    </el-row>


    <el-dialog title="添加鸽子" :visible.sync="singleVisible" @opened="setClubAndLoadData">
      <el-form :model="form" :rules="toyRules" ref="toyForm">
        <el-form-item label="俱乐部" :label-width="formLabelWidth">
          <el-select v-model="form.club"
                     ref="clubSelector"
                     filterable
                     default-first-option
                     placeholder="请选择对应俱乐部"
                     @change="setClubAndLoadData">
            <el-option v-for="item in clubList" :value="item._id" :label="item.name">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="环号" :label-width="formLabelWidth" prop="ring_no">
          <el-input v-model="form.ring_no"></el-input>
        </el-form-item>
        <el-form-item label="归属玩家" :label-width="formLabelWidth" prop="player">
          <el-select v-model="form.player" filterable default-first-option placeholder="请选择归属玩家">
            <el-option v-for="item in playerList" :value="item._id" :label="item.account">{{item.account}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="归属团长" :label-width="formLabelWidth" prop="leader">
          <el-select v-model="form.leader" filterable default-first-option placeholder="请选择归属团长">
            <el-option v-for="item in leaderList" :value="item._id" :label="item.account">{{item.account}}</el-option>
          </el-select>
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
        <el-button @click="cancelAddToy">取 消</el-button>
        <el-button type="primary" @click="addToyItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入鸽子" :visible.sync="batchVisible">
      <el-form>
        <el-form-item label="鸽子文件">
          <el-upload
            :auto-upload="false" ref="uploadToy"
            :on-success="importSuccHandler"
            drag :limit="1" :with-credentials="true" accept=".xls, .xlsx"
            action="/api/v1/upload/toy">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              请上传excel（.xls、.xlsx）文件，一次最多5万条记录<br>
              环号、团长，玩家栏为必填项，如果有多个标签请用逗号（,）分割<br>
              文件中的标签如果不存在，会自动创建<br>
              <el-link icon="el-icon-download" type="primary" @click="doDownloadTemplate">导入模板下载</el-link>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">

        <el-button @click="onCancelUpload">取 消</el-button>
        <el-button type="primary" @click="submitToyFile">确 定</el-button>
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

  import * as toyApi from '@/api/toy'
  import * as tagApi from '@/api/tag'
  import * as userApi from '@/api/account'
  import * as clubApi from '@/api/club'
  import {downloadTemplate} from "@/api/download";

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
          ring_no : '',
          player : '',
          leader : '',
          club : '',
          house_no : '',
          tags : [],
          comment : ''
        },

        loadingPlayer: false,

        toyRules: {
          club : [{required:true, message:'请选择归属俱乐部', trigger: 'blur'}],
          mobile : [
            {required: true, message:'请输入手机号码', trigger: 'blur'},
            {min: 11, max: 11, message:'请输入正确格式的手机号码', trigger: 'blur'}
            ]
        },

        tagEditVisible : false,
        tagEditForm : [],

        batchVisible :false,


        tagMap:{},
        clubList:[],
        playerList:[],
        leaderList:[],
        tagList:[],
        toyList :[],
        selectedToys : []
      }
    },
    methods : {
      async refreshView(){
        await this.loadTags();
        await this.loadToys();
        this.clubList = await clubApi.getList();
      },
      getTagName(tagId){
        console.log(tagId)
        return this.tagMap[tagId].name;
      },
      async loadToys(){
        this.toyList = await toyApi.getList();
      },
      async loadPlayer(club){
        this.playerList = await userApi.getClubPlayers(club);
      },
      async loadLeader(club){
        this.leaderList = await userApi.getClubLeaders(club);
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
          this.resetToyForm();
        }
        if(index === 1){
          //batch import
          this.batchVisible = true;
        }
      },
      async editToyHandler(data){
        let cloneData = _.cloneDeep(data)
        this.form = {
          _id : cloneData._id,
          ring_no : cloneData.ring_no,
          player : cloneData.player._id,
          leader : cloneData.leader._id,
          club : cloneData.club._id,
          house_no : cloneData.house_no,
          tags : cloneData.tags,
          comment : cloneData.comment
        }
        this.singleVisible = true;
      },
      async delByIdHandler(id){
        await toyApi.remove(id);
        this.$message({type : 'success', message: '删除成功'})
        this.refreshView();
      },
      async addToyItem() {
        let valid = await this.$refs.toyForm.validate();
        if (valid) {
          if (this.form._id) {
            await toyApi.updateById(this.form._id, this.form);
          } else {
            await toyApi.add(this.form);
          }
          await this.refreshView();
          this.$message({
            type: 'success',
            message: '添加成功'
          });
          this.singleVisible = false;
        } else {
          return false;
        }
      },
      async submitToyFile(){
        if(this.$refs.uploadToy.uploadFiles.length === 0){
          return this.$message.error('请选择文件后再上传')
        }
        this.$refs.uploadToy.submit();
      },
      onCancelUpload(){
        this.$refs.uploadToy.clearFiles();
        this.batchVisible = false
      },
      async importSuccHandler(resp){
        if(resp.code === 200){
          if( resp.data.total !== resp.data.success){
            this.$message({
              showClose: true,
              duration: 0,
              type:'warning',
              message: `上传成功，解析数量：${resp.data.total},
                成功保存：${resp.data.success}。
                ${resp.data.message || ''}`
            })
          }else{
            this.$message({
              type : 'success',
              message : `上传成功，解析数量：${resp.data.total},
        成功上传：${resp.data.success}`})
          }
        }else{
          this.$message({
            type: 'error',
            message: resp.msg
          })
        }
        this.$refs.uploadToy.clearFiles();
        this.batchVisible = false;
        await this.refreshView();
      },
      cancelAddToy(){
        this.resetToyForm()
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
        this.toyList = await toyApi.getList(key ? {ring_no : key} : undefined);
      },
      handleSelectionChange(val){
        this.selectedToys = val;
      },
      resetToyForm(){
        this.form = {
          club : '',
          ring_no : '',
          player : '',
          leader : '',
          house_no : '',
          tags : [],
          comment : ''
        }
      },
      async batchHandler(type){
        if(this.selectedToys.length === 0){
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
            let ids = this.selectedToys.map(item => item._id)
            this.doBatchDel(ids)
            break;
          }
        }
      },
      async doBatchDel(ids){
        await toyApi.deleteBatch(ids);
        this.refreshView();
      },
      cancelTagEdit(){
        this.tagEditVisible = false;
      },
      async tagUpdateHandler(type){
        let ids = this.selectedToys.map(item => item._id)
        await toyApi.updateBatch({
          ids, type, tags : this.tagEditForm
        });
        this.$message({type : 'success', message : '更新标签成功'})
        this.tagEditVisible = false;
        this.refreshView();

        this.tagEditForm = [];
      },
      doDownloadTemplate(){
        downloadTemplate({name: 'toyTmpl'})
      },
      async setClubAndLoadData(club){
        if(!club){
          club = this.clubList[0]._id;
          this.$set(this.form, 'club', club);
        }
        await this.loadPlayer(club)
        await this.loadLeader(club)
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
