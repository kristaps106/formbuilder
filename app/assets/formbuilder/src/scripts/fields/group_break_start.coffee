Formbuilder.registerField 'group_break_start',

  order: 10

  view: """
  """

  edit: """
  """

  addButton: """
    <span class='symbol'><span class='fa fa-th-large'></span></span> Sākt grupēt
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = false
    attrs
