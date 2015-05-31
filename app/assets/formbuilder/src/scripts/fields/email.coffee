Formbuilder.registerField 'email',

  order: 13

  view: """
    <input type='text' class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>' />
  """

  edit: ""

  addButton: """
    <span class="symbol"><span class="fa fa-envelope-o"></span></span> E-pasts
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs