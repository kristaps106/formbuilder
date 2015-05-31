Formbuilder.registerField 'time',

  order: 7

  view: """
    <div class='input-line'>
      <span class='hours'>
        <input type="text" />
        <label>HH</label>
      </span>

      <span class='above-line'>:</span>

      <span class='minutes'>
        <input type="text" />
        <label>MM</label>
      </span>

      <span class='above-line'>:</span>

      <span class='seconds'>
        <input type="text" />
        <label>SS</label>
      </span>

      <span class='am_pm'>
        <select>
          <option>AM</option>
          <option>PM</option>
        </select>
      </span>
    </div>
  """

  edit: ""

  addButton: """
    <span class="symbol"><span class="fa fa-clock-o"></span></span> Laiks
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.control_buttons = true
    attrs