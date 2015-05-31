class FormbuilderModel extends Backbone.DeepModel
  sync: -> # noop
  indexInDOM: ->
    $wrapper = $(".fb-field-wrapper").filter ( (_, el) => $(el).data('cid') == @cid  )
    $(".fb-field-wrapper").index $wrapper
  is_input: ->
    Formbuilder.inputFields[@get(Formbuilder.options.mappings.FIELD_TYPE)]?


class FormbuilderCollection extends Backbone.Collection
  initialize: ->
    @on 'add', @copyCidToModel

  model: FormbuilderModel

  comparator: (model) ->
    model.indexInDOM()

  copyCidToModel: (model) ->
    model.attributes.cid = model.cid

class ViewFieldView extends Backbone.View
  className: "fb-field-wrapper"

  events:
    'click .subtemplate-wrapper': 'focusEditView'
    'click .js-duplicate': 'duplicate'
    'click .js-clear': 'clear'

  initialize: (options) ->
    {@parentView} = options
    @listenTo @model, "change", @render
    @listenTo @model, "destroy", @remove

  render: ->
    @$el.addClass('response-field-' + @model.get(Formbuilder.options.mappings.FIELD_TYPE))
        .data('cid', @model.cid)
        .html(Formbuilder.templates["view/base#{if !@model.is_input() then '_non_input' else ''}"]({rf: @model}))

    return @

  focusEditView: ->
    @parentView.createAndShowEditView(@model)

  clear: (e) ->
    e.preventDefault()
    e.stopPropagation()

    cb = =>
      @parentView.handleFormUpdate()
      @model.destroy()

    x = Formbuilder.options.CLEAR_FIELD_CONFIRM

    switch typeof x
      when 'string'
        if confirm(x) then cb()
      when 'function'
        x(cb)
      else
        cb()

  duplicate: ->
    attrs = _.clone(@model.attributes)
    delete attrs['id']
    # attrs['label'] += ' Copy'
    @parentView.createField attrs, { position: @model.indexInDOM() + 1 }

class EditFieldView extends Backbone.View
  className: "edit-response-field"

  events:
    'click .js-add-option': 'addOption'
    'click .js-remove-option': 'removeOption'
    'click .js-default-updated': 'defaultUpdated'
    'input .option-label-input': 'forceRender'

  initialize: (options) ->
    {@parentView} = options
    @listenTo @model, "destroy", @remove

  render: ->
    @$el.html(Formbuilder.templates["edit/base#{if !@model.is_input() then '_non_input' else ''}"]({rf: @model}))
    rivets.bind @$el, { model: @model }
    return @

  remove: ->
    @parentView.editView = undefined
    @parentView.$el.find("[data-target=\"#addField\"]").click()
    super

  # @todo this should really be on the model, not the view
  addOption: (e) ->
    $el = $(e.currentTarget)
    i = @$el.find('.option').index($el.closest('.option'))
    options = @model.get(Formbuilder.options.mappings.OPTIONS) || []
    newOption = {label: "", checked: false}

    if i > -1
      options.splice(i + 1, 0, newOption)
    else
      options.push newOption

    @model.set Formbuilder.options.mappings.OPTIONS, options
    @model.trigger "change:#{Formbuilder.options.mappings.OPTIONS}"
    @forceRender()

  removeOption: (e) ->
    $el = $(e.currentTarget)
    index = @$el.find(".js-remove-option").index($el)
    options = @model.get Formbuilder.options.mappings.OPTIONS
    options.splice index, 1
    @model.set Formbuilder.options.mappings.OPTIONS, options
    @model.trigger "change:#{Formbuilder.options.mappings.OPTIONS}"
    @forceRender()

  defaultUpdated: (e) ->
    $el = $(e.currentTarget)

    unless @model.get(Formbuilder.options.mappings.FIELD_TYPE) == 'checkboxes' # checkboxes can have multiple options selected
      @$el.find(".js-default-updated").not($el).attr('checked', false).trigger('change')

    @forceRender()

  forceRender: ->
    @model.trigger('change')

