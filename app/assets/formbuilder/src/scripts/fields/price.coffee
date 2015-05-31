Formbuilder.registerField 'price',

  order: 9

  view: """
    <div class='input-line'>
      <span class='above-line'>&euro;</span>
      <span class='dolars'>
        <input type='text' />
        <label>Eiro</label>
      </span>
      <span class='above-line'>.</span>
      <span class='cents'>
        <input type='text' />
        <label>Centi</label>
      </span>
    </div>
  """

  edit: ""

  addButton: """
    <span class="symbol"><span class="fa fa-euro"></span></span> Cena
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs