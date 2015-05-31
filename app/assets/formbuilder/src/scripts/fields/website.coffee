Formbuilder.registerField 'website',

  order: 15

  view: """
    <input type='text' placeholder='http://' />
  """

  edit: """
  """

  addButton: """
    <span class="symbol"><span class="fa fa-link"></span></span> Mājas lapa
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs