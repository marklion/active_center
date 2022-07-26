<template>
  <div class="app-container">
    <el-row>
      <el-page-header class="edit-header-bar" @back="goBack" :content=getActiveSum() :title="title"/>
    </el-row>
    <el-row>
      <el-form v-if="roleType !== 3">
        <el-form-item label="筛选玩家" label-width="80px">
          <el-select v-model="player" placeholder="请选择待选玩家">
            <el-option value="" label=" - 全部 - "></el-option>
            <el-option
              v-for="item in toyPlayers"
              :key="item._id"
              :label="item.name"
              :value="item._id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-tabs type="border-card">
        <el-tab-pane v-for="(item) of activeItems" :label="item" :key="item">
          <el-alert
            :title="'小计：￥'+ getItemSum(item)"
            type="success"
            :closable="false">
          </el-alert>

          <div v-for="(bet) of activeItemMap[item]">
            <itemRegistCard :item="bet" :records="filterActiveItemPlayersMap[bet._id]"
                            @add="showToySelect"
                            @delete="onRemoveRecord"
                            @batch-delete="onBatchRemoveRecords">
            </itemRegistCard>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-row>

    <el-dialog title="请选择下注环号" :visible.sync="toySelectVisible" width="90%" @close="onCancelToySelect">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择数量">
          <el-input v-model="editingItem.toy_limit" disabled></el-input>
        </el-form-item>
        <el-form-item label="候选环号" prop="checkedToys">
          <el-checkbox-group
            v-model="form.checkedToys">
            <el-checkbox v-for="toy in availableToyList()" :label="toy._id" :key="toy._id" :disabled="toy.disabled || !toy.available">
              {{toy.ring_no }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="结果预览">
          <el-tag style="margin-right: 8px"
                  v-for="(toyId, index) in form.checkedToys"
                  v-if="index % editingItem.toy_limit === 0"
                  closable
                  @close="onRemoveTmpCheckedGroup(index, editingItem.toy_limit, form.checkedToys)">
            {{ getPreviewDisplay(index, editingItem.toy_limit, form.checkedToys ) }}
          </el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onCancelToySelect">取 消</el-button>
        <el-button @click="onResetForm">重 置</el-button>
        <el-button type="primary" @click="onSaveBetRecord">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getById } from '@/api/active'
import {getActiveItemById} from '@/api/activeItem'
import {getList as getToyList} from '@/api/toy'
import {save as saveActivePlayer, getList as getActivePlayerList, remove as removePlayer, removeBatch} from '@/api/activePlayer'
import * as _ from 'lodash'
import {mapGetters} from "vuex";
import itemRegistCard from "./itemRegistCard";

