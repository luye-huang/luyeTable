/**
 * Created by luye on 2017/3/24.
 */
// dependencies: jq, lodash
// var http = require('../../../api.js');
(function () {
  function LuyeTable(param) {
    this.initialize(param);
  }

  LuyeTable.prototype = {
    initialize: function (param) {
      this.param = {
        el: null,
        data: null,
        url: null,
        columns: null,
        // optional
        dirtyCheck: false,
        pagination: true,
        pageCount: 20,
      };
      $.extend(this.param, param);
      this.initData();
      this.metadata = {
        processingData: _.cloneDeep(this.param.data),
        processingColumns: _.map(this.param.columns, 'cdata'),
        currentData: null,
        currentPage: 1,
        pageTotal: 0
      };
      if(this.param.dirtyCheck){
        this.checkDirtyData(this.param.data, this.metadata.processingColumns);
      }
      this.regGlobalClick('.fa-snowflake-o', function (e) {
        $('.fa-snowflake-o').toggleClass('hide');
      });
      this.regGlobalClick('.fa-fw', function (e) {
        // // var div = $('<div>hhhhhh</div>');
        // // $('.fa-user-circle-o').after(div);
      });
      this.getCurrentData();
      if (!this.metadata.processingData) {
        alert('no data');
        return;
      }
      this.render();
    },
    tpl: {
      sp: $('<span></span>'),
      dv: $('<div></div>')
    },
    regGlobalClick: (function () {
      var store = [];
      $('body').on('click', function (evt) {
        store = _.filter(store, function (config) {
          var elEl = config.element,
            handler = config.handler;
          if ($.contains(document.body, elEl.get(0))) {
            //如果存在用户自定义动作handler，执行
            if (handler) {
              handler(evt);
            } else { //否则默认行为是掩藏element
              elEl.hide();
            }
            return true;
          } else {
            //filter掉不存在的dom
            return false;
          }
        });
      });
      return function (elSelector, handler) {
        store.push({
          "element": $(elSelector),
          "handler": handler
        });
      };
    }()),
    initData: function() {
      if(this.param.url){

      }
      else if(this.param.data){

      }
      else{
        this.param.data = res.res;
      }
    },
    getCurrentData: function () {
      var pageStart = (this.metadata.currentPage - 1) * this.param.pageCount;
      var pageEnd = pageStart + this.param.pageCount;
      this.metadata.currentData = this.metadata.processingData.slice(pageStart, pageEnd);
    },
    checkDirtyData: function(data, columns){
      _.map(data, function(item){
        var obj = {};
        _.each(columns, function(column){
          obj[column] = item[column];
        });
        return obj;
      });
    },
    resetData: function () {
      if (this.param.data) {
        this.metadata.processingData = _.cloneDeep(this.param.data);
      }
    },
    render: function () {
      var $table = this.wdtb = $('<table id="LuyeTable" class="table table-bordered table-hover table-striped"></table>');
      this.renderHead();
      this.renderBody();
      this.param.el.html($table);
      if (this.param.pagination) {
        this.renderPages();
      }
    },
    renderHead: function () {
      var $head = $('<thead></thead>');
      var $tr = $('<tr></tr>');
      var headNames = _.map(this.param.columns, 'cname');
      _.each(headNames, function (headName) {
        var $th = $('<th></th>');
        $th.text(headName);
        var $sort = $('<div><i class="fa fa-sort-asc"></i><i class="fa fa-sort-desc"></i></div>');
        $th.append($sort);
        $tr.append($th);
      });
      $head.append($tr);
      this.wdtb.append($head);
      this.attachSortingEvents(this.wdtb);
    },
    renderBody: function () {
      this.wdtb.find('tbody').remove();
      var $body = $('<tbody></tbody>');
      var columns = this.metadata.processingColumns;
      console.time('start');
      _.each(this.metadata.currentData, function (tr) {
        var $tr = $('<tr></tr>');
        _.each(columns, function (col) {
          var $td = $('<td></td>');
          $td.text(_.get(tr, col));
          $tr.append($td);
        });
        $body.append($tr);
      });
      console.timeEnd('end');
      this.wdtb.append($body);
    },
    renderPages: function () {
      var params = this.param;
      var metadata = this.metadata;
      $('ul.pagination').remove();
      var $pagination = $('<ul class="pagination"></ul>');
      var pageTotal = metadata.pageTotal = _.ceil(metadata.processingData.length / params.pageCount);
      var pageFirst = metadata.currentPage - 5 < 1 ? 1 : metadata.currentPage - 5;
      var pageLast = pageFirst + 10 > pageTotal ? pageTotal : pageFirst + 10;
      console.log(metadata.currentPage);
      for (var i = pageFirst; i <= pageLast; i++) {
        var $page = $('<span></span>');
        $page.text(i);
        if (i == metadata.currentPage) {
          $page.addClass('current-page');
        }
        $pagination.append($page);
      }
      if (metadata.currentPage > 1) {
        $pagination.prepend($('<span class="page-prev">&laquo;</span>'));
      }
      if (metadata.currentPage < pageTotal) {
        $pagination.append($('<span class="page-next">&raquo;</span>'));
      }
      this.wdtb.after($pagination);
      this.attachPagingEvents();
      this.renderPageInfo();
    },
    renderPageInfo: function () {
      var params = this.param;
      var metadata = this.metadata;
      if (_.isEmpty(this.wdtb.siblings('.page-info'))) {
        var $pageInfo = $('<div class="page-info"></div>');
        var $info1 = $('<span>当前第</span>').appendTo($pageInfo);
        var $pageCurrent = $('<input type="text" class="page-info-current">').val(metadata.currentPage).appendTo($pageInfo);
        var $info2 = $('<span>页 &nbsp 共</span>').appendTo($pageInfo);
        var $pageCount = $('<span class="page-info-pages"></span>').text(metadata.pageTotal).appendTo($pageInfo);
        var $info3 = $('<span>页 &nbsp 共</span>').appendTo($pageInfo);
        var $itemCount = $('<span class="page-info-items"></span>').text(metadata.processingData.length).appendTo($pageInfo);
        var $info4 = $('<span>条</span>').appendTo($pageInfo);
        var $error = $('<div class="page-info-error hide">请输入有效页码</div>').appendTo($pageInfo);
        this.wdtb.after($pageInfo);
        this.attachPagingInfoEvents();
      } else {
        params.el.find(".page-info-current").val(metadata.currentPage);
        params.el.find(".page-info-pages").text(metadata.pageTotal);
        params.el.find(".page-info-items").text(metadata.processingData.length);
        params.el.find('.page-info-error').addClass('hide');
      }
    },
    attachSortingEvents: function () {
      var that = this;
      var metadata = that.metadata;
      // $('i')不好使
      _.each(this.wdtb.find('thead i'), function (ele) {
        $(ele).click(function () {
          var $this = $(this);
          if ($this.hasClass('invisible')) {
            return;
          }
          var colTxt = $this.parents('th').text();
          var sortParam = _.find(that.param.columns, function (item) {
            return item.cname == colTxt;
          });
          if ($this.hasClass('fa-sort-asc')) {
            metadata.processingData = _.sortBy(metadata.processingData, sortParam.cdata);
          } else {
            metadata.processingData = _.sortBy(metadata.processingData, sortParam.cdata).reverse();
          }
          metadata.currentPage = 1;
          that.refresh();
          $this.toggleClass('invisible');
        })
      });
    },
    attachPagingEvents: function () {
      var that = this;
      var metadata = that.metadata;
      _.each($('.pagination>span'), function (ele) {
        $(ele).click(function () {
          var $this = $(this);
          if ($this.hasClass('current-page')) {
            return;
          } else if ($this.hasClass('page-prev')) {
            metadata.currentPage = metadata.currentPage > 1 ? metadata.currentPage - 1 : 1;
          } else if ($this.hasClass('page-next')) {
            metadata.currentPage = metadata.currentPage < metadata.pageTotal ? metadata.currentPage + 1 : metadata.pageTotal;
          } else {
            metadata.currentPage = parseInt($this.text());
          }
          that.refresh();
        });
      });
    },
    attachPagingInfoEvents: function () {
      var that = this;
      $('.page-info-current').keydown(function () {
        if (event.keyCode == 13) {
          if ($('.page-info-current').val() >= 1 && $('.page-info-current').val() <= that.metadata.pageTotal) {
            that.metadata.currentPage = $('.page-info-current').val();
            that.refresh();
          } else {
            $('.page-info-current').val(that.metadata.currentPage);
            $('.page-info-error').removeClass('hide');
          }
        }
      });
    },
    resetSortingArrows: function () {
      this.wdtb.find('thead i.invisible').toggleClass('invisible');
    },
    query: function (queryParams) {
      var that = this;
      this.resetData();
      var metadata = that.metadata;
      queryParams = _.sortBy(queryParams, 'predicate');
      _.each(queryParams, function (queryParam) {
        switch (queryParam.predicate) {
          case "eq":
            metadata.processingData = _.filter(metadata.processingData, function (item) {
              return item[queryParam.queryCol] == queryParam.arg1;
            });
            break;
          case "gt":
            metadata.processingData = _.filter(metadata.processingData, function (item) {
              return item[queryParam.queryCol] >= queryParam.arg1;
            });
            break;
          case "lt":
            metadata.processingData = _.filter(metadata.processingData, function (item) {
              return item[queryParam.queryCol] <= queryParam.arg1;
            });
            break;
          case "rg":
            metadata.processingData = _.filter(metadata.processingData, function (item) {
              return item[queryParam.queryCol] >= queryParam.arg1 && item[queryParam.queryCol] <= queryParam.arg2;
            });
            break;
          case "zkw":
            metadata.processingData = _.filter(metadata.processingData, function (item) {
              return item[queryParam.queryCol].indexOf(queryParam.arg1) != -1;
            });
            break;
        }
      });
      this.refresh();
    },
    refresh: function () {
      this.getCurrentData();
      this.resetSortingArrows();
      this.renderBody();
      if (this.param.pagination) {
        this.renderPages();
      }
    },
    destroy: function () {
      this.param.el.empty();
    }
  }
  window.LuyeTable = LuyeTable;
})();
