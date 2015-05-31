Formbuilder.registerField 'paragraph',

  order: 2

  view: """
    <textarea class='rf-size-<%= rf.get(Formbuilder.options.mappings.SIZE) %>'></textarea>
  """

  edit: """
    <%= Formbuilder.templates['edit/min_max_length']() %>
  """

  addButton: """
    <span class="symbol">&#182;</span> Paragrāfa teksts
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.size = 'small'
    attrs
