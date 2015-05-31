Formbuilder.registerField 'address',

  order: 11

  view: """
    <div class='input-line'>
      <span class='street'>
        <input type='text' />
        <label>Adrese</label>
      </span>
    </div>

    <div class='input-line'>
      <span class='city'>
        <input type='text' />
        <label>Pilsēta</label>
      </span>

      <span class='state'>
        <input type='text' />
        <label>Novads / Pagasts</label>
      </span>
    </div>

    <div class='input-line'>
      <span class='zip'>
        <input type='text' />
        <label>Pasta indekss</label>
      </span>

      <span class='country'>
        <select><option>Latvija</option></select>
        <label>Valsts</label>
      </span>
    </div>
  """

  edit: ""

  addButton: """
    <span class="symbol"><span class="fa fa-home"></span></span> Adrese
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs
