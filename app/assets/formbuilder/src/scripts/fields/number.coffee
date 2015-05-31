Formbuilder.registerField 'number',

  order: 3

  view: """
    <input type='text' />
    <% if (units = rf.get(Formbuilder.options.mappings.UNITS)) { %>
      <%= units %>
    <% } %>
  """

  edit: """
  """

  addButton: """
    <span class="symbol"><span class="fa fa-number">123</span></span> Skaitlis
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs