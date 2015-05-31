(function() {
  rivets.binders.input = {
    publishes: true,
    routine: rivets.binders.value.routine,
    bind: function(el) {
      return $(el).bind('input.rivets', this.publish);
    },
    unbind: function(el) {
      return $(el).unbind('input.rivets');
    }
  };

  rivets.configure({
    prefix: "rv",
    adapter: {
      subscribe: function(obj, keypath, callback) {
        callback.wrapped = function(m, v) {
          return callback(v);
        };
        return obj.on('change:' + keypath, callback.wrapped);
      },
      unsubscribe: function(obj, keypath, callback) {
        return obj.off('change:' + keypath, callback.wrapped);
      },
      read: function(obj, keypath) {
        if (keypath === "cid") {
          return obj.cid;
        }
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        if (obj.cid) {
          return obj.set(keypath, value);
        } else {
          return obj[keypath] = value;
        }
      }
    }
  });

}).call(this);

(function() {
  var BuilderView, CalcFieldView, EditFieldView, FormatFieldView, Formbuilder, FormbuilderCollection, FormbuilderModel, RuleFieldView, ViewFieldView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  FormbuilderModel = (function(superClass) {
    extend(FormbuilderModel, superClass);

    function FormbuilderModel() {
      return FormbuilderModel.__super__.constructor.apply(this, arguments);
    }

    FormbuilderModel.prototype.sync = function() {};

    FormbuilderModel.prototype.indexInDOM = function() {
      var $wrapper;
      $wrapper = $(".fb-field-wrapper").filter(((function(_this) {
        return function(_, el) {
          return $(el).data('cid') === _this.cid;
        };
      })(this)));
      return $(".fb-field-wrapper").index($wrapper);
    };

    FormbuilderModel.prototype.is_input = function() {
      return Formbuilder.inputFields[this.get(Formbuilder.options.mappings.FIELD_TYPE)] != null;
    };

    return FormbuilderModel;

  })(Backbone.DeepModel);

  FormbuilderCollection = (function(superClass) {
    extend(FormbuilderCollection, superClass);

    function FormbuilderCollection() {
      return FormbuilderCollection.__super__.constructor.apply(this, arguments);
    }

    FormbuilderCollection.prototype.initialize = function() {
      return this.on('add', this.copyCidToModel);
    };

    FormbuilderCollection.prototype.model = FormbuilderModel;

    FormbuilderCollection.prototype.comparator = function(model) {
      return model.indexInDOM();
    };

    FormbuilderCollection.prototype.copyCidToModel = function(model) {
      return model.attributes.cid = model.cid;
    };

    return FormbuilderCollection;

  })(Backbone.Collection);

  ViewFieldView = (function(superClass) {
    extend(ViewFieldView, superClass);

    function ViewFieldView() {
      return ViewFieldView.__super__.constructor.apply(this, arguments);
    }

    ViewFieldView.prototype.className = "fb-field-wrapper";

    ViewFieldView.prototype.events = {
      'click .subtemplate-wrapper': 'focusEditView',
      'click .js-duplicate': 'duplicate',
      'click .js-clear': 'clear'
    };

    ViewFieldView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      this.listenTo(this.model, "change", this.render);
      return this.listenTo(this.model, "destroy", this.remove);
    };

    ViewFieldView.prototype.render = function() {
      this.$el.addClass('response-field-' + this.model.get(Formbuilder.options.mappings.FIELD_TYPE)).data('cid', this.model.cid).html(Formbuilder.templates["view/base" + (!this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      return this;
    };

    ViewFieldView.prototype.focusEditView = function() {
      return this.parentView.createAndShowEditView(this.model);
    };

    ViewFieldView.prototype.clear = function(e) {
      var cb, x;
      e.preventDefault();
      e.stopPropagation();
      cb = (function(_this) {
        return function() {
          _this.parentView.handleFormUpdate();
          return _this.model.destroy();
        };
      })(this);
      x = Formbuilder.options.CLEAR_FIELD_CONFIRM;
      switch (typeof x) {
        case 'string':
          if (confirm(x)) {
            return cb();
          }
          break;
        case 'function':
          return x(cb);
        default:
          return cb();
      }
    };

    ViewFieldView.prototype.duplicate = function() {
      var attrs;
      attrs = _.clone(this.model.attributes);
      delete attrs['id'];
      return this.parentView.createField(attrs, {
        position: this.model.indexInDOM() + 1
      });
    };

    return ViewFieldView;

  })(Backbone.View);

  EditFieldView = (function(superClass) {
    extend(EditFieldView, superClass);

    function EditFieldView() {
      return EditFieldView.__super__.constructor.apply(this, arguments);
    }

    EditFieldView.prototype.className = "edit-response-field";

    EditFieldView.prototype.events = {
      'click .js-add-option': 'addOption',
      'click .js-remove-option': 'removeOption',
      'click .js-default-updated': 'defaultUpdated',
      'input .option-label-input': 'forceRender'
    };

    EditFieldView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      return this.listenTo(this.model, "destroy", this.remove);
    };

    EditFieldView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["edit/base" + (!this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    EditFieldView.prototype.remove = function() {
      this.parentView.editView = void 0;
      this.parentView.$el.find("[data-target=\"#addField\"]").click();
      return EditFieldView.__super__.remove.apply(this, arguments);
    };

    EditFieldView.prototype.addOption = function(e) {
      var $el, i, newOption, options;
      $el = $(e.currentTarget);
      i = this.$el.find('.option').index($el.closest('.option'));
      options = this.model.get(Formbuilder.options.mappings.OPTIONS) || [];
      newOption = {
        label: "",
        checked: false
      };
      if (i > -1) {
        options.splice(i + 1, 0, newOption);
      } else {
        options.push(newOption);
      }
      this.model.set(Formbuilder.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.removeOption = function(e) {
      var $el, index, options;
      $el = $(e.currentTarget);
      index = this.$el.find(".js-remove-option").index($el);
      options = this.model.get(Formbuilder.options.mappings.OPTIONS);
      options.splice(index, 1);
      this.model.set(Formbuilder.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Formbuilder.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.defaultUpdated = function(e) {
      var $el;
      $el = $(e.currentTarget);
      if (this.model.get(Formbuilder.options.mappings.FIELD_TYPE) !== 'checkboxes') {
        this.$el.find(".js-default-updated").not($el).attr('checked', false).trigger('change');
      }
      return this.forceRender();
    };

    EditFieldView.prototype.forceRender = function() {
      return this.model.trigger('change');
    };

    return EditFieldView;

  })(Backbone.View);

  RuleFieldView = (function(superClass) {
    extend(RuleFieldView, superClass);

    function RuleFieldView() {
      return RuleFieldView.__super__.constructor.apply(this, arguments);
    }

    RuleFieldView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["edit/validation"]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    return RuleFieldView;

  })(EditFieldView);

  FormatFieldView = (function(superClass) {
    extend(FormatFieldView, superClass);

    function FormatFieldView() {
      return FormatFieldView.__super__.constructor.apply(this, arguments);
    }

    FormatFieldView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["edit/text_formating"]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    return FormatFieldView;

  })(EditFieldView);

  CalcFieldView = (function(superClass) {
    extend(CalcFieldView, superClass);

    function CalcFieldView() {
      return CalcFieldView.__super__.constructor.apply(this, arguments);
    }

    CalcFieldView.prototype.render = function() {
      this.$el.html(Formbuilder.templates["edit/calculation"]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    return CalcFieldView;

  })(EditFieldView);

  BuilderView = (function(superClass) {
    extend(BuilderView, superClass);

    function BuilderView() {
      return BuilderView.__super__.constructor.apply(this, arguments);
    }

    BuilderView.prototype.SUBVIEWS = [];

    BuilderView.prototype.events = {
      'click .js-save-form': 'saveForm',
      'click .js-approve-form': 'approveForm',
      'click .fb-tabs a': 'showTab',
      'click .fb-add-field-types a': 'addField',
      'mouseover .fb-add-field-types': 'lockLeftWrapper',
      'mouseout .fb-add-field-types': 'unlockLeftWrapper'
    };

    BuilderView.prototype.initialize = function(options) {
      var selector;
      selector = options.selector, this.formBuilder = options.formBuilder, this.bootstrapData = options.bootstrapData, this.params = options.params;
      if (selector != null) {
        this.setElement($(selector));
      }
      this.collection = new FormbuilderCollection;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.reset, this);
      this.collection.bind('change', this.handleFormUpdate, this);
      this.collection.bind('destroy add reset', this.hideShowNoResponseFields, this);
      this.collection.bind('destroy', this.ensureEditViewScrolled, this);
      this.render();
      this.collection.reset(this.bootstrapData);
      return this.bindSaveEvent();
    };

    BuilderView.prototype.bindSaveEvent = function() {
      this.formSaved = true;
      this.saveFormButton = this.$el.find(".js-save-form");
      if (!!Formbuilder.options.AUTOSAVE) {
        setInterval((function(_this) {
          return function() {
            return _this.saveForm.call(_this);
          };
        })(this), 5000);
      }
      return $(window).bind('beforeunload', (function(_this) {
        return function() {
          return void 0;
        };
      })(this));
    };

    BuilderView.prototype.reset = function() {
      this.$responseFields.html('');
      return this.addAll();
    };

    BuilderView.prototype.render = function() {
      var j, len, ref, subview;
      this.$el.html(Formbuilder.templates['page']({
        params: {
          params: this.params
        }
      }));
      this.$fbLeft = this.$el.find('.fb-left');
      this.$responseFields = this.$el.find('.fb-response-fields');
      this.bindWindowScrollEvent();
      this.hideShowNoResponseFields();
      ref = this.SUBVIEWS;
      for (j = 0, len = ref.length; j < len; j++) {
        subview = ref[j];
        new subview({
          parentView: this
        }).render();
      }
      return this;
    };

    BuilderView.prototype.bindWindowScrollEvent = function() {
      return $(window).on('scroll', (function(_this) {
        return function() {
          var maxMargin, newMargin;
          if (_this.$fbLeft.data('locked') === true) {
            return;
          }
          newMargin = Math.max(0, $(window).scrollTop() - _this.$el.offset().top) + 40;
          maxMargin = _this.$responseFields.height();
          return _this.$fbLeft.css({
            'margin-top': Math.min(maxMargin, newMargin)
          });
        };
      })(this));
    };

    BuilderView.prototype.showTab = function(e) {
      var $el, first_model, target;
      $el = $(e.currentTarget);
      target = $el.data('target');
      $el.closest('li').addClass('active').siblings('li').removeClass('active');
      $(target).addClass('active').siblings('.fb-tab-pane').removeClass('active');
      if ($.inArray(target, ['#editField', '#ruleField', '#calcField', '#formatField']) !== -1 && !this.editView && (first_model = this.collection.models[0])) {
        return this.createAndShowEditView(first_model, target);
      }
    };

    BuilderView.prototype.addOne = function(responseField, _, options) {
      var $replacePosition, view;
      view = new ViewFieldView({
        model: responseField,
        parentView: this
      });
      if (options.$replaceEl != null) {
        return options.$replaceEl.replaceWith(view.render().el);
      } else if ((options.position == null) || options.position === -1) {
        return this.$responseFields.append(view.render().el);
      } else if (options.position === 0) {
        return this.$responseFields.prepend(view.render().el);
      } else if (($replacePosition = this.$responseFields.find(".fb-field-wrapper").eq(options.position))[0]) {
        return $replacePosition.before(view.render().el);
      } else {
        return this.$responseFields.append(view.render().el);
      }
    };

    BuilderView.prototype.setSortable = function() {
      if (this.$responseFields.hasClass('ui-sortable')) {
        this.$responseFields.sortable('destroy');
      }
      this.$responseFields.sortable({
        forcePlaceholderSize: true,
        placeholder: 'sortable-placeholder',
        stop: (function(_this) {
          return function(e, ui) {
            var rf;
            if (ui.item.data('field-type')) {
              rf = _this.collection.create(Formbuilder.helpers.defaultFieldAttrs(ui.item.data('field-type')), {
                $replaceEl: ui.item
              });
              _this.createAndShowEditView(rf);
            }
            _this.handleFormUpdate();
            return true;
          };
        })(this),
        update: (function(_this) {
          return function(e, ui) {
            if (!ui.item.data('field-type')) {
              return _this.ensureEditViewScrolled();
            }
          };
        })(this)
      });
      return this.setDraggable();
    };

    BuilderView.prototype.setDraggable = function() {
      var $addFieldButtons;
      $addFieldButtons = this.$el.find("[data-field-type]");
      return $addFieldButtons.draggable({
        connectToSortable: this.$responseFields,
        helper: (function(_this) {
          return function() {
            var $helper;
            $helper = $("<div class='response-field-draggable-helper' />");
            $helper.css({
              width: _this.$responseFields.width(),
              height: '80px'
            });
            return $helper;
          };
        })(this)
      });
    };

    BuilderView.prototype.addAll = function() {
      this.collection.each(this.addOne, this);
      return this.setSortable();
    };

    BuilderView.prototype.hideShowNoResponseFields = function() {
      return this.$el.find(".fb-no-response-fields")[this.collection.length > 0 ? 'hide' : 'show']();
    };

    BuilderView.prototype.addField = function(e) {
      var field_type;
      field_type = $(e.currentTarget).data('field-type');
      this.createField(Formbuilder.helpers.defaultFieldAttrs(field_type));
      if (field_type === 'group_break_start') {
        return this.createField(Formbuilder.helpers.defaultFieldAttrs('group_break_end'));
      }
    };

    BuilderView.prototype.createField = function(attrs, options) {
      var rf;
      rf = this.collection.create(attrs, options);
      this.createAndShowEditView(rf);
      return this.handleFormUpdate();
    };

    BuilderView.prototype.createAndShowEditView = function(model, target) {
      var $newCalcEl, $newEditEl, $newFormatEl, $newRuleEl, $responseFieldEl;
      if (target == null) {
        target = '#editField';
      }
      $responseFieldEl = this.$el.find(".fb-field-wrapper").filter(function() {
        return $(this).data('cid') === model.cid;
      });
      $responseFieldEl.addClass('editing').siblings('.fb-field-wrapper').removeClass('editing');
      if (this.editView) {
        if (this.editView.model.cid === model.cid) {
          this.$el.find(".fb-tabs a[data-target=\"#editField\"]").click();
          this.scrollLeftWrapper($responseFieldEl);
          return;
        }
        this.editView.remove();
      }
      this.editView = new EditFieldView({
        model: model,
        parentView: this
      });
      this.ruleView = new RuleFieldView({
        model: model,
        parentView: this
      });
      this.formatView = new FormatFieldView({
        model: model,
        parentView: this
      });
      this.calcView = new CalcFieldView({
        model: model,
        parentView: this
      });
      $newEditEl = this.editView.render().$el;
      $newRuleEl = this.ruleView.render().$el;
      $newFormatEl = this.formatView.render().$el;
      $newCalcEl = this.calcView.render().$el;
      this.$el.find(".fb-edit-field-wrapper").html($newEditEl);
      this.$el.find(".fb-rule-field-wrapper").html($newRuleEl);
      this.$el.find(".fb-format-field-wrapper").html($newFormatEl);
      this.$el.find(".fb-calc-field-wrapper").html($newCalcEl);
      this.$el.find(".fb-tabs a[data-target=\"" + target + "\"]").click();
      this.scrollLeftWrapper($responseFieldEl);
      return this;
    };

    BuilderView.prototype.ensureEditViewScrolled = function() {
      if (!this.editView) {
        return;
      }
      return this.scrollLeftWrapper($(".fb-field-wrapper.editing"));
    };

    BuilderView.prototype.scrollLeftWrapper = function($responseFieldEl) {
      this.unlockLeftWrapper();
      if (!$responseFieldEl[0]) {
        return;
      }
      return $.scrollWindowTo((this.$el.offset().top + $responseFieldEl.offset().top) - this.$responseFields.offset().top, 200, (function(_this) {
        return function() {
          return _this.lockLeftWrapper();
        };
      })(this));
    };

    BuilderView.prototype.lockLeftWrapper = function() {
      return this.$fbLeft.data('locked', true);
    };

    BuilderView.prototype.unlockLeftWrapper = function() {
      return this.$fbLeft.data('locked', false);
    };

    BuilderView.prototype.handleFormUpdate = function() {
      if (this.updatingBatch) {
        return;
      }
      return this.formSaved = false;
    };

    BuilderView.prototype.generateContent = function() {
      var content, payload;
      this.collection.sort();
      payload = JSON.stringify({
        fields: this.collection.toJSON()
      });
      content = $('input[name=content]', this.el);
      if (content.length > 0) {
        content.remove();
      }
      return $('<input>').attr({
        type: 'hidden',
        name: 'content',
        value: payload
      }).appendTo(this.el);
    };

    BuilderView.prototype.saveForm = function(e) {
      var approved;
      approved = $('input[name=status]', this.el);
      if (approved.length > 0) {
        approved.remove();
      }
      return this.generateContent.call(this);
    };

    BuilderView.prototype.approveForm = function(e) {
      if ($('input[name=status]', this.el).length === 0) {
        $('<input>').attr({
          type: 'hidden',
          name: 'status',
          value: 'approved'
        }).appendTo(this.el);
      }
      return this.generateContent.call(this);
    };

    BuilderView.prototype.doAjaxSave = function(payload) {
      return $.ajax({
        url: Formbuilder.options.HTTP_ENDPOINT,
        type: Formbuilder.options.HTTP_METHOD,
        data: payload,
        contentType: "application/json",
        success: (function(_this) {
          return function(data) {
            var datum, j, len, ref;
            _this.updatingBatch = true;
            for (j = 0, len = data.length; j < len; j++) {
              datum = data[j];
              if ((ref = _this.collection.get(datum.cid)) != null) {
                ref.set({
                  id: datum.id
                });
              }
              _this.collection.trigger('sync');
            }
            return _this.updatingBatch = void 0;
          };
        })(this)
      });
    };

    return BuilderView;

  })(Backbone.View);

  Formbuilder = (function() {
    Formbuilder.helpers = {
      defaultFieldAttrs: function(field_type) {
        var attrs, base, label;
        attrs = {};
        label = (function() {
          switch (false) {
            case field_type !== 'group_break_start':
              return 'Grupas sakums';
            case field_type !== 'group_break_end':
              return 'Grupas beigas';
            default:
              return 'Nenosaukts';
          }
        })();
        attrs[Formbuilder.options.mappings.LABEL] = label;
        attrs[Formbuilder.options.mappings.FIELD_TYPE] = field_type;
        attrs[Formbuilder.options.mappings.REQUIRED] = false;
        attrs[Formbuilder.options.mappings.CONTROL_BUTTONS] = true;
        attrs[Formbuilder.options.mappings.HIDE_LABEL] = false;
        attrs['field_options'] = {};
        return (typeof (base = Formbuilder.fields[field_type]).defaultAttributes === "function" ? base.defaultAttributes(attrs) : void 0) || attrs;
      },
      simple_format: function(x) {
        return x != null ? x.replace(/\n/g, '<br />') : void 0;
      }
    };

    Formbuilder.options = {
      BUTTON_CLASS: 'fb-button',
      HTTP_ENDPOINT: '',
      HTTP_METHOD: 'POST',
      AUTOSAVE: false,
      CLEAR_FIELD_CONFIRM: false,
      mappings: {
        SIZE: 'field_options.size',
        UNITS: 'field_options.units',
        LABEL: 'label',
        FIELD_TYPE: 'field_type',
        REQUIRED: 'required',
        ADMIN_ONLY: 'admin_only',
        OPTIONS: 'field_options.options',
        DESCRIPTION: 'field_options.description',
        INCLUDE_OTHER: 'field_options.include_other_option',
        INCLUDE_BLANK: 'field_options.include_blank_option',
        MIN: 'field_options.min',
        MAX: 'field_options.max',
        MINLENGTH: 'field_options.minlength',
        MAXLENGTH: 'field_options.maxlength',
        LENGTH_UNITS: 'field_options.min_max_length_units',
        IDENTITY: 'identity',
        FORMULA: 'formula',
        FORMAT: 'format',
        COLSPAN: 'field_options.colspan',
        ROWSPAN: 'field_options.rowspan',
        VALIDATION_LEVEL: 'validation_level',
        VALIDATION_MESSAGE: 'validation_message',
        BOLD: 'field_options.bold',
        NOBORDER: 'field_options.noborder',
        INPUT_NOBORDER: 'field_options.input_noborder',
        GREYBACKGROUND: 'field_options.greybackground',
        INPUT_GREYBACKGROUND: 'field_options.input_greybackground',
        INTEGER: 'field_options.integer',
        DISABLED: 'field_options.disabled',
        LIMITED_ACCESS: 'field_options.limited_access',
        DISABLE_UNTIL_OTHER_FIELD_FILLED: 'field_options.disable_until_other_field_filled',
        DISABLE_UNTIL_OTHER_FIELD_FILLED_IDENTITY: 'field_options.disable_until_other_field_filled_identity',
        REQUIRED_IF_OTHER_FIELD_FILLED: 'field_options.require_if_other_field_filled',
        REQUIRED_IF_OTHER_FIELD_FILLED_IDENTITY: 'field_options.require_if_other_field_filled_identity',
        COMPARISON_TYPE: 'field_options.comparison_type',
        COMPARISON_FORMULA: 'field_options.comparison_formula',
        DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_VALUE: 'field_options.disabled_until_not_equal_other_filled_value',
        DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_TYPE: 'field_options.disabled_until_not_equal_other_filled_type',
        DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_IDENTITY: 'field_options.disabled_until_not_equal_other_filled_identity',
        DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_FORMULA: 'field_options.disabled_until_not_equal_other_filled_formula',
        DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_COMPARISON: 'field_options.disabled_until_not_equal_other_filled_comparison',
        LABEL_ALIGN: 'field_options.label_align',
        INPUT_ALIGN: 'field_options.input_align',
        CLASSIFIER: 'field_options.classifier',
        MULTI_SELECT: 'field_options.multi_select',
        SAVE_TO: 'save_to',
        CONTROL_BUTTONS: 'field_options.control_buttons',
        HIDE_LABEL: 'field_options.hide_label'
      },
      dict: {
        ALL_CHANGES_SAVED: 'All changes saved',
        SAVE_FORM: 'Save form',
        UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'
      }
    };

    Formbuilder.fields = {};

    Formbuilder.inputFields = {};

    Formbuilder.nonInputFields = {};

    Formbuilder.registerField = function(name, opts) {
      var j, len, ref, x;
      ref = ['view', 'edit'];
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        opts[x] = _.template(opts[x]);
      }
      opts.field_type = name;
      Formbuilder.fields[name] = opts;
      if (opts.type === 'non_input') {
        return Formbuilder.nonInputFields[name] = opts;
      } else {
        return Formbuilder.inputFields[name] = opts;
      }
    };

    function Formbuilder(opts) {
      var args;
      if (opts == null) {
        opts = {};
      }
      _.extend(this, Backbone.Events);
      args = _.extend(opts, {
        formBuilder: this
      });
      this.mainView = new BuilderView(args);
    }

    return Formbuilder;

  })();

  window.Formbuilder = Formbuilder;

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Formbuilder;
  } else {
    window.Formbuilder = Formbuilder;
  }

}).call(this);

(function() {
  Formbuilder.registerField('address', {
    order: 11,
    view: "<div class='input-line'>\n  <span class='street'>\n    <input type='text' />\n    <label>Adrese</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='city'>\n    <input type='text' />\n    <label>Pilsēta</label>\n  </span>\n\n  <span class='state'>\n    <input type='text' />\n    <label>Novads / Pagasts</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='zip'>\n    <input type='text' />\n    <label>Pasta indekss</label>\n  </span>\n\n  <span class='country'>\n    <select><option>Latvija</option></select>\n    <label>Valsts</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-home\"></span></span> Adrese",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('checkboxes', {
    order: 4,
    view: "<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='checkbox' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Formbuilder.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='checkbox' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
    edit: "<%= Formbuilder.templates['edit/options']({ includeOther: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-square-o\"></span></span> Izvēles rūtiņa",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('date', {
    order: 5,
    view: "<div class='input-line'>\n  <span class='month'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='day'>\n    <input type=\"text\" />\n    <label>DD</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='year'>\n    <input type=\"text\" />\n    <label>YYYY</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-calendar\"></span></span> Datums",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('dropdown', {
    order: 8,
    view: "<select>\n  <% if (rf.get(Formbuilder.options.mappings.INCLUDE_BLANK)) { %>\n    <option value=''></option>\n  <% } %>\n\n  <% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n    <option <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'selected' %>>\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </option>\n  <% } %>\n</select>",
    edit: "<%= Formbuilder.templates['edit/options']({ includeBlank: true, classifier: rf.get(Formbuilder.options.mappings.CLASSIFIER) }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-caret-down\"></span></span> Izvēlēties no saraksta",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      attrs.field_options.include_blank_option = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('email', {
    order: 13,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-envelope-o\"></span></span> E-pasts",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {


}).call(this);

(function() {
  Formbuilder.registerField('group_break_end', {
    order: 12,
    view: "  ",
    edit: "  ",
    addButton: "<span class='symbol'><span class='fa fa-th-large'></span></span> Pārtraukt grupēt",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('group_break_start', {
    order: 10,
    view: "  ",
    edit: "  ",
    addButton: "<span class='symbol'><span class='fa fa-th-large'></span></span> Sākt grupēt",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('hidden', {
    order: 16,
    view: "<input type='hidden' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />",
    edit: "  ",
    addButton: "<span class='symbol'><span class='fa fa-minus-square-o'></span></span> Slēpts lauks",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('number', {
    order: 3,
    view: "<input type='text' />\n<% if (units = rf.get(Formbuilder.options.mappings.UNITS)) { %>\n  <%= units %>\n<% } %>",
    edit: "  ",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-number\">123</span></span> Skaitlis",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('paragraph', {
    order: 2,
    view: "<textarea class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>'></textarea>",
    edit: "<%= Formbuilder.templates['edit/min_max_length']() %>",
    addButton: "<span class=\"symbol\">&#182;</span> Paragrāfa teksts",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('price', {
    order: 9,
    view: "<div class='input-line'>\n  <span class='above-line'>&euro;</span>\n  <span class='dolars'>\n    <input type='text' />\n    <label>Eiro</label>\n  </span>\n  <span class='above-line'>.</span>\n  <span class='cents'>\n    <input type='text' />\n    <label>Centi</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-euro\"></span></span> Cena",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('radio', {
    order: 6,
    view: "<% for (i in (rf.get(Formbuilder.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='radio' <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Formbuilder.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Formbuilder.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='radio' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
    edit: "<%= Formbuilder.templates['edit/options']({ includeOther: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-circle-o\"></span></span> Vairākas izvēles",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('section_break', {
    order: 0,
    type: 'non_input',
    view: "<label class='section-name'><%= rf.get(Formbuilder.options.mappings.LABEL) %></label>\n<p><%= rf.get(Formbuilder.options.mappings.DESCRIPTION) %></p>",
    edit: "<div class='fb-edit-section-header'>Label</div>\n<input type='text' data-rv-input='model.<%= Formbuilder.options.mappings.LABEL %>' />\n<textarea data-rv-input='model.<%= Formbuilder.options.mappings.DESCRIPTION %>'\n  placeholder='Pievienot detelizētāku aprakstu'></textarea>",
    addButton: "<span class='symbol'><span class='fa fa-minus'></span></span> Section Break"
  });

}).call(this);

(function() {
  Formbuilder.registerField('table_break', {
    order: 17,
    view: "  ",
    edit: "  ",
    addButton: "<span class='symbol'><span class='fa fa-text-width'></span></span> Tabulas atdalījums",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('text', {
    order: 0,
    view: "<input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />",
    edit: "<%= Formbuilder.templates['edit/min_max_length']() %>",
    addButton: "<span class='symbol'><span class='fa fa-font'></span></span> Teksts",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('text_break', {
    order: 14,
    view: "  ",
    edit: "  ",
    addButton: "<span class='symbol'><span class='fa fa-text-width'></span></span> Teksta līnija",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('time', {
    order: 7,
    view: "<div class='input-line'>\n  <span class='hours'>\n    <input type=\"text\" />\n    <label>HH</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='minutes'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='seconds'>\n    <input type=\"text\" />\n    <label>SS</label>\n  </span>\n\n  <span class='am_pm'>\n    <select>\n      <option>AM</option>\n      <option>PM</option>\n    </select>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-clock-o\"></span></span> Laiks",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

(function() {
  Formbuilder.registerField('website', {
    order: 15,
    view: "<input type='text' placeholder='http://' />",
    edit: "  ",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-link\"></span></span> Mājas lapa",
    defaultAttributes: function(attrs) {
      attrs.field_options.control_buttons = true;
      return attrs;
    }
  });

}).call(this);

this["Formbuilder"] = this["Formbuilder"] || {};
this["Formbuilder"]["templates"] = this["Formbuilder"]["templates"] || {};

this["Formbuilder"]["templates"]["edit/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.templates['edit/common']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/base_header"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-field-label\'>\n  <span data-rv-text="model.' +
((__t = ( Formbuilder.options.mappings.LABEL )) == null ? '' : __t) +
'"></span>\n  <code class=\'field-type\' data-rv-text=\'model.' +
((__t = ( Formbuilder.options.mappings.FIELD_TYPE )) == null ? '' : __t) +
'\'></code>\n  <span class=\'fa fa-arrow-right pull-right\'></span>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/calculation"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Lauka identifikators (drīkst sastāvēt [a..z][0..9] un nedrīkst sākties ar ciparu!)</div>\n    <input id="alphaNumericIdentity" type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.IDENTITY )) == null ? '' : __t) +
'" />\n    <div class=\'fb-edit-section-header\'>Formula</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.FORMULA )) == null ? '' : __t) +
'" />\n    <div class=\'fb-edit-section-header\'>Formāts</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.FORMAT )) == null ? '' : __t) +
'" />\n</div>\n\n<script type="text/javascript">\n    $(function() {\n        $(\'#alphaNumericIdentity\').bind(\'keyup blur\', function() {\n            if ($(this).val().length == 1) {\n                $(this).val($(this).val().replace(/[^A-Za-z]/g, \'\').toUpperCase());\n            } else {\n                $(this).val($(this).val().replace(/[^A-Za-z0-9]/g, \'\').toUpperCase());\n            }\n        });\n    });\n</script>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/checkboxes"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '';

}
return __p
};

this["Formbuilder"]["templates"]["edit/colspan"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Kolonnas platums</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.COLSPAN )) == null ? '' : __t) +
'" />\n    <div class=\'fb-edit-section-header\'>Rindas augstums</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.ROWSPAN )) == null ? '' : __t) +
'" />\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/common"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-common-wrapper\'>\n  <div class=\'fb-label-description\'>\n    ' +
((__t = ( Formbuilder.templates['edit/label_description']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-common-colspan\'>\n    ' +
((__t = ( Formbuilder.templates['edit/colspan']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-clear\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/label_description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Nosaukums</div>\n    <input type=\'text\' data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.LABEL )) == null ? '' : __t) +
'\' />\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.HIDE_LABEL )) == null ? '' : __t) +
'\' style="width: auto;" /> Nerādīt nosaukumu<br />\n    <textarea data-rv-input=\'model.' +
((__t = ( Formbuilder.options.mappings.DESCRIPTION )) == null ? '' : __t) +
'\' placeholder=\'Pievienot detelizētāku aprakstu\'></textarea>\n    <br /><br />\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.DISABLED )) == null ? '' : __t) +
'\' style="width: auto;" /> Nav rediģējams<br />\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INTEGER )) == null ? '' : __t) +
'\' style="width: auto;" /> Naturāls skaitlis<br />\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/min_max_length"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Garuma ierobežojumi</div>\n\n    Min\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MINLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n    &nbsp;&nbsp;\n\n    Max\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.MAXLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n    &nbsp;&nbsp;\n\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.LENGTH_UNITS )) == null ? '' : __t) +
'" style="width: auto;">\n      <option value="characters">simboli</option>\n      <option value="words">vārdi</option>\n    </select>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/options"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Vērtības</div>\n\n    <label>\n        <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.MULTI_SELECT )) == null ? '' : __t) +
'\' />\n        Atļaut atzīmēt vairākas izvēles\n    </label>\n\n    <div class=\'fb-edit-section-header\'>No klasifikatora</div>\n    <select id="source-classifier" data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.CLASSIFIER )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="nozaru-klasifikators">Nozaru klasifikators</option>\n        <option value="ATVK">Administratīvo teritoriju un teritoriālo vienību klasifikators</option>\n        <option value="merchants">Komersanti</option>\n        <option value="years">Gadi</option>\n        <option value="periods">Periodi</option>\n    </select>\n    <script type="text/javascript">\n        $(function () {\n            $(\'#source-classifier\').change(function () {\n                var value = $(this).val();\n                if (value != \'\') {\n                    $(\'#drowdown-custom-values\').addClass(\'hidden\');\n                }\n                if (value == \'\') {\n                    $(\'#drowdown-custom-values\').removeClass(\'hidden\');\n                }\n            });\n        });\n    </script>\n\n    <div id="drowdown-custom-values" ';
 if (typeof classifier !== 'undefined' && classifier != ''){ ;
__p += 'class="hidden"';
 } ;
__p += '>\n        ';
 if (typeof includeBlank !== 'undefined'){ ;
__p += '\n          <label>\n            <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INCLUDE_BLANK )) == null ? '' : __t) +
'\' />\n            Iekļaut tukšu\n          </label>\n        ';
 } ;
__p += '\n\n        <div class=\'option\' data-rv-each-option=\'model.' +
((__t = ( Formbuilder.options.mappings.OPTIONS )) == null ? '' : __t) +
'\'>\n          <input type="checkbox" class=\'js-default-updated\' data-rv-checked="option:checked" style="width:auto" />\n          <input type="text" data-rv-input="option:value" class=\'option-label-input\' style="width:100px;" placeholder="Vērtība" />\n          <input type="text" data-rv-input="option:label" class=\'option-label-input\' style="width:auto" placeholder="Nosaukums" />\n          <a class="js-add-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Add Option"><i class=\'fa fa-plus-circle\'></i></a>\n          <a class="js-remove-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove Option"><i class=\'fa fa-minus-circle\'></i></a>\n        </div>\n\n        ';
 if (typeof includeOther !== 'undefined'){ ;
__p += '\n          <label>\n            <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INCLUDE_OTHER )) == null ? '' : __t) +
'\' />\n            Iekļaut "cits"\n          </label>\n        ';
 } ;
__p += '\n\n        <div class=\'fb-bottom-add\'>\n          <a class="js-add-option ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">Pievienot vērtību</a>\n        </div>\n    </div>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/size"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Size</div>\n<select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.SIZE )) == null ? '' : __t) +
'">\n  <option value="small">Small</option>\n  <option value="medium">Medium</option>\n  <option value="large">Large</option>\n</select>\n';

}
return __p
};

this["Formbuilder"]["templates"]["edit/text_formating"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div style=\'padding-bottom:5px;\' class=\'fb-edit-section-header\'><abbr title="Izvēlieties, ja eksistē etiķetes lauks.">Etiķetes lauka teksta pielīdzinājums</abbr></div>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.LABEL_ALIGN )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="center">Centrēt tekstu</option>\n        <option value="left">Pielīdzinat tekstu kreisajai malai</option>\n        <option value="right">Pielīdzinat tekstu labajai malai</option>\n    </select>\n    <br />\n    <div style=\'padding-bottom:5px;\' class=\'fb-edit-section-header\'><abbr title="Izvēlieties teksta pielīdzinājumu galvenajam laukam.">Galvenā lauka teksta pielīdzinājums</abbr></div>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.INPUT_ALIGN )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="center">Centrēt tekstu</option>\n        <option value="left">Pielīdzinat tekstu kreisajai malai</option>\n        <option value="right">Pielīdzinat tekstu labajai malai</option>\n    </select>\n</div>  \n<div class="field-group">\n    <div style=\'padding-bottom:5px;\' class=\'fb-edit-section-header\'><abbr title="Izvēlieties, vai tiek zīmēts rāmis lauks.">Tabulas rāmju formatēšana</abbr></div>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.NOBORDER )) == null ? '' : __t) +
'\' style="width: auto;" /> Nezimēt etiķetes laukam rāmi<br />\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INPUT_NOBORDER )) == null ? '' : __t) +
'\' style="width: auto;" /> Nezimēt galvenajam laukam rāmi<br />\n</div>   \n<div class="field-group">\n    <div style=\'padding-bottom:5px;\' class=\'fb-edit-section-header\'><abbr title="Izvēlieties, vai laukam tiks iekrāsots fons.">Fona iekrāsošana</abbr></div>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.GREYBACKGROUND )) == null ? '' : __t) +
'\' style="width: auto;" /> Etiķetes lauks iekrāsojams viegli pelēkā krāsā<br />\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.INPUT_GREYBACKGROUND )) == null ? '' : __t) +
'\' style="width: auto;" /> Galvenais lauks iekrāsojams viegli pelēkā krāsā<br />\n</div>    \n<div class="field-group">\n    <div style=\'padding-bottom:5px;\' class=\'fb-edit-section-header\'><abbr title="Izvēlieties, vai lauks rakstāms treknrakstā.">Burtu formatēšana</abbr></div>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.BOLD )) == null ? '' : __t) +
'\' style="width: auto;" /> Treknrakstā<br />\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["edit/validation"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Pārbaudes līmenis</div>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.VALIDATION_LEVEL )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="required">Obligāts</option>\n        <option value="info">Informatīvs</option>\n    </select>\n    <div class=\'fb-edit-section-header\'>Brīdinājuma teksts</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.VALIDATION_MESSAGE )) == null ? '' : __t) +
'" />\n</div>\n<div class="field-group">\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.DISABLE_UNTIL_OTHER_FIELD_FILLED )) == null ? '' : __t) +
'\' /> Lauku nevar aizpildīt, kamēr nav aizpildīts cits\n    <div class=\'fb-edit-section-header\'>Saistītais lauks</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.DISABLE_UNTIL_OTHER_FIELD_FILLED_IDENTITY )) == null ? '' : __t) +
'" />\n</div>\n<div class="field-group">\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.REQUIRED_IF_OTHER_FIELD_FILLED )) == null ? '' : __t) +
'\' /> Lauks ir obligāti aizpildāms, ja saistīts lauks ir aizpildīts\n    <div class=\'fb-edit-section-header\'>Saistītais lauks</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.REQUIRED_IF_OTHER_FIELD_FILLED_IDENTITY )) == null ? '' : __t) +
'" />\n</div>\n<div class="field-group">\n    <div class=\'fb-edit-section-header\'>Salīdzinājuma veids</div>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.COMPARISON_TYPE )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="equal">vienāds</option>\n        <option value="bigger">lielāks</option>\n        <option value="less">mazāks</option>\n        <option value="bigger_equal">lielāks un vienāds</option>\n        <option value="less_equal">mazāks un vienāds</option>\n    </select>\n    <div class=\'fb-edit-section-header\'>Formula, kas atsaucas uz citiem veidlapas sagataves laukiem</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.COMPARISON_FORMULA )) == null ? '' : __t) +
'" />\n</div>\n<div class="field-group">\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Formbuilder.options.mappings.DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_VALUE )) == null ? '' : __t) +
'\' /> Lauku nevar aizpildīt, kamēr citā lauka vērtība nesakrīt ar iepriekš noteiktu vērtību\n    <div class=\'fb-edit-section-header\'>Saistītais lauks</div>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_IDENTITY )) == null ? '' : __t) +
'" />\n    <div class=\'fb-edit-section-header\'>Salīdzināt ar:</div>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_TYPE )) == null ? '' : __t) +
'">\n        <option value="formula">Izteiksmi</option>\n        <option value="value">Vērtību</option>\n    </select>\n    <select data-rv-value="model.' +
((__t = ( Formbuilder.options.mappings.DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_COMPARISON )) == null ? '' : __t) +
'">\n        <option value=""></option>\n        <option value="equal">vienāds</option>\n        <option value="bigger">lielāks</option>\n        <option value="less">mazāks</option>\n        <option value="bigger_equal">lielāks un vienāds</option>\n        <option value="less_equal">mazāks un vienāds</option>\n    </select>\n    <input type="text" data-rv-input="model.' +
((__t = ( Formbuilder.options.mappings.DISABLED_UNTIL_NOT_EQUAL_OTHER_FILLED_FORMULA )) == null ? '' : __t) +
'" />\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["page"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Formbuilder.templates['partials/left_side'](params) )) == null ? '' : __t) +
'\n' +
((__t = ( Formbuilder.templates['partials/right_side']() )) == null ? '' : __t);

}
return __p
};

this["Formbuilder"]["templates"]["partials/add_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane active\' id=\'addField\'>\n  <div class=\'fb-add-field-types\'>\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Formbuilder.inputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n\n    <!--div class=\'section\'>\n      ';
 _.each(_.sortBy(Formbuilder.nonInputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div -->\n  </div>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["partials/calc_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'calcField\'>\n    <div class=\'fb-calc-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/edit_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'editField\'>\n  <div class=\'fb-edit-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/format_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'formatField\'>\n  <div class=\'fb-format-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/left_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-left\'>\n  <ul class=\'fb-tabs\'>\n    <li class=\'active\'><a data-target=\'#addField\'>Pievienot</a></li>\n    <li><a data-target=\'#editField\'>Labot</a></li>\n    <li><a data-target=\'#ruleField\'>Pārbaudes</a></li>\n    <li><a data-target=\'#calcField\'>Aprēķini</a></li>\n    <li><a data-target=\'#formatField\'>Stili</a></li>\n  </ul>\n\n  <div class=\'fb-tab-content\'>\n    ' +
((__t = ( Formbuilder.templates['partials/add_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/edit_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/rule_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/calc_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Formbuilder.templates['partials/format_field']() )) == null ? '' : __t) +
'\n  </div>\n  ' +
((__t = ( Formbuilder.templates['partials/save_button'](params) )) == null ? '' : __t) +
'\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["partials/right_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-right\'>\n  <div class=\'fb-no-response-fields\'></div>\n  <div class=\'fb-response-fields\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/rule_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'ruleField\'>\n    <div class=\'fb-rule-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["partials/save_button"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="form-group text-center fb-save-button">\n    ';
 if (create) { ;
__p += '\n        <a href="' +
((__t = ( viewUrl )) == null ? '' : __t) +
'" class="btn btn-info" role="button">Apskatīt</a>\n    ';
 } ;
__p += '\n    <input class="btn btn-warning js-save-form" type="submit" value="Saglabāt">\n    ';
 if (allowApprove) { ;
__p += '\n        <input class="btn btn-success js-approve-form" type="submit" value="Apstiprināt">\n    ';
 } ;
__p += '\n    <a href="' +
((__t = ( cancelUrl )) == null ? '' : __t) +
'" class="btn btn-default" role="button">Aizvērt</a>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["view/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'subtemplate-wrapper\'>\n  <div class=\'cover\'></div>\n  ' +
((__t = ( Formbuilder.templates['view/label']({rf: rf}) )) == null ? '' : __t) +
'\n\n  ' +
((__t = ( Formbuilder.fields[rf.get(Formbuilder.options.mappings.FIELD_TYPE)].view({rf: rf}) )) == null ? '' : __t) +
'\n\n  ' +
((__t = ( Formbuilder.templates['view/description']({rf: rf}) )) == null ? '' : __t) +
'\n  ' +
((__t = ( Formbuilder.templates['view/duplicate_remove']({rf: rf}) )) == null ? '' : __t) +
'\n</div>\n';

}
return __p
};

this["Formbuilder"]["templates"]["view/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '';

}
return __p
};

this["Formbuilder"]["templates"]["view/description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span class=\'help-block\'>\n  ' +
((__t = ( Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.DESCRIPTION)) )) == null ? '' : __t) +
'\n</span>\n';

}
return __p
};

this["Formbuilder"]["templates"]["view/duplicate_remove"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'actions-wrapper\'>\n  <a class="js-duplicate ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Kopēt lauku"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-clear ' +
((__t = ( Formbuilder.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Dzēst lauku"><i class=\'fa fa-minus-circle\'></i></a>\n</div>';

}
return __p
};

this["Formbuilder"]["templates"]["view/label"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<label>\n  <span>' +
((__t = ( Formbuilder.helpers.simple_format(rf.get(Formbuilder.options.mappings.LABEL)) )) == null ? '' : __t) +
'\n  ';
 if (rf.get(Formbuilder.options.mappings.REQUIRED)) { ;
__p += '\n    <abbr title=\'required\'>*</abbr>\n  ';
 } ;
__p += '\n</label>\n';

}
return __p
};