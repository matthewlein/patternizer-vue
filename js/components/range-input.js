export default {
  props: ['value', 'name', 'min', 'max'],
  template: `<label class="controls__label">
              <span class="controls__label-text">{{name}}</span>
              <div class="controls__range">
                <input class="range" :value="value" type="range" @input="onRangeChange" :min="min" :max="max">
              </div>
              <div class="controls__range-input-wrapper">
                <input class="controls__range-input" :value="value" type="number" @change="onRangeChange" :min="min" :max="max">
              </div>
            </label>`,
  mounted() {
  },
  watch: {
  },
  methods: {
    onRangeChange(event) {
      const value = event.target.value;
      this.$emit('input', Number(value));
    },
  },
};
