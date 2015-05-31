$(document).ready(function () {

    $(function () {
        $.ajaxSetup({
            headers: {
                'X-CSRF-Token': $('meta[name="_token"]').attr('content')
            }
        });
    });

    $('.dk-content select').selectize();

    // Required for select2 to work inside bootstrap modal
    $.fn.modal.Constructor.prototype.enforceFocus = function () {
    };

    $('select.select2').select2({
        language: "lv",
        allowClear: true,
        placeholder: "Meklēt.."
    });

    $('select.select2-ajax').each(function () {
        $(this).select2(helpers.select2options());
    });
    $('select.select2-ajax-merchant').each(function () {
        $(this).select2(helpers.select2MerchantOptions());
    });

    $('select.multiple-selected').multiselect({
        buttonWidth: '100%',
        enableFiltering: true,
        filterPlaceholder: 'Meklēt...',
        buttonText: function (options, select) {
            if (options.length === 0) {
                return 'Nav izvēlēts neviens... ';
            } else if (options.length > 1) {
                return 'Izvēlēti vairāki...';
            } else {
                var labels = [];
                options.each(function () {
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    } else {
                        labels.push($(this).html());
                    }
                });
                return labels.join(', ') + ' ';
            }
        },
        templates: {
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon none"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>'
        }
    });

    $("#form-user").change(function () {
        var str = "";
        $("#form-user option:selected").each(function () {
            $("#form-license").val($(this).data('license'));
            $("#form-area").val($(this).data('area'));
        });
    });

    $('[data-method]').append(function () {
        return "\n" +
                "<form action='" + $(this).attr('href') + "' method='POST' style='display:none'>\n" +
                "   <input type='hidden' name='_method' value='" + $(this).attr('data-method') + "'>\n" +
                "</form>\n"
    })
            .removeAttr('href')
            .attr('style', 'cursor:pointer;');

    var fixHelper = function (e, ui) {
        ui.children().each(function () {
            $(this).width($(this).width());
        });
        return ui;
    };

    $("#sortable").sortable({
        helper: fixHelper,
        handle: "#moveItem",
        axis: "y",
        cursor: "move",
        opacity: 0.8,
        cancel: "a",
        stop: function (e, ui) {
            var newPosition = ui.item.index();
            var current = ui.item.attr('id');
            var other = 0;
            var type = 'prev';

            // if placed as the last
            if (newPosition == ($('#sortable tr').length - 1)) {
                type = 'next';
                other = $('tbody tr:nth-child(' + ($('#sortable tr').length - 1)).attr('id');
            }
            else {
                other = $('tbody tr:nth-child(' + (newPosition + 2) + ')').attr('id');
            }

            $.ajax({
                type: 'POST',
                url: '/klasifikatora-vertibas/seciba',
                data: {current: current, other: other, type: type},
                success: function (data, textStatus, jqXHR)
                {
                    //data - response from server
                },
                error: function (xhr, ajaxOptions, thrownError) {
//                    console.log(xhr.responseText);
                }
            });
        }
    });

    // Toogle collapse arrow icons
    function toggleChevron(e) {
        $(e.target)
                .prev('.panel-heading')
                .find("i.indicator")
                .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    }
    $('.collapse-blocks').on('hidden.bs.collapse', toggleChevron);
    $('.collapse-blocks').on('shown.bs.collapse', toggleChevron);

    $('.toogle-radio').click(function () {
        $(this).tab('show');
    });

    new Vue({
        el: '#application'
    });

    $(function () {
        $('.date-picker').datetimepicker({
            pickTime: false,
            language: "lv"
        });
    });

//$( "body" ).delegate( ".date-picker", "click", function() {
//  $('.date-picker').datetimepicker({
//            pickTime: false,
//            language: "lv"
//        });
//});



    $(function () {
        if ($('#form-calx').length > 0) {
            $('#form-calx').calx({
                'onAfterRender': function () {
                    var $t = this;
                    if ($t.activeCell && $t.activeCell.address) {
                        var $cell = $t.getCell($t.activeCell.address);
                        // Workaround because value is not changed...
                        $('#' + $t.activeCell.address).val($cell.getValue()).trigger('change');
                    }
                }
            });
            $('[data-toggle="tooltip"]').tooltip({
                placement: 'top'
            });
            $('[data-toggle="tooltip-rejected"]').popover('destroy').popover({
                'trigger': "hover",
                'placement': 'right'
            });
        }
    });
});

/**
 * Vue js helpers
 *
 * @type {{getDate: getDate, zeroPad: zeroPad, getStatus: getStatus, spinner: spinner}}
 */

var helpers = {
    getDate: function (date) {
        if (!date) {
            return null;
        }
        // Substr to avoid NaN when date object return zeros at end i.e. 2014-01-01 00:00:00.000000
        var date = new Date(date.substr(0, 10));
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return helpers.zeroPad(d) + "." + helpers.zeroPad(m) + "." + y;
    },
    getTime: function (d) {
        d = d.substr(0, 19);
        var d = new Date(d ? d.replace(/-/g, '/') : '');
        return helpers.zeroPad(d.getHours()) + ":" + helpers.zeroPad(d.getMinutes());
    },
    zeroPad: function (n) {
        return (n <= 9 ? '0' + n : n);
    },
    getStatus: function (key, withLabel) {
        if (typeof (withLabel) === 'undefined')
            withLabel = false;
        var statuses = {
            'approved': 'Tīrraksts',
            'draft': 'Melnraksts',
            'active': 'Aktīvs',
            'inactive': 'Neaktīvs',
            'liquidated': 'Likvidēts',
            'insolvency': 'Maksātnespēja',
            'cancelled_certificate': 'Apliecības anulēšana',
            'ready': 'Gatavs iesniegšanai',
            'accepted': 'Pieņemts',
            'rejected': 'Noraidīts',
            'submitted': 'Iesniegts',
            'confirmed': 'Pieņemts',
            're-submitted': 'Iesniegts atkārtoti',
            'changed': 'Labots',
            'expired': 'Kavēts',
            'not-submitted': 'Nav iesniegts'
        };
        var status = (statuses.hasOwnProperty(key)) ? statuses[key] : key;
        if (withLabel) {
            var labels = {
                'ready': 'info',
                'draft': 'warning',
                'accepted': 'success',
                'active': 'success',
                'approved': 'success',
                'rejected': 'danger',
                'submitted': 'info',
                'confirmed': 'success',
                're-submitted': 'warning',
                'expired': 'danger',
                'not-submitted': 'danger'
            }
            var label = (labels.hasOwnProperty(key)) ? labels[key] : 'default';
            return '<span class="label label-' + label + '">' + status + '</span>';
        }
        return status;
    },
    spinner: function (el) {
        var spinner = $(el).find('.app-spinner');
        return spinner.length ? spinner : $('<div class="app-spinner"/>');
    },
    dropkickOptions: function () {
        return {
            mobile: true,
            initialize: function () {
                var $input,
                        dk = this;
                $('.dk-selected', dk.data.elem).after([
                    '<div class="dk-search">',
                    '<input type="text" class="dk-search-input" placeholder="Meklēt">',
                    '</div>'
                ].join(""));
                $input = $(".dk-search-input", dk.data.elem);
                $input.on("click", function (event) {
                    event.stopPropagation();
                }).on("keypress keyup", function (event) {
                    var found = dk.search(this.value, 'partial');
                    event.stopPropagation();
                    $('.dk-option', dk.data.elem).remove();
                    if (found.length) {
                        $(found).appendTo(dk.data.elem.lastChild);
                        dk.selectOne(found[0]);
                    } else {
                        $("<li></li>").addClass("dk-option dk-option-disabled").text("Sakritību nav...").appendTo(dk.data.elem.lastChild);
                    }
                    found.length && dk.selectOne(found[0]);
                });
            },
            open: function () {
                $('.dk-search-input', this.data.elem).focus();
                $('.dk-selected', this.data.elem).parent().parent().css('z-index', 5);
            },
            close: function () {
                $('.dk-search-input', this.data.elem).val("").blur();
                $('.dk-option', this.data.elem).remove();
                $(this.options).appendTo(this.data.elem.lastChild);
            }
        }
    },
    substrDate: function (string, start, length) {
        if (!string) {
            return;
        }
        var dateArr = string.substr(start, length).split('-');
        if (dateArr.length == 3) {
            return dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0];
        }
        return;
    },
    select2options: function (url) {
        if (typeof (url) == 'undefined') {
            return {
                language: "lv",
                allowClear: true,
                ajax: {
                    dataType: 'json',
                    delay: 250,
                    allowClear: true,
                    data: function (params) {
                        return {
                            search: params.term, // search term
                            limit: params.page
                        };
                    }
                },
                placeholder: "Meklēt.."
            };
        } else {
            return {
                language: "lv",
                allowClear: true,
                ajax: {
                    url: url,
                    dataType: 'json',
                    delay: 250,
                    allowClear: true,
                    data: function (params) {
                        return {
                            search: params.term, // search term
                            limit: params.page
                        };
                    }
                },
                placeholder: "Meklēt.."
            };
        }

    },
    select2MerchantOptions: function () {
        return {
            language: "lv",
            allowClear: true,
            ajax: {
                dataType: 'json',
                delay: 250,
                allowClear: true,
                data: function (params) {
                    return {
                        search: params.term, // search term
                        limit: params.page,
                        per_page: 30,
                    };
                }
            },
            placeholder: "Meklēt..",
            minimumInputLength: 3,
        };
    }
};

/**
 * Vue js tables
 *
 * @type {*|void|Object}
 */
