<template>

  <div>
    <el-dialog :title=title
               :visible.sync=visible
               :width=width
    :before-close="beforeClose">
      <el-row>
        <el-col :span="8">
          <div class="phone-ctn">
            <div class="phone-bottom">
              <div class="suggestion-items">
                <el-button v-for="(item, i) in form.menus" class="suggestion-item" type="primary" plain size="small"
                           :id="'menu_'+i">{{item.display_text}}
                </el-button>

              </div>
              <div class="add-suggestion">
                <el-button class="suggestion-item" type="primary" plain icon="el-icon-plus" size="small"
                           @click="addMenu"></el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="16">
          <el-form label-position="right" label-width="120px" :model="form" ref="form">
            <el-form-item label="菜单组名称" prop="name" :rules=rules.name>
              <el-input v-model="form.name" maxlength="30" show-word-limit></el-input>
            </el-form-item>

            <el-form-item label="已添加的菜单数">
              【{{form.menus.length}}】
              <el-button type="default" @click="addMenu" icon="el-icon-plus" class="add-suggestion">添加悬浮菜单</el-button>
            </el-form-item>

            <div v-if="editIndex >= 0">
              <el-form-item label="菜单名称" :prop="'menus['+editIndex+'].display_text'" :rules=rules.display_text>
                <el-input v-model="form.menus[editIndex].display_text" maxlength="25" show-word-limit></el-input>
              </el-form-item>

              <el-form-item label="菜单类型" prop="type">
                <el-select v-model="form.menus[editIndex].type" placeholder="请选择">
                  <el-option
                    v-for="item in suggestionTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item v-if="form.menus[editIndex].type === 0"
                            label="上行内容" :prop="'menus['+editIndex+'].post_back'" :rules="rules.post_back">

                <el-input v-model.sync="form.menus[editIndex].post_back" show-word-limit default>
                  <el-button slot="append" icon="el-icon-document-copy" @click="syncMenuName(editIndex)">同名称</el-button>
                </el-input>
              </el-form-item>

              <el-form-item v-if="form.menus[editIndex].type === 10"
                            label="输入URL" :prop="'menus['+editIndex+'].url'" :rules="rules.url">
                <el-input v-model="form.menus[editIndex].url"></el-input>
              </el-form-item>

              <el-form-item v-if="form.menus[editIndex].type === 20"
                            label="位置名称" :prop="'menus['+editIndex+'].query'" :rules="rules.query">
                <el-input v-model="form.menus[editIndex].query" maxlength="200" show-word-limit default></el-input>
              </el-form-item>

              <div v-if="form.menus[editIndex].type === 21">
                <el-form-item>
                  <location-picker @confirm="choosePosition"></location-picker>
                </el-form-item>
                <el-form-item label="显示内容" :prop="'menus['+editIndex+'].label'" :rules="rules.label">
                  <el-input v-model="form.menus[editIndex].label" maxlength="100" show-word-limit default></el-input>
                </el-form-item>
                <el-form-item label="经度" :prop="'menus['+editIndex+'].longitude'" :rules="rules.longitude">
                  <el-input v-model="form.menus[editIndex].longitude"></el-input>
                </el-form-item>
                <el-form-item label="纬度" :prop="'menus['+editIndex+'].latitude'" :rules="rules.latitude">
                  <el-input v-model="form.menus[editIndex].latitude"></el-input>
                </el-form-item>
              </div>

              <div v-if="form.menus[editIndex].type === 30">
                <el-form-item label="发送码号" :prop="'menus['+editIndex+'].phone_number'" :rules="rules.phone_number">
                  <el-input v-model="form.menus[editIndex].phone_number"></el-input>
                </el-form-item>
                <el-form-item label="消息内容" :prop="'menus['+editIndex+'].text'" :rules="rules.text">
                  <el-input v-model="form.menus[editIndex].text"></el-input>
                </el-form-item>
              </div>

              <div v-if="form.menus[editIndex].type === 40">
                <el-form-item label="拨打号码" :prop="'menus['+editIndex+'].phone_number'" :rules="rules.phone_number">
                  <el-input v-model="form.menus[editIndex].phone_number"></el-input>
                </el-form-item>
              </div>

              <div v-if="form.menus[editIndex].type === 50">
                <el-form-item label="起止时间" :prop="'menus['+editIndex+'].time'" :rules="rules.time">
                  <el-date-picker
                    value-format="yyyy-MM-dd[T]HH:mm:ss[Z]"
                    v-model="form.menus[editIndex].time"
                    type="datetimerange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @change="setTimeRangerValue"
                  >
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="标题" :prop="'menus['+editIndex+'].title'" :rules="rules.title">
                  <el-input v-model="form.menus[editIndex].title"></el-input>
                </el-form-item>
                <el-form-item label="描述" :prop="'menus['+editIndex+'].description'" :rules="rules.description">
                  <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}"
                            v-model="form.menus[editIndex].description"></el-input>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <div v-for="(item, i) in form.menus" class="suggestion-item"
             style="position : relative; display: inline-block; margin: 20px 6px">
          <el-button :type="(i === editIndex)? 'primary' : ''" plain size="small" :id="'menu_'+i"
                     @click="renderAddForm(i)">
            {{item.display_text}}
          </el-button>
          <el-button type="danger" icon="el-icon-close" circle size="mini" class="menu-del"
                     @click.stop="delMenuByIndex(i)"></el-button>
        </div>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reset">取 消</el-button>
        <el-button type="primary" @click="save">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import locationPicker from '@/components/LocationPicker'

  export default {
    name: 'suggestionForm',
    components: { locationPicker },
    props: {
      title: {
        type: String,
        default: ''
      },
      width: String
    },
    data() {
      return {
        suggestionTypes: [{
          value: 0,
          label: '回复上行'
        }, {
          value: 10,
          label: '打开链接'
        }, {
          value: 20,
          label: '查询位置'
        }, {
          value: 21,
          label: '推送已知位置'
        }, {
          value: 30,
          label: '编辑发送定向短信'
        }, {
          value: 40,
          label: '拨打电话'
        }, {
          value: 50,
          label: '添加日历事件'
        }, {
          value: 60,
          label: '终端信息上报'
        }],
        visible: false,
        editIndex: -1,

        form: {
          id : undefined,
          name: '',
          type : 4,
          menus: [],
        },
        rules: {
          name: [
            { required: true, message: 'please fill in the name of this group', trigger: 'blur' },
            { min: 1, max: 30, message: 'length in 30', trigger: 'blur' }
          ],
          display_text: [
            { required: true, message: 'please fill in the name of this menu', trigger: 'blur' },
            { min: 1, max: 25, message: 'length in 25 bytes', trigger: 'blur' }
          ],
          post_back: [
            { min: 1, max: 2048, message: 'length in 2048 bytes', trigger: 'blur' }
          ],
          url: [
            { required: true, message: 'please fill in the url', trigger: 'blur' }
          ],
          query: [
            { required: true, message: 'please fill in the url', trigger: 'blur' },
            { min: 1, max: 200, message: 'length in 200 char', trigger: 'blur' }
          ],
          label: [
            { min: 1, max: 100, message: 'length in 100 char', trigger: 'blur' }
          ],
          longitude : [
            { required: true, message: 'please fill in the longitude', trigger: 'blur' },
          ],
          latitude : [
            { required: true, message: 'please fill in the latitude', trigger: 'blur' },
          ],
          phone_number : [
            { required: true, message: 'please fill in the phone number you want send message to', trigger: 'blur' },
          ],
          text : [
            { required: true, message: 'please fill in the message content', trigger: 'blur' },
            { min: 1, max: 100, message: 'length in 100 char', trigger: 'blur' }
          ],
          time : [
            { required: true, message: 'please fill in the time content', trigger: 'blur' },
          ],
          title : [
            { required: true, message: 'please fill in the title', trigger: 'blur' },
            { min: 1, max: 100, message: 'length in 100 char', trigger: 'blur' }
          ],
          description : [
            { min: 1, max: 500, message: 'length in 500 char', trigger: 'blur' }
          ]
        }
      }
    },
    watch: {
      // form : {
      //   handler : function(nv, ov){
      //     // console.log(nv);
      //     // if(nv.type === 0 && !nv.mo_text){
      //     //   this.form.mo_text = nv.name;
      //     // }
      //   },
      //   deep:true
      // }
    },
    methods: {
      setForm(form){
        this.form = form;
        if(form.menus && form.menus.length > 0){
          for(let m of form.menus){
            if(m.type === 50){
              m.time = [m.start_time, m.end_time]
            }
          }
        }
      },
      choosePosition(poi) {
        let menu = this.form.menus[this.editIndex];
        this.$set(menu, 'longitude', poi.lng)
        this.$set(menu, 'latitude', poi.lat)
        this.$set(menu, 'label', poi.name)
      },
      setTimeRangerValue(arr){
        let menu = this.form.menus[this.editIndex];
        this.$set(menu, 'start_time', arr[0])
        this.$set(menu, 'end_time', arr[1])
        this.$set(menu, 'time', arr)
      },
      renderAddForm(index) {
        this.editIndex = index
      },
      addMenu() {
        let curLength = this.form.menus.length
        if (curLength >= 11) {
          this.$message.error('最多可添加11个浮动菜单哦')
          return
        }
        this.form.menus.push({
          display_text: '',
          type: 0
        })
        this.renderAddForm(curLength)
      },
      delMenuByIndex(index) {
        this.form.menus.splice(index, 1)
        if (this.form.menus.length === 0) {
          this.editIndex = -1
          return
        }
        if (index === this.editIndex) {
          this.editIndex = 0
        } else if (index < this.editIndex) {
          this.editIndex--
        }
      },
      syncMenuName(index) {
        this.$set(this.form.menus[index], 'post_back', String(this.form.menus[index].display_text.toString()))
      },
      beforeClose(done){
        this.reset();
        done();
      },
      reset(){
        this.form.id = undefined;
        this.form.menus = [];
        this.form.name = '';
        this.visible = false;
        this.editIndex = -1;
      },
      save(){
        //valid & net submit
        this.visible = false;
        this.$emit('confirm', {id : this.form.id, menus : this.form.menus, name : this.form.name, type : 4});
        this.reset();
      }

    }
  }
</script>

<style scoped>

  /*suggestion edit*/
  .phone-ctn {
    position: relative;
    background-size: 100% 100%;
    background-image: url("../../../assets/phone_bg01.png");
    width: 276px;
    height: 492px;
    padding: 50px 24px;
  }

  .phone-bottom {
    width: 82%;
    display: inline-block;
    position: absolute;
    bottom: 50px;
  }

  .suggestion-items {
    display: inline-block;
    width: 77%;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .suggestion-items::-webkit-scrollbar {
    width: 0 !important
  }

  .phone-bottom .suggestion-item {
    white-space: nowrap;
  }

  .add-suggestion {
    display: inline-block;
    float: right;
  }

  .menu-del {
    position: absolute;
    top: -6px;
    padding: 2px;
    right: -9px;
  }
  .dialog-footer{
    text-align: center;
  }
</style>
