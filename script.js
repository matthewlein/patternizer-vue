Vue.component('rotation-input', {
  props: ['value'],
  template: `<label>
              Rotationº
              <input type="number" data-rotator-input>
              <canvas id="rotator" width="49" height="49" class="rotator" data-rotator></canvas>
            </label>`,
  mounted: function() {
    var $rotator = $(this.$el).find('[data-rotator]')
    var rotator = $rotator[0];
    var $rotationInput = $(this.$el).find('[data-rotator-input]');
    var rCenter = rotator.width/2
    var rCtx = rotator.getContext('2d')
    rCtx.translate( rCenter, rCenter )
    rotator.addEventListener('mousedown', this.onPress, false)
    $rotationInput.on('change', this.onRotationInputChange );
    $rotationInput.val(this.value);
    this.setRotation(this.value);
  },
  watch: {
    value: function (value) {
      var $rotationInput = $(this.$el).find('[data-rotator-input]');
      $rotationInput.val(this.value).trigger('change');
      this.setRotation(this.value);
    },
  },
  methods: {
    deg_rad(deg) {
      return (Math.PI/180)*deg;
    },
    rad_deg(rad) {
      return rad*(180/Math.PI);
    },
    onPress(event) {
      event.preventDefault();
      document.addEventListener('mousemove', this.dragRotation, false);
      document.addEventListener('mouseup', this.onRelease, false);
      this.dragRotation(event)
    },
    dragRotation(event) {
      var degrees = this.getRotationDegrees(event);
      this.$emit('input', degrees);
    },
    onRelease() {
      document.removeEventListener('mousemove', this.dragRotation, false);
    },
    getRotationDegrees(event) {
      var coords = this.getNormalizedCoordinates(event);
      var x = coords.x;
      var y = coords.y;
      var degrees = Math.round( this.rad_deg( Math.atan( y / x ) ) )

      if ( x >= 0 && y <= 0 || x >= 0 && y >= 0 ) {
        //top right
        degrees += 90
      } else {
        //bottom left
        degrees += 270
      }
      return degrees;
    },
    getNormalizedCoordinates(event) {
      var rotator = document.getElementById('rotator')
      var rCenter = rotator.width/2
      var x = event.pageX - ( $(rotator).offset().left + rCenter )
      var y = event.pageY - ( $(rotator).offset().top + rCenter )
      var hyp = Math.sqrt( (x * x) + (y * y) )
      var mult = rCenter / hyp

      //normalize to circle size
      x = Math.round( x * mult )
      y = Math.round( y * mult )
      return {
        x: x,
        y: y
      }
    },
    setRotation(angle) {
      var rotator = document.getElementById('rotator')
      var rCenter = rotator.width/2
      var hyp = rCenter
      var degrees = angle || 0
      var rads = this.deg_rad(degrees)

      // not sure why this is negative
      var adj = -Math.round( hyp * Math.cos( rads ) )
      var opp = Math.round( hyp * Math.sin( rads ) )

      this.drawShapes( opp, adj );
    },
    drawShapes( x, y ) {
      var rotator = document.getElementById('rotator')
      var rCtx = rotator.getContext('2d')
      var rCenter = rotator.width/2
      //clear
      rCtx.clearRect(-rCenter, -rCenter, rotator.width, rotator.height)

      //angle line
      rCtx.strokeStyle = '#666';
      rCtx.lineWidth = 3;
      rCtx.beginPath();
      rCtx.moveTo(0,0);
      rCtx.lineTo(x, y);
      rCtx.closePath();
      rCtx.stroke();
    },
    onRotationInputChange(event) {
      var $this = $(event.target);
      var angle = Number( $this.val() )
      if (angle > 360) {
        angle -= 360
      } else if (angle < 0 ) {
        angle += 360
      }
      this.$emit('input', angle);
    }
  }
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
    })
  },
  watch: {
    value: function (value) {
      const $wrapper = $(this.$el).find('[data-colorpicker-wrapper]')
      $.farbtastic($wrapper).setColor(value);
    },
  }
});


Vue.component('patternizer', {
  props: ['value'],
  template: `<canvas data-patternizer></canvas>`,
  mounted: function () {
    this.canvas = this.$el;
    this.ctx = this.canvas.getContext('2d');
    this.renderPattern();
  },
  watch: {
    value: function (value) {
      this.renderPattern();
    },
  },
  methods: {
    clearCanvas() {
      this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height )
    },
    renderPattern() {
      this.clearCanvas();
      this.canvas.patternizer(this.value)
    },
  }
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
      visible: true
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
      visible: true
    }
  ],
  bg: '#bb1a1a',
};

function migratePatternData(data) {
  const newData = Object.assign({}, data);
  const stripes = newData.stripes.map(function(stripe) {
    const clone = Object.assign({}, stripe);
    if (clone.hasOwnProperty('mode')) {
      clone.plaid = (clone.mode === 'plaid');
      delete clone.mode;
    }
    return clone;
  });
  newData.stripes = stripes;
  return newData;
}

var app = new Vue({
  el: '#app',
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
      var classes = [];
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
      var index = 0;
      while ( (node = node.previousElementSibling) ) {
        index++;
      }
      return index;
    },
    dataFiltered: function() {
      const visibleStripes = this.stripes.filter(function(stripe){ return stripe.visible === true })
      const stripesCleaned = visibleStripes.map(function(stripe) {
        const clone = Object.assign({}, stripe);
        delete clone.visible;
        return clone;
      })
      return {
        stripes: stripesCleaned,
        bg: this.bg
      }
    }
  },
});
