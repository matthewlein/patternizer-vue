import $ from 'jquery';

export default {
  props: ['value'],
  template: `<label class="rotation__label">
              Rotationº
              <canvas id='rotator' width='49' height='49' class='rotation__canvas rotator' data-rotator></canvas>
              <div class="rotation__input-wrapper">
                <input class="rotation__input" type='number' data-rotator-input>
              </div>
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
};
