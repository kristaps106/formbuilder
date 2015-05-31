Formbuilder.registerField 'text_break',

  order: 14

  view: """
  """

  edit: """
  """

  addButton: """
    <span class='symbol'><span class='fa fa-text-width'></span></span> Teksta līnija
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = false
    attrs
