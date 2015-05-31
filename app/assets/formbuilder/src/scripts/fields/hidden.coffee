Formbuilder.registerField 'hidden',

  order: 16

  view: """
    <input type='hidden' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />
  """

  edit: """
  """

  addButton: """
    <span class='symbol'><span class='fa fa-minus-square-o'></span></span> Slēpts lauks
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = false
    attrs
