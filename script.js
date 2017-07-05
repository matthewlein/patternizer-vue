var app = new Vue({
  el: '#app',
  data: {
    currentStripeId: 0,
    stripes: [
      {
        color: '#a03ad6',
        rotation: 200,
        opacity: 50,
        mode: 'plaid',
        width: 10,
        gap: 10,
        offset: 0
      },
      {
        color: '#FFB4D6',
        rotation: 45,
        opacity: 80,
        mode: 'normal',
        width: 30,
        gap: 10,
        offset: 0
      }
    ],
    bg: '#bb1a1a'
  },
  methods: {
    onRangeChange: function() {
      const name = event.target.name;
      const value = event.target.value;
      this.stripes[this.currentStripeId][name] = value;
    },
    onStripeClick: function() {
      const idx = getElementIndex(event.currentTarget);
      this.currentStripeId = idx;
    },
    getStripeActiveClass: function(index) {
      if (this.currentStripeId === index) {
        return 'active';
      } else {
        return null;
      }
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