class RuleFieldView extends EditFieldView
  render: ->
    @$el.html(Formbuilder.templates["edit/validation"]({rf: @model}))
    rivets.bind @$el, { model: @model }
    return @

class FormatFieldView extends EditFieldView
  render: ->
    @$el.html(Formbuilder.templates["edit/text_formating"]({rf: @model}))
    rivets.bind @$el, { model: @model }
    return @

class CalcFieldView extends EditFieldView
  render: ->
    @$el.html(Formbuilder.templates["edit/calculation"]({rf: @model}))
    rivets.bind @$el, { model: @model }
    return @

class BuilderView extends Backbone.View
  SUBVIEWS: []

  events:
    'click .js-save-form': 'saveForm'
    'click .js-approve-form': 'approveForm'
    'click .fb-tabs a': 'showTab'
    'click .fb-add-field-types a': 'addField'
    'mouseover .fb-add-field-types': 'lockLeftWrapper'
    'mouseout .fb-add-field-types': 'unlockLeftWrapper'

  initialize: (options) ->
    {selector, @formBuilder, @bootstrapData, @params} = options

    # This is a terrible idea because it's not scoped to this view.
    if selector?
      @setElement $(selector)

    # Create the collection, and bind the appropriate events
    @collection = new FormbuilderCollection
    @collection.bind 'add', @addOne, @
    @collection.bind 'reset', @reset, @
    @collection.bind 'change', @handleFormUpdate, @
    @collection.bind 'destroy add reset', @hideShowNoResponseFields, @
    @collection.bind 'destroy', @ensureEditViewScrolled, @

    @render()
    @collection.reset(@bootstrapData)
    @bindSaveEvent()

  bindSaveEvent: ->
    @formSaved = true
    @saveFormButton = @$el.find(".js-save-form")
    #@saveFormButton.attr('disabled', true).text(Formbuilder.options.dict.ALL_CHANGES_SAVED)

    unless !Formbuilder.options.AUTOSAVE
      setInterval =>
        @saveForm.call(@)
      , 5000

    $(window).bind 'beforeunload', =>
      undefined
      #if @formSaved then undefined else Formbuilder.options.dict.UNSAVED_CHANGES

  reset: ->
    @$responseFields.html('')
    @addAll()

  render: ->
    @$el.html Formbuilder.templates['page'](params: {@params})

    # Save jQuery objects for easy use
    @$fbLeft = @$el.find('.fb-left')
    @$responseFields = @$el.find('.fb-response-fields')

    @bindWindowScrollEvent()
    @hideShowNoResponseFields()

    # Render any subviews (this is an easy way of extending the Formbuilder)
    new subview({parentView: @}).render() for subview in @SUBVIEWS

    return @

  bindWindowScrollEvent: ->
    $(window).on 'scroll', =>
      return if @$fbLeft.data('locked') == true
      newMargin = Math.max(0, $(window).scrollTop() - @$el.offset().top) + 40
      maxMargin = @$responseFields.height()

      @$fbLeft.css
        'margin-top': Math.min(maxMargin, newMargin)

  showTab: (e) ->
    $el = $(e.currentTarget)
    target = $el.data('target')
    $el.closest('li').addClass('active').siblings('li').removeClass('active')
    $(target).addClass('active').siblings('.fb-tab-pane').removeClass('active')
    if $.inArray(target, ['#editField', '#ruleField', '#calcField', '#formatField']) != -1 && !@editView && (first_model = @collection.models[0])
      @createAndShowEditView(first_model, target)

  addOne: (responseField, _, options) ->
    view = new ViewFieldView
      model: responseField
      parentView: @

    #####
    # Calculates where to place this new field.
    #
    # Are we replacing a temporarily drag placeholder?
    if options.$replaceEl?
      options.$replaceEl.replaceWith(view.render().el)

    # Are we adding to the bottom?
    else if !options.position? || options.position == -1
      @$responseFields.append view.render().el

    # Are we adding to the top?
    else if options.position == 0
      @$responseFields.prepend view.render().el

    # Are we adding below an existing field?
    else if ($replacePosition = @$responseFields.find(".fb-field-wrapper").eq(options.position))[0]
      $replacePosition.before view.render().el

    # Catch-all: add to bottom
    else
      @$responseFields.append view.render().el

  setSortable: ->
    @$responseFields.sortable('destroy') if @$responseFields.hasClass('ui-sortable')
    @$responseFields.sortable
      forcePlaceholderSize: true
      placeholder: 'sortable-placeholder'
      stop: (e, ui) =>
        if ui.item.data('field-type')
          rf = @collection.create Formbuilder.helpers.defaultFieldAttrs(ui.item.data('field-type')), {$replaceEl: ui.item}
          @createAndShowEditView(rf)

        @handleFormUpdate()
        return true
      update: (e, ui) =>
        # ensureEditViewScrolled, unless we're updating from the draggable
        @ensureEditViewScrolled() unless ui.item.data('field-type')

    @setDraggable()

  setDraggable: ->
    $addFieldButtons = @$el.find("[data-field-type]")

    $addFieldButtons.draggable
      connectToSortable: @$responseFields
      helper: =>
        $helper = $("<div class='response-field-draggable-helper' />")
        $helper.css
          width: @$responseFields.width() # hacky, won't get set without inline style
          height: '80px'

        $helper

  addAll: ->
    @collection.each @addOne, @
    @setSortable()

  hideShowNoResponseFields: ->
    @$el.find(".fb-no-response-fields")[if @collection.length > 0 then 'hide' else 'show']()

  addField: (e) ->
    field_type = $(e.currentTarget).data('field-type')
    @createField Formbuilder.helpers.defaultFieldAttrs(field_type)
    if (field_type == 'group_break_start')
      @createField Formbuilder.helpers.defaultFieldAttrs('group_break_end')

  createField: (attrs, options) ->
    rf = @collection.create attrs, options
    @createAndShowEditView(rf)
    @handleFormUpdate()

  createAndShowEditView: (model, target = '#editField') ->
    $responseFieldEl = @$el.find(".fb-field-wrapper").filter( -> $(@).data('cid') == model.cid )
    $responseFieldEl.addClass('editing').siblings('.fb-field-wrapper').removeClass('editing')

    if @editView
      if @editView.model.cid is model.cid
        @$el.find(".fb-tabs a[data-target=\"#editField\"]").click()
        @scrollLeftWrapper($responseFieldEl)
        return

      @editView.remove()

    @editView = new EditFieldView
      model: model
      parentView: @

    @ruleView = new RuleFieldView
      model: model
      parentView: @

    @formatView = new FormatFieldView
      model: model
      parentView: @

    @calcView = new CalcFieldView
      model: model
      parentView: @

    $newEditEl = @editView.render().$el
    $newRuleEl = @ruleView.render().$el
    $newFormatEl = @formatView.render().$el
    $newCalcEl = @calcView.render().$el
    @$el.find(".fb-edit-field-wrapper").html $newEditEl
    @$el.find(".fb-rule-field-wrapper").html $newRuleEl
    @$el.find(".fb-format-field-wrapper").html $newFormatEl
    @$el.find(".fb-calc-field-wrapper").html $newCalcEl
    @$el.find(".fb-tabs a[data-target=\"" + target + "\"]").click()
    @scrollLeftWrapper($responseFieldEl)
    return @

  ensureEditViewScrolled: ->
    return unless @editView
    @scrollLeftWrapper $(".fb-field-wrapper.editing")

  scrollLeftWrapper: ($responseFieldEl) ->
    @unlockLeftWrapper()
    return unless $responseFieldEl[0]
    $.scrollWindowTo ((@$el.offset().top + $responseFieldEl.offset().top) - @$responseFields.offset().top), 200, =>
      @lockLeftWrapper()

  lockLeftWrapper: ->
    @$fbLeft.data('locked', true)

  unlockLeftWrapper: ->
    @$fbLeft.data('locked', false)

  handleFormUpdate: ->
    return if @updatingBatch
    @formSaved = false
    #@saveFormButton.removeAttr('disabled').text(Formbuilder.options.dict.SAVE_FORM)

  generateContent: ->
    @collection.sort()
    payload = JSON.stringify fields: @collection.toJSON()
    content = $('input[name=content]', @el)
    if content.length > 0
      content.remove()
    $('<input>')
      .attr
        type: 'hidden',
        name: 'content',
        value: payload
      .appendTo @el;

  saveForm: (e) ->
    approved = $('input[name=status]', @el)
    if approved.length > 0
      approved.remove()
    @generateContent.call(@)

  approveForm: (e) ->
    if $('input[name=status]', @el).length == 0
      $('<input>')
        .attr
          type: 'hidden',
          name: 'status',
          value: 'approved'
       .appendTo @el
    @generateContent.call(@)

  doAjaxSave: (payload) ->
    $.ajax
      url: Formbuilder.options.HTTP_ENDPOINT
      type: Formbuilder.options.HTTP_METHOD
      data: payload
      contentType: "application/json"
      success: (data) =>
        @updatingBatch = true

        for datum in data
          # set the IDs of new response fields, returned from the server
          @collection.get(datum.cid)?.set({id: datum.id})
          @collection.trigger 'sync'

        @updatingBatch = undefined


