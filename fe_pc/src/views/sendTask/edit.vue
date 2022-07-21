<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" :content=title />
    </el-row>
    <el-row>
      <el-col :span="8">
        <phonePreview :template="template"></phonePreview>
      </el-col>
      <el-col :span="16">

        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="任务名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>

          <el-form-item label="发送模板" prop="template">
            <el-input v-model="form.template" style="display:none"></el-input>
            <el-link type="primary" @click="showTemplateListDialog"><i class="el-icon-document-add">点击选择模板</i></el-link>
            <span v-if="template">
                <el-divider direction="vertical"></el-divider>
                <el-tag>
<!--                  {{template.name +' | '+ template.type}}-->
                  {{template.name}}
                </el-tag>
            </span>
          </el-form-item>

          <el-form-item label="Chatbot">
            <el-select v-model="form.chatbot" disabled placeholder="请选择"></el-select>
          </el-form-item>

          <el-form-item label="发送号码" prop="mobiles.type">
            <el-radio-group v-model="form.mobiles.type">
              <el-radio label="file">上传文件</el-radio>
              <el-radio label="contact">通讯录选取</el-radio>
              <el-radio label="input">键盘输入</el-radio>
            </el-radio-group>

            <el-alert v-if="!!phone" :title="phoneResultTitle"
                      type="success" :closable="false"
                      :description="phoneResultDesc"
                      show-icon>
            </el-alert>
          </el-form-item>

          <el-form-item v-if="form.mobiles.type === 'file'" label="上传号码文件" prop="mobiles.file">
            <el-upload
              :file-list="form.mobiles.file"
              drag :limit="1" :with-credentials="true" accept=".txt, .csv, .xls, .xlsx"
              :http-request="uploadMobiles"
              :on-remove="removeFileHandler"
              action="/api/v1/upload/mobiles"
              >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">每行一个号码，文件大小不要超过200KB</div>
            </el-upload>
          </el-form-item>

          <el-form-item v-if="form.mobiles.type === 'contact'" label="选择号码标签" prop="mobiles.contact">
            <el-select v-model="form.mobiles.contact" multiple placeholder="请选择标签" @change="contactHandler">
              <el-option
                v-for="tag in tags"
                :key="tag._id"
                :label="tag.name"
                :value="tag._id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item v-if="form.mobiles.type === 'input'" label=" " prop="mobiles.input">
            <el-input ref="inputMobiles" v-model="form.mobiles.input"
                      placeholder="请输入发送号码, 多个请用逗号（,）分隔"
            @input="validInputMobile"></el-input>
          </el-form-item>

          <el-form-item label="发送时间" prop="send_type">
            <el-radio-group v-model="form.send_type">
              <el-radio label="time">定时发送</el-radio>
              <el-radio label="prompt">立即发送</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.send_type === 'time'" label=" " prop="send_time">
            <el-date-picker
              v-model="form.send_time"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              default-time="09:00:00"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onSubmitForm">创建任务</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>


    <el-dialog
      title="选择发送模板"
      :visible.sync="tplDialog.visible"
      width="60%">
      <el-row :gutter="10" v-loading="tplDialog.loading">
        <el-empty v-if="(tplDialog.list.length === 0)" :description="tplDialog.emptyTip"></el-empty>

        <el-col :span="4" v-for="item in tplDialog.list" :key="item._id">
          <templateCard :item="item" :selected="tplDialog.selected" @click="onTemplateSelect"></templateCard>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onTemplateCancel">取 消</el-button>
        <el-button type="primary" @click="onTemplateConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { getList, getById } from '@/api/template'
  import { add as addTask } from '@/api/sendTask'
  import { uploadMobiles } from '@/api/upload'
  import * as tagApi from '@/api/tag'
  import * as contactApi from '@/api/contact'
  import debounce from '@/utils/Debounce'

  import phonePreview from '@/components/PhonePreview'
  import templateCard from '@/components/TemplateCard'

  export default {
    name: 'edit',

    components: {
      phonePreview,
      templateCard
    },

    created(){
      this.loadTags();
    },

    data(){
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() <= (Date.now() - 3600 * 24 * 1000);
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '明天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '后天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 2);
              picker.$emit('pick', date);
            }
          }]
        },
        title : '编辑发送任务',
        tplDialog : {
          visible : false,
          loading : false,
          emptyTip: '请先创建可用的发送模板',
          list : [],
          selected : ''
        },

        template : undefined,
        mobilePreview : {
          file : undefined,
          contact : undefined,
          input : undefined
        },

        tags : [],

        form : {
          name : '',
          chatbot : '',
          template : '',
          mobiles : {
            type : 'input',
            file : [],
            contact : [],
            input : undefined
          },
          send_type : 'prompt',
          send_time : '',
          from : 'plat'
        },
        rules : {
          template : [{required : true, message: '请选择要发送的消息模板', trigger : 'change'}],
          'mobiles.type' : [{required : true, message: '请选择号码提交方式', trigger : 'change'}],
          'mobiles.file' : [{required : true, message: '请提交号码文件', trigger : 'change'}],
          'mobiles.contact' : [{required : true, message: '请选择通讯录下发对应标签', trigger : 'change'}],
          'mobiles.input' : [{required : true, message: '请输入要下发的号码', trigger : 'blur'}],
          send_type : [{required : true, message: '请选择下发时间', trigger : 'change'}],
          send_time : [
            // {required : true, message: '请选择计划下发时间', trigger : 'change'},
            {required : true, validator : function(rule, value, cb){
              if(!value){
                return cb(new Error('请选择计划下发时间'))
              }else{
                if(value < new Date()){
                  return cb(new Error('计划下发时间不得早于当前时间'));
                }else{
                  cb();
                }
              }
              }, trigger : 'change'},
          ],
        }
      }
    },

    computed : {
      phone(){
        return this.mobilePreview[this.form.mobiles.type]
      },
      phoneTotal(){
        return (this.phone && this.phone.total) || 0
      },
      phoneResultTitle(){
        return `提交号码数 ${this.phoneTotal} 条`
      },
      phoneResultDesc(){
        if(this.phone){
          return `移动：${this.phone.cm} 条 | 联通：${this.phone.un} 条 | 电信：${this.phone.ct} 条 ${this.phone.unknown ? '| 未知：' + this.phone.unknown + ' 条' : ''}`
        }else{
          return ''
        }

      }
    },
    watch : {
      'form.mobiles.type' : {
        handler(newName, oldName){
          this.$nextTick(() => {
            if(newName === 'input'){
              this.$refs['inputMobiles'].focus()
            }
          })
        },
        immediate: true
      },
    },

    methods : {
      goBack(){
        this.$router.push({ name: 'sendTask' })
      },
      async onSubmitForm(){
        let isValid =await this.$refs.form.validate();
        if(isValid){
          this.form.mobiles.total = this.phoneTotal
          await addTask(this.form);
          this.$message({
            message : '发送任务创建成功',
            type : 'success'
          });
          this.goBack()
        }
      },
      async showTemplateListDialog(){
        this.tplDialog.visible = true;
        this.tplDialog.list = await getList();
      },
      onTemplateSelect(item){
        console.log('selected', item);
        this.tplDialog.selected = item._id;
      },
      onTemplateCancel(){
        this.tplDialog.selected = '';
        this.tplDialog.visible = false;
      },
      async onTemplateConfirm(){
        if(!this.tplDialog.selected){
          return this.$message({
            message: '您尚未选择发送模板',
            type: 'warning'
          });
        }
        this.template = await getById(this.tplDialog.selected)
        this.form.template = this.template._id
        this.tplDialog.visible = false
      },
      async uploadMobiles(opts){
        let result = await uploadMobiles(opts);

        this.form.mobiles.file.push(opts.file);
        this.setBriefResult('file', result);
      },
      removeFileHandler(file, fileList){
        this.mobilePreview.file = null;
        this.form.mobiles.file = fileList;
      },
      async loadTags(){
        this.tags = await tagApi.getList();
      },
      async contactHandler(tagIds){
        let result = await contactApi.briefResult({tags : tagIds})
        this.setBriefResult('contact', result);
      },
      async validInputMobile(value){
        try{
          await debounce('sendTask.edit.inputMobile')
          if(!value){
            return
          }
          let mobiles = value.split(/[,，]/)
          let result = await contactApi.briefResult({input : mobiles});
          this.setBriefResult('input', result);
        }catch(err){
          console.log(err);
        }
      },
      setBriefResult(type, result){
        this.mobilePreview[type] = result;

      }
    }
  }
</script>

<style scoped>
  .el-upload-dragger{
    background-color: #fff;
    border: 1px dashed #d9d9d9;
    border-radius: 50px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 360px;
    height: 180px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .el-upload-dragger .el-icon-upload {
     /*font-size: 67px;*/
     color: #C0C4CC;
     /*margin: 40px 0 16px;*/
     line-height: 50px;
   }
</style>
