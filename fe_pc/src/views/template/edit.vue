<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" content="编辑模板"/>
    </el-row>
    <el-row>
      <el-col :span="8">
        <phonePreview :template="form"></phonePreview>
      </el-col>
      <el-col :span="16">
        <el-form ref="form" :model="form" label-width="120px">
          <el-form-item label="模板名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-radio-group v-model="form.type" @change="radioChange">
              <el-radio-button label=0>纯文本</el-radio-button>
              <el-radio-button label=1>位置消息</el-radio-button>
              <el-radio-button label=2>文件消息</el-radio-button>
              <el-radio-button label=3>单卡片</el-radio-button>
              <el-radio-button label=4>多卡片</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <div v-if="form.type === 0">
            <el-form-item label="模板名称">
              <el-input
                type="textarea"
                :rows="4"
                placeholder="请输入内容"
                maxlength="1000"
                show-word-limit
                v-model="form.text">
              </el-input>
            </el-form-item>
          </div>

          <div v-if="form.type === 1">
            <el-form-item>
              <location-picker @confirm="choosePosition"></location-picker>
            </el-form-item>
            <el-form-item label="地址名称" prop="label">
              <el-input v-model="form.label" maxlength="100" show-word-limit default></el-input>
            </el-form-item>
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="form.longitude"></el-input>
            </el-form-item>
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="form.latitude"></el-input>
            </el-form-item>
          </div>
          <div v-if="form.type === 2">
            <el-form-item label="媒体文件">
              <media-select display="选择媒体文件" :tabs="mediaTabs" @confirm="handleMediaConfirm"></media-select>
              <span v-if="form.media">
                <el-divider direction="vertical"></el-divider>
                <el-tag closable @close="handleMediaFileRemove()">{{form.media.name}}</el-tag>
              </span>
            </el-form-item>
          </div>
          <div v-if="form.type === 3">
            <message-card-form @change="handleCardItemChange" :model="form.message_card_list[0]"></message-card-form>
          </div>
          <div v-if="form.type === 4">
            <el-tabs tab-position="top" editable v-model="editCardValue" type="card"
                     :before-leave="cardLeaveHandler"
                     @tab-click="cardClickHandler"
                     @tab-remove="cardRemoveHandler"
                     @tab-add="cardAddHandler">

              <el-tab-pane v-for="(item, index) in cardsTab"
                           :label="item.title"
                           :name="item.name"
                           :key="item.name" >
                <message-card-form @change="handleCardItemChange"
                                   :model="form.message_card_list[index]"></message-card-form>
              </el-tab-pane>
            </el-tabs>
          </div>

          <el-form-item label="悬浮菜单">
            <media-select display="选择悬浮菜单" :tabs="suggestionTabs" @confirm="handleSuggestionConfirm"></media-select>
            <span v-if="form.suggestions">
                <el-divider direction="vertical"></el-divider>
                <el-tag closable @close="handlerFloatMenuRemove()">{{form.suggestions.name}}</el-tag>
              </span>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onSubmit" icon="el-icon-check">保 存</el-button>
            <el-button @click="goBack" icon="el-icon-close">取 消</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { getById, saveTemplate } from '@/api/template'
  import { saveCards } from '@/api/card'

  import locationPicker from '@/components/LocationPicker'
  import mediaSelect from './mediaSelect'
  import messageCardForm from './messageCardForm'
  import phonePreview from '@/components/PhonePreview'

  export default {
    name: 'edit',

    components: {
      mediaSelect,
      locationPicker,
      messageCardForm,
      phonePreview
    },

    data() {
      return {
        suggestionTabs: [{ label: '悬浮菜单', name: 'suggestion' }],
        mediaTabs: [{
          label: '图片', name: 'image'
        }, {
          label: '视频', name: 'video'
        }, {
          label: '音频', name: 'audio'
        }],
        cardsTab: [],
        editCardIndex: 0,
        editCardValue: '',

        // media: null,

        form: {
          _id: undefined,
          name: '',
          type: 0,

          text: '',

          longitude: 0,
          latitude: 0,
          label: '',

          media: null,

          message_card_list: [],

          suggestions: null
        }
      }
    },

    computed: {
      currentEditIndex: {
        get() {
          return +(this.editCardValue.split('卡片')[0]) || 0
        }
      }
    },

    watch : {
      'form.type' : {
        handler(type, oldValue){
          if(type === 4){
            this.cardsTab = this.form.message_card_list.map((card,index) => {
              let name = `${index}卡片${this.editCardIndex++}`;
              if(index === 0){
                this.editCardValue = name;
              }
                return {
                  title : '卡片' + (index + 1),
                  name : name
                }
            })
          }
        }
      },
      deep: true
    },

    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        if (id !== undefined) {
          //获取已存在card，覆盖form
          getById(id).then((resp) => {
            vm.form = resp
            //接口获取的数据中已经直接关联提取了media实体，但是form中的media实际上应该还mediaId，所以有下面两部操作
            // vm.media = resp.media
            // vm.form.media = vm.media && vm.media._id
          })
        }
      })
    },

    methods: {
      goBack() {
        this.$router.push({ path: '/template/index' })
      },
      async onSubmit() {
        // 校验表单 TODO
        console.log('model form = ',this.form)
        //提交表单
        let cardsIds = [];

        if (this.form.type === 3 || this.form.type === 4) {
          let cardsForm = [];
          for(let card of this.form.message_card_list){
            cardsForm.push({
              media : card.media && card.media._id,
              title : card.title,
              description : card.description,
              suggestions : card.suggestions.map(it => it._id)
            })
          }
          console.log('submit form = ', cardsForm)
          cardsIds = await saveCards(cardsForm)
        }
        let result = await saveTemplate({
          _id: this.form._id,
          name: this.form.name,
          type: this.form.type,
          text: this.form.text,
          longitude: this.form.longitude,
          latitude: this.form.latitude,
          label: this.form.label,
          media: this.form.media && this.form.media._id,
          message_card_list: cardsIds,
          suggestions: this.form.suggestions && this.form.suggestions._id
        })
        this.$message.success('消息模板添加成功！')
        //成功
        this.$router.push({ path: '/template/index' })
        //失败由api统一拦截给出错误提示
      },
      getAnEmptyCard() {
        return {
          media: null,
          title: '',
          description: '',
          suggestions: []
        }
      },
      radioChange(type) {
        console.log('message Type change:', type)
        this.$set(this.form, 'type', +type)
        if (+type === 3) {
          this.editCardIndex = 0
          this.cardsTab = [this.getAnEmptyCard()]
          this.form.message_card_list = [this.getAnEmptyCard()]
        }
        if (+type === 4) {
          this.editCardIndex = 2
          this.editCardValue = '0卡片0'
          this.cardsTab = [{ title: '卡片1', name: '0卡片0' }, { title: '卡片2', name: '1卡片1' }]
          this.form.message_card_list = [this.getAnEmptyCard(), this.getAnEmptyCard()]
        }
      },
      handlerFloatMenuRemove() {
        this.form.suggestions = null
      },
      handleSuggestionConfirm(data) {
        this.form.suggestions = data
      },
      choosePosition(poi) {
        this.$set(this.form, 'longitude', poi.lng)
        this.$set(this.form, 'latitude', poi.lat)
        this.$set(this.form, 'label', poi.name)
      },
      handleMediaConfirm(media) {
        this.form.media = media
      },
      handleMediaFileRemove() {
        this.form.media = undefined
      },
      handleCardItemChange(type, card) {
        console.log('card change EVENT:', type, card)
        this.form.message_card_list[this.currentEditIndex] = card
        this.$forceUpdate()
      },

      cardLeaveHandler() {

      },

      cardClickHandler(value) {
        console.log('cardTabClick', value.paneName)
        this.$refs.cardList[this.currentEditIndex].$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      },

      cardViewClickHandler(index) {
        this.editCardValue = this.cardsTab[index].name
        this.cardClickHandler(this.editCardValue)
      },
      cardRemoveHandler(targetName) {
        if (this.cardsTab.length < 3) {
          this.$message.error('多卡片消息至少需要两张卡片')
        } else {
          //1 删除掉当前cardTab，同时删除对应list
          let index = +(targetName.split('卡片')[0])
          let tabs = this.cardsTab
          this.cardsTab = tabs.filter(tab => tab.name !== targetName)
          this.form.message_card_list.splice(index, 1)

          //2 重命名所有tabName，赋值给this.cardsTab
          this.cardsTab.forEach((tab, index) => {
            tab.name = index + '卡片' + this.editCardIndex++
            tab.title = '卡片' + (index + 1)
          })

          //3 算出新的editValue
          if (index >= this.cardsTab.length) {
            index = this.cardsTab.length - 1
          }
          this.editCardValue = this.cardsTab[index].name
        }
      },
      cardAddHandler() {
        if (this.cardsTab.length < 12) {
          let name = this.cardsTab.length + '卡片' + this.editCardIndex++
          this.cardsTab.push({ title: '卡片' + (this.cardsTab.length + 1), name: name })
          this.form.message_card_list.push(this.getAnEmptyCard())
          this.editCardValue = name
        } else {
          this.$message.error('多卡片消息最多可以添加12张消息卡片')
        }
      }
    }
  }
</script>

<style scoped>
</style>
