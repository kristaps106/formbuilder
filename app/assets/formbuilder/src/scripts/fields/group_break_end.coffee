Formbuilder.registerField 'group_break_end',

  order: 12

  view: """
  """

  edit: """
  """

  addButton: """
    <span class='symbol'><span class='fa fa-th-large'></span></span> Pārtraukt grupēt
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = false
    attrs
