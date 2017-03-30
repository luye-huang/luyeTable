//dependencies: jq, lodash, bootstrap, fontawesome
//lodash modules: map, find, filter, each, get, sortBy, ceil， isEmpty, cloneDeep, values, last
//var http = require('../../../api.js');
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
        manageColumns: false
      };
      $.extend(this.param, param);
      this.initData();
      this.metadata = {
        processingData: _.cloneDeep(this.param.data),
        processingColumns: _.cloneDeep(this.param.columns),
        currentData: null,
        currentPage: 1,
        pageTotal: 0
      };
      if (this.param.dirtyCheck) {
        this.checkDirtyData(this.param.data, this.metadata.processingColumns);
      }
      this.regGlobalClick('.fa-snowflake-o', function (e) {
        $('.fa-snowflake-o').toggleClass('hide');
      });
      this.getCurrentData();
      if (!this.metadata.processingData) {
        alert('no data');
        return;
      }
      this.adjustContainer();
      this.render();
    },
    //自执行函数,随LuyeTable在初始化时执行
    regGlobalClick: function () {
      var store = [];
      console.trace();
      $('body').on('click', function (evt) {
        store = _.filter(store, function (config) {
          var elEl = config.element,
            handler = config.handler;
          if ($.contains(document.body, elEl.get(0))) {
            if (handler) {
              handler(evt);
            } else {
              elEl.hide();
            }
            return true;
          } else {
            return false;
          }
        });
      });
      return function (elSelector, handler) {
        console.trace();
        store.push({
          "element": $(elSelector),
          "handler": handler
        });
      };
    }(),
    initData: function () {
      if (this.param.url) {

      }
      else if (this.param.data) {

      }
      else {
        this.param.data = res.res;
      }
    },
    getCurrentData: function () {
      var pageStart = (this.metadata.currentPage - 1) * this.param.pageCount;
      var pageEnd = pageStart + this.param.pageCount;
      this.metadata.currentData = this.metadata.processingData.slice(pageStart, pageEnd);
    },
    checkDirtyData: function (data, columns) {
      _.map(data, function (item) {
        var obj = {};
        _.each(columns, function (column) {
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
    adjustContainer: function () {
      //for external export plugin
      this.param.el.css({"position": "relative", "padding-top": "20px"});
    },
    render: function () {
      var $table = this.wdtb = $('<table id="LuyeTable" class="table table-bordered table-hover table-striped"></table>');
      this.renderHead();
      this.renderBody();
      this.param.el.html($table);
      if (this.param.pagination) {
        this.renderPages();
      }
      this.renderHeadBoard();
    },
    renderHead: function () {
      this.wdtb.find('thead').remove();
      var $head = $('<thead></thead>');
      var $tr = $('<tr></tr>');
      _.each(this.metadata.processingColumns, function (headName) {
        var $th = $('<th></th>');
        var $checkbox = $('<input type="checkbox" class="hide" checked="checked">');
        var $sort = $('<div><i class="fa fa-sort-asc"></i><i class="fa fa-sort-desc"></i></div>');
        $th.text(headName.cname).data('db', headName.cdata);
        $th.append($checkbox).append($sort);
        if (headName.hide) {
          $th.addClass('hide');
          $th.find('input').val('off').removeAttr('checked');
        }
        $tr.append($th);
      });
      $head.append($tr);
      this.wdtb.append($head);
      this.attachSortingEvents();
      this.attachColumnCheckedEvents();
    },
    renderHeadBoard: function () {
      var $board = $('<div class="head-board"><button>列管理</button><button>重置</button></div>');
      this.wdtb.before($board);
      this.attachColumnManagementEvents();
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
          col.hide && $td.addClass('hide');
          if (!col.type) {
            $td.text(_.get(tr, col.cdata)).data('db', col.cdata);
          }
          else if (col.type == 'a') {
            var rawUrl = col.url.split('@@');
            var href = "";
            for (var i = 0; i < col.params.length; i++) {
              href += rawUrl[i];
              href += tr[col.params[i]];
            }
            href += _.last(rawUrl);
            console.log(href);
            var $a = $('<a></a>').text(col.cname).attr('href', href);
            $td.append($a);
          }
          if (col.style == 'fakeA') {
            $td.addClass('fake-a');
          }
          else if (col.type == 'hide') {
            $td.addClass('hide');
          }
          if (col.triggerClick) {
            var paramArray = [];
            _.each(col.callbackParam, function (param) {
              paramArray.push(_.get(tr, param));
            });
            $td.on('click', paramArray, col.triggerClick);
          }
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
    attachColumnCheckedEvents: function () {
      this.wdtb.find('thead input').click(function () {
        if ($(this).val() == "on") {
          $(this).removeAttr('checked');
          $(this).val('off');
        }
        else {
          $(this).attr('checked', 'checked');
          $(this).val('on');
        }
      });
    },
    attachColumnManagementEvents: function () {
      var that = this;
      $('.head-board>button').click(function () {
        if (this.innerText == "列管理") {
          $('thead input').removeClass('hide');
          $(this).text('确定');
        }
        else if (this.innerText == "重置") {
          $(this).prev().text('列管理');
          that.resetColumns();
        }
        else if (this.innerText == "确定") {
          _.each($('thead input'), function (item) {
            console.log($(item).attr('checked'));
            console.log($(item).val());
          });
          for (var i = 0; i < that.metadata.processingColumns.length; i++) {
            var val = $($('thead input')[i]).val();
            if (val == 'on') {
              that.metadata.processingColumns[i].hide = false;
            }
            else {
              that.metadata.processingColumns[i].hide = true;
            }
          }
          $(this).text('列管理');
          $(this).next().text('重置');
          that.renderHead();
          that.renderBody();
        }
        //checkbox 大坑  ng-check?
        // else if (this.innerText == "取消") {
        //   for(var i =0; i<that.metadata.processingColumns.length; i++){
        //     if(that.metadata.processingColumns[i].hide){
        //       $($('thead input')[i]).val('off').removeAttr('checked');
        //     }
        //     else{
        //       $($('thead input')[i]).val('on').attr('checked','checked');
        //     }
        //   }
        //   $('thead input').addClass('hide');
        //   $(this).text('重置');
        //   $(this).prev().text('列管理');
        // }
      });
    },
    resetSortingArrows: function () {
      this.wdtb.find('thead i.invisible').toggleClass('invisible');
    },
    resetColumns: function () {
      this.metadata.processingColumns = _.cloneDeep(this.param.columns);
      this.renderHead();
      this.renderBody();
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
    queryAll: function (keyword) {
      this.resetData();
      this.metadata.processingData = _.filter(this.metadata.processingData, function (item) {
        return _.values(item).join(',').indexOf(keyword) != -1;
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