var TableVM = Vue.extend({
    directives: {
        "remote-data": {
            "bind": function () {
                this.vm.url = this.expression;
                this.vm.loadData();
            }
        },
    },
    created: function () {
        this.$set('rows', {});
        this.$set('filter', {});
        this.paginator = [];
        this.$set('filter.page', 1);
        this.$set('per_page', 5);

        this.$set('sortKey', '');
        this.$set('filter.reversed', {});
        setUpTree();
    },
    methods: {
        getDate: helpers.getDate,
        getTime: helpers.getTime,
        getStatus: helpers.getStatus,
        sortBy: function (key) {
            var filter = this.$get('filter');
            this.$set('filter.sortKey', key);

            if (filter.order_by == key) {
                this.$set('filter.order_dir', (filter.order_dir == 'asc' ? 'desc' : 'asc'));

                var orderType = (filter.order_dir == 'asc' ? false : true);
                this.$set('filter.reversed.' + key, orderType);
            } else {
                this.$set('filter.order_by', key);
                this.$set('filter.order_dir', 'asc');
                this.$set('filter.reversed.' + key, false);
            }
            this.loadData();
        },
        clear: function () {
            $('.alert-success', this.$root.$el).remove();
            $('.alert-danger', this.$root.$el).remove();
        },
        loadData: function (spinner) {
            if (typeof (spinner) === 'undefined')
                spinner = true;
            var $t = this;
            var ov = helpers.spinner($t.$el);
            if (spinner) {
                $($t.$el).css({position: 'relative'});
                $($t.$el).prepend(ov.fadeIn());
            }
            $.get(this.url, $t.$get('filter'), function (data) {
                $t.$set('rows', data.items);
                $t.$set('reversed', $t.$get('filter.reversed'));
                $t.$set('sortKey', $t.$get('filter.sortKey'));
                // check if current period is set, if so find the select2 filter element and set current period
                if (data.current_period && data.current_period.id) {
                    var $select2 = $('#form_client_period', $t.$el);
                    $select2.val(data.current_period.id).trigger("change");
                }
                // When remove last item of page need set page and reload grid
                if (data.params.page > data.params.last_page && data.params.last_page > 0) {
                    $t.$set('filter.page', data.params.last_page);
                    $t.loadData(false);
                }
                $t.$set('page', data.params.page);
                $t.$set('last_page', data.params.last_page);
                $t.$set('total', data.params.total);
                var paginator = [];
                var page_links = 10;
                var page_link_start = Math.max(1, $t.$get('page') - Math.ceil(page_links / 2));
                var page_link_end = Math.min(page_link_start + page_links, $t.$get('last_page'));
                page_link_end - page_link_start < page_links && (page_links_start = Math.max(page_link_end - page_links, 1));
                for (var pn = page_link_start; pn <= page_link_end; pn++) {
                    paginator.push({
                        page: pn,
                        active: pn == $t.$get('filter.page')
                    });
                }
                $t.$set('paginator', paginator);
            }).always(function () {
                ov.remove();
            });
        },
        selectTab: function (tab, e) {
            e.preventDefault();
            $(e.target).parent().addClass('active').siblings().removeClass('active');
            this.$set('filter.page', 1);
            this.$set('filter.status', tab);
            this.loadData();
        },
        filterBy: function (e) {
            e.preventDefault();
            var value = $(e.target).val();
            this.$set('filter.page', 1);
            this.$set('filter.status', value);
            this.loadData();
        },
        search: function (e) {
            e.preventDefault();
            this.$set('filter.page', 1);
            this.$set('filter.search', $(e.target).val());
            this.loadData();
        },
        searchSubmit: function (e) {
            e.preventDefault();
            this.$set('filter.page', 1);
            var searchValue = $(e.target).closest('div').find('input').val();
            this.$set('filter.search', searchValue);
            this.loadData();
        },
        paginate: function (page, e) {
            e.preventDefault();
            if (page === 'prev') {
                page = this.$get('filter.page') - 1;
            }
            if (page === 'next') {
                page = this.$get('filter.page') + 1;
            }
            if (page < 1) {
                page = 1;
            }
            if (page > this.$get('last_page')) {
                page = this.$get('last_page');
            }
            this.$set('filter.page', page);
            this.loadData();
        },
        deleteItem: function (id, e, url, question) {
            e.preventDefault();
            this.clear();
            var $t = this;
            if (typeof (url) === 'undefined') {
                url = window.location.href;
            }
            if (typeof (question) === 'undefined') {
                question = 'Vai tiešām vēlaties dzēst?';
            }
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            // Verify to allow delete
            $.ajax({
                url: url,
                type: 'DELETE',
                data: {'id': id, verify: true, _token: $('meta[name="_token"]').attr('content')},
                success: function (response) {
                    if (response.error === true) {
                        bootbox.alert(response.message);
                    } else {
                        bootbox.confirm(question, function (confirm) {
                            if (confirm === true) {
                                // Destroy
                                $.ajax({
                                    url: url,
                                    type: 'DELETE',
                                    data: {id: id, _token: $('meta[name="_token"]').attr('content')},
                                    success: function (data) {
                                        $t.afterDeleteSuccess(data);
                                    },
                                    fail: function () {
                                        bootbox.alert('Sistēmas kļūda!');
                                    }
                                });

                            }
                        });
                    }
                }
            }).always(function () {
                ov.remove();
            });
        },
        afterDeleteSuccess: function (data) {
            if (data.hasOwnProperty('reload')) {
                window.location.reload();
            } else {
                this.loadData();
            }
        },
        dataExport: function (format, e, url) {
            e.preventDefault();
            if (typeof (url) === 'undefined') {
                url = window.location.href;
            }
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            $.fileDownload(url + '?export=' + format, {
                httpMethod: "POST",
                data: $t.$get('filter')
            })
                    .done(function () {
                        ov.remove();
                    })
                    .fail(function () {
                        ov.remove();
                        bootbox.alert('Failu neizdevās lejupielādēt!');
                    });
        }
    },
    components: {
        paginator: {
            template:
                    '<div class="text-center">' +
                    '<ul v-if="paginator.length > 1" class="pagination">' +
                    '<li><a v-on="click:paginate(\'prev\', $event)" href="#">&laquo;</a></li>' +
                    '<li v-repeat="paginator" v-class="active: active">' +
                    '<a v-on="click:paginate({{ page }}, $event)" href="#">{{ page }}</a>' +
                    '</li>' +
                    '<li><a v-on="click:paginate(\'next\', $event)" href="#">&raquo;</a></li>' +
                    '</ul>' +
                    '</div>',
            replace: true,
            computed: {
                hasItems: function () {
                    return this.$parent.rows && this.$parent.rows.length;
                }
            }
        }
    }
});

var TableFormVM = TableVM.extend({
    directives: {
        "validate": function (value) {
            if (value && value.length) {
                $(this.el).addClass('has-error');
                if ($('[data-toggle="tooltip"]', this.el).length == 0) {
                    $(this.el).find('input, select, .selectize-input, .select2-selection').popover('destroy').popover({
                        'trigger': "hover",
                        'placement': 'right',
                        'content': value[0]
                    });
                }
            } else {
                $(this.el).removeClass('has-error');
                $(this.el).find('input, select, .selectize-input, .select2-selection').popover('destroy');
            }
        },
    },
    methods: {
        getDate: helpers.getDate,
        afterSuccess: function () {
            $('.modal', this.$el).modal('hide');
            this.loadData();
        },
        submit: function (e) {
            e.preventDefault();
            var form = $(e.target).parents('form:first', this.$el);
            var data = $(form[0]).serialize();

            var method = (function (el) {
                return $(form).attr('method') || "post";
            })(this.$el).toUpperCase();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            var remove_overlay = function () {
                ov.fadeOut(function () {
                    $(this).remove();
                });
            }
            $.ajax({
                url: $(form).attr('action') || "",
                type: method,
                data: data,
                success: function (data) {
                    if (data.errors) {
                        $t.$data.$add('errors', data.messages);
                        remove_overlay();
                    } else {
                        $t.$data.errors = {};
                        $t.afterSuccess(data);
                    }
                },
                error: function (data) {
                    remove_overlay();
                }
            });
        },
    }
});

Vue.component('vue-grid', TableVM);

Vue.component('vue-grid-forms', TableVM.extend({
    methods: {
        verifyStatus: function (status, e) {
            if (status == 'approved') {
                e.preventDefault();
                bootbox.alert('Veidlapas sagatavi nedrīkst labot, jo tās statuss ir "Tīrraksts"!<br /><br />Veidlapas sagatavei ir jāveido jauna versija!');
            } else {
                return true;
            }
        },
        cloneItem: function (id, e, url) {
            e.preventDefault();
            var $t = this;
            bootbox.confirm('Vai tiešām vēlaties veidot jaunu versiju?', function (confirm) {
                if (confirm === true) {
                    var ov = helpers.spinner($t.$el);
                    $($t.$el).css({position: 'relative'});
                    $($t.$el).prepend(ov.fadeIn());
                    $.ajax({
                        url: url,
                        type: 'PUT',
                        data: {id: id, _token: $('meta[name="_token"]').attr('content')},
                        success: function (data) {
                            bootbox.confirm('Jaunā versija veiksmīgi izveidota. Vai vēlaties to atvērt rediģēšanas rīkā?', function (confirmOpen) {
                                if (confirmOpen === true) {
                                    window.location.href = data.toUrl;
                                } else {
                                    $('.nav-tabs #draft', $t.$el).addClass('active').siblings().removeClass('active');
                                    $t.$set('filter.page', 1);
                                    $t.$set('filter.status', 'draft');
                                    $t.loadData();
                                }
                            });
                        },
                        fail: function () {
                            bootbox.alert('Sistēmas kļūda!');
                        }
                    });
                }
            });
        }
    }
}));

var TableVMLinking = TableVM.extend({
    directives: {
        "select-id": {
            "bind": function () {
                this.vm.select = '#' + this.expression;
                this.vm.loadAvailableItems();
            }
        }
    },
    created: function () {
        this.$set('linking_items', {});
    },
    methods: {
        getDate: helpers.getDate,
        getTime: helpers.getTime,
        loadAvailableItems: function () {
            var $t = this;
            var ov = helpers.spinner($t.select);
            $($t.select).css({position: 'relative'});
            $($t.select).prepend(ov.fadeIn());
            $.get(this.url, {'get_available_items': true}, function (data) {
                $t.$set('linking_items', data.linking_items);
                var $container = $($t.select);
                var select_name = '#linking-item-list';
                // Remove existed objects
                if ($(select_name, $container).length) {
                    $(select_name, $container).remove();
                    $('.dk-select', $container).remove();
                }
                // Create new dropdown with droppick
                if (data.linking_items.length) {
                    $container.append('<select id="linking-item-list" class="form-control"></select>');
                    var $select = $(select_name, $container);
                    $.each(data.linking_items, function (key, obj) {
                        var info = '';
                        if (typeof (obj.info) !== 'undefined') {
                            info = obj.info;
                        }
                        $select.append('<option value="' + obj.id + '">' + obj.description + info + '</option>');
                    });
                    $select.dropkick(helpers.dropkickOptions());
                } else {
                    var message = 'Visas iespējamās vienības piesaistītas!';
                    if (data.hasOwnProperty('empty_list_message')) {
                        message = data.empty_list_message;
                    }
                    $container.append('<p id="linking-item-list">' + message + '</p>');
                }
                if ($t.$.child) {
                    $t.$.child.loadAvailableItems();
                    ov.remove();
                } else {
                    $t.reloadIndusries();
                    ov.remove();
                }
            });
        },
        reloadIndusries: function () {
            // ...
        },
        addItem: function (e) {
            e.preventDefault();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            var item = $('#linking-item-list option:selected', $t.$el).val();
            $.post(this.url, {add_item: item}, function (data) {
                if (data.hasOwnProperty('toUrl')) {
                    window.location.href = data.toUrl;
                } else {
                    $t.loadData(false);
                    $t.loadAvailableItems();
                    if ($t.$.child) {
                        $t.$.child.loadData(false);
                        $t.$.child.loadAvailableItems();
                    }
                }
            });
        },
        removeItem: function (id, e) {
            var $t = this;
            e.preventDefault();
            bootbox.confirm('Vai tiešām vēlaties dzēst?', function (response) {
                if (response === true) {
                    var ov = helpers.spinner($t.$el);
                    $($t.$el).css({position: 'relative'});
                    $($t.$el).prepend(ov.fadeIn());
                    $.post($t.url, {remove_item: id}, function () {
                        $t.loadAvailableItems();
                        $t.loadData(false);
                        if ($t.$.child) {
                            $t.$.child.loadData(false);
                            $t.$.child.loadAvailableItems();
                        }
                    });
                }
            });
        },
        saveParam: function (parameter, id, t) {
            var $t = this;
            var value = 0;
            if ($(t.$el).prop("checked")) {
                value = 1;
            }
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            $.post($t.url, {saveParam: parameter, value: value, id: id}, function () {
                $t.loadData(false);
            });
        }
    }
});
Vue.component("vue-grid-with-linking", TableVMLinking);

