Vue.component('rotation-input', {
  template: `<label for="rotationInput" class="clearfix" id="rotationLabel">
              <span class="rotationText">Rotation</span><span class="degrees">º</span>
              <input name="rotationInput" value="" id="rotationInput" class="control">
              <canvas id="rotator" width="49" height="49"></canvas>
            </label>`,
  mounted: function () {

  },
});

Vue.component('color-picker', {
  props: ['value'],
  template: `<div class="color-picker">
               <input type="text" data-colorpicker-input>
               <div data-colorpicker-wrapper></div>
             </div>`,
  mounted: function () {
    const vm = this;
    // farbtastic $.browser fix
    $.browser = {msie: false}
    const $wrapper = $(this.$el).find('[data-colorpicker-wrapper]')
    const $input = $(this.$el).find('[data-colorpicker-input]')
    $.farbtastic($wrapper, {
      callback: $input,
      width: 150,
      height: 150
    }).setColor(this.value);
    $input.on('change', function () {
      vm.$emit('input', this.value)
      console.log(this.value);
    })
  },
  watch: {
    value: function (value) {
      const $wrapper = $(this.$el).find('[data-colorpicker-wrapper]')
      $.farbtastic($wrapper).setColor(value);
      // $(this.$el).find('[data-colorpicker-input]').val(value).trigger('change');
    },
  }
});


var app = new Vue({
  el: '#app',
  data: {
    currentStripeId: 0,
    stripes: [
      {
        color: '#a03ad6',
        rotation: 200,
        opacity: 50,
        plaid: true,
        width: 10,
        gap: 10,
        offset: 0,
        visible: true
      },
      {
        color: '#FFB4D6',
        rotation: 45,
        opacity: 80,
        plaid: false,
        width: 30,
        gap: 10,
        offset: 0,
        visible: true
      }
    ],
    bg: '#bb1a1a',
  },
  methods: {
    onRangeChange() {
      const name = event.target.name;
      const value = event.target.value;
      this.stripes[this.currentStripeId][name] = Number(value);
    },
    onStripeClick() {
      this.currentStripeId = getElementIndex(event.currentTarget);
    },
    removeStripe(index) {
      this.stripes.splice(index, 1);
    },
    getStripeActiveClass(index) {
      if (this.currentStripeId === index) {
        return 'active';
      } else {
        return null;
      }
    },
    onSortUpdate(event) {
      this.currentStripeId = event.newIndex;
    },
  }
})


function getElementIndex(node) {
  var index = 0;
  while ( (node = node.previousElementSibling) ) {
    index++;
  }
  return index;
}
