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
        url: null,
        columns: null,
        pagination: false
      };
      $.extend(this.param, param);
      this.getData();
      if (!this.param.data) {
        alert('no data');
        return;
      }
      this.render();
    },
    getData: function () {
      this.param.data = data.res;
    },
    render: function () {
      console.log(this.param.columns);
      var $table = $('<table class="table table-bordered table-hover table-striped"></table>');
      this.renderHead($table);
      this.renderBody($table);
      this.param.el.html($table);
      this.attachEvents();
    },
    renderHead: function (tb) {
      var $head = $('<thead></thead>');
      var $tr = $('<tr></tr>');
      var headNames = _.map(this.param.columns, 'cname');
      _.each(headNames, function (headName) {
        var $th = $('<th></th>');
        $th.text(headName);
        var $sort = $('<i class="fa fa-sort-asc"></i><i class="fa fa-sort-desc"></i>');
        $th.append($sort);
        $tr.append($th);
      });
      $head.append($tr);
      tb.append($head);
    },
    renderBody: function (tb) {
      var $body = $('<tbody></tbody>');
      var bodysrc = _.map(this.param.columns, 'cdata');
      _.each(this.param.data, function (tr) {
        console.log(tr);
        var $tr = $('<tr></tr>');
        _.forIn(tr, function (key, value) {
          console.log("key is " + key + " value is" + value);
          if (_.includes(bodysrc, value)) {
            var $td = $('<td></td>');
            $td.text(key);
            $tr.append($td);
          }
        });
        $body.append($tr);
      });
      tb.append($body);
    },
    attachEvents: function () {
      var that = this;
      _.each($('i'), function (ele) {
        $(ele).click(function () {
          var $target = $(event.target);
          var colTxt = $target.parent().text();
          var sortParam = _.find(that.param.columns, function (item) {
            return item.cname == colTxt;
          });
          var sortedData = _.sortBy(that.param.data, sortParam.cdata).reverse();
          console.log(that.param.data);
        })
      });

    },

    refresh: function () {
    },
    destroy: function () {
      this.param.el.remove();
    }
  }
  window.LuyeTable = LuyeTable;
})();