function setUpTree() {
    $treeUL = $("#classifier-tree");
    $treeSubtree = $treeUL.find('.hideSubtree');

    if ($treeSubtree.length) {
        $treeUL.find('.hideSubtree').hide(0, function () {
            $treeUL.find('ul:first').addClass('show');
        });
    } else {
        $treeUL.find('ul:first').addClass('show');
    }

    // Toogle classifier breadcrumbs
    $(".moreTree").on("click", function () {
        var classifier = $(this).parent();
        classifier.children('.hideSubtree').toggle();
    });
}

var TableVMLinkingUserAcl = TableVMLinking.extend({
    created: function () {
        $("#classifier-tree").find('ul:first').removeClass('show');
        this.reloadIndusries();
    },
    methods: {
        reloadIndusries: function () {
            var $t = this;
            var $box = $('.panel-industries', $t.el);
            var ov = helpers.spinner($box);
            $(ov).css({position: 'absolute'});
            $($box).prepend(ov.fadeIn());

            $urlTo = $($t.$el).data('url');

            $.get($urlTo, {'get_available_industries': true}, function (data) {
                if (data.industries.length > 0) {
                    $t.$set('industries', data.industries);
                    var isDataAdded = setTimeout(function () {
                        if ($("#classifier-tree ul").length) {
                            clearTimeout(isDataAdded);
                            setUpTree();
                        }
                    }, 100);
                } else {
                    $t.$set('industries', '');
                }
            }).always(function () {
                ov.remove();
            });
        }
    }
});
Vue.component("vue-grid-with-linking-user-acl", TableVMLinkingUserAcl);

var TableVMBlock = TableFormVM.extend({
    directives: {
        "select-id": {
            "bind": function () {
                this.vm.select = '#' + this.expression;
                this.vm.loadAvailableItems();
            }
        }
    },
    methods: {
        substrDate: helpers.substrDate,
        loadAvailableItems: function () {
            var $t = this;
            var ov = helpers.spinner($t.select);
            $($t.select).css({position: 'relative'});
            $($t.select).prepend(ov.fadeIn());
            var list_name = $t.select.substring(1);
            var $container = $($t.select);
            $.get(this.url, {'get_available_items': list_name}, function (data) {
                $t.$set('linking_items', data.linking_items);
                var select_name = '#linking-item-list-' + list_name;
                // Remove existed objects
                if ($(select_name, $container).length) {
                    $(select_name, $container).remove();
                    $('.dk-select', $container).remove();
                }
                // Create new dropdown with droppick
                if (data.linking_items.length) {
                    $container.append('<select id="linking-item-list-' + list_name + '" class="form-control"></select>');
                    var $select = $(select_name, $container);
                    $.each(data.linking_items, function (key, obj) {
                        $select.append('<option value="' + obj.id + '">' + obj.name + '</option>');
                    });
                    $select.dropkick(helpers.dropkickOptions());
                } else {
                    var message = 'Visi iespējamie komersanti piesaistīti!';
                    if (data.hasOwnProperty('empty_list_message')) {
                        message = data.empty_list_message;
                    }
                    $container.append('<p id="linking-item-list-' + list_name + '">' + message + '</p>');
                }
                if ($t.$.child) {
                    $t.$.child.loadAvailableItems();
                }
            }).always(function () {
                ov.remove();
            });
        },
        addItem: function (e, action) {
            e.preventDefault();
            var $t = this;
            var list_name = $t.select.substring(1);
            var item = $('#linking-item-list-' + list_name + ' option:selected', $t.$el).val();
            var group_id = $('input:hidden[name=group_id]', $t.$el).val();
            if (typeof (item) === 'undefined') {
                return false;
            }
            if (typeof (group_id) === 'undefined') {
                return false;
            }
            var $url = this.url;
            if (action) {
                $url = action;
            }

            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            var post = {
                add_item: item,
                target: group_id
            };
            $.post($url, post, function (data) {
                if (data.hasOwnProperty('toUrl')) {
                    window.location.href = data.toUrl;
                } else {
                    $t.loadData(false);
                    $t.loadAvailableItems();
                    if ($t.$.child) {
                        $t.$.child.loadData(false);
                        $t.$.child.loadAvailableItems();
                    }
                }
            });
        },
        editRow: function (id, block, e, url) {
            e.preventDefault();
            var $t = this;
            var $elem = $('#collapse' + block);
            if (!$elem.hasClass('collapse in')) {
                $($elem, $t.$el).toggleClass('in');
                $($elem, $t.$el).removeAttr('style');
                $('span.collapse-link', $t.$el).toggleClass('collapsed');
                $($t.$el).find('i.indicator').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
            }
            if (typeof (url) === 'undefined') {
                url = window.location.href;
            }

            var $block = $('#block-' + block, this.$el);

            // block-water-report set hidden field on form
            $block.find('input[name=report]').val(id);

            var $formbox = $('.modal-dialog', $block);
            var ov = helpers.spinner($formbox);
            $($formbox).css({position: 'relative'});
            $($formbox).prepend(ov.fadeIn());
            $.get(url, function (data) {
                $.each(data.fields, function (i, val) {
                    if (typeof (val) === 'object') {
                        if (val['type'] == 'select') {
                            if (typeof (val['value']) !== 'undefined') {
                                var content = '<div data-value="' + val['value'] + '" class="item">' + val['name'] + '</div>';
                                $($block.find('#' + i), $t.$el).find('.selectize-input :input').removeAttr('placeholder').css('width', '4px');
                                $($block.find('#' + i), $t.$el).find('.selectize-input > .item').remove();
                                $($block.find('#' + i + ' > select > option'), $t.$el).val(val['value']);
                                $($block.find('#' + i), $t.$el).find('.selectize-input').prepend(content);

                                $($block.find('#' + i), $t.$el).find('.selectize-input').click(function () {
                                    $($block.find('#' + i), $t.$el).find('.selectize-input > .item').remove();
                                });
                            }
                        }
                        if (val['type'] == 'multiselect') {
                            var $ul = $($block.find('#' + i), $t.$el).find('ul.multiselect-container');
                            var $select = $($block.find('#' + i), $t.$el).find('select');

                            // Clear old data
                            $($block.find('#' + i), $t.$el).find('select > option').each(function () {
                                $(this).removeAttr('selected');
                            });
                            $($block.find('#' + i), $t.$el).find('ul.multiselect-container > li').each(function () {
                                $(this).find('input').removeAttr('checked');
                                $(this).removeClass('active');
                            });
                            $.each(val['values'], function (index, value) {
                                var $option = $($select).find('option[value="' + value + '"]');
                                $($option).attr('selected', 'selected');

                                var $input = $($ul).find('input[value="' + value + '"]');
                                $($input).attr('checked', 'checked');
                                $($input).closest('li').addClass('active');
                            });
                            $($block.find('#' + i), $t.$el).find('.form-select').multiselect();
                        }
                        if (val['type'] == 'select2ajax') {
                            if (typeof (val['value']) !== 'undefined') {
                                var $select = $('#' + i, $t.$el);
                                var $select2 = $('select.select2-ajax', $select);
                                var option = '<option value="' + val['value'] + '" selected="selected">' + val['name'] + '</option>';
                                $select2.html(option).select2(helpers.select2options());
                            } else if (typeof (val['values']) !== 'undefined') {
                                var $select = $('#' + i, $t.$el);
                                var $select2 = $('select.select2-ajax', $select);
                                $select2.html('');
                                $.each(val['values'], function (index, value) {
                                    if (value['id']) {
                                        var option = '<option value="' + value['id'] + '" selected="selected">' + value['name'] + '</option>';
                                        $select2.append(option);
                                    }
                                });
                                $select2.select2(helpers.select2options());
                            }

                            if (typeof (val['ajaxParam']) !== 'undefined') {
                                var url = $select2.attr('data-index-url');
                                url = url + '/' + val['ajaxParam'];
                                $($select2).select2(helpers.select2options(url));
                            }
                        }
                        if (val['type'] == 'select2') {
                            var $select = $('#' + i, $t.$el);
                            var $select2 = $('select.select2', $select);
                            if (typeof (val['value']) !== 'undefined') {
                                $select2.val(val['value']).trigger("change");
                            } else if (typeof (val['values']) !== 'undefined') {
                                $select2.val(val['values']).trigger("change");
                            }

                            if (typeof (val['disabled']) !== 'undefined' && val['disabled']) {
                                $select2.attr('disabled', 'disabled');
                            }
                        }
                        if (val['type'] == 'files') {
                            $block.find("#files_" + i, $t.$el).children().remove();
                            $block.find("#files_" + i, $t.$el).append(val['print']);

                            $block.find(".files_" + i, $t.$el).children().remove();
                            $block.find(".files_" + i, $t.$el).append(val['print']);

                            $block.find('form').append(val['input']);
                        }
                        if (val['type'] == 'textarea') {
                            $block.find("textarea[name='" + i + "']").val(val['value']);
                        }
                        if (val['type'] == 'checkbox') {
                            if (typeof (val['values']) !== 'undefined' && val['values'] != null) {
                                $.each(val['values'], function (k, v) {
                                    $('input[name="' + i + '[]"][value="' + v + '"]', $block)
                                            .attr("checked", true);
                                });
                            }
                        }
                        if (val['type'] == 'radio') {
                            if (typeof (val['value']) !== 'undefined') {
                                $block.find($('input[name="' + i + '"][value="' + val['value'] + '"]'))
                                        .attr("checked", true);
                            }
                        }
                        if (val['type'] == 'info') {
                            $block.find("#" + val['name']).text(val['value'])
                        }
                    }
                    else {
                        $block.find("input[name='" + i + "']").val(val);
                    }

                    $('.disabled-dk').find('.selectize-input').unbind();

                    $block.find('form').attr('action', data.action);
                });
            }).always(function () {
                ov.remove();
            });
            var title = $($block.find('.modal-title'));
            title = 'Labot ' + title.text().replace("Labot ", "").replace("Pievienot ", "");
            $block.find('.modal-title').text('').append(title);

            $block.modal('show');
        },
        createRow: function (block, e, url) {
            e.preventDefault();
            var $t = this;
            var $elem = $('#collapse' + block);
            if (!$elem.hasClass('collapse in')) {
                $($elem, $t.$el).toggleClass('in');
                $($elem, $t.$el).removeAttr('style');
                $('span.collapse-link', $t.$el).toggleClass('collapsed');
                $($t.$el).find('i.indicator').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
            }
            if (typeof (url) === 'undefined') {
                url = window.location.href;
            }
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());

            $('#files', $t.$el).empty();
            $('input[name="uploaded_files[]"]', $t.$el).remove();
            //reseting radio button
            var $block = $('#block-' + block, this.$el);
            var $new_group_tab = $('#new-group');
            var $exist_group_tab = $('#existing-group');
            if ($exist_group_tab.hasClass('tab-pane active')) {
                $($exist_group_tab, $block).toggleClass('active');
                $($new_group_tab, $block).toggleClass('active');
            }
            $block.find('form').attr('action', url);
            var title = $($block.find('.modal-title'));
            title = 'Pievienot ' + title.text().replace("Labot ", "").replace("Pievienot ", "");
            $block.find('.modal-title').text('').append(title);
            $block.modal('show');
            ov.remove();
        },
        addRow: function (block, e, url) {
            e.preventDefault();
            var $t = this;
            if (typeof (url) === 'undefined') {
                url = window.location.href;
            }
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());

            var $block = $('#block-second-' + block, this.$el);

            $block.modal('show');
            ov.remove();
        },
        createForm: function (e) {
            e.preventDefault();
            var $t = this;
            var item = $('select[class*="select2"]', $t.$el).val();
            if (item == null) {
                bootbox.alert('Izvēlieties veidlapas sagatavi').find('div.modal-dialog').attr('style', 'width:20%;');
                return false;
            }
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            $.post(this.url, {add_item: item}, function (data) {
                if (data.errors) {
                    bootbox.alert(data.messages).find('div.modal-dialog').attr('style', 'width:20%;');
                    ov.remove();
                } else {
                    if (data.hasOwnProperty('toUrl')) {
                        window.location.href = data.toUrl;
                    } else {
                        $t.loadData(false);
                        $t.loadAvailableItems();
                        if ($t.$.child) {
                            $t.$.child.loadData(false);
                            $t.$.child.loadAvailableItems();
                        }
                    }
                }
            });
        },
    }
});
Vue.component("vue-grid-block", TableVMBlock.extend({
    created: function () {
        var $t = this;
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).removeData('bs.modal');
            $('form', this).trigger('reset');
            $('form', this).find('.form-group').removeClass('has-error');
            $('form', this).find('input, select, .selectize-input, a.select2-choice, .select2-selection').popover('destroy');
            var $selectize = $('select.selectized', $t.$el);
            // SELECT2
            $('select.select2', $t.$el).each(function () {
                $(this).val('').trigger("change");
            });
            $('select.select2-ajax', $t.$el).each(function () {
                $(this).val('').trigger("change");
            });

        });

        // SET FILTER TRACKER FOR SELECT2
        $('select.select2-year-filter', $t.$el).each(function () {
            $(this).val('').trigger("change");
            $(this).on("select2:select", function (e) {
                $t.searchSubmitCustom($(e.target).attr('id'), $(e.target).val());
            });
            $(this).on("select2:unselect", function (e) {
                $t.searchSubmitCustom($(e.target).attr('id'), null);
            });
        });

        // Change select2 ajax url to custom
        var select2ajax = $('select.select2-ajax', $t.$el);
        if ($(select2ajax).length > 0) {
            $(select2ajax).each(function () {
                var url = $(this).attr('data-index-url');
                if (typeof (url) !== 'undefined') {
                    $(this).select2(helpers.select2options(url));
                }
            });
        }
    },
    methods: {
        searchSubmitCustom: function (field, value) {
            var $t = this;
            if (value == null) {
                this.$set('filter.page', 1);
                this.$set('filter.search_' + field, '');
                this.loadData();
            } else {
                this.$set('filter.page', 1);
                this.$set('filter.search_' + field, value);
                this.loadData();
            }
        },
        refreshOzolsData: function (e, id, block) {
            e.preventDefault();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());

            $.get('/apgrozijums-nodevu-statuss/atjauninat', {'client': id, 'block': block}, function (data) {
                //manage errors
            }).complete(function () {
                $t.loadData(false);
                Vue.nextTick(function () {
                    ov.remove();
                }.bind(this));
            });
        },
        OzolsErrorLog: function (e, id) {
            e.preventDefault();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());

            $.get('/apgrozijums-nodevu-statuss/servisa-vesture', {'client': id}, function (data) {
                var returnStr = '<table class="table table-striped table-borderless table-hover">' +
                        '<tr>' +
                        '<th>Teksts</th>' +
                        '<th>Datums</th>' +
                        '</tr>';
                for (var i = 0; i < data.items.length; i++) {
                    returnStr += '<tr><td>' + data.items[i]['info'] + '</td><td>' + helpers.getDate(data.items[i]['created_at']) + '</td></tr>';
                }

                returnStr += '</table>';
                bootbox.alert(returnStr);
            }).always(function () {
                ov.remove();
            });
        }
    }
}));

