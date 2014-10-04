import Em from 'ember';

var get = Em.get;

var defaultFilter = function(value) { console.log('value', value); return value; };

var defaultGate = function(value, lastValue) { return value !== lastValue; };

export default function(dependentKey, filter, gate) {
  filter = filter || defaultFilter;
  gate = gate || defaultGate;

  var computed = Em.computed(function handler(key) {

    var lastValueKey = '__changeGate%@LastValue'.fmt(key);

    var isFirstRun = !this.hasOwnProperty(lastValueKey);
    if (isFirstRun) { //setup an observer which is responsible for notifying property changes
      this[lastValueKey] = filter.call(this, get(this, dependentKey));

      this.addObserver(dependentKey, function() {
        var newValue = filter.call(this, get(this, dependentKey));
        var lastValue = this[lastValueKey];

        if (gate.call(this, newValue, lastValue)) {
          this[lastValueKey] = newValue;
          this.notifyPropertyChange(key);
        }
      });
    }

    return this[lastValueKey];
  });

  return computed;
}
