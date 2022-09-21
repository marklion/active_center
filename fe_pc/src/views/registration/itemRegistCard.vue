<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="12">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">
              <span>{{ item.bet_value }}</span>
            </el-checkbox>
          </el-col>
          <el-col :span="12" style="text-align: end">
            <el-button class="card-header-button" type="primary" plain icon="el-icon-plus"
                       @click="onClickAdd()">
              添加
            </el-button>
            <el-button class="card-header-button" type="danger" plain icon="el-icon-delete"
                       @click="onClickBatchDelete()">
              批量删除
            </el-button>
          </el-col>
        </el-row>
      </div>
      <el-checkbox-group
        @change="handleCheckedRecordsChange"
        v-model="checkedRecords">
        <el-checkbox v-for="(group) of records" :key="group[0]._id" :label="group">
          <el-tag style="margin: 0 5px 5px 0"
                  closable
                  @close="onClickDeleteRecord(group)">
            {{getGroupDisplay(group)}}
          </el-tag>
        </el-checkbox>
      </el-checkbox-group>
    </el-card>

  </div>
</template>

<script>

import * as _ from "lodash";

export default {
  props: ['item','records'],
  data() {
    return {
      checkedRecords : [],
      checkAll: false,
      isIndeterminate: false
    }
  },
  methods: {
    handleCheckAllChange(val) {
      this.checkedRecords = val ? this.records : [];
      this.isIndeterminate = false;
    },
    handleCheckedRecordsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.records.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.records.length;
    },
    getGroupDisplay(group){
      return _.map(group, 'toy.ring_no').join(' - ')
    },
    onClickAdd(){
      this.$emit('add', this.item)
    },
    onClickDeleteRecord(group){
      this.$confirm('此操作将删除该报名记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        this.$emit('delete', this.item, group)
        this.checkedRecords = [];
        this.handleCheckedRecordsChange([])
      }).catch(err => {

      })
    },
    onClickBatchDelete(){
      if(this.checkedRecords.length === 0){
        this.$message('没有选中任何记录');
      }else{
        this.$confirm('此操作将删除所有选中的报名记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          this.$emit('batch-delete', this.item, this.checkedRecords)
          this.checkedRecords = [];
          this.handleCheckedRecordsChange([])
        }).catch(err => {

        })
      }
    }
  }
}
</script>

<style>
.card-header-button{
  display: inline;
  padding: 6px;
  margin-left: 6px
}
</style>