export default {

  components:{
    itemRegistCard
  },
  data() {
    const toysValidator = function(){
      let _this = this;
      return function(rule, value, cb){
        if(value.length > 0 && (value.length % _this.editingItem.toy_limit) === 0){
          cb();
        }else{
          return cb(new Error('无法完成分组，请检查选择的数量，该项目每 ' + _this.editingItem.toy_limit + ' 个为一组'))
        }
      }
    }.bind(this)()
    return {
      player : '',

      title : '',
      activeId: '',
      active: null,
      activeItems : [],
      activeItemMap: {},
      activeItemPlayers: [],
      activeItemPlayersMap: {},

      toyList : [],
      toySelectVisible: false,
      editingItem: {toy_limit: 0},

      form : {
        checkedToys : []
      },
      rules : {
        checkedToys : [
          {type: 'array', required: true, message: '请选择对应数量的环号', trigger: 'change'},
          {type: 'array', required: true, validator: toysValidator, trigger: 'change'},
        ]
      },
    }
  },
  beforeRouteEnter(to, from, next) {
    let id = to.query.id
    next( vm => {
      vm.activeId = id;
      getById(id).then(res => {
        vm.active = res;
        vm.title = res.name + ' 报名表'
      });
      getActiveItemById(id).then( res => {
        vm.activeItems = res;
        let map = _.groupBy(res, 'name')
        vm.activeItemMap = map;
        vm.activeItems = _.keys(map);
      });
      vm.reloadActivePlayers();
    })
  },
  async created(){
    await this.loadToys();
  },
  methods: {
    getPreviewDisplay(index, limit, checkedList){
      let result = '';
      for(let i = 0; i < limit; i++){
        let toyId = checkedList[index + i];
        if(toyId){
          result += `,${this.toyMap[toyId].ring_no}`
        }else{
          result += ', ? '
        }
      }
      return result.substring(1);
    },
    onRemoveTmpCheckedGroup(index, limit, checkedList){
      checkedList.splice(index, limit);
    },
    goBack(){
      this.$router.push({ path: '/registration/index' })
    },
    async loadToys(){
      this.toyList = await getToyList();
    },
    getTitleDisplay(){
      return this.active ? this.active.name : ''
    },
    getItemSum(itemName){
      let items = this.activeItemMap[itemName];
      let result = _.reduce(items, (sum, item) => {
        let records = this.filterActiveItemPlayersMap[item._id];
        return sum + (records ? records.length * item.bet_value : 0);
      }, 0)
      return result
    },
    getActiveSum(){
      let sum = _.reduce(this.activeItems, (sum, itemName) => {
        return sum + this.getItemSum(itemName)
      }, 0)
      return '总计：￥' + sum
    },

    async showToySelect(activeItem){
      const loading = this.$loading({
        lock: true,
        text: '数据加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.editingItem = activeItem;
      if(this.toyList === null){
        this.toyList = await getToyList();
      }
      this.toySelectVisible = true;
      loading.close();
    },
    onResetForm(){
      this.form.checkedToys = [];
    },
    onCancelToySelect(){
      this.editingItem = {toy_limit : 0};
      this.form.checkedToys = [];
      this.toySelectVisible = false;
    },
    onSaveBetRecord(){
      const loading = this.$loading({
        lock: true,
        text: '数据加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      this.$refs.form.validate(async valid => {
        try{
          if(valid){
            let postData = {
              toys: this.form.checkedToys,
              item: this.editingItem._id
            }
            await saveActivePlayer(postData)
            await this.reloadActivePlayers()
            this.onCancelToySelect();
          }else{
            return false;
          }
        }catch(err){
          console.log(err)
        }finally{
          loading.close()
        }
      })
    },
    async reloadActivePlayers(){
      this.activeItemPlayers = await getActivePlayerList({active: this.activeId});
    },
    async onRemoveRecord(item, toyGroup) {
      for (let record of toyGroup) {
        await removePlayer(record._id);
      }
      await this.reloadActivePlayers();
      this.$message({
        type: 'success',
        message: '删除成功!'
      })
    },
    async onBatchRemoveRecords(bet_item, recordGroups){
      let ids = _.map(_.flattenDeep(recordGroups), '_id');
      let r = await removeBatch(ids);
      await this.reloadActivePlayers();
      this.$message({
        type: 'success',
        message: r.deletedCount + '条记录，删除成功!'
      })
    },
    availableToyList(){
      let notInGroup = this.form.checkedToys.length % this.editingItem.toy_limit
      if(notInGroup > 0){
        let toyId = this.form.checkedToys.at(-1);
        let playerId = this.toyMap[toyId].player._id;
        for(let toy of this.filterToyList){
          toy.available = (toy.player._id === playerId)
        }
      }else{
        for(let toy of this.filterToyList){
          toy.available = true
        }
      }
      return this.filterToyList;
    }
  },
  computed: {
    ...mapGetters([
      'account',
      'name',
      'id',
      'roleType'
    ]),
    toyMap(){
      return _.keyBy(this.toyList, '_id')
    },
    toyPlayers(){
      return  _.uniqBy(_.map(this.toyList, 'player'), '_id');
    },
    filterToyList(){
      let result = this.player ? _.filter(this.toyList, o => { return o.player._id === this.player }) : this.toyList;
      outer:
      for(let t of result){
        t.disabled = false;
        for(let record of this.activeItemPlayers){
          if(record.item === this.editingItem._id && record.toy._id === t._id){
            t.disabled = true;
            continue outer;
          }
        }
      }
      return result
    },
    filterActiveItemPlayersMap(){
      let activeItemPlayersMap = {}
      let records = this.activeItemPlayers;
      if(this.player){
        records = _.filter(this.activeItemPlayers, {player : this.player})
      }
      let groups = _.groupBy(records, 'group_id');
      for(let group of _.values(groups)){
        let key = group[0].item;
        if(!activeItemPlayersMap[key]){
          activeItemPlayersMap[key] = []
        }
        activeItemPlayersMap[key].push(group)
      }
      return activeItemPlayersMap;
    }
  }

}
</script>

<style lang="scss" scoped>
.edit-header-bar{
  margin-bottom: 20px;
}
</style>
