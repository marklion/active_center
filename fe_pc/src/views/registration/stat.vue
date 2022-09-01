<template>
  <div class="app-container">
    <el-row>
      <el-page-header class="edit-header-bar" @back="goBack" :content=getTitleDisplay() />
    </el-row>
    <el-row>
      <el-card class="box-card" :body-style="{ padding: 0 }">
        <el-table style="width: 100%"
                  stripe
                  :data="activeItems"
                  @filter-change="onFilterChange"
                  show-summary
                  :summary-method="getTotalSummaries"
                  :span-method="itemSpanMethod">
          <el-table-column
            prop="name" label="项目" align="center"
            :filters="activeItemsName.map(name => {return {text: name, value: name}})"
            :filter-method="filterHandler">
          </el-table-column>
          <el-table-column prop="bet_value" label="金额" align="center">
          </el-table-column>
          <el-table-column
            prop="ring_no" label="环号" align="center"
            :filters="toyList.map(toy => {return {text: toy.ring_no, value: toy._id}})"
            :filter-method="filterHandler">
            <template v-slot="scope">
              <div v-for="(group) of activeItemPlayersMap[scope.row._id]" :key="group[0]._id" class="text item">
                <el-tag>{{getGroupDisplay(group)}}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="item_sum" label="小计(元)" align="center">
            <template v-slot="scope">
              <span>{{getItemSum(scope.row)}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import { getById } from '@/api/active'
import {getActiveItemById} from '@/api/activeItem'
import {getList as getToyList} from '@/api/toy'
import {save as saveActivePlayer, getList as getActivePlayerList, remove as removePlayer} from '@/api/activePlayer'
import * as _ from 'lodash'

export default {

  data() {
    return {
      title : '',
      activeId: '',
      active: null,
      activeItems : [],
      activeItemsName : [],
      activeItemMap: {},
      activeItemPlayers: [],
      activeItemPlayersMap: {},

      toyList : [],
      spanCache:{}
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
        vm.activeItemsName = _.keys(map);
      });
      vm.reloadActivePlayers();
    })
  },
  async created(){
    await this.loadToys();
  },

  methods: {
    goBack(){
      this.$router.push({ path: '/registration/index' })
    },
    getTitleDisplay(){
      return this.active ? this.active.name : ''
    },
    getItemSum(item){
      let records = this.activeItemPlayersMap[item._id];
      return records && records.length > 0 ? item.bet_value * records.length : 0
    },
    getTotalSummaries(param){
      let _this = this;
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计(元)';
          return;
        }
        if(index === columns.length - 1){
          sums[index] = data.reduce((sum, item) => {return sum + _this.getItemSum(item)}, 0);
        }
      });
      return sums;
    },
    async loadToys(){
      this.toyList = await getToyList();
    },
    async reloadActivePlayers(){
      this.activeItemPlayersMap = {}
      this.activeItemPlayers = await getActivePlayerList({active: this.activeId});
      let groups = _.groupBy(this.activeItemPlayers, 'group_id');
      for(let group of _.values(groups)){
        let key = group[0].item;
        if(!this.activeItemPlayersMap[key]){
          this.$set(this.activeItemPlayersMap, key, [])
        }
        this.activeItemPlayersMap[key].push(group)
      }
      await this.$nextTick()
    },
    getGroupDisplay(group){
      return _.map(group, 'toy.ring_no').join(' - ')
    },
    onFilterChange(filters){
      console.log('fileters = ', filters)
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      if(property === 'ring_no'){
        let group = this.activeItemPlayersMap[row._id];
        return group && _.find(_.flattenDeep(group), o => o.toy._id === value)
      }else{
        return row[property] === value;
      }
    },
    itemSpanMethod({ row, column, rowIndex, columnIndex }){
      if (columnIndex === 0) {
        if(!row.spanParam){
          if(this.spanCache[row.name]){
            console.log(1)
            row.spanParam = {
              rowspan: 0,
              colspan: 0
            }
          }else{
            console.log(2)
            this.spanCache[row.name] = {
              rowspan: this.activeItemMap[row.name].length,
              colspan: 1
            }
            row.spanParam = this.spanCache[row.name];
          }
        }
        return row.spanParam
      }
      if(rowIndex === (row.length - 1) && columnIndex === (column.length - 1)){
        this.spanCache = {}
      }
    }
  },
  computed: {

  }

}
</script>

<style lang="scss" scoped>
.edit-header-bar{
  margin-bottom: 20px;
}
</style>
