Formbuilder.registerField 'table_break',

  order: 17

  view: """
  """

  edit: """
  """

  addButton: """
    <span class='symbol'><span class='fa fa-text-width'></span></span> Tabulas atdalījums
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = false
    attrs
