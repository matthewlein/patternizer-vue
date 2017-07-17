import $ from 'jquery';
import 'farbtastic';

export default {
  props: ['value', 'name', 'top'],
  template: `<div class='color-picker'>
                <label class="color-picker__label">
                  <span class="color-picker__label-text">{{ name }}</span>
                  <div class="color-picker__input-wrapper">
                    <input type='text' class="color-picker__input" data-colorpicker-input>
                    <div class="color-picker__picker" :class="{ 'color-picker__picker--top' : top}" data-colorpicker-wrapper></div>
                  </div>
                </label>
              </div>`,
  mounted() {
    const vm = this;
    // farbtastic $.browser fix
    $.browser = { msie: false };
    this.$wrapper = $(this.$el).find('[data-colorpicker-wrapper]');
    const $input = $(this.$el).find('[data-colorpicker-input]');
    $.farbtastic(this.$wrapper, {
      callback: $input,
      width: 200,
      height: 200,
    }).setColor(this.value);
    $input.on('change', this.updateValue);
  },
  methods: {
    updateValue(event) {
      this.$emit('input', event.target.value);
    },
  },
  watch: {
    value(value) {
      $.farbtastic(this.$wrapper).setColor(value);
    },
  },
}