class Formbuilder
  @helpers:
    defaultFieldAttrs: (field_type) ->
      attrs = {}
      label = switch
        when field_type == 'group_break_start' then 'Grupas sakums'
        when field_type == 'group_break_end' then 'Grupas beigas'
        else 'Nenosaukts'
      attrs[Formbuilder.options.mappings.LABEL] = label
      attrs[Formbuilder.options.mappings.FIELD_TYPE] = field_type
      attrs[Formbuilder.options.mappings.REQUIRED] = false
      attrs[Formbuilder.options.mappings.CONTROL_BUTTONS] = true
      attrs[Formbuilder.options.mappings.HIDE_LABEL] = false
      attrs['field_options'] = {}
      Formbuilder.fields[field_type].defaultAttributes?(attrs) || attrs

    simple_format: (x) ->
      x?.replace(/\n/g, '<br />')

  @options:
    BUTTON_CLASS: 'fb-button'
    HTTP_ENDPOINT: ''
    HTTP_METHOD: 'POST'
    AUTOSAVE: false
    CLEAR_FIELD_CONFIRM: false

    mappings:
      SIZE: 'field_options.size'
      UNITS: 'field_options.units'
      LABEL: 'label'
      FIELD_TYPE: 'field_type'
      REQUIRED: 'required'
      ADMIN_ONLY: 'admin_only'
      OPTIONS: 'field_options.options'
      DESCRIPTION: 'field_options.description'
      INCLUDE_OTHER: 'field_options.include_other_option'
      INCLUDE_BLANK: 'field_options.include_blank_option'
      MIN: 'field_options.min'
      MAX: 'field_options.max'
      MINLENGTH: 'field_options.minlength'
      MAXLENGTH: 'field_options.maxlength'
      LENGTH_UNITS: 'field_options.min_max_length_units'
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
      CLASSIFIER: 'field_options.classifier'
      MULTI_SELECT: 'field_options.multi_select',
      SAVE_TO: 'save_to',
      CONTROL_BUTTONS: 'field_options.control_buttons',
      HIDE_LABEL: 'field_options.hide_label',

    dict:
      ALL_CHANGES_SAVED: 'All changes saved'
      SAVE_FORM: 'Save form'
      UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'

  @fields: {}
  @inputFields: {}
  @nonInputFields: {}

  @registerField: (name, opts) ->
    for x in ['view', 'edit']
      opts[x] = _.template(opts[x])

    opts.field_type = name

    Formbuilder.fields[name] = opts

    if opts.type == 'non_input'
      Formbuilder.nonInputFields[name] = opts
    else
      Formbuilder.inputFields[name] = opts

  constructor: (opts={}) ->
    _.extend @, Backbone.Events
    args = _.extend opts, {formBuilder: @}
    @mainView = new BuilderView args

window.Formbuilder = Formbuilder

if module?
  module.exports = Formbuilder
else
  window.Formbuilder = Formbuilder
