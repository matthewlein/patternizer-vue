import $ from 'jquery';
import 'patternizer';

export default {
  props: ['value'],
  template: `<section class="preview">
               <canvas class="preview__canvas" data-patternizer></canvas>
             </section>`,
  mounted() {
    this.canvas = $(this.$el).find('[data-patternizer]')[0];
    this.ctx = this.canvas.getContext('2d');
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  },
  watch: {
    value() {
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
    onResize() {
      this.canvas.width = this.$el.offsetWidth;
      this.canvas.height = this.$el.offsetHeight;
      this.renderPattern();
    },
  },
};
