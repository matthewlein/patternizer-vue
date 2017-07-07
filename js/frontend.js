import Vue from 'vue';
import draggable from 'vuedraggable';
import $ from 'jquery';
import 'farbtastic';
import 'patternizer';

Vue.component('rotation-input', {
  props: ['value'],
  template: `<label>
              Rotationº
              <input type='number' data-rotator-input>
              <canvas id='rotator' width='49' height='49' class='rotator' data-rotator></canvas>
            </label>`,
  mounted() {
    this.$rotator = $(this.$el).find('[data-rotator]');
    this.rotator = this.$rotator[0];
    this.$rotationInput = $(this.$el).find('[data-rotator-input]');
    this.rCenter = this.rotator.width / 2;
    this.rCtx = this.rotator.getContext('2d');
    this.rCtx.translate(this.rCenter, this.rCenter);

    this.rotator.addEventListener('mousedown', this.onPress, false);
    this.$rotationInput.on('change', this.onRotationInputChange);
    this.$rotationInput.val(this.value);
    this.setRotation(this.value);
  },
  watch: {
    value() {
      this.$rotationInput = $(this.$el).find('[data-rotator-input]');
      this.$rotationInput.val(this.value).trigger('change');
      this.setRotation(this.value);
    },
  },
  methods: {
    deg_rad(deg) {
      return Math.PI / 180 * deg;
    },
    rad_deg(rad) {
      return rad * (180 / Math.PI);
    },
    onPress(event) {
      event.preventDefault();
      document.addEventListener('mousemove', this.dragRotation, false);
      document.addEventListener('mouseup', this.onRelease, false);
      this.dragRotation(event);
    },
    dragRotation(event) {
      const degrees = this.getRotationDegrees(event);
      this.$emit('input', degrees);
    },
    onRelease() {
      document.removeEventListener('mousemove', this.dragRotation, false);
    },
    getRotationDegrees(event) {
      const coords = this.getNormalizedCoordinates(event);
      const x = coords.x;
      const y = coords.y;
      let degrees = Math.round(this.rad_deg(Math.atan(y / x)));

      if ((x >= 0 && y <= 0) || (x >= 0 && y >= 0)) {
        // top right
        degrees += 90;
      } else {
        // bottom left
        degrees += 270;
      }
      return degrees;
    },
    getNormalizedCoordinates(event) {
      let x = event.pageX - (this.$rotator.offset().left + this.rCenter);
      let y = event.pageY - (this.$rotator.offset().top + this.rCenter);
      const hyp = Math.sqrt((x * x) + (y * y));
      const mult = this.rCenter / hyp;

      // normalize to circle size
      x = Math.round(x * mult);
      y = Math.round(y * mult);
      return {
        x,
        y,
      };
    },
    setRotation(angle) {
      const hyp = this.rCenter;
      const degrees = angle || 0;
      const rads = this.deg_rad(degrees);
      const adj = -Math.round(hyp * Math.cos(rads));
      const opp = Math.round(hyp * Math.sin(rads));

      this.drawShapes(opp, adj);
    },
    drawShapes(x, y) {
      this.rCtx.clearRect(-this.rCenter, -this.rCenter, this.rotator.width, this.rotator.height);
      // angle line
      this.rCtx.strokeStyle = '#666';
      this.rCtx.lineWidth = 3;
      this.rCtx.beginPath();
      this.rCtx.moveTo(0, 0);
      this.rCtx.lineTo(x, y);
      this.rCtx.closePath();
      this.rCtx.stroke();
    },
    onRotationInputChange(event) {
      let angle = Number($(event.target).val());
      if (angle > 360) {
        angle -= 360;
      } else if (angle < 0) {
        angle += 360;
      }
      this.$emit('input', angle);
    },
  },
});

Vue.component('color-picker', {
  props: ['value'],
  template: `<div class='color-picker'>
               <input type='text' data-colorpicker-input>
               <div data-colorpicker-wrapper></div>
             </div>`,
  mounted() {
    const vm = this;
    // farbtastic $.browser fix
    $.browser = { msie: false };
    this.$wrapper = $(this.$el).find('[data-colorpicker-wrapper]');
    const $input = $(this.$el).find('[data-colorpicker-input]');
    $.farbtastic(this.$wrapper, {
      callback: $input,
      width: 150,
      height: 150,
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
});

Vue.component('patternizer', {
  props: ['value'],
  template: '<canvas data-patternizer></canvas>',
  mounted() {
    this.canvas = this.$el;
    this.ctx = this.canvas.getContext('2d');
    this.renderPattern();
  },
  watch: {
    value(value) {
      this.renderPattern();
    },
  },
  methods: {
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    renderPattern() {
      this.clearCanvas();
      this.canvas.patternizer(this.value);
    },
  },
});

window.pattern = {
  stripes: [
    {
      color: '#a03ad6',
      rotation: 200,
      opacity: 50,
      // plaid: true,
      mode: 'plaid',
      width: 10,
      gap: 10,
      offset: 0,
      visible: true,
    },
    {
      color: '#FFB4D6',
      rotation: 45,
      opacity: 80,
      // plaid: false,
      mode: 'normal',
      width: 30,
      gap: 10,
      offset: 0,
      visible: true,
    },
  ],
  bg: '#bb1a1a',
};

function migratePatternData(data) {
  const newData = Object.assign({}, data);
  const stripes = newData.stripes.map(function(stripe) {
    const clone = Object.assign({}, stripe);
    if (Object.prototype.hasOwnProperty.call(clone, 'mode')) {
      clone.plaid = clone.mode === 'plaid';
      delete clone.mode;
    }
    return clone;
  });
  newData.stripes = stripes;
  return newData;
}

const app = new Vue({
  el: '#app',
  components: {
    draggable,
  },
  data: Object.assign(
    {},
    {
      currentStripeId: 0,
    },
    migratePatternData(window.pattern)
  ),
  methods: {
    onRangeChange() {
      const name = event.target.name;
      const value = event.target.value;
      this.stripes[this.currentStripeId][name] = Number(value);
    },
    onStripeClick() {
      this.currentStripeId = this.getElementIndex(event.currentTarget);
    },
    removeStripe(index) {
      this.stripes.splice(index, 1);
    },
    getStripeClasses(index) {
      const classes = [];
      if (this.currentStripeId === index) {
        classes.push('active');
      }
      if (!this.stripes[index].visible) {
        classes.push('hidden');
      }
      return classes.join(' ');
    },
    onSortUpdate(event) {
      this.currentStripeId = event.newIndex;
    },
    onNewStripe() {
      const newStripe = Object.assign({}, this.stripes[this.currentStripeId]);
      this.stripes.unshift(newStripe);
      this.currentStripeId = 0;
    },
    getElementIndex(node) {
      let index = 0;
      while ((node = node.previousElementSibling)) {
        index += 1;
      }
      return index;
    },
    dataFiltered() {
      const visibleStripes = this.stripes.filter(function(stripe) {
        return stripe.visible === true;
      });
      const stripesCleaned = visibleStripes.map(function(stripe) {
        const clone = Object.assign({}, stripe);
        delete clone.visible;
        return clone;
      });
      return {
        stripes: stripesCleaned,
        bg: this.bg,
      };
    },
  },
});