/**
 * Vue js forms
 *
 * @type {*|void|Object}
 */
var FormVM = Vue.extend({
    directives: {
        "validate": function (value) {
            if (value && value.length) {
                $(this.el).addClass('has-error');
                if ($('[data-toggle="tooltip"]', this.el).length == 0) {
                    $(this.el).find('input, select, .selectize-input, textarea, .select2-selection').popover('destroy').popover({
                        'trigger': "hover",
                        'placement': 'right',
                        'content': value[0],
                        container: 'body'
                    });
                }
            } else {
                $(this.el).removeClass('has-error');
                $(this.el).find('input, select, .selectize-input, a.select2-choice, textarea, .select2-selection').popover('destroy');
            }
        },
        "select-tags": {
            "bind": function () {
                var $e = $(this.$el),
                        model = this.vm,
                        data = this.vm.$data.selectize,
                        remote = data.remote || "";

                $('.select-tags', this.$el).selectize({
                    valueField: data.valueField,
                    searchField: data.searchFields,
                    sortField: data.sortFields,
                    plugins: ['remove_button', 'drag_drop'],
                    delimiter: ',',
                    persist: false,
                    openOnFocus: false,
                    load: function (query, callback) {
                        if (!query.length)
                            return callback();
                        $.ajax({
                            url: remote,
                            data: {search: query},
                            type: 'GET',
                            error: function () {
                                callback();
                            },
                            success: function (res) {
                                callback(res.results);
                            }
                        });
                    },
                    render: {
                        item: model.selectizeRenderItem,
                        option: model.selectizeRenderOption
                    },
                    create: model.selectizeCreate
                });
            }
        }
    },
    methods: {
        selectizeCreate: function (input) {
            return {label: input};
        },
        selectizeRenderItem: function (item, escape) {
            return '<div>' + escape(item.name) + '</div>';
        },
        selectizeRenderOption: function (item, escape) {
            return '<div>' + escape(item.name) + '</div>';
        },
        submit: function (e) {
            e.preventDefault();
            var $t = this;
            var collapse_target = $("input[name='report']", $t.$el).val();
            var collapse_block = $("input[name='collapse_block']", $t.$el).val();
            var data = $(this.$el).serialize();
            var method = (function (el) {
                return $(el).attr('method') || "post";
            })(this.$el).toUpperCase();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).css({position: 'relative'});
            $($t.$el).prepend(ov.fadeIn());
            var remove_overlay = function () {
                ov.fadeOut(function () {
                    $(this).remove();
                });
            }
            $.ajax({
                url: $(this.$el).attr('action') || "",
                type: method,
                data: data,
                success: function (data) {
                    if (data.errors) {
                        $t.$data.errors = data.messages;
                        if ($('.modal.fade.in').length > 0) {
                            // If form is in modal 
                            var $modal = $('.modal.fade.in');
                            $($modal).animate({
                                scrollTop: $('.modal-content', $modal).offset().top
                            }, 'fast');
                        } else {
                            $(window).scrollTop(0);
                        }
                        remove_overlay();
                    } else if (data.error_bootbox) {
                        $t.$data.errors = {};
                        bootbox.alert(data.bootbox_message).find('div.modal-dialog').attr('style', 'width:20%;');
                        remove_overlay();
                    } else {
                        $t.$data.errors = {};
                        $t.afterSuccess(data, collapse_target, collapse_block);
                    }
                },
                error: function (data) {
                    remove_overlay();
                }
            });
        },
        afterSuccess: function (data) {
            if (data.hasOwnProperty('toUrl')) {
                window.location.href = data.toUrl;
            } else if (data.hasOwnProperty('alertMessage')) {
                bootbox.alert(data.alertMessage);
                helpers.spinner(this.$el).fadeOut(function () {
                    $(this).remove();
                });
            } else {
                window.location.reload();
            }
        },
        clear: function () {
            $('.alert-success:not(.disable-clear)', this.$root.$el).remove();
            $('.alert-danger:not(.disable-clear)', this.$root.$el).remove();
        },
        clearSelect: function (e) {
            e.preventDefault();
            $(e.target).closest('div').find('select').val('').trigger("change");
        },
        paginate: function (page, e) {
            e.preventDefault();
            if (page === 'prev') {
                page = this.$get('filter.page') - 1;
            }
            if (page === 'next') {
                page = this.$get('filter.page') + 1;
            }
            if (page < 1) {
                page = 1;
            }
            if (page > this.$get('last_page')) {
                page = this.$get('last_page');
            }
            this.$set('filter.page', page);
            this.loadData();
        }
    },
    components: {
        paginator: {
            template:
                    '<div class="text-center">' +
                    '<ul v-if="paginator.length > 1" class="pagination">' +
                    '<li><a v-on="click:paginate(\'prev\', $event)" href="#">&laquo;</a></li>' +
                    '<li v-repeat="paginator" v-class="active: active">' +
                    '<a v-on="click:paginate({{ page }}, $event)" href="#">{{ page }}</a>' +
                    '</li>' +
                    '<li><a v-on="click:paginate(\'next\', $event)" href="#">&raquo;</a></li>' +
                    '</ul>' +
                    '</div>',
            replace: true,
            computed: {
                hasItems: function () {
                    return this.$parent.rows && this.$parent.rows.length;
                }
            }
        }
    }
});

