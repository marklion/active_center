<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div class="list-title-ctn">
          <b class="">{{media.title}}（共{{media.list.length}}张）</b>
        </div>
      </el-col>

      <el-col :span="12" v-if="media.type === 4">
        <suggestion-form ref="suggestionForm" :title="media.title" width="75%" @confirm="handleSuggestionsConfirm"></suggestion-form>
      </el-col>
      <el-col :span="12" v-else>
        <el-button type="primary" class="media-edit-add" @click="showMediaUploadDialog(true)"><i class="el-icon-upload"> 上传</i></el-button>
        <el-dialog
          :title=media.title
          :visible.sync=media.showUploadDialog>
          <el-upload class="media-uploader"
                     :action="uploadUrl"
                     :show-file-list="false"
                     :on-success="handleMediaUploadSuccess"
                     :before-upload="beforeMediaUpload">
            <img v-if="form.mediaUrl" :src="form.mediaUrl" class="media-preview">
            <i v-else class="el-icon-plus media-uploader-icon"></i>
          </el-upload>
          <div class="media-preview-tip">{{media.limitTip}}</div>

          <el-form :model="form" label-width="100px" :rules="rules" ref="form">
            <el-form-item :label="media.title + '名称'" prop="name">
              <el-input v-model="form.name" placeholder="请输入素材名称"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="showMediaUploadDialog(false)">取 消</el-button>
            <el-button type="primary" @click="handleMediaUploadConfirm">确 定</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>

    <el-row :gutter="15" v-loading="listLoading">
      <el-empty v-if="(media.list.length === 0)" :description="media.emptyTip"></el-empty>

      <el-col v-else :span="media.rowNumber" v-for="item in media.list" :key="item._id">
        <el-card shadow="hover" :body-style="cardBody" class="media-card-panel">
          <el-image v-if="item.type === 1"
                    class="image-ctn"
                    :src="item.url"
                    :preview-src-list="[item.url]"
                    :fit="fit">
          </el-image>

          <div v-else-if="item.type === 2" class="image-ctn">
            <video class="image-ctn" :src="item.url" :poster="item.thumbnail_url" controls="controls"></video>
          </div>

          <div v-else-if="item.type === 3" class="image-ctn"
               :style="'background-image:url('+item.thumbnail_url+');background-size:cover'">
            <!--              <el-image class="image-ctn" :src="item.thumbnail_url" :fit="fit"></el-image>-->
            <audio class="image-ctn" controls="controls">
              <source :src="item.url" type="audio/mp3">
            </audio>
          </div>

          <div v-if="item.type !== 4">
            <el-radio v-model="radio" :label="item._id" @change="handleClick(item)">
              {{item.name}}
            </el-radio>
            <div class="bottom clearfix">
              <time class="time">{{ item.create_time_str}}</time>
            </div>
          </div>

          <div v-if="item.type === 4">
            <el-card>
              <div slot="header" class="clearfix">
                <el-radio v-model="radio" :label="item._id" @change="handleClick(item)">
                  {{item.name}}
                </el-radio>
              </div>
              <el-tag v-for="menu in item.menus">{{menu.display_text}}</el-tag>
            </el-card>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import {getList, save, remove} from '@/api/media'
  import {getMenus, saveMenus} from '@/api/suggestion'

  import suggestionForm from '@/components/SuggestionForm'

  export default {
    name: 'mediaCards',
    //mediaType = [image, video, audio],
    props: ["mediaType"],

    components:{
      suggestionForm
    },
    data() {
      return {
        typeMap : {
          suggestion : {
            type : 4,
            title : '悬浮菜单',
            list : [],
            rowNumber : 24,
            showUploadDialog : true,
            limitTip: '只能上传jpg/png文件，且不超过2M',
            emptyTip: '请新增一组悬浮菜单'
          },
          image : {
            type : 1,
            title : '图片',
            list : [],
            rowNumber : 4,
            showUploadDialog : false,
            limitTip: '只能上传jpg/png文件，且不超过2M',
            emptyTip: '请上传一张图片'
          },
          video : {
            type : 2,
            title : '视频',
            list : [],
            rowNumber : 4,
            showUploadDialog : false,
            limitTip: '只能上传mp4,flv文件，且不超过2M',
            emptyTip: '请上传一段视频'
          },
          audio : {
            type : 3,
            title : '音频',
            list : [],
            rowNumber : 4,
            showUploadDialog : false,
            limitTip : '只能上传mp3/wave文件，且不超过2M',
            emptyTip: '请上传一段音频'
          }
        },
        uploadUrl:'/api/v1/upload/media',
        form: {
          id:'',
          file_id : '',
          mediaUrl: '',
          name:'',
        },
        rules:{
          name:[{required: true, message: '请输入素材名称', trigger: 'blur'}]
        },
        listLoading : false,
        cardBody : {padding: 0},
        fit: 'cover',

        radio:''
      }
    },
    created(){
      this.fetchUploadedMedias();
    },
    computed : {
      media(){
        console.log('computed', this.mediaType);
        return this.typeMap[this.mediaType];
      }
    },

    methods: {
      handleClick(item){
        this.$emit('confirm', item);
      },
      showMediaUploadDialog(flag){
        this.media.showUploadDialog = flag;
      },
      handleMediaUploadSuccess(res, file, fileList){
        console.log(res.data);
        this.form.mediaUrl = '/api/v1/upload/media?id=' + res.data.id;
        this.form.file_id = res.data.id;
        this.form.name = res.data.originalname;
      },
      beforeMediaUpload(){

      },
      async fetchUploadedMedias() {
        this.listLoading = true

        let resp = await getList(this.media.type);

        if(this.media.type === 4){
          for(let item of resp){
            item.menus = await getMenus(item._id);
          }
        }
        console.log(resp)

        this.typeMap[this.mediaType].list = resp;
        this.listLoading = false
      },

      async handleMediaUploadConfirm(){
        this.showMediaUploadDialog(false);
        let res = await save({
          name : this.form.name,
          file_id : this.form.file_id,
          type : this.media.type
        });
        this.form = {
          file_id : '',
          name : '',
          mediaUrl: ''
        }
        this.fetchUploadedMedias();
      },

      async handleSuggestionsConfirm(data){
        let media = await save({
          id : data.id,
          name : data.name,
          type : this.media.type
        });
        this.form = data;
        await saveMenus(media._id, data.menus);
        this.$message.success('保存成功');
        this.fetchUploadedMedias();
      },

      onDeleteMedia(id){
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          remove(id).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.fetchUploadedMedias(this.activeName);
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '删除失败，请重新操作'
            });
          })
        })
      },
      handleMediaUploadPreview(){
        console.log('preview');
      },
      handleMediaUploadRemove(){
        console.log('remove');
      }
    }
  }
</script>

<style scoped>
  .list-title-ctn b{
    line-height: 40px;
  }
  .media-edit-add{
    float : right
  }
  .time {
    font-size: 13px;
    color: #999;
  }
  .bottom {
    line-height: 12px;
  }
  .button {
    padding: 0;
    float: right;
  }
  .btn-type-4{
    float: right;
    margin-left: 5px
  }
  .media-name{
    text-align: center;
    display: block;
  }
  .media-card-panel{
    margin-top: 15px;
  }
  .media-card-panel .selected{
    border: 1px solid #409EFF;
  }
  .image-ctn{
    width: 100%;
    height: 150px;
  }
  .dialog-footer{
    text-align: center;
  }
  /*  media upload css*/
  .media-uploader{
    width: 180px;
    height: 180px;
    margin: auto;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .media-uploader:hover{
    border-color: #409EFF;
  }
  .media-uploader-icon{
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .media-preview{
    width: 178px;
    height: 178px;
    display: block;
  }
  .media-preview-tip{
    color: #8c939d;
    padding: 5px;
    text-align: center;
  }
</style>