Vue.component("formbuilder-form", FormVM.extend({
    methods: {
        saveForm: function (e) {
            e.preventDefault();
            var $t = this;
            var ov = helpers.spinner($t.$el);
            $($t.$el).prepend(ov.fadeIn());
            var remove_overlay = function () {
                ov.fadeOut(function () {
                    $(this).remove();
                });
            }
            if ($('input[name=status]', e.target).val() == 'approved') {
                var url = $(this.$el).attr('action');
                var msg = 'Pēc apstiprināšanas veidlapas sagatavei tiks piešķirts statuss "Tīrraksts" un veidlapas sagatavi vairs nevarēs labot!';
                $.post(url, {'other_approved': true}, function (response) {
                    if (response) {
                        msg = 'Sistēmā jau ir sagatave statusā "Tīrraksts"! Turpinot, Jūsu versijai tiks piešķirts statuss "Tīrraksts" un Sistēmā esošai sagataves versijai tiks mainīts statuss uz "Melnraksts"?';
                    }
                    bootbox.confirm(msg, function (confirm) {
                        if (confirm === true) {
                            $t.submit(e);
                        }
                    });
                }).always(function () {
                    ov.remove();
                });
            } else {
                $t.submit(e);
            }
        }
    }
}));
Vue.component("formbuilder-formulas", {
    created: function () {
        var isDataAdded = setTimeout(function () {
            if ($("table.table.table-borderless").length) {
                clearTimeout(isDataAdded);

                var $tableInput = $('input[type="text"]:not([readonly])', 'table');
                var inputIndex;

                $tableInput.focus(function () {
                    $(this).addClass('focused');
                });

                $tableInput.blur(function () {
                    $(this).removeClass('focused');
                });

                $(this).keydown(function (e) {
                    if (e.which == 13) {
                        $findInput = $('.focused', 'table');
                        inputIndex = $tableInput.index($findInput);
                        inputIndex++;
                        if ($tableInput.eq(inputIndex).length) {
                            $tableInput.eq(inputIndex).focus();
                        } else {
                            inputIndex--;
                        }
                        e.preventDefault();
                    }
                });
            }
        }, 100);

        if ($("div.merchant-select2").length > 0) {
            $($("div.merchant-select2")).find('select').select2(helpers.select2MerchantOptions());
        }
    },
    directives: {
        "document-status-checker": function () {
            // Clean listener element id value from qoutes and get Object
            var $t = this;
            var listener_id = this.expression.replace(/['"]+/g, '');
            var $listener_elem = $("#" + listener_id, this.vm.$el);
            $t.vm.$parent.$set('allowedUnload', true);
            $listener_elem.change(function () {
                $t.vm.$parent.$set('allowedUnload', false);
            });
        },
        "other-field-filled": function () {
            // Clean listener element id value from qoutes and get Object
            var listener_id = this.expression.replace(/['"]+/g, '');
            var $listener_elem = $("#" + listener_id, this.vm.$el);

            // Clean target element id value from qoutes and get Object
            var target_id = $listener_elem.attr('data-target-elem').replace(/['"]+/g, '');
            var $target_elem = $("#" + target_id, this.vm.$el);

            // Create event listener
            this.vm.createEventListener($listener_elem, $target_elem);
        },
        "get-previous-period-val": function () {
            // Clean listener element id value from qoutes and get Object
            var elem_id = this.expression.replace(/['"]+/g, '');
            var $elem = $("#" + elem_id, this.vm.$el);

            // Clean target element id value from qoutes and get Object
            var target_id = $elem.attr('data-target-elem').replace(/['"]+/g, '');

            var step = $elem.attr('data-step-count').replace(/['"]+/g, '');

            var period_id = $elem.attr('data-current-period').replace(/['"]+/g, '');

            var form_id = $elem.attr('data-form-id').replace(/['"]+/g, '');

            var client_id = $elem.attr('data-client-id').replace(/['"]+/g, '');

            this.vm.updatePrevPeriodValField($elem, target_id, step, period_id, form_id, client_id);
        },
        "time-picker": function () {
            // Clean time-picker element id value from qoutes and get Object
            var time_picker_id = this.expression.replace(/['"]+/g, '');
            this.vm.createTimePicker(time_picker_id);

            $('.time-picker-' + time_picker_id + ' input').keydown(function (e) {
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                        // Allow: Ctrl+A
                                (e.keyCode == 65 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                        (e.keyCode >= 35 && e.keyCode <= 39) ||
                                        // Allow: Sfift+:
                                                (e.keyCode == 186 && e.shiftKey === true)) {
                                    // let it happen, don't do anything
                                    return;
                                }
                                // Ensure that it is a number and stop the keypress
                                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                    e.preventDefault();
                                }
                            });
                },
                "number-field": function (e) {
                    var id = this.expression.replace(/['"]+/g, '');

                    $('.number-field-' + id).keydown(function (e) {
                        var is_integer = $(this).attr('data-type-integer').replace(/['"]+/g, '');
                        if (is_integer == 'true') {
                            var in_array = $.inArray(e.keyCode, [46, 8, 9, 27, 13]);
                        } else {
                            var in_array = $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 109, 189]);
                        }

                        var value = $(this).val();
                        // Process "-"
                        if ((e.keyCode === 110 || e.keyCode === 190)) {
                            // Allow only one "." in input
                            if (this.value.split('.').length === 2) {
                                return false;
                            }
                            // Don't allow "." only at start of string
                            if (value == '') {
                                return false;
                            }
                        }
                        // Process "-"
                        if ((e.keyCode === 109 || e.keyCode === 189)) {
                            // Allow only one "-" in input
                            if (this.value.split('-').length === 2) {
                                return false;
                            }
                            // Allow "-" only at start of string
                            if (value != '') {
                                return false;
                            }
                        }

                        // Allow: backspace, delete, tab, escape, enter and . -
                        if (in_array !== -1 ||
                                // Allow: Ctrl+A
                                        (e.keyCode == 65 && e.ctrlKey === true) ||
                                        // Allow: Ctrl+V
                                                (e.ctrlKey == true && (e.which == '118' || e.which == '86')) ||
                                                // Allow: Ctrl+C
                                                        (e.ctrlKey == true && (e.which == '99' || e.which == '67')) ||
                                                        // Allow: home, end, left, right
                                                                (e.keyCode >= 35 && e.keyCode <= 39) ||
                                                                // Allow: Sfift+:
                                                                        (e.keyCode == 186 && e.shiftKey === true)) {
                                                            // let it happen, don't do anything
                                                            return;
                                                        }
                                                        // Ensure that it is a number and stop the keypress
                                                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                                            e.preventDefault();
                                                        }
                                                    });
                                            $('.number-field-' + id).bind("paste", function (e) {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (e.originalEvent.clipboardData) {
                                                    var paste_value = e.originalEvent.clipboardData.getData("text/plain");
                                                }
                                                if (window.clipboardData) {
                                                    var paste_value = window.clipboardData.getData("Text");
                                                }
                                                if ($.isNumeric(paste_value)) {
                                                    this.value = paste_value;
                                                } else {
                                                    bootbox.alert('Ielīmējamā vērtība nav skaitlis!');
                                                }
                                            });
                                        },
                                        "equal-other-filled-value": function () {
                                            // Clean listener element id value from qoutes and get Object
                                            var elem_id = this.expression.replace(/['"]+/g, '');
                                            var $elem = $("#" + elem_id, this.vm.$el);

                                            // Get TR object
                                            var $tr_elem = $("#" + elem_id + "_TR", this.vm.$el);


                                            // value listener set on TR not simple element
                                            if ($elem.length == 0 && $tr_elem.length > 0) {
                                                $elem = $tr_elem;
                                            }
                                            // Clean filledOther element id value from qoutes and get Object
                                            var filled_other_id = $elem.attr('data-filled-other').replace(/['"]+/g, '');
                                            var $filledOther = $("#" + filled_other_id, this.vm.$el);

                                            // Clean filledId element id value from qoutes and get Object
                                            var filled_id = $elem.attr('data-filled-id').replace(/['"]+/g, '');
                                            var $filledId = $("#" + filled_id, this.vm.$el);

                                            var operator = $elem.attr('data-operator').replace(/['"]+/g, '');

                                            if ($elem.is('select')) {
                                                $elem = $elem.parent();
                                            }

                                            this.vm.createValueListener($elem, $filledOther, $filledId, operator, $tr_elem);

                                        }
                                    },
                                    methods: {
                                        compare: function (post, operator, value) {
                                            switch (operator) {
                                                case 'bigger':
                                                    return post > value;
                                                case 'less':
                                                    return post < value;
                                                case 'bigger_equal':
                                                    return post >= value;
                                                case 'less_equal':
                                                    return post <= value;
                                                case 'equal':
                                                    return post == value;
                                            }
                                        },
                                        updatePrevPeriodValField: function ($elem, target_id, step, period_id, form_id, client_id) {
                                            var url = '/vesturisko-periodu-vertiba';
                                            $elem.addClass('hidden');
                                            var $spinner = $elem.next('.spinner');
                                            $spinner.html('<img src="/assets/img/loading.gif" />');
                                            $.get(url, {'field_id': target_id, 'step': step, 'period_id': period_id, 'form_id': form_id, 'client_id': client_id}, function (data) {
                                                var $dataCell = $elem.attr('data-cell');
                                                var $sheet = $('#form-calx').calx('getSheet');
                                                var $cell = $sheet.getCell($dataCell);
                                                if (data.value !== null) {
                                                    $cell.setValue(data.value);
                                                    $elem.val(data.value);
                                                } else {
                                                    $cell.setValue('');
                                                    $elem.val('');
                                                }
                                                //$elem.prop('readonly', true);
                                            }).always(function () {
                                                $spinner.html('');
                                                $elem.removeClass('hidden');
                                                $('#form-calx').calx('calculate');
                                                //$elem.prop('readonly', true);
                                            });
                                        },
                                        resetSelectedValues: function ($elem) {
                                            // Classic
                                            $elem.addClass("hidden");
                                            $elem.val(null);

                                            // Bootstrap Multiselect
                                            $('select.multiple-selected option', $elem).each(function () {
                                                $(this).prop('selected', false);
                                            });
                                            $('select.multiple-selected', $elem).multiselect('refresh');

                                            // SELECT2
                                            $('select.select2', $elem).each(function () {
                                                $(this).val('').trigger("change");
                                            });

                                            $('select.select2-ajax', $elem).each(function () {
                                                $(this).val('').trigger("change");
                                            });

                                            // Selectize.js
                                            var $selectize = $('select.selectized', $elem);
                                            if (typeof ($selectize[0]) !== 'undefined') {
                                                $selectize[0].selectize.clear();
                                            }
                                        },
                                        createValueListener: function ($elem, $filledOther, $filledId, operator, $tr_elem) {
                                            // Create value listener
                                            var $t = this;
                                            if ($elem.parent().find('span').hasClass('input-group-addon'), $t.$el) {
                                                var $span_elem = $elem.parent().find('span[class*="input-group-addon"]');
                                            }
                                            switch (true) {
                                                case $filledOther.find('input:radio, input:checkbox').length > 0:
                                                    $(':radio', $filledOther).click('input', function () {

                                                        var checkedValue = (typeof ($(this).val()) !== 'undefined') ? $(this).val().trim() : true;
                                                        var filledValue = (typeof ($filledId.text()) !== 'undefined') ? $filledId.text().trim() : false;
                                                        if ($t.compare(checkedValue, operator, filledValue)) {
                                                            $elem.removeClass("hidden");
                                                            if ($tr_elem.length) {
                                                                $tr_elem.removeClass("hidden");
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $span_elem.removeClass("hidden");
                                                            }
                                                        } else {
                                                            $t.resetSelectedValues($elem);
                                                            if ($tr_elem.length) {
                                                                $t.resetSelectedValues($tr_elem);
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $t.resetSelectedValues($span_elem);
                                                            }
                                                        }
                                                    });
                                                    $(':checkbox', $filledOther).click('input', function () {
                                                        // To validate a checkbox element you need the combined value of all checked boxes and then compare it
                                                        var checkboxName = this.getAttribute('name');
                                                        var $checkboxElem = $("input[name*='" + checkboxName + "']");

                                                        var combinedValueSum = 0;
                                                        $checkboxElem.each(function () {
                                                            var elemVal = (typeof ($(this).val()) !== 'undefined') ? $(this).val().trim() : true;
                                                            if ($(this).prop("checked")) {
                                                                combinedValueSum = Number(combinedValueSum) + Number(elemVal);
                                                            }
                                                        });
                                                        var filledValue = (typeof ($filledId.text()) !== 'undefined') ? $filledId.text().trim() : false;
                                                        if ($t.compare(combinedValueSum, operator, filledValue)) {
                                                            $elem.removeClass("hidden");
                                                            if ($tr_elem.length) {
                                                                $tr_elem.removeClass("hidden");
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $span_elem.removeClass("hidden");
                                                            }
                                                        } else {
                                                            $t.resetSelectedValues($elem);
                                                            if ($tr_elem.length) {
                                                                $t.resetSelectedValues($tr_elem);
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $t.resetSelectedValues($span_elem);
                                                            }
                                                        }
                                                    });
                                                    break;
                                                case $filledOther.is(":hidden"):
                                                    $filledOther.change(function () {
                                                        var checkedValue = (typeof ($(this).val()) !== 'undefined') ? $(this).val().trim() : true;
                                                        var filledValue = (typeof ($filledId.text()) !== 'undefined') ? $filledId.text().trim() : false;
                                                        if ($t.compare(checkedValue, operator, filledValue)) {
                                                            $elem.removeClass("hidden");
                                                            if ($tr_elem.length) {
                                                                $tr_elem.removeClass("hidden");
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $span_elem.removeClass("hidden");
                                                            }
                                                        } else {
                                                            $t.resetSelectedValues($elem);
                                                            if ($tr_elem.length) {
                                                                $t.resetSelectedValues($tr_elem);
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $t.resetSelectedValues($span_elem);
                                                            }
                                                        }
                                                    });
                                                    break;
                                                default:
                                                    $('input').on('input', function () {
                                                        var checkedValue = (typeof ($(this).val()) !== 'undefined') ? $(this).val().trim() : true;
                                                        var filledValue = (typeof ($filledId.text()) !== 'undefined') ? $filledId.text().trim() : false;
                                                        if ($t.compare(checkedValue, operator, filledValue)) {
                                                            $elem.removeClass("hidden");
                                                            if ($tr_elem.length) {
                                                                $tr_elem.removeClass("hidden");
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $span_elem.removeClass("hidden");
                                                            }
                                                        } else {
                                                            $t.resetSelectedValues($elem);
                                                            if ($tr_elem.length) {
                                                                $t.resetSelectedValues($tr_elem);
                                                            }
                                                            if (typeof ($span_elem) !== 'undefined') {
                                                                $t.resetSelectedValues($span_elem);
                                                            }
                                                        }
                                                    });
                                                    break;
                                            }
                                        },
                                        createEventListener: function ($listener_elem, $target_elem) {
                                            // Create event listener
                                            $target_elem.on('input', function () {
                                                if ($(this).val().length > 0) {
                                                    $listener_elem.prop("readonly", false);
                                                } else {
                                                    $listener_elem.prop("readonly", true).val('');
                                                }
                                            });
                                        },
                                        createTimePicker: function (time_picker_id) {
                                            $('.time-picker-' + time_picker_id).datetimepicker({
                                                format: 'HH:mm',
                                                pickDate: false,
                                                pickSeconds: false,
                                                pick12HourFormat: false,
                                            });
                                        }
                                    }

                                });
                        Vue.component("formbuilder-view-form", FormVM.extend({
                            directives: {
                                "history-action": function (value) {
                                    this.vm.historyUrl = this.expression;
                                },
                                "form-id": function (value) {
                                    this.vm.formId = this.expression;
                                },
                                "form-status": function () {
                                    var $t = this;
                                    var status = this.expression;

                                    if (status == 'confirmed') {
                                        $t.vm.allowedUnload = true;
                                    }
                                }
                            },
                            created: function () {
                                var $t = this;
                                $('.allowed-onload').on('click', function () {
                                    $t.$set('allowedUnload', true);
                                });
                                $(window).on("beforeunload", function () {
                                    if ($t.$get('allowedUnload') === false) {
                                        return 'Vai esiet saglabājis izmaiņas dokumentam?';
                                    } else {
                                        return;
                                    }

                                });
                                var $elem = $('div.mselect');
                                $('button.multiselect', $elem).each(function () {
                                    $(this).addClass('form-control');
                                });
                                $('select.select2-locked', $elem).each(function () {
                                    $(this).prop('disabled', true);
                                });
                            },
                            methods: {
                                getStatus: helpers.getStatus,
                                getDate: helpers.getDate,
                                editFormField: function (e) {
                                    e.preventDefault();
                                    var td = $(e.target).closest('td');
                                    var input = td.find('input, textarea, selectize, select');
                                    var $opt_btn = $('button[class*="ctrl-btn"]', td);
                                    $opt_btn.hide();
                                    $('.regulator-control', td).hide();
                                    td.find('.substantiation-control').removeClass('hidden');
                                    $(input).prop('readonly', false);

                                    if ($(input).is(':checkbox') || $(input).is(':radio')) {
                                        $(input).prop('disabled', false);
                                    }
                                    if ($(input).hasClass('locked')) {
                                        var $multiselect = $('select[class*="locked"]', td);
                                        $multiselect.prop('disabled', false);
                                    }
                                    $(input).data('old-value', $(input).val());
                                    $(input).select();
                                },
                                showControlButtons: function (e) {
                                    e.preventDefault();
                                    var td = $(e.target).closest('td');
                                    var $opt_btn = $('i[class*="ctrl-btn glyphicon"]', td);
                                    $opt_btn.toggleClass("glyphicon-cog glyphicon-remove");
                                    var $ctrl_buttons = $('span[class*="ctrl-btns"]', td);
                                    $ctrl_buttons.toggleClass('hidden');
                                },
                                okFormField: function (e, value) {

                                    if (typeof (value) != "undefined") {
                                        $('#substantiation_reason', this.$el).attr('value', value);
                                        var $substantiation_content = $('#substantiation', this.$el);
                                        var input = $('input[name="field_id"]', $substantiation_content);
                                        if (input.length > 0) {
                                            input.remove();
                                        }
                                        $('<input/>').attr('name', 'field_id').attr('type', 'hidden').attr('value', value).insertAfter('#substantiation_reason', this.$el);
                                        var $submit = $("#submit-reason", this.$el);
                                        $submit.attr('value', value);
                                    }
                                    var clean_val = value.replace(/\D/g, '');
                                    var $input = $('input[name*=' + clean_val + '], textarea[name*=' + clean_val + '], select[name*=' + clean_val + ']', this.$el).val();
                                    if ($input == '') {
                                        bootbox.alert('Lūdzu ievadiet vērtību');
                                        return;
                                    }

                                    $('#substantiation').modal('show');
                                    var td = $(e.target).closest('td');
                                    var $opt_btn = $('button[class*="ctrl-btn"]', td);
                                    $opt_btn.show();
                                },
                                showRejectForm: function (e, value) {
                                    if (typeof (value) != "undefined") {
                                        $('#reason', this.$el).attr('name', 'reason_' + value);
                                        var $reason_content = $('#reason-content', this.$el);
                                        var input = $('input[name="field_id"]', $reason_content);
                                        if (input.length > 0) {
                                            input.remove();
                                        }
                                        var clean_val = value.replace(/\D/g, '');
                                        $('<input/>').attr('name', 'field_id').attr('type', 'hidden').attr('value', value).insertAfter('select[name*=reason_' + clean_val + ']', this.$el);
                                        var $submit = $("#submit-reject-reason", this.$el);
                                        $submit.attr('value', value);
                                    }
                                    var $modal = $('#reason-content');
                                    var $select2 = $('select#reason', $modal);
                                    $select2.val('').trigger("change");
                                    $('#reason-content').modal('show');
                                },
                                cancelFormField: function (e) {
                                    var td = $(e.target).closest('td');
                                    $('.regulator-control', td).show();
                                    $('.substantiation-control', td).addClass('hidden');
                                    var input = td.find('input, textarea, selectize, select');
                                    $(input).prop('readonly', true);

                                    if ($(input).is(':checkbox') || $(input).is(':radio')) {
                                        $(input).prop('disabled', true);
                                    }
                                    if ($(input).hasClass('locked')) {
                                        var $multiselect = $('select[class*="locked"]', td);
                                        $multiselect.prop('disabled', true);
                                    }
                                    if (($(input).is(':checkbox') || $(input).is(':radio')) == false) {
                                        //need to return the checked parameter not value as that breaks radio / checkbox functionality
                                        $(input).val($(input).data('old-value'));
                                    }
                                    var $opt_btn = $('button[class*="ctrl-btn"]', td);
                                    $opt_btn.show();
                                },
                                submitReasonFormField: function (e) {
                                    var $t = this;
                                    var $field_id = $(e.target).attr('value');
                                    var clean_id = $field_id.replace(/\D/g, '');
                                    var input = $('input[name*=' + clean_id + ']', $t.$el);
                                    var is_period_value = false;
                                    if ($('select[name*=' + clean_id + ']').hasClass('period')) {
                                        is_period_value = true;
                                    }
                                    switch ($(input).prop('type')) {
                                        case 'radio':
                                            var $value = $('input[name*=' + clean_id + ']:checked', $t.$el).val();
                                            break;
                                        case 'checkbox':
                                            var $value = [''];
                                            $('input[name*=' + clean_id + ']:checked', $t.$el).each(function () {
                                                $value.push(this.value);
                                            });
                                            break;
                                        default:
                                            var $value = $('input[name*=' + clean_id + '], textarea[name*=' + clean_id + '], select[name*=' + clean_id + ']', $t.$el).val();
                                    }

                                    var $substantiation = $('textarea[value*=' + clean_id + ']', $t.$el).val();
                                    var data = {
                                        'form_field': clean_id,
                                        'value': $value,
                                        'is_period_value': is_period_value,
                                        'substantiation': $substantiation,
                                        'status': 'changed',
                                        'button_action': 'field_edit',
                                        _token: $('meta[name="_token"]').attr('content')
                                    };

                                    var $form = $('#substantiation', $t.$el);
                                    var $modal = $('.modal-dialog', $form);
                                    var ov = helpers.spinner($modal);
                                    $($modal).css({position: 'relative'});
                                    $($modal).prepend(ov.fadeIn());
                                    var remove_overlay = function () {
                                        ov.fadeOut(function () {
                                            $(this).remove();
                                        });
                                    }
                                    $.ajax({
                                        url: $('form').attr('action') || "",
                                        type: $('form').attr('method') || "POST",
                                        data: data,
                                        success: function (data) {
                                            if (data.errors) {
                                                $t.$data.errors = data.messages;
                                                $(window).scrollTop(0);
                                                remove_overlay();
                                            } else {
                                                $('#confirm_btn', $t.$el).remove();
                                                $t.$data.errors = {};
                                                var input = $('input[name*=' + clean_id + ']', $t.$el);
                                                if ($(input).prop('type') != 'radio' && $(input).prop('type') != 'checkbox') {
                                                    $('input[name*=' + clean_id + ']', $t.$el).val($value);
                                                }
                                                remove_overlay();
                                                $('#substantiation_reason').val('');
                                                var $field_id = $(e.target).attr('value');
                                                var td = $('input[name*=' + clean_id + '], textarea[name*=' + clean_id + '], select[name*=' + clean_id + ']', $t.$el).closest('td');
                                                $('.regulator-control', td).show();
                                                $('.substantiation-control', td).addClass('hidden');
                                                var input = td.find('input, textarea, selectize, select');
                                                $(input).prop('readonly', true);

                                                if ($(input).is(':checkbox') || $(input).is(':radio')) {
                                                    $(input).prop('disabled', true);
                                                }
                                                if ($(input).hasClass('locked')) {
                                                    var $multiselect = $('select[class*="locked"]', td);
                                                    $multiselect.prop('disabled', true);
                                                }
                                                $('#substantiation').modal('hide');
                                            }
                                        },
                                        error: function (data) {
                                            remove_overlay();
                                        }
                                    });
                                },
                                submitRejectFormField: function (e) {
                                    var $t = this;
                                    var $field_id = $(e.target).attr('value');
                                    var clean_id = $field_id.replace(/\D/g, '');
                                    var $reason = $('select[name*=reason_' + clean_id + ']', $t.$el).val();
                                    var data = {
                                        'form_field': clean_id,
                                        'reason': $reason,
                                        'status': 'rejected',
                                        'button_action': 'field_rejected',
                                        _token: $('meta[name="_token"]').attr('content')
                                    };
                                    var $modal = $(e.target).closest('.modal-content');
                                    var ov = helpers.spinner($modal);
                                    $($modal).css({position: 'relative'});
                                    $($modal).prepend(ov.fadeIn());
                                    var remove_overlay = function () {
                                        ov.fadeOut(function () {
                                            $(this).remove();
                                        });
                                    }

                                    $.ajax({
                                        url: $('form').attr('action') || "",
                                        type: $('form').attr('method') || "POST",
                                        data: data,
                                        success: function (data) {
                                            if (data.errors) {
                                                $t.$data.errors = data.messages;
                                                $(window).scrollTop(0);
                                                remove_overlay();
                                            } else {
                                                $t.$data.errors = {};
                                                remove_overlay();
                                                $('#reason').val('');
                                                var button = $(e.target).val();
                                                var clean_id = button.replace(/\D/g, '');
                                                var td = $(clean_id).closest('td');
                                                $('.regulator-control', td).show();
                                                $('.substantiation-control', td).addClass('hidden');
                                                var input = td.find('input, textarea, selectize, select');
                                                $(input).prop('readonly', true);

                                                if ($(input).is(':checkbox') || $(input).is(':radio')) {
                                                    $(input).prop('disabled', true);
                                                }
                                                if ($(input).hasClass('locked')) {
                                                    var $multiselect = $('select[class*="locked"]', td);
                                                    $multiselect.prop('disabled', true);
                                                }
                                                $('#reason-content').modal('hide');
                                            }
                                        },
                                        error: function (data) {
                                            remove_overlay();
                                        }
                                    });
                                },
                                submitWithType: function (action, e) {
                                    e.preventDefault();
                                    var $t = this;
                                    this.clear();
                                    var input = $('input[name="action"]', $t.$el);
                                    if (input.length > 0) {
                                        input.remove();
                                    }
                                    $($t.$el).append($('<input/>').attr('name', 'action').attr('type', 'hidden').attr('value', action));
                                    if (action == 'submitted' || action == 're-submitted') {
                                        bootbox.confirm('Vai tiešām vēlaties iesniegt dokumentu?', function (confirm) {
                                            if (confirm === true) {
                                                $t.submit(action, e);
                                            }
                                        });
                                    } else {
                                        $t.submit(action, e);
                                    }
                                },
                                submit: function (action, e) {
                                    e.preventDefault();
                                    // Unlock select2 before sending data to post
                                    if ($.inArray(action, ['submitted', 'draft', 'rejection-draft', 're-submitted']) !== -1) {
                                        $('select.select2-locked', this.$el).each(function () {
                                            $(this).prop('disabled', false);
                                        });
                                    }
                                    var data = $(this.$el).serialize();
                                    var method = (function (el) {
                                        return $(el).attr('method') || "post";
                                    })(this.$el).toUpperCase();
                                    var $t = this;
                                    if ($t.$get('rejectedList')) {
                                        var $modal = $('#rejection-content', $t.$el);
                                        var $modalbox = $('.modal-dialog', $modal);
                                        var ov = helpers.spinner($modalbox);
                                        $($modalbox).css({position: 'relative'});
                                        $($modalbox).prepend(ov.fadeIn());
                                    } else {
                                        var ov = helpers.spinner($t.$el);
                                        $($t.$el).prepend(ov.fadeIn());
                                    }
                                    var remove_overlay = function () {
                                        ov.fadeOut(function () {
                                            $(this).remove();
                                        });
                                    };
                                    $.ajax({
                                        url: $(this.$el).attr('action') || "",
                                        type: method,
                                        data: data,
                                        success: function (data) {
                                            if (data.errors) {
                                                $t.$data.errors = data.messages;
                                                var required_message = '';
                                                if (typeof (data.exist_required) != 'undefined' && data.exist_required) {
                                                    required_message = 'Nav aizpildīti visi obligātie lauki!';
                                                }
                                                $(window).scrollTop(0);
                                                remove_overlay();
                                                if (action == 'rejection-draft' || action == 'draft' || action == 're-submitted' || action == 'submitted') {
                                                    bootbox.confirm('Ievadīto datu validācija nav veiksmīga! ' + required_message + ' Vai neskatoties uz to vēlaties saglabāt?', function (notValidSave) {
                                                        if (notValidSave === true) {
                                                            if (action == 'submitted') {
                                                                $('input[name="action"]', $t.$el).val('draft');
                                                            } else if (action == 're-submitted') {
                                                                $('input[name="action"]', $t.$el).val('rejected');
                                                            }
                                                            $($t.$el).append($('<input/>').attr('name', 'withoutValidation').attr('type', 'hidden').attr('value', 'true'));
                                                            $t.submit(action, e);
                                                        }
                                                    });
                                                } else if (action == 'confirmed') {
                                                    bootbox.alert({
                                                        message: data.content
                                                    });
                                                }
                                            } else if (data.notices) {
                                                remove_overlay();
                                                var messageList = '<br /><br /><ul>';
                                                $.each(data.messages, function (key, val) {
                                                    messageList += '<li>' + val + '</li>';
                                                });
                                                messageList += '</ul>';
                                                bootbox.confirm('Sekojoši lauki nav obligāti, bet ir ieticams tos aizpidlīt! ' +
                                                        messageList +
                                                        'Vai vēlaties saglabāt viedlapu neaizpildot šos laukus?', function (ignoreNotices) {
                                                            if (ignoreNotices === true) {
                                                                $($t.$el).append($('<input/>').attr('name', 'withoutNoticeValidation').attr('type', 'hidden').attr('value', 'true'));
                                                                $t.submit(action, e);
                                                            }
                                                        });
                                            } else if (data.processForm) {
//                        $t.$set('list', data.list);
//                        remove_overlay();
                                                $t.$set('rejectedList', data.rejected_list);
                                                $t.$set('processForm', true);
                                                $('#rejection-content').modal('show');
                                                remove_overlay();
                                            } else if (data.rejectForm) {
                                                $t.$set('rejectedList', data.list);
                                                $t.$set('processForm', false);
                                                $('#rejection-content').modal('show');
                                                remove_overlay();
                                            } else {
                                                $t.$data.errors = {};
                                                $t.afterSuccess(data);
                                            }
                                        },
                                        error: function (data) {
                                            remove_overlay();
                                        }
                                    });
                                },
                                showFieldHistory: function (e, field, client) {
                                    var $t = this;
                                    var $modal = $('body').find('#history', this.$el);
                                    $t.$set('field', field);
                                    $t.$set('client', client);
                                    $t.loadHistoryData();
                                    $modal.modal('show');
                                },
                                loadHistoryData: function (spinner) {
                                    var $t = this;
                                    var $modal = $('body').find('#history', this.$el);
                                    var $modalbox = $('.modal-dialog', $modal);
                                    var ov = helpers.spinner($modalbox);
                                    $($modalbox).css({position: 'relative'});
                                    $($modalbox).prepend(ov.fadeIn());

                                    var status = $t.$get('filter.status');
                                    if (typeof (status) === 'undefined') {
                                        status = 'fieldHistory';
                                    }

                                    $t.$set('tab', status);
                                    $.get($t.$get('historyUrl'), {'field': $t.$get('field'), 'client': $t.$get('client'), 'status': status, 'form': $t.$get('formId')}, function (data) {
                                        $t.$set('rows', data.items);
                                    }).always(function () {
                                        ov.remove();
                                    });
                                },
                                selectTab: function (tab, e) {
                                    e.preventDefault();
                                    $(e.target).parent().addClass('active').siblings().removeClass('active');
                                    this.$set('filter.status', tab);
                                    this.loadHistoryData();
                                },
                            }
                        }));

                        Vue.component("form-component", FormVM.extend({
                            created: function () {
                                this.$set('rows', {});
                                this.$set('filter', {});
                                this.paginator = [];
                                this.$set('filter.page', 1);
                                this.$set('per_page', 10);
                                $('#submitter_preview').keypress(function (e) {
                                    if (e.which == 13) // Enter key = keycode 13
                                    {
                                        return false;
                                    }
                                });

                            },
                            methods: {
                                timetableChoose: function (timetable) {
                                    $('.form-schedule', this.$el).addClass('hidden');
                                    if (timetable == 'optional') {
                                        $('.form-schedule', this.$el).closest('.panel.panel-default').addClass('hidden');
                                    } else {
                                        $('.form-schedule', this.$el).closest('.panel.panel-default').removeClass('hidden');
                                        $('[data-timetable="' + timetable + '"]', this.$el).toggleClass('hidden');
                                    }
                                },
                                applicantChoose: function (applicant) {
                                    $('.applicant-param', this.$el).addClass('hidden');
                                    $('[data-applicant="' + applicant + '"]', this.$el).toggleClass('hidden');
                                    $('.form-select').multiselect();

                                },
                                regulatorChoose: function (regulator) {
                                    $('.regulator-param', this.$el).addClass('hidden');
                                    $('[data-regulator="' + regulator + '"]', this.$el).toggleClass('hidden');
                                    $('.form-select').multiselect();
                                },
                                clearSelect: function (e) {
                                    e.preventDefault();
                                    $(e.target).closest('div').find('select').val('').trigger("change");
                                },
                                searchSubmitter: function (e) {
                                    e.preventDefault();
                                    this.$set('filter.page', 1);
                                    this.$set('filter.search', $(e.target).val());
                                    this.loadSubmitterData();
                                },
                                searchSubmitterSubmit: function (e) {
                                    e.preventDefault();
                                    this.$set('filter.page', 1);
                                    var searchValue = $(e.target).closest('div').find('input').val();
                                    this.$set('filter.search', searchValue);
                                    this.loadSubmitterData();
                                },
                                previewSubmitters: function (e) {
                                    e.preventDefault();
                                    var $t = this;
                                    var criteria = $($t.$el).find('input[name="criteria"]').val();
                                    var $modal = $('#submitter_preview', this.$el);
                                    $t.$set('filter.criteria', criteria);
                                    $t.loadSubmitterData();
                                    $modal.modal('show');
                                },
                                loadSubmitterData: function () {
                                    var $t = this;
                                    var $block = $('#submitter_preview', this.$el);
                                    var ov = helpers.spinner($($block).find('.modal-content'));
                                    $(ov).css('top', '0');
                                    $($block).find('.modal-content').prepend(ov.fadeIn());
                                    $.get('/veidlapu/dokumentu-iesniedzeji-apskats', $t.$get('filter'), function (data) {
                                        $t.$set('rows', data.items);
                                        $t.$set('page', data.params.page);
                                        $t.$set('last_page', data.params.last_page);
                                        $t.$set('total', data.params.total);
                                        var paginator = [];
                                        var page_links = 10;
                                        var page_link_start = Math.max(1, $t.$get('page') - Math.ceil(page_links / 2));
                                        var page_link_end = Math.min(page_link_start + page_links, $t.$get('last_page'));
                                        page_link_end - page_link_start < page_links && (page_links_start = Math.max(page_link_end - page_links, 1));
                                        for (var pn = page_link_start; pn <= page_link_end; pn++) {
                                            paginator.push({
                                                page: pn,
                                                active: pn == $t.$get('filter.page')
                                            });
                                        }
                                        $t.$set('paginator', paginator);
                                    }).always(function () {
                                        ov.remove();
                                    });
                                },
                                paginate: function (page, e) {
                                    e.preventDefault();
                                    if (page === 'prev') {
                                        page = this.$get('filter.page') - 1;
                                    }
                                    if (page === 'next') {
                                        page = this.$get('filter.page') + 1;
                                    }
                                    if (page < 1) {
                                        page = 1;
                                    }
                                    if (page > this.$get('last_page')) {
                                        page = this.$get('last_page');
                                    }
                                    this.$set('filter.page', page);
                                    this.loadSubmitterData();
                                }
                            }
                        }));

                        Vue.component('vue-docs-add-form', FormVM.extend({
                            created: function () {
                                var $t = this;
                                $('select.select2-get-form-periods', $t.$el).each(function () {
                                    var url = $(this).attr('data-index-url');
                                    $(this).select2(helpers.select2options(url));
                                });

                                // SELECT2
                                $('select.select2', $t.$el).each(function () {
                                    $(this).val('').trigger("change");
                                });
                                $('select.select2-ajax', $t.$el).each(function () {
                                    $(this).val('').trigger("change");
                                });

                                $('body').on('hidden.bs.modal', '.modal', function () {
                                    $(this).removeData('bs.modal');
                                    $('form', this).trigger('reset');
                                    $('form', this).find('.form-group').removeClass('has-error');
                                    $('form', this).find('input, select, .selectize-input, a.select2-choice, .select2-selection').popover('destroy');
                                    var $selectize = $('select.selectized', $t.$el);
                                    $selectize.each(function (i) {
                                        if (typeof ($selectize[i]) !== 'undefined') {
                                            $selectize[i].selectize.clear();
                                        }
                                    });
                                    // SELECT2
                                    $('select.select2', $t.$el).each(function () {
                                        $(this).val('').trigger("change");
                                    });

                                    $('select.select2-ajax', $t.$el).each(function () {
                                        $(this).val('').trigger("change");
                                    });
                                    // Disable dropdown
                                    $t.populatePeriodList(false, true);
                                });
                                // SET FILTER TRACKER FOR SELECT2
                                $('select.select2-filter', $t.$el).each(function () {
                                    $(this).val('').trigger("change");
                                    $(this).on("select2:select", function (e) {
                                        $t.searchSubmitCustom($(e.target).val());
                                    });
                                    $(this).on("select2:unselect", function (e) {
                                        $t.searchSubmitCustom(null);
                                    });
                                });
                            },
                            methods: {
                                searchSubmitCustom: function (value) {
                                    var $t = this;
                                    var $select2 = $('select.select2-get-form-periods', $t.$el);
                                    if (value != null) {
                                        var url = $select2.attr('data-index-url') + '&industry_filter=' + value;
                                        $select2.select2(helpers.select2options(url));
                                    } else {
                                        var url = $select2.attr('data-index-url');
                                        $select2.select2(helpers.select2options(url));
                                    }

                                }
                            }
                        }));

                        Vue.component("block-form", FormVM.extend({
                            afterSuccess: function () {
                                return false;
                            },
                            created: function () {
                                var $t = this;
                                // Clear modal data after close
                                $('body').on('hidden.bs.modal', '.modal', function () {
                                    $(this).removeData('bs.modal');
                                    $('form', this).trigger('reset');
                                    $('form', this).find('.form-group').removeClass('has-error');
                                    $('form', this).find('input, select, .selectize-input, a.select2-choice, .select2-selection').popover('destroy');
                                });

                            }
                        }));

                        Vue.component("block-create-form", FormVM.extend({
                            created: function () {
                                var $t = this;
                                $('body').on('hidden.bs.modal', '.modal', function () {
                                    $(this).removeData('bs.modal');
                                    $('form', this).trigger('reset');
                                    $('form', this).find('.form-group').removeClass('has-error');
                                    $('form', this).find('input, select, .selectize-input, a.select2-choice, .select2-selection').popover('destroy');
                                    var $selectize = $('select.selectized', $t.$el);
                                    $selectize.each(function (i) {
                                        if (typeof ($selectize[i]) !== 'undefined') {
                                            $selectize[i].selectize.clear();
                                        }
                                    });
                                    // SELECT2
                                    $('select.select2', $t.$el).each(function () {
                                        $(this).val('').trigger("change");
                                    });

                                    $('select.select2-ajax', $t.$el).each(function () {
                                        $(this).empty();
                                    });
                                    $('select.select2', $t.$el).removeAttr('disabled');
                                    $('select.select2-ajax', $t.$el).removeAttr('disabled');
                                    if ($('.history-info').length > 0) {
                                        $('.history-info', $t.$el).text('');
                                    }

                                    $('.files_resolutionFile', $t.$el).empty();
                                    $('.files_conditionFile ', $t.$el).empty();
                                    $('.files_obligationFile', $t.$el).empty();
                                    $('.files_electricityFile', $t.$el).empty();
                                    $('input[name="uploaded_files_resolutionFile"]', $t.$el).remove();
                                    $('input[name="uploaded_files_obligationFile"]', $t.$el).remove();
                                    $('input[name="uploaded_files_electricityFile"]', $t.$el).remove();

                                    // Clear radio and checkbox 
                                    $('input:checkbox', $t.$el).removeAttr('checked');
                                    $('input:radio', $t.$el).removeAttr('checked');
                                });
                                // SELECT2
                                $('select.select2', $t.$el).each(function () {
                                    $(this).val('').trigger("change");
                                });

                                $('select.select2-ajax', $t.$el).each(function () {
                                    $(this).val('').trigger("change");
                                });
                                $('.fileupload', $t.$el).fileupload({
                                    url: '/komersants/pielikumi',
                                    dataType: 'json',
                                    autoUpload: true,
                                    acceptFileTypes: /(\.|\/)(gif|jpe?g|png|txt|docx|doc|pdf|xls|xlsx)$/i,
                                    maxFileSize: 5000000, // 5 MB
                                    maxNumberOfFiles: 1,
                                }).on('fileuploadadd', function (e, data) {
                                    var fieldName = $(e.target).attr('data-file-field');
                                    data.context = $('<li/>').html('<img src="/assets/img/loading.gif" />').appendTo('.files_' + fieldName);
                                }).on('fileuploadprocessalways', function (e, data) {
                                    var index = data.index,
                                            file = data.files[index];
                                    if (file.error) {
                                        data.context.html(file.name + ' - <span class="text-danger">' + file.error + '</span>', $t.$el);
                                    }
                                }).on('fileuploaddone', function (e, data) {
                                    $.each(data.result.files, function (index, file) {
                                        fileId = $(e.target).attr('data-file-field');

                                        // Remove old file       
                                        if ($('.files_' + fileId + ' li', $t.$el).length > 1) {
                                            $('.files_' + fileId + ' li', $t.$el).first().remove();
                                        }

                                        var removeButton = $('<a/>', $t.$el).attr('href', '#')
                                                .html('<i class="fa fa-times fa-1"></i>')
                                                .prop('disabled', true)
                                                .on('click', function () {
                                                    $(this).parent().remove();
                                                    $('input[name="uploaded_files_' + fileId + '"][value=' + file.id + ']', $t.$el).remove();
                                                    $('input[name="fileValidation_' + fileId + '"]', $t.$el).val('');
                                                });

                                        $('.files_' + fileId, $t.$el).html('<li>' + file.name + '&nbsp;</li>', $t.$el);
                                        $('.files_' + fileId + ' li', $t.$el).append(removeButton);

                                        // Set file array to delete
                                        $('input[name="uploaded_files_' + fileId + '"]', $t.$el).attr('name', 'deleting_files[]');
                                        $('input[name="fileValidation_' + fileId + '"]', $t.$el).val('1');
                                        $(data.form[0]).append($('<input/>').attr('name', 'uploaded_files_' + fileId + '').attr('type', 'hidden').attr('value', file.id));
                                    });
                                }).on('fileuploadfail', function (e, data) {
                                    $.each(data.files, function (index, file) {
                                        // TODO nocekot, vai te ari nevajag pielikt $t
                                        data.context.html(file.name + ' - <span class="text-danger">neizdevās pievienot!</span>');
                                    });
                                }).prop('disabled', !$.support.fileInput)
                                        .parent().addClass($.support.fileInput ? undefined : 'disabled');
                            },
                            methods: {
                                afterSuccess: function (data, collapse_target, collapse_block) {
                                    var $t = this;
                                    $('.modal', $t.$parent.$el).modal('hide');
                                    $t.$parent.$set('filter.page', 1);
                                    // Correctly open collapse blocks after twig has refreshed values
                                    $t.$parent.loadData(true, collapse_target, collapse_block);
                                }
                            }
                        }));

                        bootbox.setDefaults({
                            locale: "lv"
                        });

                        /**
                         * Jquery session expire plugin [v0.1]
                         *
                         * Library dependencies
                         *  + jQuery >= v2.1.3
                         *  + bootbox.js >= v4.3.
                         */
                        (function () {
                            $.sessionPlugin = {
                                _sessionExpireMinutes: 120,
                                _sessionBeforeExpireNoticeMinutes: 15,
                                _expireMessageTimeout: null,
                                _expireRedirectTimeout: null,
                                alert: function () {
                                    var $t = this;
                                    bootbox.alert($t.beforeExpireNoticeMessage(), function () {
                                        // Do ajax to reset server session lifetime
                                        $.get(window.location.href);
                                        // Clear timeouts
                                        clearTimeout($t._expireMessageTimeout);
                                        clearTimeout($t._expireRedirectTimeout);
                                        // Refresh timeouts
                                        $.sessionPlugin.init();
                                    });
                                },
                                expired: function () {
                                    // Reload after session expired
                                    window.location.reload();
                                },
                                beforeExpireNoticeMessage: function () {
                                    return 'Lietotāja sessija tiks pārtraukta pēc ' + this._sessionBeforeExpireNoticeMinutes + ' minūtēm!';
                                },
                                calculateMillisecondsBeforeExpire: function () {
                                    return (this._sessionExpireMinutes * 60000) - (this._sessionBeforeExpireNoticeMinutes * 60000);
                                },
                                calculateMillisecondsAfterExpire: function () {
                                    // Add 30 seconds after real time expire
                                    return (this._sessionExpireMinutes * 60000) + 30000;
                                },
                                init: function () {
                                    var $t = this;
                                    $t._expireMessageTimeout = setTimeout(function () {
                                        $t.alert()
                                    }, $t.calculateMillisecondsBeforeExpire());
                                    $t._expireRedirectTimeout = setTimeout(function () {
                                        $t.expired()
                                    }, $t.calculateMillisecondsAfterExpire());
                                }
                            }
                            $.fn.sessionPlugin = function () {
                                $.sessionPlugin.init();
                            }
                        }(jQuery));