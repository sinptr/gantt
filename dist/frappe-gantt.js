(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Gantt = factory());
}(this, function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var YEAR = 'year';
  var MONTH = 'month';
  var DAY = 'day';
  var HOUR = 'hour';
  var MINUTE = 'minute';
  var SECOND = 'second';
  var MILLISECOND = 'millisecond';

  var month_names = {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      ptBr: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  };

  var date_utils = {
      parse: function parse(date) {
          var date_separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
          var time_separator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : /[.:]/;

          if (date instanceof Date) {
              return date;
          }
          if (typeof date === 'string') {
              var date_parts = void 0,
                  time_parts = void 0;
              var parts = date.split(' ');

              date_parts = parts[0].split(date_separator).map(function (val) {
                  return parseInt(val, 10);
              });
              time_parts = parts[1] && parts[1].split(time_separator);

              // month is 0 indexed
              date_parts[1] = date_parts[1] - 1;

              var vals = date_parts;

              if (time_parts && time_parts.length) {
                  if (time_parts.length == 4) {
                      time_parts[3] = '0.' + time_parts[3];
                      time_parts[3] = parseFloat(time_parts[3]) * 1000;
                  }
                  vals = vals.concat(time_parts);
              }

              return new (Function.prototype.bind.apply(Date, [null].concat(toConsumableArray(vals))))();
          }
      },
      to_string: function to_string(date) {
          var with_time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (!(date instanceof Date)) {
              throw new TypeError('Invalid argument type');
          }
          var vals = this.get_date_values(date).map(function (val, i) {
              if (i === 1) {
                  // add 1 for month
                  val = val + 1;
              }

              if (i === 6) {
                  return padStart(val + '', 3, '0');
              }

              return padStart(val + '', 2, '0');
          });
          var date_string = vals[0] + '-' + vals[1] + '-' + vals[2];
          var time_string = vals[3] + ':' + vals[4] + ':' + vals[5] + '.' + vals[6];

          return date_string + (with_time ? ' ' + time_string : '');
      },
      format: function format(date) {
          var format_string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY-MM-DD HH:mm:ss.SSS';
          var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';

          var values = this.get_date_values(date).map(function (d) {
              return padStart(d, 2, 0);
          });
          var format_map = {
              YYYY: values[0],
              MM: padStart(+values[1] + 1, 2, 0),
              DD: values[2],
              HH: values[3],
              mm: values[4],
              ss: values[5],
              SSS: values[6],
              D: values[2],
              MMMM: month_names[lang][+values[1]],
              MMM: month_names[lang][+values[1]]
          };

          var str = format_string;
          var formatted_values = [];

          Object.keys(format_map).sort(function (a, b) {
              return b.length - a.length;
          }) // big string first
          .forEach(function (key) {
              if (str.includes(key)) {
                  str = str.replace(key, '$' + formatted_values.length);
                  formatted_values.push(format_map[key]);
              }
          });

          formatted_values.forEach(function (value, i) {
              str = str.replace('$' + i, value);
          });

          return str;
      },
      diff: function diff(date_a, date_b) {
          var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DAY;
          var precise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

          var milliseconds = void 0,
              seconds = void 0,
              hours = void 0,
              minutes = void 0,
              days = void 0,
              months = void 0,
              years = void 0;

          milliseconds = date_a - date_b;
          seconds = milliseconds / 1000;
          minutes = seconds / 60;
          hours = minutes / 60;
          days = hours / 24;
          months = days / 30;
          years = months / 12;

          if (!scale.endsWith('s')) {
              scale += 's';
          }

          var result = {
              milliseconds: milliseconds,
              seconds: seconds,
              minutes: minutes,
              hours: hours,
              days: days,
              months: months,
              years: years
          }[scale];

          return precise ? result : Math.floor(result);
      },
      today: function today() {
          var vals = this.get_date_values(new Date()).slice(0, 3);
          return new (Function.prototype.bind.apply(Date, [null].concat(toConsumableArray(vals))))();
      },
      now: function now() {
          return new Date();
      },
      add: function add(date, qty, scale) {
          qty = parseInt(qty, 10);
          var vals = [date.getFullYear() + (scale === YEAR ? qty : 0), date.getMonth() + (scale === MONTH ? qty : 0), date.getDate() + (scale === DAY ? qty : 0), date.getHours() + (scale === HOUR ? qty : 0), date.getMinutes() + (scale === MINUTE ? qty : 0), date.getSeconds() + (scale === SECOND ? qty : 0), date.getMilliseconds() + (scale === MILLISECOND ? qty : 0)];
          return new (Function.prototype.bind.apply(Date, [null].concat(vals)))();
      },
      start_of: function start_of(date, scale) {
          var _scores;

          var scores = (_scores = {}, defineProperty(_scores, YEAR, 6), defineProperty(_scores, MONTH, 5), defineProperty(_scores, DAY, 4), defineProperty(_scores, HOUR, 3), defineProperty(_scores, MINUTE, 2), defineProperty(_scores, SECOND, 1), defineProperty(_scores, MILLISECOND, 0), _scores);

          function should_reset(_scale) {
              var max_score = scores[scale];
              return scores[_scale] <= max_score;
          }

          var vals = [date.getFullYear(), should_reset(YEAR) ? 0 : date.getMonth(), should_reset(MONTH) ? 1 : date.getDate(), should_reset(DAY) ? 0 : date.getHours(), should_reset(HOUR) ? 0 : date.getMinutes(), should_reset(MINUTE) ? 0 : date.getSeconds(), should_reset(SECOND) ? 0 : date.getMilliseconds()];

          return new (Function.prototype.bind.apply(Date, [null].concat(vals)))();
      },
      clone: function clone(date) {
          return new (Function.prototype.bind.apply(Date, [null].concat(toConsumableArray(this.get_date_values(date)))))();
      },
      get_date_values: function get_date_values(date) {
          return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
      },
      get_days_in_month: function get_days_in_month(date) {
          var no_of_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

          var month = date.getMonth();

          if (month !== 1) {
              return no_of_days[month];
          }

          // Feb
          var year = date.getFullYear();
          if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
              return 29;
          }
          return 28;
      }
  };

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
  function padStart(str, targetLength, padString) {
      str = str + '';
      targetLength = targetLength >> 0;
      padString = String(typeof padString !== 'undefined' ? padString : ' ');
      if (str.length > targetLength) {
          return String(str);
      } else {
          targetLength = targetLength - str.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength / padString.length);
          }
          return padString.slice(0, targetLength) + String(str);
      }
  }

  function $(expr, con) {
      return typeof expr === 'string' ? (con || document).querySelector(expr) : expr || null;
  }

  function createSVG(tag, attrs) {
      var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (var attr in attrs) {
          if (attr === 'append_to') {
              var parent = attrs.append_to;
              parent.appendChild(elem);
          } else if (attr === 'innerHTML') {
              elem.innerHTML = attrs.innerHTML;
          } else if (attr === 'clipPath') {
              elem.setAttribute('clip-path', 'url(#' + attrs[attr] + ')');
          } else {
              elem.setAttribute(attr, attrs[attr]);
          }
      }
      return elem;
  }

  function animateSVG(svgElement, attr, from, to) {
      var animatedSvgElement = getAnimationElement(svgElement, attr, from, to);

      if (animatedSvgElement === svgElement) {
          // triggered 2nd time programmatically
          // trigger artificial click event
          var event = document.createEvent('HTMLEvents');
          event.initEvent('click', true, true);
          event.eventName = 'click';
          animatedSvgElement.dispatchEvent(event);
      }
  }

  function getAnimationElement(svgElement, attr, from, to) {
      var dur = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0.4s';
      var begin = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '0.1s';

      var animEl = svgElement.querySelector('animate');
      if (animEl) {
          $.attr(animEl, {
              attributeName: attr,
              from: from,
              to: to,
              dur: dur,
              begin: 'click + ' + begin // artificial click
          });
          return svgElement;
      }

      var animateElement = createSVG('animate', {
          attributeName: attr,
          from: from,
          to: to,
          dur: dur,
          begin: begin,
          calcMode: 'spline',
          values: from + ';' + to,
          keyTimes: '0; 1',
          keySplines: cubic_bezier('ease-out')
      });
      svgElement.appendChild(animateElement);

      return svgElement;
  }

  function cubic_bezier(name) {
      return {
          ease: '.25 .1 .25 1',
          linear: '0 0 1 1',
          'ease-in': '.42 0 1 1',
          'ease-out': '0 0 .58 1',
          'ease-in-out': '.42 0 .58 1'
      }[name];
  }

  $.on = function (element, event, selector, callback) {
      if (!callback) {
          callback = selector;
          $.bind(element, event, callback);
      } else {
          $.delegate(element, event, selector, callback);
      }
  };

  $.off = function (element, event, handler) {
      element.removeEventListener(event, handler);
  };

  $.bind = function (element, event, callback) {
      event.split(/\s+/).forEach(function (event) {
          element.addEventListener(event, callback);
      });
  };

  $.delegate = function (element, event, selector, callback) {
      element.addEventListener(event, function (e) {
          var delegatedTarget = e.target.closest(selector);
          if (delegatedTarget) {
              e.delegatedTarget = delegatedTarget;
              callback.call(this, e, delegatedTarget);
          }
      });
  };

  $.closest = function (selector, element) {
      if (!element) return null;

      if (element.matches(selector)) {
          return element;
      }

      return $.closest(selector, element.parentNode);
  };

  $.attr = function (element, attr, value) {
      if (!value && typeof attr === 'string') {
          return element.getAttribute(attr);
      }

      if ((typeof attr === 'undefined' ? 'undefined' : _typeof(attr)) === 'object') {
          for (var key in attr) {
              $.attr(element, key, attr[key]);
          }
          return;
      }

      element.setAttribute(attr, value);
  };

  var enums = {
      dependency: {
          types: {
              END_TO_START: 0,
              START_TO_START: 1
          }
      }
  };

  var Bar = function () {
      function Bar(gantt, task) {
          classCallCheck(this, Bar);

          this.set_defaults(gantt, task);
          this.prepare();
          this.draw();
          this.bind();
      }

      createClass(Bar, [{
          key: 'set_defaults',
          value: function set_defaults(gantt, task) {
              this.action_completed = false;
              this.gantt = gantt;
              this.task = task;
          }
      }, {
          key: 'prepare',
          value: function prepare() {
              this.prepare_values();
              this.prepare_helpers();
          }
      }, {
          key: 'prepare_values',
          value: function prepare_values() {
              this.invalid = this.task.invalid;
              this.height = this.gantt.options.bar_height;
              this.image_size = this.gantt.options.bar_height - 5;
              this.x = this.compute_x();
              this.y = this.compute_y();
              this.corner_radius = this.gantt.options.bar_corner_radius;
              this.duration = date_utils.diff(this.task._end, this.task._start, 'hour') / this.gantt.options.step;
              this.width = this.compute_width();
              this.progress_width = this.gantt.options.column_width * this.duration * (this.task.progress / 100) || 0;
              this.group = createSVG('g', {
                  class: 'bar-wrapper ' + (this.task.custom_class || ''),
                  'data-id': this.task.id,
                  transform: 'translate(' + this.x + ', ' + this.y + ')'
              });
              this.bar_group = createSVG('g', {
                  class: 'bar-group',
                  append_to: this.group
              });
              this.handle_group = createSVG('g', {
                  class: 'handle-group',
                  append_to: this.group
              });
          }
      }, {
          key: 'prepare_helpers',
          value: function prepare_helpers() {
              SVGElement.prototype.getX = function () {
                  return +this.getAttribute('x');
              };
              SVGElement.prototype.getY = function () {
                  return +this.getAttribute('y');
              };
              SVGElement.prototype.getWidth = function () {
                  return +this.getAttribute('width');
              };
              SVGElement.prototype.getHeight = function () {
                  return +this.getAttribute('height');
              };
              SVGElement.prototype.getEndX = function () {
                  return this.getX() + this.getWidth();
              };
          }
      }, {
          key: 'draw',
          value: function draw() {
              this.draw_bar();

              if (this.gantt.options.progress) {
                  this.draw_progress_bar();
              }

              this.draw_label();

              if (this.task.thumbnail) {
                  this.draw_thumbnail();
              }

              if (this.gantt.options.resizing) {
                  this.draw_resize_handles();
              }
          }
      }, {
          key: 'draw_bar',
          value: function draw_bar() {
              this.$bar = createSVG('rect', {
                  x: 0, //this.x,
                  y: 0, //this.y,
                  width: this.width,
                  height: this.height,
                  rx: this.corner_radius,
                  ry: this.corner_radius,
                  class: 'bar',
                  append_to: this.bar_group
              });

              animateSVG(this.$bar, 'width', 0, this.width);

              if (this.invalid) {
                  this.$bar.classList.add('bar-invalid');
              }
          }
      }, {
          key: 'draw_progress_bar',
          value: function draw_progress_bar() {
              if (this.invalid) return;
              this.$bar_progress = createSVG('rect', {
                  x: 0, //this.x,
                  y: 0, //this.y,
                  width: this.progress_width,
                  height: this.height,
                  rx: this.corner_radius,
                  ry: this.corner_radius,
                  class: 'bar-progress-gantt',
                  append_to: this.bar_group
              });

              animateSVG(this.$bar_progress, 'width', 0, this.progress_width);
          }
      }, {
          key: 'draw_label',
          value: function draw_label() {
              var _this = this;

              var x_coord = void 0;
              var padding = 5;

              if (this.task.img) {
                  x_coord = this.image_size + padding;
              } else {
                  x_coord = padding;
              }

              createSVG('text', {
                  x: x_coord,
                  y: this.height / 2,
                  innerHTML: this.task.name,
                  class: 'bar-label',
                  append_to: this.bar_group
              });
              // labels get BBox in the next tick
              requestAnimationFrame(function () {
                  return _this.update_label_position();
              });
          }
      }, {
          key: 'draw_thumbnail',
          value: function draw_thumbnail() {
              var x_offset = 10,
                  y_offset = 2;
              var defs = void 0,
                  clipPath = void 0;

              defs = createSVG('defs', {
                  append_to: this.bar_group
              });

              createSVG('rect', {
                  id: 'rect_' + this.task.id,
                  x: x_offset,
                  y: y_offset,
                  width: this.image_size,
                  height: this.image_size,
                  rx: '15',
                  class: 'img_mask',
                  append_to: defs
              });

              clipPath = createSVG('clipPath', {
                  id: 'clip_' + this.task.id,
                  append_to: defs
              });

              createSVG('use', {
                  href: '#rect_' + this.task.id,
                  append_to: clipPath
              });

              createSVG('image', {
                  x: x_offset,
                  y: y_offset,
                  width: this.image_size,
                  height: this.image_size,
                  class: 'bar-img',
                  href: this.task.thumbnail,
                  clipPath: 'clip_' + this.task.id,
                  append_to: this.bar_group
              });
          }
      }, {
          key: 'draw_resize_handles',
          value: function draw_resize_handles() {
              if (this.invalid) return;

              var bar = this.$bar;
              var handle_width = 8;

              createSVG('rect', {
                  x: bar.getX() + bar.getWidth() - 9,
                  y: bar.getY() + 1,
                  width: handle_width,
                  height: this.height - 2,
                  rx: this.corner_radius,
                  ry: this.corner_radius,
                  class: 'handle right',
                  append_to: this.handle_group
              });

              createSVG('rect', {
                  x: bar.getX() + 1,
                  y: bar.getY() + 1,
                  width: handle_width,
                  height: this.height - 2,
                  rx: this.corner_radius,
                  ry: this.corner_radius,
                  class: 'handle left',
                  append_to: this.handle_group
              });

              createSVG('circle', {
                  cx: bar.getX() - 10,
                  cy: bar.getY() + this.height / 2,
                  r: this.height / 6,
                  class: 'circle left',
                  append_to: this.handle_group
              });

              createSVG('circle', {
                  cx: bar.getX() + bar.getWidth() + 10,
                  cy: bar.getY() + this.height / 2,
                  r: this.height / 6,
                  class: 'circle right',
                  append_to: this.handle_group
              });

              if (this.task.progress && this.task.progress < 100) {
                  this.$handle_progress = createSVG('polygon', {
                      points: this.get_progress_polygon_points().join(','),
                      class: 'handle progress',
                      append_to: this.handle_group
                  });
              }
          }
      }, {
          key: 'get_progress_polygon_points',
          value: function get_progress_polygon_points() {
              var bar_progress = this.$bar_progress;
              return bar_progress && [bar_progress.getEndX() - 5, bar_progress.getY() + bar_progress.getHeight(), bar_progress.getEndX() + 5, bar_progress.getY() + bar_progress.getHeight(), bar_progress.getEndX(), bar_progress.getY() + bar_progress.getHeight() - 8.66] || [];
          }
      }, {
          key: 'bind',
          value: function bind() {
              if (this.invalid) return;
              this.setup_click_event();
          }
      }, {
          key: 'setup_click_event',
          value: function setup_click_event() {
              var _this2 = this;

              $.on(this.bar_group, 'focus ' + this.gantt.options.popup_trigger, function (e) {
                  if (_this2.action_completed) {
                      // just finished a move action, wait for a few seconds
                      return;
                  }

                  if (e.type === 'click') {
                      _this2.gantt.trigger_event('click', [_this2.task]);
                      _this2.show_popup();
                  }

                  _this2.gantt.unselect_all();
                  _this2.group.classList.toggle('active');
              });
          }
      }, {
          key: 'show_popup',
          value: function show_popup() {
              if (this.gantt.bar_being_dragged) return;

              var start_date = date_utils.format(this.task._start, 'MMM D', this.gantt.options.language);
              var end_date = date_utils.format(date_utils.add(this.task._end, -1, 'second'), 'MMM D', this.gantt.options.language);
              var subtitle = start_date + ' - ' + end_date;

              this.gantt.show_popup({
                  target_element: this.$bar,
                  title: this.task.name,
                  subtitle: subtitle,
                  task: this.task
              });
          }
      }, {
          key: 'update_bar_position',
          value: function update_bar_position(_ref) {
              var _this3 = this;

              var _ref$x = _ref.x,
                  x = _ref$x === undefined ? null : _ref$x,
                  _ref$y = _ref.y,
                  y = _ref$y === undefined ? null : _ref$y,
                  _ref$width = _ref.width,
                  width = _ref$width === undefined ? null : _ref$width;

              var bar = this.$bar;
              if (x) {
                  // get all x values of parent task
                  var xs = Array.from(this.task.dependencies, function (_ref2) {
                      var _ref3 = slicedToArray(_ref2, 2),
                          dep = _ref3[0],
                          type = _ref3[1];

                      var bar = _this3.gantt.get_bar(dep);
                      return type === enums.dependency.types.START_TO_START ? bar.x : bar.x + bar.$bar.getWidth();
                  });
                  // child task must not go before parent
                  var valid_x = xs.reduce(function (prev, curr) {
                      return x >= curr;
                  }, x);
                  if (!valid_x) {
                      this.x = Math.max.apply(Math, toConsumableArray(xs));
                  } else {
                      this.x = x;
                  }
              }
              if (y) {
                  this.y = y;
              }
              this.group.setAttribute('transform', 'translate(' + this.x + ', ' + this.y + ')');
              if (width && width >= this.gantt.options.column_width / this.gantt.options.step) {
                  this.update_attr(bar, 'width', width);
              }
              this.update_label_position();

              if (this.gantt.options.resizing) {
                  this.update_handle_position();
              }

              this.update_progressbar_position();
              this.update_arrow_position();
          }
      }, {
          key: 'update_label_position_on_horizontal_scroll',
          value: function update_label_position_on_horizontal_scroll(_ref4) {
              var x = _ref4.x,
                  sx = _ref4.sx;

              var container = document.querySelector('.gantt-container');
              var label = this.group.querySelector('.bar-label');
              var img = this.group.querySelector('.bar-img') || '';
              var img_mask = this.bar_group.querySelector('.img_mask') || '';

              var barWidthLimit = this.$bar.getX() + this.$bar.getWidth();
              var newLabelX = label.getX() + x;
              var newImgX = img && img.getX() + x || 0;
              var imgWidth = img && img.getBBox().width + 7 || 7;
              var labelEndX = newLabelX + label.getBBox().width + 7;
              var viewportCentral = sx + container.clientWidth / 2;

              if (label.classList.contains('big')) return;

              if (labelEndX < barWidthLimit && x > 0 && labelEndX < viewportCentral) {
                  label.setAttribute('x', newLabelX);
                  if (img) {
                      img.setAttribute('x', newImgX);
                      img_mask.setAttribute('x', newImgX);
                  }
              } else if (newLabelX - imgWidth > this.$bar.getX() && x < 0 && labelEndX > viewportCentral) {
                  label.setAttribute('x', newLabelX);
                  if (img) {
                      img.setAttribute('x', newImgX);
                      img_mask.setAttribute('x', newImgX);
                  }
              }
          }
      }, {
          key: 'compute_width',
          value: function compute_width() {
              return date_utils.diff(this.task._end, this.task._start, 'hour') / this.gantt.options.step * this.gantt.options.column_width;
          }
      }, {
          key: 'date_changed',
          value: function date_changed() {
              var resizing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

              var _compute_start_end_da = this.compute_start_end_date(),
                  new_start_date = _compute_start_end_da.new_start_date,
                  new_end_date = _compute_start_end_da.new_end_date;

              var calendar = this.gantt.calendar;

              if (resizing) {
                  this.task.duration = calendar.computeTaskDuration(calendar.placeDateInWorkingRange(new_start_date), calendar.placeDateInWorkingRange(new_end_date));
                  new_end_date = calendar.placeDateInWorkingRange(new_end_date);
              }
              new_start_date = calendar.placeDateInWorkingRange(new_start_date);
              if (!resizing) {
                  new_end_date = calendar.computeTaskEndDate(new_start_date, this.task.duration);
              }

              var changed = +new_start_date !== +this.task._start || +new_end_date !== +this.task._end;

              if (Number(this.task._start) !== Number(new_start_date)) {
                  this.task._start = new_start_date;
              }

              if (Number(this.task._end) !== Number(new_end_date)) {
                  this.task._end = new_end_date;
              }

              this.update_bar_position({
                  x: this.compute_x(),
                  width: this.compute_width()
              });

              if (changed) {
                  this.gantt.trigger_event('date_change', [this.task, new_start_date, new_end_date]);
              }
          }
      }, {
          key: 'progress_changed',
          value: function progress_changed() {
              var new_progress = this.compute_progress();
              this.task.progress = new_progress;
              this.gantt.trigger_event('progress_change', [this.task, new_progress]);
          }
      }, {
          key: 'set_action_completed',
          value: function set_action_completed() {
              var _this4 = this;

              this.action_completed = true;
              setTimeout(function () {
                  return _this4.action_completed = false;
              }, 1000);
          }
      }, {
          key: 'compute_start_end_date',
          value: function compute_start_end_date() {
              var bar = this.$bar;
              var x_in_units = this.x / this.gantt.options.column_width;
              var new_start_date = date_utils.add(this.gantt.gantt_start, x_in_units * this.gantt.options.step, 'hour');
              var width_in_units = bar.getWidth() / this.gantt.options.column_width;
              var new_end_date = date_utils.add(new_start_date, width_in_units * this.gantt.options.step, 'hour');

              return { new_start_date: new_start_date, new_end_date: new_end_date };
          }
      }, {
          key: 'compute_progress',
          value: function compute_progress() {
              var progress = this.$bar_progress.getWidth() / this.$bar.getWidth() * 100;
              return parseInt(progress, 10);
          }
      }, {
          key: 'compute_x',
          value: function compute_x() {
              var _gantt$options = this.gantt.options,
                  step = _gantt$options.step,
                  column_width = _gantt$options.column_width;

              var task_start = this.task._start;
              var gantt_start = this.gantt.gantt_start;

              var diff = date_utils.diff(task_start, gantt_start, 'hour');
              var x = diff / step * column_width;

              if (this.gantt.view_is('Month')) {
                  var _diff = date_utils.diff(task_start, gantt_start, 'day');
                  x = _diff * column_width / 30;
              }
              return x;
          }
      }, {
          key: 'compute_y',
          value: function compute_y() {
              return this.gantt.options.header_height + this.gantt.options.padding + this.task._index * (this.height + this.gantt.options.padding);
          }
      }, {
          key: 'get_snap_position',
          value: function get_snap_position(dx) {
              var odx = dx,
                  rem = void 0,
                  position = void 0;

              if (this.gantt.view_is('Week')) {
                  rem = dx % (this.gantt.options.column_width / 7);
                  position = odx - rem + (rem < this.gantt.options.column_width / 14 ? 0 : this.gantt.options.column_width / 7);
              } else if (this.gantt.view_is('Month')) {
                  rem = dx % (this.gantt.options.column_width / 30);
                  position = odx - rem + (rem < this.gantt.options.column_width / 60 ? 0 : this.gantt.options.column_width / 30);
              } else {
                  rem = dx % this.gantt.options.column_width;
                  position = odx - rem + (rem < this.gantt.options.column_width / 2 ? 0 : this.gantt.options.column_width);
              }
              return position;
          }
      }, {
          key: 'update_attr',
          value: function update_attr(element, attr, value) {
              value = +value;
              if (!isNaN(value)) {
                  element.setAttribute(attr, value);
              }
              return element;
          }
      }, {
          key: 'update_progressbar_position',
          value: function update_progressbar_position() {
              this.$bar_progress && this.$bar_progress.setAttribute('width', this.$bar.getWidth() * (this.task.progress / 100));
          }
      }, {
          key: 'update_label_position',
          value: function update_label_position() {
              var img_mask = this.bar_group.querySelector('.img_mask') || '';
              var bar = this.$bar,
                  label = this.group.querySelector('.bar-label'),
                  img = this.group.querySelector('.bar-img');

              var padding = 5;
              var x_offset_label_img = this.image_size + 10;

              if (label.getBBox().width > bar.getWidth()) {
                  label.classList.add('big');
                  if (img) {
                      img.setAttribute('x', bar.getX() + bar.getWidth() + padding);
                      img_mask.setAttribute('x', bar.getX() + bar.getWidth() + padding);
                      label.setAttribute('x', bar.getX() + bar.getWidth() + x_offset_label_img);
                  } else {
                      label.setAttribute('x', bar.getX() + bar.getWidth() + padding);
                  }
              } else {
                  label.classList.remove('big');

                  if (img) {
                      img.setAttribute('x', bar.getX() + padding);
                      img_mask.setAttribute('x', bar.getX() + padding);
                      label.setAttribute('x', bar.getX() + x_offset_label_img);
                  } else {
                      label.setAttribute('x', bar.getX() + padding);
                  }
              }
          }
      }, {
          key: 'update_handle_position',
          value: function update_handle_position() {
              var bar = this.$bar;
              this.handle_group.querySelector('.handle.left').setAttribute('x', bar.getX() + 1);
              this.handle_group.querySelector('.handle.right').setAttribute('x', bar.getEndX() - 9);

              this.handle_group.querySelector('.circle.left').setAttribute('cx', String(bar.getX() - 10));
              this.handle_group.querySelector('.circle.right').setAttribute('cx', String(bar.getEndX() + 10));

              var handle = this.group.querySelector('.handle.progress');
              handle && handle.setAttribute('points', this.get_progress_polygon_points());
          }
      }, {
          key: 'update_arrow_position',
          value: function update_arrow_position() {
              this.arrows = this.arrows || [];
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                  for (var _iterator = this.arrows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var arrow = _step.value;

                      arrow.update();
                  }
              } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                      }
                  } finally {
                      if (_didIteratorError) {
                          throw _iteratorError;
                      }
                  }
              }
          }
      }]);
      return Bar;
  }();

  var Arrow = function () {
      function Arrow(gantt, from_task, to_task, type) {
          classCallCheck(this, Arrow);

          this.gantt = gantt;
          this.from_task = from_task;
          this.to_task = to_task;
          this.type = type;

          this.calculate_path();
          this.draw();

          if (!gantt.options.read_only) {
              this.bind_events();
          }
      }

      createClass(Arrow, [{
          key: 'bind_events',
          value: function bind_events() {
              this.handle_dblclick = this.handle_dblclick.bind(this);
              this.handle_mouseover = this.handle_mouseover.bind(this);

              this.setup_events();
          }
      }, {
          key: 'calculate_path',
          value: function calculate_path() {
              var types = enums.dependency.types;

              var start_x = void 0;
              var start_padding = void 0;
              var typeSign = void 0;
              var padding = 10;
              switch (this.type) {
                  case types.START_TO_START:
                      start_x = this.from_task.x;
                      start_padding = -padding;
                      typeSign = -1;
                      break;
                  case types.END_TO_START:
                      start_x = this.from_task.x + this.from_task.$bar.getWidth();
                      start_padding = padding;
                      typeSign = 1;
                      break;
                  default:
                      start_x = this.from_task.x;
                      start_padding = -padding;
                      typeSign = -1;
              }
              var start_y = this.from_task.y + this.from_task.$bar.getHeight() / 2;
              var end_x = this.to_task.x;
              var end_y = this.to_task.y + this.to_task.$bar.getHeight() / 2;

              var arrowPath = '\n                m -5 -5\n                l 5 5\n                l -5 5';

              if (start_x + start_padding >= end_x) {
                  var from_is_below_to = this.from_task.task._index > this.to_task.task._index;
                  var offset = this.to_task.$bar.getHeight() / 2 + this.gantt.options.padding / 2;
                  var sign = from_is_below_to ? -1 : 1;
                  offset *= sign;

                  this.path = '\n                M ' + start_x + ' ' + start_y + '\n                h ' + start_padding + '\n                V ' + (end_y - offset) + '\n                H ' + (end_x - start_padding * typeSign) + '\n                V ' + end_y + '\n                L ' + end_x + ' ' + end_y + '\n                ' + arrowPath;
              } else {
                  this.path = '\n                M ' + start_x + ' ' + start_y + '\n                h ' + start_padding + '\n                V ' + end_y + '\n                L ' + end_x + ' ' + end_y + '\n                ' + arrowPath;
              }
          }
      }, {
          key: 'calculate_path_old',
          value: function calculate_path_old() {
              var _this = this;

              var start_x = this.from_task.$bar.getX() + this.from_task.$bar.getWidth() / 2;

              var condition = function condition() {
                  return _this.to_task.$bar.getX() < start_x + _this.gantt.options.padding && start_x > _this.from_task.$bar.getX() + _this.gantt.options.padding;
              };

              while (condition()) {
                  start_x -= 10;
              }

              var start_y = this.gantt.options.header_height + this.gantt.options.bar_height + (this.gantt.options.padding + this.gantt.options.bar_height) * this.from_task.task._index + this.gantt.options.padding;

              var end_x = this.to_task.$bar.getX() - this.gantt.options.padding / 2;
              var end_y = this.gantt.options.header_height + this.gantt.options.bar_height / 2 + (this.gantt.options.padding + this.gantt.options.bar_height) * this.to_task.task._index + this.gantt.options.padding;

              var from_is_below_to = this.from_task.task._index > this.to_task.task._index;
              var curve = this.gantt.options.arrow_curve;
              var clockwise = from_is_below_to ? 1 : 0;
              var curve_y = from_is_below_to ? -curve : curve;
              var offset = from_is_below_to ? end_y + this.gantt.options.arrow_curve : end_y - this.gantt.options.arrow_curve;

              this.path = '\n            M ' + start_x + ' ' + start_y + '\n            V ' + offset + '\n            a ' + curve + ' ' + curve + ' 0 0 ' + clockwise + ' ' + curve + ' ' + curve_y + '\n            L ' + end_x + ' ' + end_y + '\n            m -5 -5\n            l 5 5\n            l -5 5';

              if (this.to_task.$bar.getX() < this.from_task.$bar.getX() + this.gantt.options.padding) {
                  var down_1 = this.gantt.options.padding / 2 - curve;
                  var down_2 = this.to_task.$bar.getY() + this.to_task.$bar.getHeight() / 2 - curve_y;
                  var left = this.to_task.$bar.getX() - this.gantt.options.padding;

                  this.path = '\n                M ' + start_x + ' ' + start_y + '\n                v ' + down_1 + '\n                a ' + curve + ' ' + curve + ' 0 0 1 -' + curve + ' ' + curve + '\n                H ' + left + '\n                a ' + curve + ' ' + curve + ' 0 0 ' + clockwise + ' -' + curve + ' ' + curve_y + '\n                V ' + down_2 + '\n                a ' + curve + ' ' + curve + ' 0 0 ' + clockwise + ' ' + curve + ' ' + curve_y + '\n                L ' + end_x + ' ' + end_y + '\n                m -5 -5\n                l 5 5\n                l -5 5';
              }
          }
      }, {
          key: 'draw',
          value: function draw() {
              this.element = createSVG('g', {});
              this.hover = createSVG('path', {
                  class: 'hover-area',
                  d: this.path,
                  'data-from': this.from_task.task.id,
                  'data-to': this.to_task.task.id,
                  append_to: this.element
              });
              this.arrow = createSVG('path', {
                  class: 'arrow',
                  d: this.path,
                  'data-from': this.from_task.task.id,
                  'data-to': this.to_task.task.id,
                  append_to: this.element
              });
          }
      }, {
          key: 'update',
          value: function update() {
              this.calculate_path();
              this.arrow.setAttribute('d', this.path);
              this.hover.setAttribute('d', this.path);
          }
      }, {
          key: 'setup_events',
          value: function setup_events() {
              this.hover.addEventListener('dblclick', this.handle_dblclick);
              this.hover.addEventListener('mouseover', this.handle_mouseover);
          }
      }, {
          key: 'remove_events',
          value: function remove_events() {
              this.hover.removeEventListener('dblclick', this.handle_dblclick);
              this.hover.removeEventListener('mouseover', this.handle_mouseover);
          }
      }, {
          key: 'handle_mouseover',
          value: function handle_mouseover() {
              // place hovered arrow in the end for proper highlight
              this.element.parentNode.appendChild(this.element);
          }
      }, {
          key: 'handle_dblclick',
          value: function handle_dblclick() {
              this.delete();
          }
      }, {
          key: 'delete',
          value: function _delete() {
              this.gantt.delete_dependency(this.from_task.task, this.to_task.task, this.type);
              this.element.remove();
              this.remove_events();
          }
      }]);
      return Arrow;
  }();

  var Popup = function () {
      function Popup(parent, custom_html, chart) {
          classCallCheck(this, Popup);

          this.parent = parent;
          this.custom_html = custom_html;
          this.chart = chart;
          this.make();
      }

      createClass(Popup, [{
          key: 'make',
          value: function make() {
              this.parent.innerHTML = '\n            <div class="title"></div>\n            <div class="subtitle"></div>\n            <div class="pointer"></div>\n        ';

              this.hide();

              this.title = this.parent.querySelector('.title');
              this.subtitle = this.parent.querySelector('.subtitle');
              this.pointer = this.parent.querySelector('.pointer');
          }
      }, {
          key: 'show',
          value: function show(options) {
              if (!options.target_element) {
                  throw new Error('target_element is required to show popup');
              }
              if (!options.position) {
                  options.position = 'left';
              }
              var target_element = options.target_element;

              if (this.custom_html) {
                  var html = this.custom_html(options.task);
                  html += '<div class="pointer"></div>';
                  this.parent.innerHTML = html;
                  this.pointer = this.parent.querySelector('.pointer');
              } else {
                  // set data
                  this.title.innerHTML = options.title;
                  this.subtitle.innerHTML = options.subtitle;
                  this.parent.style.width = this.parent.clientWidth + 'px';
              }

              // set position
              var chart_position = this.chart.getBoundingClientRect();
              var target_position = target_element.getBoundingClientRect();
              var relative_position = {
                  top: target_position.top - chart_position.top,
                  right: target_position.right - chart_position.right,
                  bottom: target_position.bottom - chart_position.bottom,
                  left: target_position.left - chart_position.left
              };

              if (options.position === 'left') {
                  this.parent.style.left = relative_position.left + (target_position.width + 10) + 'px';
                  this.parent.style.top = relative_position.top + 'px';

                  this.pointer.style.transform = 'rotateZ(90deg)';
                  this.pointer.style.left = '-7px';
                  this.pointer.style.top = '2px';
              }

              // show
              this.parent.style.opacity = '1';
              this.parent.style.visibility = 'visible';
          }
      }, {
          key: 'hide',
          value: function hide() {
              this.parent.style.opacity = '0';
              this.parent.style.visibility = 'hidden';
          }
      }]);
      return Popup;
  }();

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var moment = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
      module.exports = factory();
  }(commonjsGlobal, (function () {
      var hookCallback;

      function hooks () {
          return hookCallback.apply(null, arguments);
      }

      // This is done to register the method called with moment()
      // without creating circular dependencies.
      function setHookCallback (callback) {
          hookCallback = callback;
      }

      function isArray(input) {
          return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
      }

      function isObject(input) {
          // IE8 will treat undefined and null as object if it wasn't for
          // input != null
          return input != null && Object.prototype.toString.call(input) === '[object Object]';
      }

      function isObjectEmpty(obj) {
          if (Object.getOwnPropertyNames) {
              return (Object.getOwnPropertyNames(obj).length === 0);
          } else {
              var k;
              for (k in obj) {
                  if (obj.hasOwnProperty(k)) {
                      return false;
                  }
              }
              return true;
          }
      }

      function isUndefined(input) {
          return input === void 0;
      }

      function isNumber(input) {
          return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
      }

      function isDate(input) {
          return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
      }

      function map(arr, fn) {
          var res = [], i;
          for (i = 0; i < arr.length; ++i) {
              res.push(fn(arr[i], i));
          }
          return res;
      }

      function hasOwnProp(a, b) {
          return Object.prototype.hasOwnProperty.call(a, b);
      }

      function extend(a, b) {
          for (var i in b) {
              if (hasOwnProp(b, i)) {
                  a[i] = b[i];
              }
          }

          if (hasOwnProp(b, 'toString')) {
              a.toString = b.toString;
          }

          if (hasOwnProp(b, 'valueOf')) {
              a.valueOf = b.valueOf;
          }

          return a;
      }

      function createUTC (input, format, locale, strict) {
          return createLocalOrUTC(input, format, locale, strict, true).utc();
      }

      function defaultParsingFlags() {
          // We need to deep clone this object.
          return {
              empty           : false,
              unusedTokens    : [],
              unusedInput     : [],
              overflow        : -2,
              charsLeftOver   : 0,
              nullInput       : false,
              invalidMonth    : null,
              invalidFormat   : false,
              userInvalidated : false,
              iso             : false,
              parsedDateParts : [],
              meridiem        : null,
              rfc2822         : false,
              weekdayMismatch : false
          };
      }

      function getParsingFlags(m) {
          if (m._pf == null) {
              m._pf = defaultParsingFlags();
          }
          return m._pf;
      }

      var some;
      if (Array.prototype.some) {
          some = Array.prototype.some;
      } else {
          some = function (fun) {
              var t = Object(this);
              var len = t.length >>> 0;

              for (var i = 0; i < len; i++) {
                  if (i in t && fun.call(this, t[i], i, t)) {
                      return true;
                  }
              }

              return false;
          };
      }

      function isValid(m) {
          if (m._isValid == null) {
              var flags = getParsingFlags(m);
              var parsedParts = some.call(flags.parsedDateParts, function (i) {
                  return i != null;
              });
              var isNowValid = !isNaN(m._d.getTime()) &&
                  flags.overflow < 0 &&
                  !flags.empty &&
                  !flags.invalidMonth &&
                  !flags.invalidWeekday &&
                  !flags.weekdayMismatch &&
                  !flags.nullInput &&
                  !flags.invalidFormat &&
                  !flags.userInvalidated &&
                  (!flags.meridiem || (flags.meridiem && parsedParts));

              if (m._strict) {
                  isNowValid = isNowValid &&
                      flags.charsLeftOver === 0 &&
                      flags.unusedTokens.length === 0 &&
                      flags.bigHour === undefined;
              }

              if (Object.isFrozen == null || !Object.isFrozen(m)) {
                  m._isValid = isNowValid;
              }
              else {
                  return isNowValid;
              }
          }
          return m._isValid;
      }

      function createInvalid (flags) {
          var m = createUTC(NaN);
          if (flags != null) {
              extend(getParsingFlags(m), flags);
          }
          else {
              getParsingFlags(m).userInvalidated = true;
          }

          return m;
      }

      // Plugins that add properties should also add the key here (null value),
      // so we can properly clone ourselves.
      var momentProperties = hooks.momentProperties = [];

      function copyConfig(to, from) {
          var i, prop, val;

          if (!isUndefined(from._isAMomentObject)) {
              to._isAMomentObject = from._isAMomentObject;
          }
          if (!isUndefined(from._i)) {
              to._i = from._i;
          }
          if (!isUndefined(from._f)) {
              to._f = from._f;
          }
          if (!isUndefined(from._l)) {
              to._l = from._l;
          }
          if (!isUndefined(from._strict)) {
              to._strict = from._strict;
          }
          if (!isUndefined(from._tzm)) {
              to._tzm = from._tzm;
          }
          if (!isUndefined(from._isUTC)) {
              to._isUTC = from._isUTC;
          }
          if (!isUndefined(from._offset)) {
              to._offset = from._offset;
          }
          if (!isUndefined(from._pf)) {
              to._pf = getParsingFlags(from);
          }
          if (!isUndefined(from._locale)) {
              to._locale = from._locale;
          }

          if (momentProperties.length > 0) {
              for (i = 0; i < momentProperties.length; i++) {
                  prop = momentProperties[i];
                  val = from[prop];
                  if (!isUndefined(val)) {
                      to[prop] = val;
                  }
              }
          }

          return to;
      }

      var updateInProgress = false;

      // Moment prototype object
      function Moment(config) {
          copyConfig(this, config);
          this._d = new Date(config._d != null ? config._d.getTime() : NaN);
          if (!this.isValid()) {
              this._d = new Date(NaN);
          }
          // Prevent infinite loop in case updateOffset creates new moment
          // objects.
          if (updateInProgress === false) {
              updateInProgress = true;
              hooks.updateOffset(this);
              updateInProgress = false;
          }
      }

      function isMoment (obj) {
          return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
      }

      function absFloor (number) {
          if (number < 0) {
              // -0 -> 0
              return Math.ceil(number) || 0;
          } else {
              return Math.floor(number);
          }
      }

      function toInt(argumentForCoercion) {
          var coercedNumber = +argumentForCoercion,
              value = 0;

          if (coercedNumber !== 0 && isFinite(coercedNumber)) {
              value = absFloor(coercedNumber);
          }

          return value;
      }

      // compare two arrays, return the number of differences
      function compareArrays(array1, array2, dontConvert) {
          var len = Math.min(array1.length, array2.length),
              lengthDiff = Math.abs(array1.length - array2.length),
              diffs = 0,
              i;
          for (i = 0; i < len; i++) {
              if ((dontConvert && array1[i] !== array2[i]) ||
                  (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                  diffs++;
              }
          }
          return diffs + lengthDiff;
      }

      function warn(msg) {
          if (hooks.suppressDeprecationWarnings === false &&
                  (typeof console !==  'undefined') && console.warn) {
              console.warn('Deprecation warning: ' + msg);
          }
      }

      function deprecate(msg, fn) {
          var firstTime = true;

          return extend(function () {
              if (hooks.deprecationHandler != null) {
                  hooks.deprecationHandler(null, msg);
              }
              if (firstTime) {
                  var args = [];
                  var arg;
                  for (var i = 0; i < arguments.length; i++) {
                      arg = '';
                      if (typeof arguments[i] === 'object') {
                          arg += '\n[' + i + '] ';
                          for (var key in arguments[0]) {
                              arg += key + ': ' + arguments[0][key] + ', ';
                          }
                          arg = arg.slice(0, -2); // Remove trailing comma and space
                      } else {
                          arg = arguments[i];
                      }
                      args.push(arg);
                  }
                  warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                  firstTime = false;
              }
              return fn.apply(this, arguments);
          }, fn);
      }

      var deprecations = {};

      function deprecateSimple(name, msg) {
          if (hooks.deprecationHandler != null) {
              hooks.deprecationHandler(name, msg);
          }
          if (!deprecations[name]) {
              warn(msg);
              deprecations[name] = true;
          }
      }

      hooks.suppressDeprecationWarnings = false;
      hooks.deprecationHandler = null;

      function isFunction(input) {
          return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
      }

      function set (config) {
          var prop, i;
          for (i in config) {
              prop = config[i];
              if (isFunction(prop)) {
                  this[i] = prop;
              } else {
                  this['_' + i] = prop;
              }
          }
          this._config = config;
          // Lenient ordinal parsing accepts just a number in addition to
          // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
          // TODO: Remove "ordinalParse" fallback in next major release.
          this._dayOfMonthOrdinalParseLenient = new RegExp(
              (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                  '|' + (/\d{1,2}/).source);
      }

      function mergeConfigs(parentConfig, childConfig) {
          var res = extend({}, parentConfig), prop;
          for (prop in childConfig) {
              if (hasOwnProp(childConfig, prop)) {
                  if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                      res[prop] = {};
                      extend(res[prop], parentConfig[prop]);
                      extend(res[prop], childConfig[prop]);
                  } else if (childConfig[prop] != null) {
                      res[prop] = childConfig[prop];
                  } else {
                      delete res[prop];
                  }
              }
          }
          for (prop in parentConfig) {
              if (hasOwnProp(parentConfig, prop) &&
                      !hasOwnProp(childConfig, prop) &&
                      isObject(parentConfig[prop])) {
                  // make sure changes to properties don't modify parent config
                  res[prop] = extend({}, res[prop]);
              }
          }
          return res;
      }

      function Locale(config) {
          if (config != null) {
              this.set(config);
          }
      }

      var keys;

      if (Object.keys) {
          keys = Object.keys;
      } else {
          keys = function (obj) {
              var i, res = [];
              for (i in obj) {
                  if (hasOwnProp(obj, i)) {
                      res.push(i);
                  }
              }
              return res;
          };
      }

      var defaultCalendar = {
          sameDay : '[Today at] LT',
          nextDay : '[Tomorrow at] LT',
          nextWeek : 'dddd [at] LT',
          lastDay : '[Yesterday at] LT',
          lastWeek : '[Last] dddd [at] LT',
          sameElse : 'L'
      };

      function calendar (key, mom, now) {
          var output = this._calendar[key] || this._calendar['sameElse'];
          return isFunction(output) ? output.call(mom, now) : output;
      }

      var defaultLongDateFormat = {
          LTS  : 'h:mm:ss A',
          LT   : 'h:mm A',
          L    : 'MM/DD/YYYY',
          LL   : 'MMMM D, YYYY',
          LLL  : 'MMMM D, YYYY h:mm A',
          LLLL : 'dddd, MMMM D, YYYY h:mm A'
      };

      function longDateFormat (key) {
          var format = this._longDateFormat[key],
              formatUpper = this._longDateFormat[key.toUpperCase()];

          if (format || !formatUpper) {
              return format;
          }

          this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
              return val.slice(1);
          });

          return this._longDateFormat[key];
      }

      var defaultInvalidDate = 'Invalid date';

      function invalidDate () {
          return this._invalidDate;
      }

      var defaultOrdinal = '%d';
      var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

      function ordinal (number) {
          return this._ordinal.replace('%d', number);
      }

      var defaultRelativeTime = {
          future : 'in %s',
          past   : '%s ago',
          s  : 'a few seconds',
          ss : '%d seconds',
          m  : 'a minute',
          mm : '%d minutes',
          h  : 'an hour',
          hh : '%d hours',
          d  : 'a day',
          dd : '%d days',
          M  : 'a month',
          MM : '%d months',
          y  : 'a year',
          yy : '%d years'
      };

      function relativeTime (number, withoutSuffix, string, isFuture) {
          var output = this._relativeTime[string];
          return (isFunction(output)) ?
              output(number, withoutSuffix, string, isFuture) :
              output.replace(/%d/i, number);
      }

      function pastFuture (diff, output) {
          var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
          return isFunction(format) ? format(output) : format.replace(/%s/i, output);
      }

      var aliases = {};

      function addUnitAlias (unit, shorthand) {
          var lowerCase = unit.toLowerCase();
          aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
      }

      function normalizeUnits(units) {
          return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
      }

      function normalizeObjectUnits(inputObject) {
          var normalizedInput = {},
              normalizedProp,
              prop;

          for (prop in inputObject) {
              if (hasOwnProp(inputObject, prop)) {
                  normalizedProp = normalizeUnits(prop);
                  if (normalizedProp) {
                      normalizedInput[normalizedProp] = inputObject[prop];
                  }
              }
          }

          return normalizedInput;
      }

      var priorities = {};

      function addUnitPriority(unit, priority) {
          priorities[unit] = priority;
      }

      function getPrioritizedUnits(unitsObj) {
          var units = [];
          for (var u in unitsObj) {
              units.push({unit: u, priority: priorities[u]});
          }
          units.sort(function (a, b) {
              return a.priority - b.priority;
          });
          return units;
      }

      function zeroFill(number, targetLength, forceSign) {
          var absNumber = '' + Math.abs(number),
              zerosToFill = targetLength - absNumber.length,
              sign = number >= 0;
          return (sign ? (forceSign ? '+' : '') : '-') +
              Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
      }

      var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

      var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

      var formatFunctions = {};

      var formatTokenFunctions = {};

      // token:    'M'
      // padded:   ['MM', 2]
      // ordinal:  'Mo'
      // callback: function () { this.month() + 1 }
      function addFormatToken (token, padded, ordinal, callback) {
          var func = callback;
          if (typeof callback === 'string') {
              func = function () {
                  return this[callback]();
              };
          }
          if (token) {
              formatTokenFunctions[token] = func;
          }
          if (padded) {
              formatTokenFunctions[padded[0]] = function () {
                  return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
              };
          }
          if (ordinal) {
              formatTokenFunctions[ordinal] = function () {
                  return this.localeData().ordinal(func.apply(this, arguments), token);
              };
          }
      }

      function removeFormattingTokens(input) {
          if (input.match(/\[[\s\S]/)) {
              return input.replace(/^\[|\]$/g, '');
          }
          return input.replace(/\\/g, '');
      }

      function makeFormatFunction(format) {
          var array = format.match(formattingTokens), i, length;

          for (i = 0, length = array.length; i < length; i++) {
              if (formatTokenFunctions[array[i]]) {
                  array[i] = formatTokenFunctions[array[i]];
              } else {
                  array[i] = removeFormattingTokens(array[i]);
              }
          }

          return function (mom) {
              var output = '', i;
              for (i = 0; i < length; i++) {
                  output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
              }
              return output;
          };
      }

      // format date using native date object
      function formatMoment(m, format) {
          if (!m.isValid()) {
              return m.localeData().invalidDate();
          }

          format = expandFormat(format, m.localeData());
          formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

          return formatFunctions[format](m);
      }

      function expandFormat(format, locale) {
          var i = 5;

          function replaceLongDateFormatTokens(input) {
              return locale.longDateFormat(input) || input;
          }

          localFormattingTokens.lastIndex = 0;
          while (i >= 0 && localFormattingTokens.test(format)) {
              format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
              localFormattingTokens.lastIndex = 0;
              i -= 1;
          }

          return format;
      }

      var match1         = /\d/;            //       0 - 9
      var match2         = /\d\d/;          //      00 - 99
      var match3         = /\d{3}/;         //     000 - 999
      var match4         = /\d{4}/;         //    0000 - 9999
      var match6         = /[+-]?\d{6}/;    // -999999 - 999999
      var match1to2      = /\d\d?/;         //       0 - 99
      var match3to4      = /\d\d\d\d?/;     //     999 - 9999
      var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
      var match1to3      = /\d{1,3}/;       //       0 - 999
      var match1to4      = /\d{1,4}/;       //       0 - 9999
      var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

      var matchUnsigned  = /\d+/;           //       0 - inf
      var matchSigned    = /[+-]?\d+/;      //    -inf - inf

      var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
      var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

      var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

      // any word (or two) characters or numbers including two/three word month in arabic.
      // includes scottish gaelic two word and hyphenated months
      var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

      var regexes = {};

      function addRegexToken (token, regex, strictRegex) {
          regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
              return (isStrict && strictRegex) ? strictRegex : regex;
          };
      }

      function getParseRegexForToken (token, config) {
          if (!hasOwnProp(regexes, token)) {
              return new RegExp(unescapeFormat(token));
          }

          return regexes[token](config._strict, config._locale);
      }

      // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
      function unescapeFormat(s) {
          return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
              return p1 || p2 || p3 || p4;
          }));
      }

      function regexEscape(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }

      var tokens = {};

      function addParseToken (token, callback) {
          var i, func = callback;
          if (typeof token === 'string') {
              token = [token];
          }
          if (isNumber(callback)) {
              func = function (input, array) {
                  array[callback] = toInt(input);
              };
          }
          for (i = 0; i < token.length; i++) {
              tokens[token[i]] = func;
          }
      }

      function addWeekParseToken (token, callback) {
          addParseToken(token, function (input, array, config, token) {
              config._w = config._w || {};
              callback(input, config._w, config, token);
          });
      }

      function addTimeToArrayFromToken(token, input, config) {
          if (input != null && hasOwnProp(tokens, token)) {
              tokens[token](input, config._a, config, token);
          }
      }

      var YEAR = 0;
      var MONTH = 1;
      var DATE = 2;
      var HOUR = 3;
      var MINUTE = 4;
      var SECOND = 5;
      var MILLISECOND = 6;
      var WEEK = 7;
      var WEEKDAY = 8;

      // FORMATTING

      addFormatToken('Y', 0, 0, function () {
          var y = this.year();
          return y <= 9999 ? '' + y : '+' + y;
      });

      addFormatToken(0, ['YY', 2], 0, function () {
          return this.year() % 100;
      });

      addFormatToken(0, ['YYYY',   4],       0, 'year');
      addFormatToken(0, ['YYYYY',  5],       0, 'year');
      addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

      // ALIASES

      addUnitAlias('year', 'y');

      // PRIORITIES

      addUnitPriority('year', 1);

      // PARSING

      addRegexToken('Y',      matchSigned);
      addRegexToken('YY',     match1to2, match2);
      addRegexToken('YYYY',   match1to4, match4);
      addRegexToken('YYYYY',  match1to6, match6);
      addRegexToken('YYYYYY', match1to6, match6);

      addParseToken(['YYYYY', 'YYYYYY'], YEAR);
      addParseToken('YYYY', function (input, array) {
          array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
      });
      addParseToken('YY', function (input, array) {
          array[YEAR] = hooks.parseTwoDigitYear(input);
      });
      addParseToken('Y', function (input, array) {
          array[YEAR] = parseInt(input, 10);
      });

      // HELPERS

      function daysInYear(year) {
          return isLeapYear(year) ? 366 : 365;
      }

      function isLeapYear(year) {
          return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      }

      // HOOKS

      hooks.parseTwoDigitYear = function (input) {
          return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
      };

      // MOMENTS

      var getSetYear = makeGetSet('FullYear', true);

      function getIsLeapYear () {
          return isLeapYear(this.year());
      }

      function makeGetSet (unit, keepTime) {
          return function (value) {
              if (value != null) {
                  set$1(this, unit, value);
                  hooks.updateOffset(this, keepTime);
                  return this;
              } else {
                  return get(this, unit);
              }
          };
      }

      function get (mom, unit) {
          return mom.isValid() ?
              mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
      }

      function set$1 (mom, unit, value) {
          if (mom.isValid() && !isNaN(value)) {
              if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                  mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
              }
              else {
                  mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
              }
          }
      }

      // MOMENTS

      function stringGet (units) {
          units = normalizeUnits(units);
          if (isFunction(this[units])) {
              return this[units]();
          }
          return this;
      }


      function stringSet (units, value) {
          if (typeof units === 'object') {
              units = normalizeObjectUnits(units);
              var prioritized = getPrioritizedUnits(units);
              for (var i = 0; i < prioritized.length; i++) {
                  this[prioritized[i].unit](units[prioritized[i].unit]);
              }
          } else {
              units = normalizeUnits(units);
              if (isFunction(this[units])) {
                  return this[units](value);
              }
          }
          return this;
      }

      function mod(n, x) {
          return ((n % x) + x) % x;
      }

      var indexOf;

      if (Array.prototype.indexOf) {
          indexOf = Array.prototype.indexOf;
      } else {
          indexOf = function (o) {
              // I know
              var i;
              for (i = 0; i < this.length; ++i) {
                  if (this[i] === o) {
                      return i;
                  }
              }
              return -1;
          };
      }

      function daysInMonth(year, month) {
          if (isNaN(year) || isNaN(month)) {
              return NaN;
          }
          var modMonth = mod(month, 12);
          year += (month - modMonth) / 12;
          return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
      }

      // FORMATTING

      addFormatToken('M', ['MM', 2], 'Mo', function () {
          return this.month() + 1;
      });

      addFormatToken('MMM', 0, 0, function (format) {
          return this.localeData().monthsShort(this, format);
      });

      addFormatToken('MMMM', 0, 0, function (format) {
          return this.localeData().months(this, format);
      });

      // ALIASES

      addUnitAlias('month', 'M');

      // PRIORITY

      addUnitPriority('month', 8);

      // PARSING

      addRegexToken('M',    match1to2);
      addRegexToken('MM',   match1to2, match2);
      addRegexToken('MMM',  function (isStrict, locale) {
          return locale.monthsShortRegex(isStrict);
      });
      addRegexToken('MMMM', function (isStrict, locale) {
          return locale.monthsRegex(isStrict);
      });

      addParseToken(['M', 'MM'], function (input, array) {
          array[MONTH] = toInt(input) - 1;
      });

      addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
          var month = config._locale.monthsParse(input, token, config._strict);
          // if we didn't find a month name, mark the date as invalid.
          if (month != null) {
              array[MONTH] = month;
          } else {
              getParsingFlags(config).invalidMonth = input;
          }
      });

      // LOCALES

      var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
      var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
      function localeMonths (m, format) {
          if (!m) {
              return isArray(this._months) ? this._months :
                  this._months['standalone'];
          }
          return isArray(this._months) ? this._months[m.month()] :
              this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
      }

      var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
      function localeMonthsShort (m, format) {
          if (!m) {
              return isArray(this._monthsShort) ? this._monthsShort :
                  this._monthsShort['standalone'];
          }
          return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
              this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
      }

      function handleStrictParse(monthName, format, strict) {
          var i, ii, mom, llc = monthName.toLocaleLowerCase();
          if (!this._monthsParse) {
              // this is not used
              this._monthsParse = [];
              this._longMonthsParse = [];
              this._shortMonthsParse = [];
              for (i = 0; i < 12; ++i) {
                  mom = createUTC([2000, i]);
                  this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                  this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
              }
          }

          if (strict) {
              if (format === 'MMM') {
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._longMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              }
          } else {
              if (format === 'MMM') {
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._longMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._longMonthsParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortMonthsParse, llc);
                  return ii !== -1 ? ii : null;
              }
          }
      }

      function localeMonthsParse (monthName, format, strict) {
          var i, mom, regex;

          if (this._monthsParseExact) {
              return handleStrictParse.call(this, monthName, format, strict);
          }

          if (!this._monthsParse) {
              this._monthsParse = [];
              this._longMonthsParse = [];
              this._shortMonthsParse = [];
          }

          // TODO: add sorting
          // Sorting makes sure if one month (or abbr) is a prefix of another
          // see sorting in computeMonthsParse
          for (i = 0; i < 12; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, i]);
              if (strict && !this._longMonthsParse[i]) {
                  this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                  this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
              }
              if (!strict && !this._monthsParse[i]) {
                  regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                  this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
              }
              // test the regex
              if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                  return i;
              } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                  return i;
              } else if (!strict && this._monthsParse[i].test(monthName)) {
                  return i;
              }
          }
      }

      // MOMENTS

      function setMonth (mom, value) {
          var dayOfMonth;

          if (!mom.isValid()) {
              // No op
              return mom;
          }

          if (typeof value === 'string') {
              if (/^\d+$/.test(value)) {
                  value = toInt(value);
              } else {
                  value = mom.localeData().monthsParse(value);
                  // TODO: Another silent failure?
                  if (!isNumber(value)) {
                      return mom;
                  }
              }
          }

          dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
          mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
          return mom;
      }

      function getSetMonth (value) {
          if (value != null) {
              setMonth(this, value);
              hooks.updateOffset(this, true);
              return this;
          } else {
              return get(this, 'Month');
          }
      }

      function getDaysInMonth () {
          return daysInMonth(this.year(), this.month());
      }

      var defaultMonthsShortRegex = matchWord;
      function monthsShortRegex (isStrict) {
          if (this._monthsParseExact) {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  computeMonthsParse.call(this);
              }
              if (isStrict) {
                  return this._monthsShortStrictRegex;
              } else {
                  return this._monthsShortRegex;
              }
          } else {
              if (!hasOwnProp(this, '_monthsShortRegex')) {
                  this._monthsShortRegex = defaultMonthsShortRegex;
              }
              return this._monthsShortStrictRegex && isStrict ?
                  this._monthsShortStrictRegex : this._monthsShortRegex;
          }
      }

      var defaultMonthsRegex = matchWord;
      function monthsRegex (isStrict) {
          if (this._monthsParseExact) {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  computeMonthsParse.call(this);
              }
              if (isStrict) {
                  return this._monthsStrictRegex;
              } else {
                  return this._monthsRegex;
              }
          } else {
              if (!hasOwnProp(this, '_monthsRegex')) {
                  this._monthsRegex = defaultMonthsRegex;
              }
              return this._monthsStrictRegex && isStrict ?
                  this._monthsStrictRegex : this._monthsRegex;
          }
      }

      function computeMonthsParse () {
          function cmpLenRev(a, b) {
              return b.length - a.length;
          }

          var shortPieces = [], longPieces = [], mixedPieces = [],
              i, mom;
          for (i = 0; i < 12; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, i]);
              shortPieces.push(this.monthsShort(mom, ''));
              longPieces.push(this.months(mom, ''));
              mixedPieces.push(this.months(mom, ''));
              mixedPieces.push(this.monthsShort(mom, ''));
          }
          // Sorting makes sure if one month (or abbr) is a prefix of another it
          // will match the longer piece.
          shortPieces.sort(cmpLenRev);
          longPieces.sort(cmpLenRev);
          mixedPieces.sort(cmpLenRev);
          for (i = 0; i < 12; i++) {
              shortPieces[i] = regexEscape(shortPieces[i]);
              longPieces[i] = regexEscape(longPieces[i]);
          }
          for (i = 0; i < 24; i++) {
              mixedPieces[i] = regexEscape(mixedPieces[i]);
          }

          this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
          this._monthsShortRegex = this._monthsRegex;
          this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
          this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
      }

      function createDate (y, m, d, h, M, s, ms) {
          // can't just apply() to create a date:
          // https://stackoverflow.com/q/181348
          var date;
          // the date constructor remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              date = new Date(y + 400, m, d, h, M, s, ms);
              if (isFinite(date.getFullYear())) {
                  date.setFullYear(y);
              }
          } else {
              date = new Date(y, m, d, h, M, s, ms);
          }

          return date;
      }

      function createUTCDate (y) {
          var date;
          // the Date.UTC function remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              var args = Array.prototype.slice.call(arguments);
              // preserve leap years using a full 400 year cycle, then reset
              args[0] = y + 400;
              date = new Date(Date.UTC.apply(null, args));
              if (isFinite(date.getUTCFullYear())) {
                  date.setUTCFullYear(y);
              }
          } else {
              date = new Date(Date.UTC.apply(null, arguments));
          }

          return date;
      }

      // start-of-first-week - start-of-year
      function firstWeekOffset(year, dow, doy) {
          var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
              fwd = 7 + dow - doy,
              // first-week day local weekday -- which local weekday is fwd
              fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

          return -fwdlw + fwd - 1;
      }

      // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
      function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
          var localWeekday = (7 + weekday - dow) % 7,
              weekOffset = firstWeekOffset(year, dow, doy),
              dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
              resYear, resDayOfYear;

          if (dayOfYear <= 0) {
              resYear = year - 1;
              resDayOfYear = daysInYear(resYear) + dayOfYear;
          } else if (dayOfYear > daysInYear(year)) {
              resYear = year + 1;
              resDayOfYear = dayOfYear - daysInYear(year);
          } else {
              resYear = year;
              resDayOfYear = dayOfYear;
          }

          return {
              year: resYear,
              dayOfYear: resDayOfYear
          };
      }

      function weekOfYear(mom, dow, doy) {
          var weekOffset = firstWeekOffset(mom.year(), dow, doy),
              week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
              resWeek, resYear;

          if (week < 1) {
              resYear = mom.year() - 1;
              resWeek = week + weeksInYear(resYear, dow, doy);
          } else if (week > weeksInYear(mom.year(), dow, doy)) {
              resWeek = week - weeksInYear(mom.year(), dow, doy);
              resYear = mom.year() + 1;
          } else {
              resYear = mom.year();
              resWeek = week;
          }

          return {
              week: resWeek,
              year: resYear
          };
      }

      function weeksInYear(year, dow, doy) {
          var weekOffset = firstWeekOffset(year, dow, doy),
              weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
          return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
      }

      // FORMATTING

      addFormatToken('w', ['ww', 2], 'wo', 'week');
      addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

      // ALIASES

      addUnitAlias('week', 'w');
      addUnitAlias('isoWeek', 'W');

      // PRIORITIES

      addUnitPriority('week', 5);
      addUnitPriority('isoWeek', 5);

      // PARSING

      addRegexToken('w',  match1to2);
      addRegexToken('ww', match1to2, match2);
      addRegexToken('W',  match1to2);
      addRegexToken('WW', match1to2, match2);

      addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
          week[token.substr(0, 1)] = toInt(input);
      });

      // HELPERS

      // LOCALES

      function localeWeek (mom) {
          return weekOfYear(mom, this._week.dow, this._week.doy).week;
      }

      var defaultLocaleWeek = {
          dow : 0, // Sunday is the first day of the week.
          doy : 6  // The week that contains Jan 6th is the first week of the year.
      };

      function localeFirstDayOfWeek () {
          return this._week.dow;
      }

      function localeFirstDayOfYear () {
          return this._week.doy;
      }

      // MOMENTS

      function getSetWeek (input) {
          var week = this.localeData().week(this);
          return input == null ? week : this.add((input - week) * 7, 'd');
      }

      function getSetISOWeek (input) {
          var week = weekOfYear(this, 1, 4).week;
          return input == null ? week : this.add((input - week) * 7, 'd');
      }

      // FORMATTING

      addFormatToken('d', 0, 'do', 'day');

      addFormatToken('dd', 0, 0, function (format) {
          return this.localeData().weekdaysMin(this, format);
      });

      addFormatToken('ddd', 0, 0, function (format) {
          return this.localeData().weekdaysShort(this, format);
      });

      addFormatToken('dddd', 0, 0, function (format) {
          return this.localeData().weekdays(this, format);
      });

      addFormatToken('e', 0, 0, 'weekday');
      addFormatToken('E', 0, 0, 'isoWeekday');

      // ALIASES

      addUnitAlias('day', 'd');
      addUnitAlias('weekday', 'e');
      addUnitAlias('isoWeekday', 'E');

      // PRIORITY
      addUnitPriority('day', 11);
      addUnitPriority('weekday', 11);
      addUnitPriority('isoWeekday', 11);

      // PARSING

      addRegexToken('d',    match1to2);
      addRegexToken('e',    match1to2);
      addRegexToken('E',    match1to2);
      addRegexToken('dd',   function (isStrict, locale) {
          return locale.weekdaysMinRegex(isStrict);
      });
      addRegexToken('ddd',   function (isStrict, locale) {
          return locale.weekdaysShortRegex(isStrict);
      });
      addRegexToken('dddd',   function (isStrict, locale) {
          return locale.weekdaysRegex(isStrict);
      });

      addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
          var weekday = config._locale.weekdaysParse(input, token, config._strict);
          // if we didn't get a weekday name, mark the date as invalid
          if (weekday != null) {
              week.d = weekday;
          } else {
              getParsingFlags(config).invalidWeekday = input;
          }
      });

      addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
          week[token] = toInt(input);
      });

      // HELPERS

      function parseWeekday(input, locale) {
          if (typeof input !== 'string') {
              return input;
          }

          if (!isNaN(input)) {
              return parseInt(input, 10);
          }

          input = locale.weekdaysParse(input);
          if (typeof input === 'number') {
              return input;
          }

          return null;
      }

      function parseIsoWeekday(input, locale) {
          if (typeof input === 'string') {
              return locale.weekdaysParse(input) % 7 || 7;
          }
          return isNaN(input) ? null : input;
      }

      // LOCALES
      function shiftWeekdays (ws, n) {
          return ws.slice(n, 7).concat(ws.slice(0, n));
      }

      var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
      function localeWeekdays (m, format) {
          var weekdays = isArray(this._weekdays) ? this._weekdays :
              this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
          return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
              : (m) ? weekdays[m.day()] : weekdays;
      }

      var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
      function localeWeekdaysShort (m) {
          return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
              : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
      }

      var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
      function localeWeekdaysMin (m) {
          return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
              : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
      }

      function handleStrictParse$1(weekdayName, format, strict) {
          var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
          if (!this._weekdaysParse) {
              this._weekdaysParse = [];
              this._shortWeekdaysParse = [];
              this._minWeekdaysParse = [];

              for (i = 0; i < 7; ++i) {
                  mom = createUTC([2000, 1]).day(i);
                  this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                  this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                  this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
              }
          }

          if (strict) {
              if (format === 'dddd') {
                  ii = indexOf.call(this._weekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else if (format === 'ddd') {
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              }
          } else {
              if (format === 'dddd') {
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else if (format === 'ddd') {
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              } else {
                  ii = indexOf.call(this._minWeekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._weekdaysParse, llc);
                  if (ii !== -1) {
                      return ii;
                  }
                  ii = indexOf.call(this._shortWeekdaysParse, llc);
                  return ii !== -1 ? ii : null;
              }
          }
      }

      function localeWeekdaysParse (weekdayName, format, strict) {
          var i, mom, regex;

          if (this._weekdaysParseExact) {
              return handleStrictParse$1.call(this, weekdayName, format, strict);
          }

          if (!this._weekdaysParse) {
              this._weekdaysParse = [];
              this._minWeekdaysParse = [];
              this._shortWeekdaysParse = [];
              this._fullWeekdaysParse = [];
          }

          for (i = 0; i < 7; i++) {
              // make the regex if we don't have it already

              mom = createUTC([2000, 1]).day(i);
              if (strict && !this._fullWeekdaysParse[i]) {
                  this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                  this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                  this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
              }
              if (!this._weekdaysParse[i]) {
                  regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                  this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
              }
              // test the regex
              if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                  return i;
              } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                  return i;
              } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                  return i;
              } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                  return i;
              }
          }
      }

      // MOMENTS

      function getSetDayOfWeek (input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
          if (input != null) {
              input = parseWeekday(input, this.localeData());
              return this.add(input - day, 'd');
          } else {
              return day;
          }
      }

      function getSetLocaleDayOfWeek (input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
          return input == null ? weekday : this.add(input - weekday, 'd');
      }

      function getSetISODayOfWeek (input) {
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }

          // behaves the same as moment#day except
          // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
          // as a setter, sunday should belong to the previous week.

          if (input != null) {
              var weekday = parseIsoWeekday(input, this.localeData());
              return this.day(this.day() % 7 ? weekday : weekday - 7);
          } else {
              return this.day() || 7;
          }
      }

      var defaultWeekdaysRegex = matchWord;
      function weekdaysRegex (isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysStrictRegex;
              } else {
                  return this._weekdaysRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  this._weekdaysRegex = defaultWeekdaysRegex;
              }
              return this._weekdaysStrictRegex && isStrict ?
                  this._weekdaysStrictRegex : this._weekdaysRegex;
          }
      }

      var defaultWeekdaysShortRegex = matchWord;
      function weekdaysShortRegex (isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysShortStrictRegex;
              } else {
                  return this._weekdaysShortRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                  this._weekdaysShortRegex = defaultWeekdaysShortRegex;
              }
              return this._weekdaysShortStrictRegex && isStrict ?
                  this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
          }
      }

      var defaultWeekdaysMinRegex = matchWord;
      function weekdaysMinRegex (isStrict) {
          if (this._weekdaysParseExact) {
              if (!hasOwnProp(this, '_weekdaysRegex')) {
                  computeWeekdaysParse.call(this);
              }
              if (isStrict) {
                  return this._weekdaysMinStrictRegex;
              } else {
                  return this._weekdaysMinRegex;
              }
          } else {
              if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                  this._weekdaysMinRegex = defaultWeekdaysMinRegex;
              }
              return this._weekdaysMinStrictRegex && isStrict ?
                  this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
          }
      }


      function computeWeekdaysParse () {
          function cmpLenRev(a, b) {
              return b.length - a.length;
          }

          var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
              i, mom, minp, shortp, longp;
          for (i = 0; i < 7; i++) {
              // make the regex if we don't have it already
              mom = createUTC([2000, 1]).day(i);
              minp = this.weekdaysMin(mom, '');
              shortp = this.weekdaysShort(mom, '');
              longp = this.weekdays(mom, '');
              minPieces.push(minp);
              shortPieces.push(shortp);
              longPieces.push(longp);
              mixedPieces.push(minp);
              mixedPieces.push(shortp);
              mixedPieces.push(longp);
          }
          // Sorting makes sure if one weekday (or abbr) is a prefix of another it
          // will match the longer piece.
          minPieces.sort(cmpLenRev);
          shortPieces.sort(cmpLenRev);
          longPieces.sort(cmpLenRev);
          mixedPieces.sort(cmpLenRev);
          for (i = 0; i < 7; i++) {
              shortPieces[i] = regexEscape(shortPieces[i]);
              longPieces[i] = regexEscape(longPieces[i]);
              mixedPieces[i] = regexEscape(mixedPieces[i]);
          }

          this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
          this._weekdaysShortRegex = this._weekdaysRegex;
          this._weekdaysMinRegex = this._weekdaysRegex;

          this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
          this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
          this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
      }

      // FORMATTING

      function hFormat() {
          return this.hours() % 12 || 12;
      }

      function kFormat() {
          return this.hours() || 24;
      }

      addFormatToken('H', ['HH', 2], 0, 'hour');
      addFormatToken('h', ['hh', 2], 0, hFormat);
      addFormatToken('k', ['kk', 2], 0, kFormat);

      addFormatToken('hmm', 0, 0, function () {
          return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
      });

      addFormatToken('hmmss', 0, 0, function () {
          return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
              zeroFill(this.seconds(), 2);
      });

      addFormatToken('Hmm', 0, 0, function () {
          return '' + this.hours() + zeroFill(this.minutes(), 2);
      });

      addFormatToken('Hmmss', 0, 0, function () {
          return '' + this.hours() + zeroFill(this.minutes(), 2) +
              zeroFill(this.seconds(), 2);
      });

      function meridiem (token, lowercase) {
          addFormatToken(token, 0, 0, function () {
              return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
          });
      }

      meridiem('a', true);
      meridiem('A', false);

      // ALIASES

      addUnitAlias('hour', 'h');

      // PRIORITY
      addUnitPriority('hour', 13);

      // PARSING

      function matchMeridiem (isStrict, locale) {
          return locale._meridiemParse;
      }

      addRegexToken('a',  matchMeridiem);
      addRegexToken('A',  matchMeridiem);
      addRegexToken('H',  match1to2);
      addRegexToken('h',  match1to2);
      addRegexToken('k',  match1to2);
      addRegexToken('HH', match1to2, match2);
      addRegexToken('hh', match1to2, match2);
      addRegexToken('kk', match1to2, match2);

      addRegexToken('hmm', match3to4);
      addRegexToken('hmmss', match5to6);
      addRegexToken('Hmm', match3to4);
      addRegexToken('Hmmss', match5to6);

      addParseToken(['H', 'HH'], HOUR);
      addParseToken(['k', 'kk'], function (input, array, config) {
          var kInput = toInt(input);
          array[HOUR] = kInput === 24 ? 0 : kInput;
      });
      addParseToken(['a', 'A'], function (input, array, config) {
          config._isPm = config._locale.isPM(input);
          config._meridiem = input;
      });
      addParseToken(['h', 'hh'], function (input, array, config) {
          array[HOUR] = toInt(input);
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('hmm', function (input, array, config) {
          var pos = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos));
          array[MINUTE] = toInt(input.substr(pos));
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('hmmss', function (input, array, config) {
          var pos1 = input.length - 4;
          var pos2 = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos1));
          array[MINUTE] = toInt(input.substr(pos1, 2));
          array[SECOND] = toInt(input.substr(pos2));
          getParsingFlags(config).bigHour = true;
      });
      addParseToken('Hmm', function (input, array, config) {
          var pos = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos));
          array[MINUTE] = toInt(input.substr(pos));
      });
      addParseToken('Hmmss', function (input, array, config) {
          var pos1 = input.length - 4;
          var pos2 = input.length - 2;
          array[HOUR] = toInt(input.substr(0, pos1));
          array[MINUTE] = toInt(input.substr(pos1, 2));
          array[SECOND] = toInt(input.substr(pos2));
      });

      // LOCALES

      function localeIsPM (input) {
          // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
          // Using charAt should be more compatible.
          return ((input + '').toLowerCase().charAt(0) === 'p');
      }

      var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
      function localeMeridiem (hours, minutes, isLower) {
          if (hours > 11) {
              return isLower ? 'pm' : 'PM';
          } else {
              return isLower ? 'am' : 'AM';
          }
      }


      // MOMENTS

      // Setting the hour should keep the time, because the user explicitly
      // specified which hour they want. So trying to maintain the same hour (in
      // a new timezone) makes sense. Adding/subtracting hours does not follow
      // this rule.
      var getSetHour = makeGetSet('Hours', true);

      var baseConfig = {
          calendar: defaultCalendar,
          longDateFormat: defaultLongDateFormat,
          invalidDate: defaultInvalidDate,
          ordinal: defaultOrdinal,
          dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
          relativeTime: defaultRelativeTime,

          months: defaultLocaleMonths,
          monthsShort: defaultLocaleMonthsShort,

          week: defaultLocaleWeek,

          weekdays: defaultLocaleWeekdays,
          weekdaysMin: defaultLocaleWeekdaysMin,
          weekdaysShort: defaultLocaleWeekdaysShort,

          meridiemParse: defaultLocaleMeridiemParse
      };

      // internal storage for locale config files
      var locales = {};
      var localeFamilies = {};
      var globalLocale;

      function normalizeLocale(key) {
          return key ? key.toLowerCase().replace('_', '-') : key;
      }

      // pick the locale from the array
      // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
      // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
      function chooseLocale(names) {
          var i = 0, j, next, locale, split;

          while (i < names.length) {
              split = normalizeLocale(names[i]).split('-');
              j = split.length;
              next = normalizeLocale(names[i + 1]);
              next = next ? next.split('-') : null;
              while (j > 0) {
                  locale = loadLocale(split.slice(0, j).join('-'));
                  if (locale) {
                      return locale;
                  }
                  if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                      //the next array item is better than a shallower substring of this one
                      break;
                  }
                  j--;
              }
              i++;
          }
          return globalLocale;
      }

      function loadLocale(name) {
          var oldLocale = null;
          // TODO: Find a better way to register and load all the locales in Node
          if (!locales[name] && ('object' !== 'undefined') &&
                  module && module.exports) {
              try {
                  oldLocale = globalLocale._abbr;
                  var aliasedRequire = commonjsRequire;
                  aliasedRequire('./locale/' + name);
                  getSetGlobalLocale(oldLocale);
              } catch (e) {}
          }
          return locales[name];
      }

      // This function will load locale and then set the global locale.  If
      // no arguments are passed in, it will simply return the current global
      // locale key.
      function getSetGlobalLocale (key, values) {
          var data;
          if (key) {
              if (isUndefined(values)) {
                  data = getLocale(key);
              }
              else {
                  data = defineLocale(key, values);
              }

              if (data) {
                  // moment.duration._locale = moment._locale = data;
                  globalLocale = data;
              }
              else {
                  if ((typeof console !==  'undefined') && console.warn) {
                      //warn user if arguments are passed but the locale could not be set
                      console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                  }
              }
          }

          return globalLocale._abbr;
      }

      function defineLocale (name, config) {
          if (config !== null) {
              var locale, parentConfig = baseConfig;
              config.abbr = name;
              if (locales[name] != null) {
                  deprecateSimple('defineLocaleOverride',
                          'use moment.updateLocale(localeName, config) to change ' +
                          'an existing locale. moment.defineLocale(localeName, ' +
                          'config) should only be used for creating a new locale ' +
                          'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                  parentConfig = locales[name]._config;
              } else if (config.parentLocale != null) {
                  if (locales[config.parentLocale] != null) {
                      parentConfig = locales[config.parentLocale]._config;
                  } else {
                      locale = loadLocale(config.parentLocale);
                      if (locale != null) {
                          parentConfig = locale._config;
                      } else {
                          if (!localeFamilies[config.parentLocale]) {
                              localeFamilies[config.parentLocale] = [];
                          }
                          localeFamilies[config.parentLocale].push({
                              name: name,
                              config: config
                          });
                          return null;
                      }
                  }
              }
              locales[name] = new Locale(mergeConfigs(parentConfig, config));

              if (localeFamilies[name]) {
                  localeFamilies[name].forEach(function (x) {
                      defineLocale(x.name, x.config);
                  });
              }

              // backwards compat for now: also set the locale
              // make sure we set the locale AFTER all child locales have been
              // created, so we won't end up with the child locale set.
              getSetGlobalLocale(name);


              return locales[name];
          } else {
              // useful for testing
              delete locales[name];
              return null;
          }
      }

      function updateLocale(name, config) {
          if (config != null) {
              var locale, tmpLocale, parentConfig = baseConfig;
              // MERGE
              tmpLocale = loadLocale(name);
              if (tmpLocale != null) {
                  parentConfig = tmpLocale._config;
              }
              config = mergeConfigs(parentConfig, config);
              locale = new Locale(config);
              locale.parentLocale = locales[name];
              locales[name] = locale;

              // backwards compat for now: also set the locale
              getSetGlobalLocale(name);
          } else {
              // pass null for config to unupdate, useful for tests
              if (locales[name] != null) {
                  if (locales[name].parentLocale != null) {
                      locales[name] = locales[name].parentLocale;
                  } else if (locales[name] != null) {
                      delete locales[name];
                  }
              }
          }
          return locales[name];
      }

      // returns locale data
      function getLocale (key) {
          var locale;

          if (key && key._locale && key._locale._abbr) {
              key = key._locale._abbr;
          }

          if (!key) {
              return globalLocale;
          }

          if (!isArray(key)) {
              //short-circuit everything else
              locale = loadLocale(key);
              if (locale) {
                  return locale;
              }
              key = [key];
          }

          return chooseLocale(key);
      }

      function listLocales() {
          return keys(locales);
      }

      function checkOverflow (m) {
          var overflow;
          var a = m._a;

          if (a && getParsingFlags(m).overflow === -2) {
              overflow =
                  a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                  a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                  a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                  a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                  a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                  a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                  -1;

              if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                  overflow = DATE;
              }
              if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                  overflow = WEEK;
              }
              if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                  overflow = WEEKDAY;
              }

              getParsingFlags(m).overflow = overflow;
          }

          return m;
      }

      // Pick the first defined of two or three arguments.
      function defaults(a, b, c) {
          if (a != null) {
              return a;
          }
          if (b != null) {
              return b;
          }
          return c;
      }

      function currentDateArray(config) {
          // hooks is actually the exported moment object
          var nowValue = new Date(hooks.now());
          if (config._useUTC) {
              return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
          }
          return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
      }

      // convert an array to a date.
      // the array should mirror the parameters below
      // note: all values past the year are optional and will default to the lowest possible value.
      // [year, month, day , hour, minute, second, millisecond]
      function configFromArray (config) {
          var i, date, input = [], currentDate, expectedWeekday, yearToUse;

          if (config._d) {
              return;
          }

          currentDate = currentDateArray(config);

          //compute day of the year from weeks and weekdays
          if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
              dayOfYearFromWeekInfo(config);
          }

          //if the day of the year is set, figure out what it is
          if (config._dayOfYear != null) {
              yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

              if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                  getParsingFlags(config)._overflowDayOfYear = true;
              }

              date = createUTCDate(yearToUse, 0, config._dayOfYear);
              config._a[MONTH] = date.getUTCMonth();
              config._a[DATE] = date.getUTCDate();
          }

          // Default to current date.
          // * if no year, month, day of month are given, default to today
          // * if day of month is given, default month and year
          // * if month is given, default only year
          // * if year is given, don't default anything
          for (i = 0; i < 3 && config._a[i] == null; ++i) {
              config._a[i] = input[i] = currentDate[i];
          }

          // Zero out whatever was not defaulted, including time
          for (; i < 7; i++) {
              config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
          }

          // Check for 24:00:00.000
          if (config._a[HOUR] === 24 &&
                  config._a[MINUTE] === 0 &&
                  config._a[SECOND] === 0 &&
                  config._a[MILLISECOND] === 0) {
              config._nextDay = true;
              config._a[HOUR] = 0;
          }

          config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
          expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

          // Apply timezone offset from input. The actual utcOffset can be changed
          // with parseZone.
          if (config._tzm != null) {
              config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
          }

          if (config._nextDay) {
              config._a[HOUR] = 24;
          }

          // check for mismatching day of week
          if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
              getParsingFlags(config).weekdayMismatch = true;
          }
      }

      function dayOfYearFromWeekInfo(config) {
          var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

          w = config._w;
          if (w.GG != null || w.W != null || w.E != null) {
              dow = 1;
              doy = 4;

              // TODO: We need to take the current isoWeekYear, but that depends on
              // how we interpret now (local, utc, fixed offset). So create
              // a now version of current config (take local/utc/offset flags, and
              // create now).
              weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
              week = defaults(w.W, 1);
              weekday = defaults(w.E, 1);
              if (weekday < 1 || weekday > 7) {
                  weekdayOverflow = true;
              }
          } else {
              dow = config._locale._week.dow;
              doy = config._locale._week.doy;

              var curWeek = weekOfYear(createLocal(), dow, doy);

              weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

              // Default to current week.
              week = defaults(w.w, curWeek.week);

              if (w.d != null) {
                  // weekday -- low day numbers are considered next week
                  weekday = w.d;
                  if (weekday < 0 || weekday > 6) {
                      weekdayOverflow = true;
                  }
              } else if (w.e != null) {
                  // local weekday -- counting starts from beginning of week
                  weekday = w.e + dow;
                  if (w.e < 0 || w.e > 6) {
                      weekdayOverflow = true;
                  }
              } else {
                  // default to beginning of week
                  weekday = dow;
              }
          }
          if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
              getParsingFlags(config)._overflowWeeks = true;
          } else if (weekdayOverflow != null) {
              getParsingFlags(config)._overflowWeekday = true;
          } else {
              temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
              config._a[YEAR] = temp.year;
              config._dayOfYear = temp.dayOfYear;
          }
      }

      // iso 8601 regex
      // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
      var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
      var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

      var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

      var isoDates = [
          ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
          ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
          ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
          ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
          ['YYYY-DDD', /\d{4}-\d{3}/],
          ['YYYY-MM', /\d{4}-\d\d/, false],
          ['YYYYYYMMDD', /[+-]\d{10}/],
          ['YYYYMMDD', /\d{8}/],
          // YYYYMM is NOT allowed by the standard
          ['GGGG[W]WWE', /\d{4}W\d{3}/],
          ['GGGG[W]WW', /\d{4}W\d{2}/, false],
          ['YYYYDDD', /\d{7}/]
      ];

      // iso time formats and regexes
      var isoTimes = [
          ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
          ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
          ['HH:mm:ss', /\d\d:\d\d:\d\d/],
          ['HH:mm', /\d\d:\d\d/],
          ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
          ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
          ['HHmmss', /\d\d\d\d\d\d/],
          ['HHmm', /\d\d\d\d/],
          ['HH', /\d\d/]
      ];

      var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

      // date from iso format
      function configFromISO(config) {
          var i, l,
              string = config._i,
              match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
              allowTime, dateFormat, timeFormat, tzFormat;

          if (match) {
              getParsingFlags(config).iso = true;

              for (i = 0, l = isoDates.length; i < l; i++) {
                  if (isoDates[i][1].exec(match[1])) {
                      dateFormat = isoDates[i][0];
                      allowTime = isoDates[i][2] !== false;
                      break;
                  }
              }
              if (dateFormat == null) {
                  config._isValid = false;
                  return;
              }
              if (match[3]) {
                  for (i = 0, l = isoTimes.length; i < l; i++) {
                      if (isoTimes[i][1].exec(match[3])) {
                          // match[2] should be 'T' or space
                          timeFormat = (match[2] || ' ') + isoTimes[i][0];
                          break;
                      }
                  }
                  if (timeFormat == null) {
                      config._isValid = false;
                      return;
                  }
              }
              if (!allowTime && timeFormat != null) {
                  config._isValid = false;
                  return;
              }
              if (match[4]) {
                  if (tzRegex.exec(match[4])) {
                      tzFormat = 'Z';
                  } else {
                      config._isValid = false;
                      return;
                  }
              }
              config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
              configFromStringAndFormat(config);
          } else {
              config._isValid = false;
          }
      }

      // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
      var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

      function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
          var result = [
              untruncateYear(yearStr),
              defaultLocaleMonthsShort.indexOf(monthStr),
              parseInt(dayStr, 10),
              parseInt(hourStr, 10),
              parseInt(minuteStr, 10)
          ];

          if (secondStr) {
              result.push(parseInt(secondStr, 10));
          }

          return result;
      }

      function untruncateYear(yearStr) {
          var year = parseInt(yearStr, 10);
          if (year <= 49) {
              return 2000 + year;
          } else if (year <= 999) {
              return 1900 + year;
          }
          return year;
      }

      function preprocessRFC2822(s) {
          // Remove comments and folding whitespace and replace multiple-spaces with a single space
          return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      }

      function checkWeekday(weekdayStr, parsedInput, config) {
          if (weekdayStr) {
              // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
              var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                  weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
              if (weekdayProvided !== weekdayActual) {
                  getParsingFlags(config).weekdayMismatch = true;
                  config._isValid = false;
                  return false;
              }
          }
          return true;
      }

      var obsOffsets = {
          UT: 0,
          GMT: 0,
          EDT: -4 * 60,
          EST: -5 * 60,
          CDT: -5 * 60,
          CST: -6 * 60,
          MDT: -6 * 60,
          MST: -7 * 60,
          PDT: -7 * 60,
          PST: -8 * 60
      };

      function calculateOffset(obsOffset, militaryOffset, numOffset) {
          if (obsOffset) {
              return obsOffsets[obsOffset];
          } else if (militaryOffset) {
              // the only allowed military tz is Z
              return 0;
          } else {
              var hm = parseInt(numOffset, 10);
              var m = hm % 100, h = (hm - m) / 100;
              return h * 60 + m;
          }
      }

      // date and time from ref 2822 format
      function configFromRFC2822(config) {
          var match = rfc2822.exec(preprocessRFC2822(config._i));
          if (match) {
              var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
              if (!checkWeekday(match[1], parsedArray, config)) {
                  return;
              }

              config._a = parsedArray;
              config._tzm = calculateOffset(match[8], match[9], match[10]);

              config._d = createUTCDate.apply(null, config._a);
              config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

              getParsingFlags(config).rfc2822 = true;
          } else {
              config._isValid = false;
          }
      }

      // date from iso format or fallback
      function configFromString(config) {
          var matched = aspNetJsonRegex.exec(config._i);

          if (matched !== null) {
              config._d = new Date(+matched[1]);
              return;
          }

          configFromISO(config);
          if (config._isValid === false) {
              delete config._isValid;
          } else {
              return;
          }

          configFromRFC2822(config);
          if (config._isValid === false) {
              delete config._isValid;
          } else {
              return;
          }

          // Final attempt, use Input Fallback
          hooks.createFromInputFallback(config);
      }

      hooks.createFromInputFallback = deprecate(
          'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
          'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
          'discouraged and will be removed in an upcoming major release. Please refer to ' +
          'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
          function (config) {
              config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
          }
      );

      // constant that refers to the ISO standard
      hooks.ISO_8601 = function () {};

      // constant that refers to the RFC 2822 form
      hooks.RFC_2822 = function () {};

      // date from string and format string
      function configFromStringAndFormat(config) {
          // TODO: Move this to another part of the creation flow to prevent circular deps
          if (config._f === hooks.ISO_8601) {
              configFromISO(config);
              return;
          }
          if (config._f === hooks.RFC_2822) {
              configFromRFC2822(config);
              return;
          }
          config._a = [];
          getParsingFlags(config).empty = true;

          // This array is used to make a Date, either with `new Date` or `Date.UTC`
          var string = '' + config._i,
              i, parsedInput, tokens, token, skipped,
              stringLength = string.length,
              totalParsedInputLength = 0;

          tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

          for (i = 0; i < tokens.length; i++) {
              token = tokens[i];
              parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
              // console.log('token', token, 'parsedInput', parsedInput,
              //         'regex', getParseRegexForToken(token, config));
              if (parsedInput) {
                  skipped = string.substr(0, string.indexOf(parsedInput));
                  if (skipped.length > 0) {
                      getParsingFlags(config).unusedInput.push(skipped);
                  }
                  string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                  totalParsedInputLength += parsedInput.length;
              }
              // don't parse if it's not a known token
              if (formatTokenFunctions[token]) {
                  if (parsedInput) {
                      getParsingFlags(config).empty = false;
                  }
                  else {
                      getParsingFlags(config).unusedTokens.push(token);
                  }
                  addTimeToArrayFromToken(token, parsedInput, config);
              }
              else if (config._strict && !parsedInput) {
                  getParsingFlags(config).unusedTokens.push(token);
              }
          }

          // add remaining unparsed input length to the string
          getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
          if (string.length > 0) {
              getParsingFlags(config).unusedInput.push(string);
          }

          // clear _12h flag if hour is <= 12
          if (config._a[HOUR] <= 12 &&
              getParsingFlags(config).bigHour === true &&
              config._a[HOUR] > 0) {
              getParsingFlags(config).bigHour = undefined;
          }

          getParsingFlags(config).parsedDateParts = config._a.slice(0);
          getParsingFlags(config).meridiem = config._meridiem;
          // handle meridiem
          config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

          configFromArray(config);
          checkOverflow(config);
      }


      function meridiemFixWrap (locale, hour, meridiem) {
          var isPm;

          if (meridiem == null) {
              // nothing to do
              return hour;
          }
          if (locale.meridiemHour != null) {
              return locale.meridiemHour(hour, meridiem);
          } else if (locale.isPM != null) {
              // Fallback
              isPm = locale.isPM(meridiem);
              if (isPm && hour < 12) {
                  hour += 12;
              }
              if (!isPm && hour === 12) {
                  hour = 0;
              }
              return hour;
          } else {
              // this is not supposed to happen
              return hour;
          }
      }

      // date from string and array of format strings
      function configFromStringAndArray(config) {
          var tempConfig,
              bestMoment,

              scoreToBeat,
              i,
              currentScore;

          if (config._f.length === 0) {
              getParsingFlags(config).invalidFormat = true;
              config._d = new Date(NaN);
              return;
          }

          for (i = 0; i < config._f.length; i++) {
              currentScore = 0;
              tempConfig = copyConfig({}, config);
              if (config._useUTC != null) {
                  tempConfig._useUTC = config._useUTC;
              }
              tempConfig._f = config._f[i];
              configFromStringAndFormat(tempConfig);

              if (!isValid(tempConfig)) {
                  continue;
              }

              // if there is any input that was not parsed add a penalty for that format
              currentScore += getParsingFlags(tempConfig).charsLeftOver;

              //or tokens
              currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

              getParsingFlags(tempConfig).score = currentScore;

              if (scoreToBeat == null || currentScore < scoreToBeat) {
                  scoreToBeat = currentScore;
                  bestMoment = tempConfig;
              }
          }

          extend(config, bestMoment || tempConfig);
      }

      function configFromObject(config) {
          if (config._d) {
              return;
          }

          var i = normalizeObjectUnits(config._i);
          config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
              return obj && parseInt(obj, 10);
          });

          configFromArray(config);
      }

      function createFromConfig (config) {
          var res = new Moment(checkOverflow(prepareConfig(config)));
          if (res._nextDay) {
              // Adding is smart enough around DST
              res.add(1, 'd');
              res._nextDay = undefined;
          }

          return res;
      }

      function prepareConfig (config) {
          var input = config._i,
              format = config._f;

          config._locale = config._locale || getLocale(config._l);

          if (input === null || (format === undefined && input === '')) {
              return createInvalid({nullInput: true});
          }

          if (typeof input === 'string') {
              config._i = input = config._locale.preparse(input);
          }

          if (isMoment(input)) {
              return new Moment(checkOverflow(input));
          } else if (isDate(input)) {
              config._d = input;
          } else if (isArray(format)) {
              configFromStringAndArray(config);
          } else if (format) {
              configFromStringAndFormat(config);
          }  else {
              configFromInput(config);
          }

          if (!isValid(config)) {
              config._d = null;
          }

          return config;
      }

      function configFromInput(config) {
          var input = config._i;
          if (isUndefined(input)) {
              config._d = new Date(hooks.now());
          } else if (isDate(input)) {
              config._d = new Date(input.valueOf());
          } else if (typeof input === 'string') {
              configFromString(config);
          } else if (isArray(input)) {
              config._a = map(input.slice(0), function (obj) {
                  return parseInt(obj, 10);
              });
              configFromArray(config);
          } else if (isObject(input)) {
              configFromObject(config);
          } else if (isNumber(input)) {
              // from milliseconds
              config._d = new Date(input);
          } else {
              hooks.createFromInputFallback(config);
          }
      }

      function createLocalOrUTC (input, format, locale, strict, isUTC) {
          var c = {};

          if (locale === true || locale === false) {
              strict = locale;
              locale = undefined;
          }

          if ((isObject(input) && isObjectEmpty(input)) ||
                  (isArray(input) && input.length === 0)) {
              input = undefined;
          }
          // object construction must be done this way.
          // https://github.com/moment/moment/issues/1423
          c._isAMomentObject = true;
          c._useUTC = c._isUTC = isUTC;
          c._l = locale;
          c._i = input;
          c._f = format;
          c._strict = strict;

          return createFromConfig(c);
      }

      function createLocal (input, format, locale, strict) {
          return createLocalOrUTC(input, format, locale, strict, false);
      }

      var prototypeMin = deprecate(
          'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
          function () {
              var other = createLocal.apply(null, arguments);
              if (this.isValid() && other.isValid()) {
                  return other < this ? this : other;
              } else {
                  return createInvalid();
              }
          }
      );

      var prototypeMax = deprecate(
          'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
          function () {
              var other = createLocal.apply(null, arguments);
              if (this.isValid() && other.isValid()) {
                  return other > this ? this : other;
              } else {
                  return createInvalid();
              }
          }
      );

      // Pick a moment m from moments so that m[fn](other) is true for all
      // other. This relies on the function fn to be transitive.
      //
      // moments should either be an array of moment objects or an array, whose
      // first element is an array of moment objects.
      function pickBy(fn, moments) {
          var res, i;
          if (moments.length === 1 && isArray(moments[0])) {
              moments = moments[0];
          }
          if (!moments.length) {
              return createLocal();
          }
          res = moments[0];
          for (i = 1; i < moments.length; ++i) {
              if (!moments[i].isValid() || moments[i][fn](res)) {
                  res = moments[i];
              }
          }
          return res;
      }

      // TODO: Use [].sort instead?
      function min () {
          var args = [].slice.call(arguments, 0);

          return pickBy('isBefore', args);
      }

      function max () {
          var args = [].slice.call(arguments, 0);

          return pickBy('isAfter', args);
      }

      var now = function () {
          return Date.now ? Date.now() : +(new Date());
      };

      var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

      function isDurationValid(m) {
          for (var key in m) {
              if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                  return false;
              }
          }

          var unitHasDecimal = false;
          for (var i = 0; i < ordering.length; ++i) {
              if (m[ordering[i]]) {
                  if (unitHasDecimal) {
                      return false; // only allow non-integers for smallest unit
                  }
                  if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                      unitHasDecimal = true;
                  }
              }
          }

          return true;
      }

      function isValid$1() {
          return this._isValid;
      }

      function createInvalid$1() {
          return createDuration(NaN);
      }

      function Duration (duration) {
          var normalizedInput = normalizeObjectUnits(duration),
              years = normalizedInput.year || 0,
              quarters = normalizedInput.quarter || 0,
              months = normalizedInput.month || 0,
              weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
              days = normalizedInput.day || 0,
              hours = normalizedInput.hour || 0,
              minutes = normalizedInput.minute || 0,
              seconds = normalizedInput.second || 0,
              milliseconds = normalizedInput.millisecond || 0;

          this._isValid = isDurationValid(normalizedInput);

          // representation for dateAddRemove
          this._milliseconds = +milliseconds +
              seconds * 1e3 + // 1000
              minutes * 6e4 + // 1000 * 60
              hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
          // Because of dateAddRemove treats 24 hours as different from a
          // day when working around DST, we need to store them separately
          this._days = +days +
              weeks * 7;
          // It is impossible to translate months into days without knowing
          // which months you are are talking about, so we have to store
          // it separately.
          this._months = +months +
              quarters * 3 +
              years * 12;

          this._data = {};

          this._locale = getLocale();

          this._bubble();
      }

      function isDuration (obj) {
          return obj instanceof Duration;
      }

      function absRound (number) {
          if (number < 0) {
              return Math.round(-1 * number) * -1;
          } else {
              return Math.round(number);
          }
      }

      // FORMATTING

      function offset (token, separator) {
          addFormatToken(token, 0, 0, function () {
              var offset = this.utcOffset();
              var sign = '+';
              if (offset < 0) {
                  offset = -offset;
                  sign = '-';
              }
              return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
          });
      }

      offset('Z', ':');
      offset('ZZ', '');

      // PARSING

      addRegexToken('Z',  matchShortOffset);
      addRegexToken('ZZ', matchShortOffset);
      addParseToken(['Z', 'ZZ'], function (input, array, config) {
          config._useUTC = true;
          config._tzm = offsetFromString(matchShortOffset, input);
      });

      // HELPERS

      // timezone chunker
      // '+10:00' > ['10',  '00']
      // '-1530'  > ['-15', '30']
      var chunkOffset = /([\+\-]|\d\d)/gi;

      function offsetFromString(matcher, string) {
          var matches = (string || '').match(matcher);

          if (matches === null) {
              return null;
          }

          var chunk   = matches[matches.length - 1] || [];
          var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
          var minutes = +(parts[1] * 60) + toInt(parts[2]);

          return minutes === 0 ?
            0 :
            parts[0] === '+' ? minutes : -minutes;
      }

      // Return a moment from input, that is local/utc/zone equivalent to model.
      function cloneWithOffset(input, model) {
          var res, diff;
          if (model._isUTC) {
              res = model.clone();
              diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
              // Use low-level api, because this fn is low-level api.
              res._d.setTime(res._d.valueOf() + diff);
              hooks.updateOffset(res, false);
              return res;
          } else {
              return createLocal(input).local();
          }
      }

      function getDateOffset (m) {
          // On Firefox.24 Date#getTimezoneOffset returns a floating point.
          // https://github.com/moment/moment/pull/1871
          return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
      }

      // HOOKS

      // This function will be called whenever a moment is mutated.
      // It is intended to keep the offset in sync with the timezone.
      hooks.updateOffset = function () {};

      // MOMENTS

      // keepLocalTime = true means only change the timezone, without
      // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
      // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
      // +0200, so we adjust the time as needed, to be valid.
      //
      // Keeping the time actually adds/subtracts (one hour)
      // from the actual represented time. That is why we call updateOffset
      // a second time. In case it wants us to change the offset again
      // _changeInProgress == true case, then we have to adjust, because
      // there is no such time in the given timezone.
      function getSetOffset (input, keepLocalTime, keepMinutes) {
          var offset = this._offset || 0,
              localAdjust;
          if (!this.isValid()) {
              return input != null ? this : NaN;
          }
          if (input != null) {
              if (typeof input === 'string') {
                  input = offsetFromString(matchShortOffset, input);
                  if (input === null) {
                      return this;
                  }
              } else if (Math.abs(input) < 16 && !keepMinutes) {
                  input = input * 60;
              }
              if (!this._isUTC && keepLocalTime) {
                  localAdjust = getDateOffset(this);
              }
              this._offset = input;
              this._isUTC = true;
              if (localAdjust != null) {
                  this.add(localAdjust, 'm');
              }
              if (offset !== input) {
                  if (!keepLocalTime || this._changeInProgress) {
                      addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                  } else if (!this._changeInProgress) {
                      this._changeInProgress = true;
                      hooks.updateOffset(this, true);
                      this._changeInProgress = null;
                  }
              }
              return this;
          } else {
              return this._isUTC ? offset : getDateOffset(this);
          }
      }

      function getSetZone (input, keepLocalTime) {
          if (input != null) {
              if (typeof input !== 'string') {
                  input = -input;
              }

              this.utcOffset(input, keepLocalTime);

              return this;
          } else {
              return -this.utcOffset();
          }
      }

      function setOffsetToUTC (keepLocalTime) {
          return this.utcOffset(0, keepLocalTime);
      }

      function setOffsetToLocal (keepLocalTime) {
          if (this._isUTC) {
              this.utcOffset(0, keepLocalTime);
              this._isUTC = false;

              if (keepLocalTime) {
                  this.subtract(getDateOffset(this), 'm');
              }
          }
          return this;
      }

      function setOffsetToParsedOffset () {
          if (this._tzm != null) {
              this.utcOffset(this._tzm, false, true);
          } else if (typeof this._i === 'string') {
              var tZone = offsetFromString(matchOffset, this._i);
              if (tZone != null) {
                  this.utcOffset(tZone);
              }
              else {
                  this.utcOffset(0, true);
              }
          }
          return this;
      }

      function hasAlignedHourOffset (input) {
          if (!this.isValid()) {
              return false;
          }
          input = input ? createLocal(input).utcOffset() : 0;

          return (this.utcOffset() - input) % 60 === 0;
      }

      function isDaylightSavingTime () {
          return (
              this.utcOffset() > this.clone().month(0).utcOffset() ||
              this.utcOffset() > this.clone().month(5).utcOffset()
          );
      }

      function isDaylightSavingTimeShifted () {
          if (!isUndefined(this._isDSTShifted)) {
              return this._isDSTShifted;
          }

          var c = {};

          copyConfig(c, this);
          c = prepareConfig(c);

          if (c._a) {
              var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
              this._isDSTShifted = this.isValid() &&
                  compareArrays(c._a, other.toArray()) > 0;
          } else {
              this._isDSTShifted = false;
          }

          return this._isDSTShifted;
      }

      function isLocal () {
          return this.isValid() ? !this._isUTC : false;
      }

      function isUtcOffset () {
          return this.isValid() ? this._isUTC : false;
      }

      function isUtc () {
          return this.isValid() ? this._isUTC && this._offset === 0 : false;
      }

      // ASP.NET json date format regex
      var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

      // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
      // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
      // and further modified to allow for strings containing both week and day
      var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

      function createDuration (input, key) {
          var duration = input,
              // matching against regexp is expensive, do it on demand
              match = null,
              sign,
              ret,
              diffRes;

          if (isDuration(input)) {
              duration = {
                  ms : input._milliseconds,
                  d  : input._days,
                  M  : input._months
              };
          } else if (isNumber(input)) {
              duration = {};
              if (key) {
                  duration[key] = input;
              } else {
                  duration.milliseconds = input;
              }
          } else if (!!(match = aspNetRegex.exec(input))) {
              sign = (match[1] === '-') ? -1 : 1;
              duration = {
                  y  : 0,
                  d  : toInt(match[DATE])                         * sign,
                  h  : toInt(match[HOUR])                         * sign,
                  m  : toInt(match[MINUTE])                       * sign,
                  s  : toInt(match[SECOND])                       * sign,
                  ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
              };
          } else if (!!(match = isoRegex.exec(input))) {
              sign = (match[1] === '-') ? -1 : 1;
              duration = {
                  y : parseIso(match[2], sign),
                  M : parseIso(match[3], sign),
                  w : parseIso(match[4], sign),
                  d : parseIso(match[5], sign),
                  h : parseIso(match[6], sign),
                  m : parseIso(match[7], sign),
                  s : parseIso(match[8], sign)
              };
          } else if (duration == null) {// checks for null or undefined
              duration = {};
          } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
              diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

              duration = {};
              duration.ms = diffRes.milliseconds;
              duration.M = diffRes.months;
          }

          ret = new Duration(duration);

          if (isDuration(input) && hasOwnProp(input, '_locale')) {
              ret._locale = input._locale;
          }

          return ret;
      }

      createDuration.fn = Duration.prototype;
      createDuration.invalid = createInvalid$1;

      function parseIso (inp, sign) {
          // We'd normally use ~~inp for this, but unfortunately it also
          // converts floats to ints.
          // inp may be undefined, so careful calling replace on it.
          var res = inp && parseFloat(inp.replace(',', '.'));
          // apply sign while we're at it
          return (isNaN(res) ? 0 : res) * sign;
      }

      function positiveMomentsDifference(base, other) {
          var res = {};

          res.months = other.month() - base.month() +
              (other.year() - base.year()) * 12;
          if (base.clone().add(res.months, 'M').isAfter(other)) {
              --res.months;
          }

          res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

          return res;
      }

      function momentsDifference(base, other) {
          var res;
          if (!(base.isValid() && other.isValid())) {
              return {milliseconds: 0, months: 0};
          }

          other = cloneWithOffset(other, base);
          if (base.isBefore(other)) {
              res = positiveMomentsDifference(base, other);
          } else {
              res = positiveMomentsDifference(other, base);
              res.milliseconds = -res.milliseconds;
              res.months = -res.months;
          }

          return res;
      }

      // TODO: remove 'name' arg after deprecation is removed
      function createAdder(direction, name) {
          return function (val, period) {
              var dur, tmp;
              //invert the arguments, but complain about it
              if (period !== null && !isNaN(+period)) {
                  deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                  'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                  tmp = val; val = period; period = tmp;
              }

              val = typeof val === 'string' ? +val : val;
              dur = createDuration(val, period);
              addSubtract(this, dur, direction);
              return this;
          };
      }

      function addSubtract (mom, duration, isAdding, updateOffset) {
          var milliseconds = duration._milliseconds,
              days = absRound(duration._days),
              months = absRound(duration._months);

          if (!mom.isValid()) {
              // No op
              return;
          }

          updateOffset = updateOffset == null ? true : updateOffset;

          if (months) {
              setMonth(mom, get(mom, 'Month') + months * isAdding);
          }
          if (days) {
              set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
          }
          if (milliseconds) {
              mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
          }
          if (updateOffset) {
              hooks.updateOffset(mom, days || months);
          }
      }

      var add      = createAdder(1, 'add');
      var subtract = createAdder(-1, 'subtract');

      function getCalendarFormat(myMoment, now) {
          var diff = myMoment.diff(now, 'days', true);
          return diff < -6 ? 'sameElse' :
                  diff < -1 ? 'lastWeek' :
                  diff < 0 ? 'lastDay' :
                  diff < 1 ? 'sameDay' :
                  diff < 2 ? 'nextDay' :
                  diff < 7 ? 'nextWeek' : 'sameElse';
      }

      function calendar$1 (time, formats) {
          // We want to compare the start of today, vs this.
          // Getting start-of-today depends on whether we're local/utc/offset or not.
          var now = time || createLocal(),
              sod = cloneWithOffset(now, this).startOf('day'),
              format = hooks.calendarFormat(this, sod) || 'sameElse';

          var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

          return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
      }

      function clone () {
          return new Moment(this);
      }

      function isAfter (input, units) {
          var localInput = isMoment(input) ? input : createLocal(input);
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() > localInput.valueOf();
          } else {
              return localInput.valueOf() < this.clone().startOf(units).valueOf();
          }
      }

      function isBefore (input, units) {
          var localInput = isMoment(input) ? input : createLocal(input);
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() < localInput.valueOf();
          } else {
              return this.clone().endOf(units).valueOf() < localInput.valueOf();
          }
      }

      function isBetween (from, to, units, inclusivity) {
          var localFrom = isMoment(from) ? from : createLocal(from),
              localTo = isMoment(to) ? to : createLocal(to);
          if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
              return false;
          }
          inclusivity = inclusivity || '()';
          return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
              (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
      }

      function isSame (input, units) {
          var localInput = isMoment(input) ? input : createLocal(input),
              inputMs;
          if (!(this.isValid() && localInput.isValid())) {
              return false;
          }
          units = normalizeUnits(units) || 'millisecond';
          if (units === 'millisecond') {
              return this.valueOf() === localInput.valueOf();
          } else {
              inputMs = localInput.valueOf();
              return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
          }
      }

      function isSameOrAfter (input, units) {
          return this.isSame(input, units) || this.isAfter(input, units);
      }

      function isSameOrBefore (input, units) {
          return this.isSame(input, units) || this.isBefore(input, units);
      }

      function diff (input, units, asFloat) {
          var that,
              zoneDelta,
              output;

          if (!this.isValid()) {
              return NaN;
          }

          that = cloneWithOffset(input, this);

          if (!that.isValid()) {
              return NaN;
          }

          zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

          units = normalizeUnits(units);

          switch (units) {
              case 'year': output = monthDiff(this, that) / 12; break;
              case 'month': output = monthDiff(this, that); break;
              case 'quarter': output = monthDiff(this, that) / 3; break;
              case 'second': output = (this - that) / 1e3; break; // 1000
              case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
              case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
              case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
              case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
              default: output = this - that;
          }

          return asFloat ? output : absFloor(output);
      }

      function monthDiff (a, b) {
          // difference in months
          var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
              // b is in (anchor - 1 month, anchor + 1 month)
              anchor = a.clone().add(wholeMonthDiff, 'months'),
              anchor2, adjust;

          if (b - anchor < 0) {
              anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
              // linear across the month
              adjust = (b - anchor) / (anchor - anchor2);
          } else {
              anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
              // linear across the month
              adjust = (b - anchor) / (anchor2 - anchor);
          }

          //check for negative zero, return zero if negative zero
          return -(wholeMonthDiff + adjust) || 0;
      }

      hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
      hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

      function toString () {
          return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
      }

      function toISOString(keepOffset) {
          if (!this.isValid()) {
              return null;
          }
          var utc = keepOffset !== true;
          var m = utc ? this.clone().utc() : this;
          if (m.year() < 0 || m.year() > 9999) {
              return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
          }
          if (isFunction(Date.prototype.toISOString)) {
              // native implementation is ~50x faster, use it when we can
              if (utc) {
                  return this.toDate().toISOString();
              } else {
                  return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
              }
          }
          return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
      }

      /**
       * Return a human readable representation of a moment that can
       * also be evaluated to get a new moment which is the same
       *
       * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
       */
      function inspect () {
          if (!this.isValid()) {
              return 'moment.invalid(/* ' + this._i + ' */)';
          }
          var func = 'moment';
          var zone = '';
          if (!this.isLocal()) {
              func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
              zone = 'Z';
          }
          var prefix = '[' + func + '("]';
          var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
          var datetime = '-MM-DD[T]HH:mm:ss.SSS';
          var suffix = zone + '[")]';

          return this.format(prefix + year + datetime + suffix);
      }

      function format (inputString) {
          if (!inputString) {
              inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
          }
          var output = formatMoment(this, inputString);
          return this.localeData().postformat(output);
      }

      function from (time, withoutSuffix) {
          if (this.isValid() &&
                  ((isMoment(time) && time.isValid()) ||
                   createLocal(time).isValid())) {
              return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
          } else {
              return this.localeData().invalidDate();
          }
      }

      function fromNow (withoutSuffix) {
          return this.from(createLocal(), withoutSuffix);
      }

      function to (time, withoutSuffix) {
          if (this.isValid() &&
                  ((isMoment(time) && time.isValid()) ||
                   createLocal(time).isValid())) {
              return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
          } else {
              return this.localeData().invalidDate();
          }
      }

      function toNow (withoutSuffix) {
          return this.to(createLocal(), withoutSuffix);
      }

      // If passed a locale key, it will set the locale for this
      // instance.  Otherwise, it will return the locale configuration
      // variables for this instance.
      function locale (key) {
          var newLocaleData;

          if (key === undefined) {
              return this._locale._abbr;
          } else {
              newLocaleData = getLocale(key);
              if (newLocaleData != null) {
                  this._locale = newLocaleData;
              }
              return this;
          }
      }

      var lang = deprecate(
          'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
          function (key) {
              if (key === undefined) {
                  return this.localeData();
              } else {
                  return this.locale(key);
              }
          }
      );

      function localeData () {
          return this._locale;
      }

      var MS_PER_SECOND = 1000;
      var MS_PER_MINUTE = 60 * MS_PER_SECOND;
      var MS_PER_HOUR = 60 * MS_PER_MINUTE;
      var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

      // actual modulo - handles negative numbers (for dates before 1970):
      function mod$1(dividend, divisor) {
          return (dividend % divisor + divisor) % divisor;
      }

      function localStartOfDate(y, m, d) {
          // the date constructor remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              return new Date(y + 400, m, d) - MS_PER_400_YEARS;
          } else {
              return new Date(y, m, d).valueOf();
          }
      }

      function utcStartOfDate(y, m, d) {
          // Date.UTC remaps years 0-99 to 1900-1999
          if (y < 100 && y >= 0) {
              // preserve leap years using a full 400 year cycle, then reset
              return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
          } else {
              return Date.UTC(y, m, d);
          }
      }

      function startOf (units) {
          var time;
          units = normalizeUnits(units);
          if (units === undefined || units === 'millisecond' || !this.isValid()) {
              return this;
          }

          var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

          switch (units) {
              case 'year':
                  time = startOfDate(this.year(), 0, 1);
                  break;
              case 'quarter':
                  time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                  break;
              case 'month':
                  time = startOfDate(this.year(), this.month(), 1);
                  break;
              case 'week':
                  time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                  break;
              case 'isoWeek':
                  time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                  break;
              case 'day':
              case 'date':
                  time = startOfDate(this.year(), this.month(), this.date());
                  break;
              case 'hour':
                  time = this._d.valueOf();
                  time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                  break;
              case 'minute':
                  time = this._d.valueOf();
                  time -= mod$1(time, MS_PER_MINUTE);
                  break;
              case 'second':
                  time = this._d.valueOf();
                  time -= mod$1(time, MS_PER_SECOND);
                  break;
          }

          this._d.setTime(time);
          hooks.updateOffset(this, true);
          return this;
      }

      function endOf (units) {
          var time;
          units = normalizeUnits(units);
          if (units === undefined || units === 'millisecond' || !this.isValid()) {
              return this;
          }

          var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

          switch (units) {
              case 'year':
                  time = startOfDate(this.year() + 1, 0, 1) - 1;
                  break;
              case 'quarter':
                  time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                  break;
              case 'month':
                  time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                  break;
              case 'week':
                  time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                  break;
              case 'isoWeek':
                  time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                  break;
              case 'day':
              case 'date':
                  time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                  break;
              case 'hour':
                  time = this._d.valueOf();
                  time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                  break;
              case 'minute':
                  time = this._d.valueOf();
                  time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                  break;
              case 'second':
                  time = this._d.valueOf();
                  time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                  break;
          }

          this._d.setTime(time);
          hooks.updateOffset(this, true);
          return this;
      }

      function valueOf () {
          return this._d.valueOf() - ((this._offset || 0) * 60000);
      }

      function unix () {
          return Math.floor(this.valueOf() / 1000);
      }

      function toDate () {
          return new Date(this.valueOf());
      }

      function toArray () {
          var m = this;
          return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
      }

      function toObject () {
          var m = this;
          return {
              years: m.year(),
              months: m.month(),
              date: m.date(),
              hours: m.hours(),
              minutes: m.minutes(),
              seconds: m.seconds(),
              milliseconds: m.milliseconds()
          };
      }

      function toJSON () {
          // new Date(NaN).toJSON() === null
          return this.isValid() ? this.toISOString() : null;
      }

      function isValid$2 () {
          return isValid(this);
      }

      function parsingFlags () {
          return extend({}, getParsingFlags(this));
      }

      function invalidAt () {
          return getParsingFlags(this).overflow;
      }

      function creationData() {
          return {
              input: this._i,
              format: this._f,
              locale: this._locale,
              isUTC: this._isUTC,
              strict: this._strict
          };
      }

      // FORMATTING

      addFormatToken(0, ['gg', 2], 0, function () {
          return this.weekYear() % 100;
      });

      addFormatToken(0, ['GG', 2], 0, function () {
          return this.isoWeekYear() % 100;
      });

      function addWeekYearFormatToken (token, getter) {
          addFormatToken(0, [token, token.length], 0, getter);
      }

      addWeekYearFormatToken('gggg',     'weekYear');
      addWeekYearFormatToken('ggggg',    'weekYear');
      addWeekYearFormatToken('GGGG',  'isoWeekYear');
      addWeekYearFormatToken('GGGGG', 'isoWeekYear');

      // ALIASES

      addUnitAlias('weekYear', 'gg');
      addUnitAlias('isoWeekYear', 'GG');

      // PRIORITY

      addUnitPriority('weekYear', 1);
      addUnitPriority('isoWeekYear', 1);


      // PARSING

      addRegexToken('G',      matchSigned);
      addRegexToken('g',      matchSigned);
      addRegexToken('GG',     match1to2, match2);
      addRegexToken('gg',     match1to2, match2);
      addRegexToken('GGGG',   match1to4, match4);
      addRegexToken('gggg',   match1to4, match4);
      addRegexToken('GGGGG',  match1to6, match6);
      addRegexToken('ggggg',  match1to6, match6);

      addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
          week[token.substr(0, 2)] = toInt(input);
      });

      addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
          week[token] = hooks.parseTwoDigitYear(input);
      });

      // MOMENTS

      function getSetWeekYear (input) {
          return getSetWeekYearHelper.call(this,
                  input,
                  this.week(),
                  this.weekday(),
                  this.localeData()._week.dow,
                  this.localeData()._week.doy);
      }

      function getSetISOWeekYear (input) {
          return getSetWeekYearHelper.call(this,
                  input, this.isoWeek(), this.isoWeekday(), 1, 4);
      }

      function getISOWeeksInYear () {
          return weeksInYear(this.year(), 1, 4);
      }

      function getWeeksInYear () {
          var weekInfo = this.localeData()._week;
          return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
      }

      function getSetWeekYearHelper(input, week, weekday, dow, doy) {
          var weeksTarget;
          if (input == null) {
              return weekOfYear(this, dow, doy).year;
          } else {
              weeksTarget = weeksInYear(input, dow, doy);
              if (week > weeksTarget) {
                  week = weeksTarget;
              }
              return setWeekAll.call(this, input, week, weekday, dow, doy);
          }
      }

      function setWeekAll(weekYear, week, weekday, dow, doy) {
          var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
              date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

          this.year(date.getUTCFullYear());
          this.month(date.getUTCMonth());
          this.date(date.getUTCDate());
          return this;
      }

      // FORMATTING

      addFormatToken('Q', 0, 'Qo', 'quarter');

      // ALIASES

      addUnitAlias('quarter', 'Q');

      // PRIORITY

      addUnitPriority('quarter', 7);

      // PARSING

      addRegexToken('Q', match1);
      addParseToken('Q', function (input, array) {
          array[MONTH] = (toInt(input) - 1) * 3;
      });

      // MOMENTS

      function getSetQuarter (input) {
          return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
      }

      // FORMATTING

      addFormatToken('D', ['DD', 2], 'Do', 'date');

      // ALIASES

      addUnitAlias('date', 'D');

      // PRIORITY
      addUnitPriority('date', 9);

      // PARSING

      addRegexToken('D',  match1to2);
      addRegexToken('DD', match1to2, match2);
      addRegexToken('Do', function (isStrict, locale) {
          // TODO: Remove "ordinalParse" fallback in next major release.
          return isStrict ?
            (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
            locale._dayOfMonthOrdinalParseLenient;
      });

      addParseToken(['D', 'DD'], DATE);
      addParseToken('Do', function (input, array) {
          array[DATE] = toInt(input.match(match1to2)[0]);
      });

      // MOMENTS

      var getSetDayOfMonth = makeGetSet('Date', true);

      // FORMATTING

      addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

      // ALIASES

      addUnitAlias('dayOfYear', 'DDD');

      // PRIORITY
      addUnitPriority('dayOfYear', 4);

      // PARSING

      addRegexToken('DDD',  match1to3);
      addRegexToken('DDDD', match3);
      addParseToken(['DDD', 'DDDD'], function (input, array, config) {
          config._dayOfYear = toInt(input);
      });

      // HELPERS

      // MOMENTS

      function getSetDayOfYear (input) {
          var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
          return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
      }

      // FORMATTING

      addFormatToken('m', ['mm', 2], 0, 'minute');

      // ALIASES

      addUnitAlias('minute', 'm');

      // PRIORITY

      addUnitPriority('minute', 14);

      // PARSING

      addRegexToken('m',  match1to2);
      addRegexToken('mm', match1to2, match2);
      addParseToken(['m', 'mm'], MINUTE);

      // MOMENTS

      var getSetMinute = makeGetSet('Minutes', false);

      // FORMATTING

      addFormatToken('s', ['ss', 2], 0, 'second');

      // ALIASES

      addUnitAlias('second', 's');

      // PRIORITY

      addUnitPriority('second', 15);

      // PARSING

      addRegexToken('s',  match1to2);
      addRegexToken('ss', match1to2, match2);
      addParseToken(['s', 'ss'], SECOND);

      // MOMENTS

      var getSetSecond = makeGetSet('Seconds', false);

      // FORMATTING

      addFormatToken('S', 0, 0, function () {
          return ~~(this.millisecond() / 100);
      });

      addFormatToken(0, ['SS', 2], 0, function () {
          return ~~(this.millisecond() / 10);
      });

      addFormatToken(0, ['SSS', 3], 0, 'millisecond');
      addFormatToken(0, ['SSSS', 4], 0, function () {
          return this.millisecond() * 10;
      });
      addFormatToken(0, ['SSSSS', 5], 0, function () {
          return this.millisecond() * 100;
      });
      addFormatToken(0, ['SSSSSS', 6], 0, function () {
          return this.millisecond() * 1000;
      });
      addFormatToken(0, ['SSSSSSS', 7], 0, function () {
          return this.millisecond() * 10000;
      });
      addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
          return this.millisecond() * 100000;
      });
      addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
          return this.millisecond() * 1000000;
      });


      // ALIASES

      addUnitAlias('millisecond', 'ms');

      // PRIORITY

      addUnitPriority('millisecond', 16);

      // PARSING

      addRegexToken('S',    match1to3, match1);
      addRegexToken('SS',   match1to3, match2);
      addRegexToken('SSS',  match1to3, match3);

      var token;
      for (token = 'SSSS'; token.length <= 9; token += 'S') {
          addRegexToken(token, matchUnsigned);
      }

      function parseMs(input, array) {
          array[MILLISECOND] = toInt(('0.' + input) * 1000);
      }

      for (token = 'S'; token.length <= 9; token += 'S') {
          addParseToken(token, parseMs);
      }
      // MOMENTS

      var getSetMillisecond = makeGetSet('Milliseconds', false);

      // FORMATTING

      addFormatToken('z',  0, 0, 'zoneAbbr');
      addFormatToken('zz', 0, 0, 'zoneName');

      // MOMENTS

      function getZoneAbbr () {
          return this._isUTC ? 'UTC' : '';
      }

      function getZoneName () {
          return this._isUTC ? 'Coordinated Universal Time' : '';
      }

      var proto = Moment.prototype;

      proto.add               = add;
      proto.calendar          = calendar$1;
      proto.clone             = clone;
      proto.diff              = diff;
      proto.endOf             = endOf;
      proto.format            = format;
      proto.from              = from;
      proto.fromNow           = fromNow;
      proto.to                = to;
      proto.toNow             = toNow;
      proto.get               = stringGet;
      proto.invalidAt         = invalidAt;
      proto.isAfter           = isAfter;
      proto.isBefore          = isBefore;
      proto.isBetween         = isBetween;
      proto.isSame            = isSame;
      proto.isSameOrAfter     = isSameOrAfter;
      proto.isSameOrBefore    = isSameOrBefore;
      proto.isValid           = isValid$2;
      proto.lang              = lang;
      proto.locale            = locale;
      proto.localeData        = localeData;
      proto.max               = prototypeMax;
      proto.min               = prototypeMin;
      proto.parsingFlags      = parsingFlags;
      proto.set               = stringSet;
      proto.startOf           = startOf;
      proto.subtract          = subtract;
      proto.toArray           = toArray;
      proto.toObject          = toObject;
      proto.toDate            = toDate;
      proto.toISOString       = toISOString;
      proto.inspect           = inspect;
      proto.toJSON            = toJSON;
      proto.toString          = toString;
      proto.unix              = unix;
      proto.valueOf           = valueOf;
      proto.creationData      = creationData;
      proto.year       = getSetYear;
      proto.isLeapYear = getIsLeapYear;
      proto.weekYear    = getSetWeekYear;
      proto.isoWeekYear = getSetISOWeekYear;
      proto.quarter = proto.quarters = getSetQuarter;
      proto.month       = getSetMonth;
      proto.daysInMonth = getDaysInMonth;
      proto.week           = proto.weeks        = getSetWeek;
      proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
      proto.weeksInYear    = getWeeksInYear;
      proto.isoWeeksInYear = getISOWeeksInYear;
      proto.date       = getSetDayOfMonth;
      proto.day        = proto.days             = getSetDayOfWeek;
      proto.weekday    = getSetLocaleDayOfWeek;
      proto.isoWeekday = getSetISODayOfWeek;
      proto.dayOfYear  = getSetDayOfYear;
      proto.hour = proto.hours = getSetHour;
      proto.minute = proto.minutes = getSetMinute;
      proto.second = proto.seconds = getSetSecond;
      proto.millisecond = proto.milliseconds = getSetMillisecond;
      proto.utcOffset            = getSetOffset;
      proto.utc                  = setOffsetToUTC;
      proto.local                = setOffsetToLocal;
      proto.parseZone            = setOffsetToParsedOffset;
      proto.hasAlignedHourOffset = hasAlignedHourOffset;
      proto.isDST                = isDaylightSavingTime;
      proto.isLocal              = isLocal;
      proto.isUtcOffset          = isUtcOffset;
      proto.isUtc                = isUtc;
      proto.isUTC                = isUtc;
      proto.zoneAbbr = getZoneAbbr;
      proto.zoneName = getZoneName;
      proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
      proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
      proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
      proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
      proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

      function createUnix (input) {
          return createLocal(input * 1000);
      }

      function createInZone () {
          return createLocal.apply(null, arguments).parseZone();
      }

      function preParsePostFormat (string) {
          return string;
      }

      var proto$1 = Locale.prototype;

      proto$1.calendar        = calendar;
      proto$1.longDateFormat  = longDateFormat;
      proto$1.invalidDate     = invalidDate;
      proto$1.ordinal         = ordinal;
      proto$1.preparse        = preParsePostFormat;
      proto$1.postformat      = preParsePostFormat;
      proto$1.relativeTime    = relativeTime;
      proto$1.pastFuture      = pastFuture;
      proto$1.set             = set;

      proto$1.months            =        localeMonths;
      proto$1.monthsShort       =        localeMonthsShort;
      proto$1.monthsParse       =        localeMonthsParse;
      proto$1.monthsRegex       = monthsRegex;
      proto$1.monthsShortRegex  = monthsShortRegex;
      proto$1.week = localeWeek;
      proto$1.firstDayOfYear = localeFirstDayOfYear;
      proto$1.firstDayOfWeek = localeFirstDayOfWeek;

      proto$1.weekdays       =        localeWeekdays;
      proto$1.weekdaysMin    =        localeWeekdaysMin;
      proto$1.weekdaysShort  =        localeWeekdaysShort;
      proto$1.weekdaysParse  =        localeWeekdaysParse;

      proto$1.weekdaysRegex       =        weekdaysRegex;
      proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
      proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

      proto$1.isPM = localeIsPM;
      proto$1.meridiem = localeMeridiem;

      function get$1 (format, index, field, setter) {
          var locale = getLocale();
          var utc = createUTC().set(setter, index);
          return locale[field](utc, format);
      }

      function listMonthsImpl (format, index, field) {
          if (isNumber(format)) {
              index = format;
              format = undefined;
          }

          format = format || '';

          if (index != null) {
              return get$1(format, index, field, 'month');
          }

          var i;
          var out = [];
          for (i = 0; i < 12; i++) {
              out[i] = get$1(format, i, field, 'month');
          }
          return out;
      }

      // ()
      // (5)
      // (fmt, 5)
      // (fmt)
      // (true)
      // (true, 5)
      // (true, fmt, 5)
      // (true, fmt)
      function listWeekdaysImpl (localeSorted, format, index, field) {
          if (typeof localeSorted === 'boolean') {
              if (isNumber(format)) {
                  index = format;
                  format = undefined;
              }

              format = format || '';
          } else {
              format = localeSorted;
              index = format;
              localeSorted = false;

              if (isNumber(format)) {
                  index = format;
                  format = undefined;
              }

              format = format || '';
          }

          var locale = getLocale(),
              shift = localeSorted ? locale._week.dow : 0;

          if (index != null) {
              return get$1(format, (index + shift) % 7, field, 'day');
          }

          var i;
          var out = [];
          for (i = 0; i < 7; i++) {
              out[i] = get$1(format, (i + shift) % 7, field, 'day');
          }
          return out;
      }

      function listMonths (format, index) {
          return listMonthsImpl(format, index, 'months');
      }

      function listMonthsShort (format, index) {
          return listMonthsImpl(format, index, 'monthsShort');
      }

      function listWeekdays (localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
      }

      function listWeekdaysShort (localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
      }

      function listWeekdaysMin (localeSorted, format, index) {
          return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
      }

      getSetGlobalLocale('en', {
          dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
          ordinal : function (number) {
              var b = number % 10,
                  output = (toInt(number % 100 / 10) === 1) ? 'th' :
                  (b === 1) ? 'st' :
                  (b === 2) ? 'nd' :
                  (b === 3) ? 'rd' : 'th';
              return number + output;
          }
      });

      // Side effect imports

      hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
      hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

      var mathAbs = Math.abs;

      function abs () {
          var data           = this._data;

          this._milliseconds = mathAbs(this._milliseconds);
          this._days         = mathAbs(this._days);
          this._months       = mathAbs(this._months);

          data.milliseconds  = mathAbs(data.milliseconds);
          data.seconds       = mathAbs(data.seconds);
          data.minutes       = mathAbs(data.minutes);
          data.hours         = mathAbs(data.hours);
          data.months        = mathAbs(data.months);
          data.years         = mathAbs(data.years);

          return this;
      }

      function addSubtract$1 (duration, input, value, direction) {
          var other = createDuration(input, value);

          duration._milliseconds += direction * other._milliseconds;
          duration._days         += direction * other._days;
          duration._months       += direction * other._months;

          return duration._bubble();
      }

      // supports only 2.0-style add(1, 's') or add(duration)
      function add$1 (input, value) {
          return addSubtract$1(this, input, value, 1);
      }

      // supports only 2.0-style subtract(1, 's') or subtract(duration)
      function subtract$1 (input, value) {
          return addSubtract$1(this, input, value, -1);
      }

      function absCeil (number) {
          if (number < 0) {
              return Math.floor(number);
          } else {
              return Math.ceil(number);
          }
      }

      function bubble () {
          var milliseconds = this._milliseconds;
          var days         = this._days;
          var months       = this._months;
          var data         = this._data;
          var seconds, minutes, hours, years, monthsFromDays;

          // if we have a mix of positive and negative values, bubble down first
          // check: https://github.com/moment/moment/issues/2166
          if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                  (milliseconds <= 0 && days <= 0 && months <= 0))) {
              milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
              days = 0;
              months = 0;
          }

          // The following code bubbles up values, see the tests for
          // examples of what that means.
          data.milliseconds = milliseconds % 1000;

          seconds           = absFloor(milliseconds / 1000);
          data.seconds      = seconds % 60;

          minutes           = absFloor(seconds / 60);
          data.minutes      = minutes % 60;

          hours             = absFloor(minutes / 60);
          data.hours        = hours % 24;

          days += absFloor(hours / 24);

          // convert days to months
          monthsFromDays = absFloor(daysToMonths(days));
          months += monthsFromDays;
          days -= absCeil(monthsToDays(monthsFromDays));

          // 12 months -> 1 year
          years = absFloor(months / 12);
          months %= 12;

          data.days   = days;
          data.months = months;
          data.years  = years;

          return this;
      }

      function daysToMonths (days) {
          // 400 years have 146097 days (taking into account leap year rules)
          // 400 years have 12 months === 4800
          return days * 4800 / 146097;
      }

      function monthsToDays (months) {
          // the reverse of daysToMonths
          return months * 146097 / 4800;
      }

      function as (units) {
          if (!this.isValid()) {
              return NaN;
          }
          var days;
          var months;
          var milliseconds = this._milliseconds;

          units = normalizeUnits(units);

          if (units === 'month' || units === 'quarter' || units === 'year') {
              days = this._days + milliseconds / 864e5;
              months = this._months + daysToMonths(days);
              switch (units) {
                  case 'month':   return months;
                  case 'quarter': return months / 3;
                  case 'year':    return months / 12;
              }
          } else {
              // handle milliseconds separately because of floating point math errors (issue #1867)
              days = this._days + Math.round(monthsToDays(this._months));
              switch (units) {
                  case 'week'   : return days / 7     + milliseconds / 6048e5;
                  case 'day'    : return days         + milliseconds / 864e5;
                  case 'hour'   : return days * 24    + milliseconds / 36e5;
                  case 'minute' : return days * 1440  + milliseconds / 6e4;
                  case 'second' : return days * 86400 + milliseconds / 1000;
                  // Math.floor prevents floating point math errors here
                  case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                  default: throw new Error('Unknown unit ' + units);
              }
          }
      }

      // TODO: Use this.as('ms')?
      function valueOf$1 () {
          if (!this.isValid()) {
              return NaN;
          }
          return (
              this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6
          );
      }

      function makeAs (alias) {
          return function () {
              return this.as(alias);
          };
      }

      var asMilliseconds = makeAs('ms');
      var asSeconds      = makeAs('s');
      var asMinutes      = makeAs('m');
      var asHours        = makeAs('h');
      var asDays         = makeAs('d');
      var asWeeks        = makeAs('w');
      var asMonths       = makeAs('M');
      var asQuarters     = makeAs('Q');
      var asYears        = makeAs('y');

      function clone$1 () {
          return createDuration(this);
      }

      function get$2 (units) {
          units = normalizeUnits(units);
          return this.isValid() ? this[units + 's']() : NaN;
      }

      function makeGetter(name) {
          return function () {
              return this.isValid() ? this._data[name] : NaN;
          };
      }

      var milliseconds = makeGetter('milliseconds');
      var seconds      = makeGetter('seconds');
      var minutes      = makeGetter('minutes');
      var hours        = makeGetter('hours');
      var days         = makeGetter('days');
      var months       = makeGetter('months');
      var years        = makeGetter('years');

      function weeks () {
          return absFloor(this.days() / 7);
      }

      var round = Math.round;
      var thresholds = {
          ss: 44,         // a few seconds to seconds
          s : 45,         // seconds to minute
          m : 45,         // minutes to hour
          h : 22,         // hours to day
          d : 26,         // days to month
          M : 11          // months to year
      };

      // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
      function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
          return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
      }

      function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
          var duration = createDuration(posNegDuration).abs();
          var seconds  = round(duration.as('s'));
          var minutes  = round(duration.as('m'));
          var hours    = round(duration.as('h'));
          var days     = round(duration.as('d'));
          var months   = round(duration.as('M'));
          var years    = round(duration.as('y'));

          var a = seconds <= thresholds.ss && ['s', seconds]  ||
                  seconds < thresholds.s   && ['ss', seconds] ||
                  minutes <= 1             && ['m']           ||
                  minutes < thresholds.m   && ['mm', minutes] ||
                  hours   <= 1             && ['h']           ||
                  hours   < thresholds.h   && ['hh', hours]   ||
                  days    <= 1             && ['d']           ||
                  days    < thresholds.d   && ['dd', days]    ||
                  months  <= 1             && ['M']           ||
                  months  < thresholds.M   && ['MM', months]  ||
                  years   <= 1             && ['y']           || ['yy', years];

          a[2] = withoutSuffix;
          a[3] = +posNegDuration > 0;
          a[4] = locale;
          return substituteTimeAgo.apply(null, a);
      }

      // This function allows you to set the rounding function for relative time strings
      function getSetRelativeTimeRounding (roundingFunction) {
          if (roundingFunction === undefined) {
              return round;
          }
          if (typeof(roundingFunction) === 'function') {
              round = roundingFunction;
              return true;
          }
          return false;
      }

      // This function allows you to set a threshold for relative time strings
      function getSetRelativeTimeThreshold (threshold, limit) {
          if (thresholds[threshold] === undefined) {
              return false;
          }
          if (limit === undefined) {
              return thresholds[threshold];
          }
          thresholds[threshold] = limit;
          if (threshold === 's') {
              thresholds.ss = limit - 1;
          }
          return true;
      }

      function humanize (withSuffix) {
          if (!this.isValid()) {
              return this.localeData().invalidDate();
          }

          var locale = this.localeData();
          var output = relativeTime$1(this, !withSuffix, locale);

          if (withSuffix) {
              output = locale.pastFuture(+this, output);
          }

          return locale.postformat(output);
      }

      var abs$1 = Math.abs;

      function sign(x) {
          return ((x > 0) - (x < 0)) || +x;
      }

      function toISOString$1() {
          // for ISO strings we do not use the normal bubbling rules:
          //  * milliseconds bubble up until they become hours
          //  * days do not bubble at all
          //  * months bubble up until they become years
          // This is because there is no context-free conversion between hours and days
          // (think of clock changes)
          // and also not between days and months (28-31 days per month)
          if (!this.isValid()) {
              return this.localeData().invalidDate();
          }

          var seconds = abs$1(this._milliseconds) / 1000;
          var days         = abs$1(this._days);
          var months       = abs$1(this._months);
          var minutes, hours, years;

          // 3600 seconds -> 60 minutes -> 1 hour
          minutes           = absFloor(seconds / 60);
          hours             = absFloor(minutes / 60);
          seconds %= 60;
          minutes %= 60;

          // 12 months -> 1 year
          years  = absFloor(months / 12);
          months %= 12;


          // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
          var Y = years;
          var M = months;
          var D = days;
          var h = hours;
          var m = minutes;
          var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
          var total = this.asSeconds();

          if (!total) {
              // this is the same as C#'s (Noda) and python (isodate)...
              // but not other JS (goog.date)
              return 'P0D';
          }

          var totalSign = total < 0 ? '-' : '';
          var ymSign = sign(this._months) !== sign(total) ? '-' : '';
          var daysSign = sign(this._days) !== sign(total) ? '-' : '';
          var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

          return totalSign + 'P' +
              (Y ? ymSign + Y + 'Y' : '') +
              (M ? ymSign + M + 'M' : '') +
              (D ? daysSign + D + 'D' : '') +
              ((h || m || s) ? 'T' : '') +
              (h ? hmsSign + h + 'H' : '') +
              (m ? hmsSign + m + 'M' : '') +
              (s ? hmsSign + s + 'S' : '');
      }

      var proto$2 = Duration.prototype;

      proto$2.isValid        = isValid$1;
      proto$2.abs            = abs;
      proto$2.add            = add$1;
      proto$2.subtract       = subtract$1;
      proto$2.as             = as;
      proto$2.asMilliseconds = asMilliseconds;
      proto$2.asSeconds      = asSeconds;
      proto$2.asMinutes      = asMinutes;
      proto$2.asHours        = asHours;
      proto$2.asDays         = asDays;
      proto$2.asWeeks        = asWeeks;
      proto$2.asMonths       = asMonths;
      proto$2.asQuarters     = asQuarters;
      proto$2.asYears        = asYears;
      proto$2.valueOf        = valueOf$1;
      proto$2._bubble        = bubble;
      proto$2.clone          = clone$1;
      proto$2.get            = get$2;
      proto$2.milliseconds   = milliseconds;
      proto$2.seconds        = seconds;
      proto$2.minutes        = minutes;
      proto$2.hours          = hours;
      proto$2.days           = days;
      proto$2.weeks          = weeks;
      proto$2.months         = months;
      proto$2.years          = years;
      proto$2.humanize       = humanize;
      proto$2.toISOString    = toISOString$1;
      proto$2.toString       = toISOString$1;
      proto$2.toJSON         = toISOString$1;
      proto$2.locale         = locale;
      proto$2.localeData     = localeData;

      proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
      proto$2.lang = lang;

      // Side effect imports

      // FORMATTING

      addFormatToken('X', 0, 0, 'unix');
      addFormatToken('x', 0, 0, 'valueOf');

      // PARSING

      addRegexToken('x', matchSigned);
      addRegexToken('X', matchTimestamp);
      addParseToken('X', function (input, array, config) {
          config._d = new Date(parseFloat(input, 10) * 1000);
      });
      addParseToken('x', function (input, array, config) {
          config._d = new Date(toInt(input));
      });

      // Side effect imports


      hooks.version = '2.24.0';

      setHookCallback(createLocal);

      hooks.fn                    = proto;
      hooks.min                   = min;
      hooks.max                   = max;
      hooks.now                   = now;
      hooks.utc                   = createUTC;
      hooks.unix                  = createUnix;
      hooks.months                = listMonths;
      hooks.isDate                = isDate;
      hooks.locale                = getSetGlobalLocale;
      hooks.invalid               = createInvalid;
      hooks.duration              = createDuration;
      hooks.isMoment              = isMoment;
      hooks.weekdays              = listWeekdays;
      hooks.parseZone             = createInZone;
      hooks.localeData            = getLocale;
      hooks.isDuration            = isDuration;
      hooks.monthsShort           = listMonthsShort;
      hooks.weekdaysMin           = listWeekdaysMin;
      hooks.defineLocale          = defineLocale;
      hooks.updateLocale          = updateLocale;
      hooks.locales               = listLocales;
      hooks.weekdaysShort         = listWeekdaysShort;
      hooks.normalizeUnits        = normalizeUnits;
      hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
      hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
      hooks.calendarFormat        = getCalendarFormat;
      hooks.prototype             = proto;

      // currently HTML5 input type only supports 24-hour formats
      hooks.HTML5_FMT = {
          DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
          DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
          DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
          DATE: 'YYYY-MM-DD',                             // <input type="date" />
          TIME: 'HH:mm',                                  // <input type="time" />
          TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
          TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
          WEEK: 'GGGG-[W]WW',                             // <input type="week" />
          MONTH: 'YYYY-MM'                                // <input type="month" />
      };

      return hooks;

  })));
  });

  var Calendar = function () {
      /**
       *
       * @param holidays {Array<string>}
       * @param format {string}
       * @param workingHours {Array<number>}
       */
      function Calendar(holidays, format, workingHours) {
          classCallCheck(this, Calendar);

          this.holidays = new Set(holidays);
          this.format = format;

          var _workingHours = slicedToArray(workingHours, 2);

          this.workStartHour = _workingHours[0];
          this.workEndHour = _workingHours[1];
      }

      /**
       *
       * @param date {Date || moment.Moment}
       * @return {boolean}
       */


      createClass(Calendar, [{
          key: 'isHoliday',
          value: function isHoliday(date) {
              return this.holidays.has(moment(date).format(this.format));
          }

          /**
           *
           * @param start {Date || moment#Moment}
           * @param end {Date || moment#Moment}
           * @return {number}
           */

      }, {
          key: 'computeTaskDuration',
          value: function computeTaskDuration(start, end) {
              var startDate = moment(start);
              var endDate = moment(end);
              var workStartHour = this.workStartHour,
                  workEndHour = this.workEndHour;

              var workingHours = workEndHour - workStartHour;
              var dayDiff = moment(endDate).startOf('day').diff(moment(startDate).add(1, 'day').startOf('day'), 'days');
              var startDateHours = this.getBusinessDayEnd(startDate).diff(startDate, 'hours', true);
              var endDateHours = endDate.diff(this.getBusinessDayStart(endDate), 'hours', true);
              var duration = startDateHours + endDateHours;
              if (dayDiff > 0) {
                  duration += (dayDiff - this.holidaysNum(start, end)) * workingHours;
              }
              if (dayDiff === -1 && startDate.date() === endDate.date()) {
                  duration = endDate.diff(startDate, 'hours', true);
              }

              return duration;
          }

          /**
           *
           * @param start {Date || moment.Moment}
           * @param end {Date || moment.Moment}
           * @return {number}
           */

      }, {
          key: 'holidaysNum',
          value: function holidaysNum(start, end) {
              var holidays = this.holidays;

              var startDate = moment(start);
              var endDate = moment(end);
              var holidaysNum = 0;
              for (startDate; startDate <= endDate; startDate.add(1, 'day')) {
                  if (holidays.has(startDate.format('YYYY-MM-DD'))) {
                      holidaysNum += 1;
                  }
              }
              return holidaysNum;
          }

          /**
           *
           * @param day {Date || moment.Moment}
           * @return {Date}
           */

      }, {
          key: 'getNextWorkingDay',
          value: function getNextWorkingDay(day) {
              var result = moment(day);
              var workStartHour = this.workStartHour;

              if (this.isHoliday(result)) {
                  result.startOf('day').hours(workStartHour);
              }
              while (this.isHoliday(result)) {
                  result.add(1, 'day');
              }
              return result.toDate();
          }

          /**
           *
           * @param date {Date || moment.Moment}
           * @return {Date}
           */

      }, {
          key: 'placeDateInWorkingRange',
          value: function placeDateInWorkingRange(date) {
              var workStartHour = this.workStartHour,
                  workEndHour = this.workEndHour;

              var workingDate = moment.utc(date);
              var workStart = moment(workingDate).startOf('day').hours(workStartHour);
              var workEnd = moment(workStart).hours(workEndHour);
              if (workingDate.isBetween(workStart, workEnd)) {
                  return this.getNextWorkingDay(date);
              }

              var res = moment.min(workEnd, workingDate) === workEnd ? workEnd.toDate() : workStart.toDate();

              return this.getNextWorkingDay(res);
          }

          /**
           *
           * @param day {Date || moment.Moment}
           * @return {moment.Moment}
           */

      }, {
          key: 'getBusinessDayStart',
          value: function getBusinessDayStart(day) {
              var workStartHour = this.workStartHour;

              return moment(day).startOf('day').hours(workStartHour);
          }

          /**
           *
           * @param day {Date || moment.Moment}
           * @return {moment.Moment}
           */

      }, {
          key: 'getBusinessDayEnd',
          value: function getBusinessDayEnd(day) {
              var workEndHour = this.workEndHour;

              return moment(day).startOf('day').hours(workEndHour);
          }
      }, {
          key: 'computeTaskEndDate',
          value: function computeTaskEndDate(startDate, duration) {
              var workStartHour = this.workStartHour,
                  workEndHour = this.workEndHour;

              var workingHours = workEndHour - workStartHour;
              var endDate = moment(startDate);
              var remainDuration = duration;
              while (remainDuration > 0 || this.isHoliday(endDate)) {
                  if (this.isHoliday(endDate)) {
                      endDate.add(1, 'day');
                  } else if (remainDuration - workingHours >= 0) {
                      remainDuration -= workingHours;
                      if (remainDuration === 0 && endDate.isSame(this.getBusinessDayStart(endDate))) {
                          endDate = this.getBusinessDayEnd(endDate.add(-1, 'day'));
                      }
                      endDate.add(1, 'day');
                  } else {
                      var timeOverflow = moment(endDate).add(remainDuration, 'hour').diff(this.getBusinessDayEnd(endDate), 'hours', true);
                      if (timeOverflow > 0) {
                          remainDuration = timeOverflow;
                          endDate = this.getBusinessDayStart(endDate.add(1, 'day'));
                      } else {
                          endDate.add(remainDuration, 'hour');
                          remainDuration = 0;
                      }
                  }
              }
              return this.placeDateInWorkingRange(endDate.toDate());
          }
      }]);
      return Calendar;
  }();

  var Gantt = function () {
      function Gantt(wrapper, tasks, options) {
          classCallCheck(this, Gantt);

          this.setup_wrapper(wrapper);
          this.setup_options(options);
          this.setup_calendar();
          this.setup_tasks(tasks);
          // initialize with default view mode
          this.change_view_mode();
          this.bind_events();
      }

      createClass(Gantt, [{
          key: 'setup_wrapper',
          value: function setup_wrapper(element) {
              var svg_element = void 0,
                  wrapper_element = void 0;

              // CSS Selector is passed
              if (typeof element === 'string') {
                  element = document.querySelector(element);
              }

              // get the SVGElement
              if (element instanceof HTMLElement) {
                  wrapper_element = element;
                  svg_element = element.querySelector('svg');
              } else if (element instanceof SVGElement) {
                  svg_element = element;
              } else {
                  throw new TypeError('Frappé Gantt only supports usage of a string CSS selector,' + " HTML DOM element or SVG DOM element for the 'element' parameter");
              }

              // svg element
              if (!svg_element) {
                  // create it
                  this.$svg = createSVG('svg', {
                      append_to: wrapper_element,
                      class: 'gantt'
                  });
              } else {
                  this.$svg = svg_element;
                  this.$svg.classList.add('gantt');
              }

              // wrapper element
              this.$container = document.createElement('div');
              this.$container.classList.add('gantt-container');

              var parent_element = this.$svg.parentElement;
              parent_element.appendChild(this.$container);
              this.$container.appendChild(this.$svg);

              // popup wrapper
              this.popup_wrapper = document.createElement('div');
              this.popup_wrapper.classList.add('popup-wrapper');
              this.$container.appendChild(this.popup_wrapper);
          }
      }, {
          key: 'setup_options',
          value: function setup_options(options) {
              var default_options = {
                  header_height: 50,
                  column_width: 30,
                  step: 24,
                  view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month', 'Year'],
                  bar_height: 20,
                  bar_corner_radius: 3,
                  arrow_curve: 5,
                  padding: 18,
                  resizing: true,
                  progress: true,
                  is_draggable: true,
                  read_only: false,
                  view_mode: 'Day',
                  date_format: 'YYYY-MM-DD',
                  popup_trigger: 'click',
                  custom_popup_html: null,
                  language: 'en',
                  calendar: [],
                  workStartHour: 8,
                  workEndHour: 16
              };
              this.options = Object.assign({}, default_options, options);
          }
      }, {
          key: 'setup_tasks',
          value: function setup_tasks(tasks) {
              var _this = this;

              tasks = JSON.parse(JSON.stringify(tasks));
              // prepare tasks
              this.tasks = tasks.map(function (task, i) {
                  // convert to Date objects
                  task._start = _this.calendar.placeDateInWorkingRange(moment(task.start));
                  task._end = task.duration ? _this.calendar.computeTaskEndDate(task._start, task.duration) : _this.calendar.placeDateInWorkingRange(moment(task.end));
                  task.duration = task.duration || _this.calendar.computeTaskDuration(task._start, task._end);

                  // make task invalid if duration too large
                  if (date_utils.diff(task._end, task._start, 'year') > 10) {
                      task.end = null;
                  }

                  // cache index
                  task._index = i;

                  // invalid dates
                  if (!task.start && !task.end) {
                      var today = date_utils.today();
                      task._start = today;
                      task._end = date_utils.add(today, 2, 'day');
                  }

                  if (!task.start && task.end) {
                      task._start = date_utils.add(task._end, -2, 'day');
                  }

                  if (task.start && !task.end) {
                      task._end = date_utils.add(task._start, 2, 'day');
                  }

                  // if hours is not set, assume the last day is full day
                  // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
                  var task_end_values = date_utils.get_date_values(task._end);
                  if (task_end_values.slice(3).every(function (d) {
                      return d === 0;
                  })) {
                      task._end = date_utils.add(task._end, 24, 'hour');
                  }

                  // invalid flag
                  if (!task.start || !task.end) {
                      task.invalid = true;
                  }

                  // dependencies
                  try {
                      task.dependencies = new Map(task.dependencies);
                  } catch (e) {
                      // TODO: write meaningful exception
                      throw e;
                  }

                  // uids
                  if (!task.id) {
                      task.id = generate_id(task);
                  }

                  return task;
              });

              this.setup_dependencies();
          }
      }, {
          key: 'setup_dependencies',
          value: function setup_dependencies() {
              this.dependency_map = {};
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                  for (var _iterator = this.tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var t = _step.value;
                      var _iteratorNormalCompletion2 = true;
                      var _didIteratorError2 = false;
                      var _iteratorError2 = undefined;

                      try {
                          for (var _iterator2 = t.dependencies.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                              var d = _step2.value;

                              this.dependency_map[d] = this.dependency_map[d] || [];
                              this.dependency_map[d].push(t.id);
                          }
                      } catch (err) {
                          _didIteratorError2 = true;
                          _iteratorError2 = err;
                      } finally {
                          try {
                              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                  _iterator2.return();
                              }
                          } finally {
                              if (_didIteratorError2) {
                                  throw _iteratorError2;
                              }
                          }
                      }
                  }
              } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                      }
                  } finally {
                      if (_didIteratorError) {
                          throw _iteratorError;
                      }
                  }
              }
          }
      }, {
          key: 'refresh',
          value: function refresh(tasks) {
              this.setup_tasks(tasks);
              this.change_view_mode();
          }
      }, {
          key: 'change_view_mode',
          value: function change_view_mode() {
              var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.view_mode;

              this.update_view_scale(mode);
              this.setup_dates();
              this.render();
              // fire viewmode_change event
              this.trigger_event('view_change', [mode]);
          }
      }, {
          key: 'update_view_scale',
          value: function update_view_scale(view_mode) {
              this.options.view_mode = view_mode;

              if (view_mode === 'Day') {
                  this.options.step = 24;
                  this.options.column_width = 38;
              } else if (view_mode === 'Half Day') {
                  this.options.step = 24 / 2;
                  this.options.column_width = 38;
              } else if (view_mode === 'Quarter Day') {
                  this.options.step = 24 / 4;
                  this.options.column_width = 38;
              } else if (view_mode === 'Week') {
                  this.options.step = 24 * 7;
                  this.options.column_width = 140;
              } else if (view_mode === 'Month') {
                  this.options.step = 24 * 30;
                  this.options.column_width = 120;
              } else if (view_mode === 'Year') {
                  this.options.step = 24 * 365;
                  this.options.column_width = 120;
              }
          }
      }, {
          key: 'setup_dates',
          value: function setup_dates() {
              this.setup_gantt_dates();
              this.setup_date_values();
          }
      }, {
          key: 'setup_calendar',
          value: function setup_calendar() {
              var _options = this.options,
                  calendar = _options.calendar,
                  workStartHour = _options.workStartHour,
                  workEndHour = _options.workEndHour,
                  date_format = _options.date_format;

              this.calendar = new Calendar(calendar, date_format, [workStartHour, workEndHour]);
          }
      }, {
          key: 'setup_gantt_dates',
          value: function setup_gantt_dates() {
              this.gantt_start = null;
              this.gantt_end = null;
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                  for (var _iterator3 = this.tasks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                      var task = _step3.value;

                      // set global start and end date
                      if (!this.gantt_start || task._start < this.gantt_start) {
                          this.gantt_start = task._start;
                      }
                      if (!this.gantt_end || task._end > this.gantt_end) {
                          this.gantt_end = task._end;
                      }
                  }
              } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion3 && _iterator3.return) {
                          _iterator3.return();
                      }
                  } finally {
                      if (_didIteratorError3) {
                          throw _iteratorError3;
                      }
                  }
              }

              if (!this.gantt_start) {
                  this.gantt_start = new Date();
              }
              if (!this.gantt_end) {
                  this.gantt_end = new Date();
              }

              this.gantt_start = date_utils.start_of(this.gantt_start, 'day');
              this.gantt_end = date_utils.start_of(this.gantt_end, 'day');

              // add date padding on both sides
              if (this.view_is(['Quarter Day', 'Half Day'])) {
                  this.gantt_start = date_utils.add(this.gantt_start, -7, 'day');
                  this.gantt_end = date_utils.add(this.gantt_end, 7, 'day');
              } else if (this.view_is('Month')) {
                  this.gantt_start = date_utils.start_of(this.gantt_start, 'year');
                  this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
              } else if (this.view_is('Year')) {
                  this.gantt_start = date_utils.add(this.gantt_start, -2, 'year');
                  this.gantt_end = date_utils.add(this.gantt_end, 12, 'year');
              } else {
                  this.gantt_start = date_utils.add(this.gantt_start, -1, 'day');
                  this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
              }
          }
      }, {
          key: 'setup_date_values',
          value: function setup_date_values() {
              this.dates = [];
              var cur_date = null;

              while (cur_date === null || cur_date < this.gantt_end) {
                  if (!cur_date) {
                      cur_date = date_utils.clone(this.gantt_start);
                  } else {
                      if (this.view_is('Year')) {
                          cur_date = date_utils.add(cur_date, 1, 'year');
                      } else if (this.view_is('Month')) {
                          cur_date = date_utils.add(cur_date, 1, 'month');
                      } else {
                          cur_date = date_utils.add(cur_date, this.options.step, 'hour');
                      }
                  }
                  this.dates.push(cur_date);
              }
          }
      }, {
          key: 'bind_events',
          value: function bind_events() {
              this.bind_grid_click();
              this.bind_resize();
              if (!this.options.read_only) {
                  this.bind_bar_events();
              }
          }

          // TODO: finish chart resize

      }, {
          key: 'bind_resize',
          value: function bind_resize() {
              var _this2 = this;

              var frame = null;
              this.$svg.addEventListener('wheel', function (e) {
                  // TODO: delete false then finish
                  if (e.ctrlKey && _this2.options.view_mode === 'Day' && false) {
                      e.preventDefault();
                      _this2.options.column_width -= e.deltaY * 0.05;
                      if (_this2.options.column_width < 16) {
                          _this2.options.column_width = 16;
                      }
                      if (frame) {
                          cancelAnimationFrame(frame);
                          frame = null;
                      }
                      frame = requestAnimationFrame(function () {
                          _this2.bars.forEach(function (bar) {
                              bar.update_bar_position({
                                  x: bar.compute_x(),
                                  width: bar.compute_width()
                              });
                          });
                          _this2.layers.date.querySelectorAll('.lower-text').forEach(function (date, i) {
                              date.setAttribute('x', i * _this2.options.column_width + _this2.options.column_width / 2);
                          });
                      });
                  }
              });
          }
      }, {
          key: 'render',
          value: function render() {
              this.clear();
              this.setup_layers();
              this.make_grid();
              this.make_dates();
              this.make_bars();
              this.make_arrows();
              this.map_arrows_on_bars();
              this.set_width();
              this.set_scroll_position();
          }
      }, {
          key: 'setup_layers',
          value: function setup_layers() {
              this.layers = {};
              var layers = ['grid', 'arrows', 'progress', 'bar', 'details', 'date'];
              // make group layers
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                  for (var _iterator4 = layers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                      var layer = _step4.value;

                      this.layers[layer] = createSVG('g', {
                          class: layer,
                          append_to: this.$svg
                      });
                  }
              } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion4 && _iterator4.return) {
                          _iterator4.return();
                      }
                  } finally {
                      if (_didIteratorError4) {
                          throw _iteratorError4;
                      }
                  }
              }
          }
      }, {
          key: 'make_grid',
          value: function make_grid() {
              this.make_grid_background();
              this.make_grid_rows();
              this.make_grid_header();
              this.make_grid_ticks();
              this.make_grid_highlights();
          }
      }, {
          key: 'make_grid_background',
          value: function make_grid_background() {
              var grid_width = this.dates.length * this.options.column_width;
              var grid_height = this.options.header_height + (this.options.bar_height + this.options.padding) * (this.tasks.length + 1);

              createSVG('rect', {
                  x: 0,
                  y: 0,
                  width: grid_width,
                  height: grid_height,
                  class: 'grid-background',
                  append_to: this.layers.grid
              });

              $.attr(this.$svg, {
                  height: grid_height,
                  width: '100%'
              });
          }
      }, {
          key: 'make_grid_rows',
          value: function make_grid_rows() {
              var rows_layer = createSVG('g', { append_to: this.layers.grid });
              var lines_layer = createSVG('g', { append_to: this.layers.grid });

              var row_width = this.dates.length * this.options.column_width;
              var row_height = this.options.bar_height + this.options.padding;

              var row_y = this.options.header_height + this.options.padding / 2;

              for (var i = 0; i < this.tasks.length + 1; i++) {
                  createSVG('rect', {
                      x: 0,
                      y: row_y,
                      width: row_width,
                      height: row_height,
                      class: 'grid-row',
                      append_to: rows_layer
                  });

                  createSVG('line', {
                      x1: 0,
                      y1: row_y + row_height,
                      x2: row_width,
                      y2: row_y + row_height,
                      class: 'row-line',
                      append_to: lines_layer
                  });

                  row_y += this.options.bar_height + this.options.padding;
              }
          }
      }, {
          key: 'make_grid_header',
          value: function make_grid_header() {
              var header_width = this.dates.length * this.options.column_width;
              var header_height = this.options.header_height + 10;
              createSVG('rect', {
                  x: 0,
                  y: 0,
                  width: header_width,
                  height: header_height,
                  class: 'grid-header',
                  append_to: this.layers.date // this.layers.grid
              });
          }
      }, {
          key: 'make_grid_ticks',
          value: function make_grid_ticks() {
              var tick_x = 0;
              var tick_y = this.options.header_height + this.options.padding / 2;
              var tick_height = (this.options.bar_height + this.options.padding) * (this.tasks.length + 1);

              var _iteratorNormalCompletion5 = true;
              var _didIteratorError5 = false;
              var _iteratorError5 = undefined;

              try {
                  for (var _iterator5 = this.dates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                      var date = _step5.value;

                      var tick_class = 'tick';
                      // thick tick for monday
                      if (this.view_is('Day') && date.getDate() === 1) {
                          tick_class += ' thick';
                      }
                      // thick tick for first week
                      if (this.view_is('Week') && date.getDate() >= 1 && date.getDate() < 8) {
                          tick_class += ' thick';
                      }
                      // thick ticks for quarters
                      if (this.view_is('Month') && (date.getMonth() + 1) % 3 === 0) {
                          tick_class += ' thick';
                      }

                      createSVG('path', {
                          d: 'M ' + tick_x + ' ' + tick_y + ' v ' + tick_height,
                          class: tick_class,
                          append_to: this.layers.grid
                      });

                      if (this.view_is('Month')) {
                          tick_x += date_utils.get_days_in_month(date) * this.options.column_width / 30;
                      } else {
                          tick_x += this.options.column_width;
                      }
                  }
              } catch (err) {
                  _didIteratorError5 = true;
                  _iteratorError5 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion5 && _iterator5.return) {
                          _iterator5.return();
                      }
                  } finally {
                      if (_didIteratorError5) {
                          throw _iteratorError5;
                      }
                  }
              }
          }
      }, {
          key: 'make_grid_highlights',
          value: function make_grid_highlights() {
              // highlight today's date
              if (this.view_is('Day')) {
                  var x = 0;
                  var y = 0;

                  var width = this.options.column_width;
                  var height = (this.options.bar_height + this.options.padding) * this.tasks.length + this.options.header_height + this.options.padding / 2;

                  createSVG('rect', {
                      x: x,
                      y: y,
                      width: width,
                      height: height,
                      class: 'today-highlight',
                      append_to: this.layers.grid
                  });
              }
          }
      }, {
          key: 'make_dates',
          value: function make_dates() {
              var _iteratorNormalCompletion6 = true;
              var _didIteratorError6 = false;
              var _iteratorError6 = undefined;

              try {
                  for (var _iterator6 = this.get_dates_to_draw()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                      var date = _step6.value;

                      createSVG('text', {
                          x: date.lower_x,
                          y: date.lower_y,
                          innerHTML: date.lower_text,
                          class: ['lower-text', date.is_weekend ? 'weekend' : ''].join(' '),
                          append_to: this.layers.date
                      });

                      if (date.upper_text) {
                          var $upper_text = createSVG('text', {
                              x: date.upper_x,
                              y: date.upper_y,
                              innerHTML: date.upper_text,
                              class: 'upper-text',
                              append_to: this.layers.date
                          });

                          // remove out-of-bound dates
                          if ($upper_text.getBBox().x2 > this.layers.grid.getBBox().width) {
                              $upper_text.remove();
                          }
                      }
                  }
              } catch (err) {
                  _didIteratorError6 = true;
                  _iteratorError6 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion6 && _iterator6.return) {
                          _iterator6.return();
                      }
                  } finally {
                      if (_didIteratorError6) {
                          throw _iteratorError6;
                      }
                  }
              }
          }
      }, {
          key: 'get_dates_to_draw',
          value: function get_dates_to_draw() {
              var _this3 = this;

              var last_date = null;
              return this.dates.map(function (date, i) {
                  var d = _this3.get_date_info(date, last_date, i);
                  last_date = date;
                  return d;
              });
          }
      }, {
          key: 'get_date_info',
          value: function get_date_info(date, last_date, i) {
              if (!last_date) {
                  last_date = date_utils.add(date, 1, 'year');
              }

              var is_weekend = this.calendar.isHoliday(date) && this.options.view_mode === 'Day';

              var date_text = {
                  'Quarter Day_lower': date_utils.format(date, 'HH', this.options.language),
                  'Half Day_lower': date_utils.format(date, 'HH', this.options.language),
                  Day_lower: date.getDate() !== last_date.getDate() ? date_utils.format(date, 'D', this.options.language) : '',
                  Week_lower: date.getMonth() !== last_date.getMonth() ? date_utils.format(date, 'D MMM', this.options.language) : date_utils.format(date, 'D', this.options.language),
                  Month_lower: date_utils.format(date, 'MMMM', this.options.language),
                  Year_lower: date_utils.format(date, 'YYYY', this.options.language),
                  'Quarter Day_upper': date.getDate() !== last_date.getDate() ? date_utils.format(date, 'D MMM', this.options.language) : '',
                  'Half Day_upper': date.getDate() !== last_date.getDate() ? date.getMonth() !== last_date.getMonth() ? date_utils.format(date, 'D MMM', this.options.language) : date_utils.format(date, 'D', this.options.language) : '',
                  Day_upper: date.getMonth() !== last_date.getMonth() ? date_utils.format(date, 'MMMM', this.options.language) : '',
                  Week_upper: date.getMonth() !== last_date.getMonth() ? date_utils.format(date, 'MMMM', this.options.language) : '',
                  Month_upper: date.getFullYear() !== last_date.getFullYear() ? date_utils.format(date, 'YYYY', this.options.language) : '',
                  Year_upper: date.getFullYear() !== last_date.getFullYear() ? date_utils.format(date, 'YYYY', this.options.language) : ''
              };

              var base_pos = {
                  x: i * this.options.column_width,
                  lower_y: this.options.header_height,
                  upper_y: this.options.header_height - 25
              };

              var x_pos = {
                  'Quarter Day_lower': this.options.column_width * 4 / 2,
                  'Quarter Day_upper': 0,
                  'Half Day_lower': this.options.column_width * 2 / 2,
                  'Half Day_upper': 0,
                  Day_lower: this.options.column_width / 2,
                  Day_upper: this.options.column_width * 30 / 2,
                  Week_lower: 0,
                  Week_upper: this.options.column_width * 4 / 2,
                  Month_lower: this.options.column_width / 2,
                  Month_upper: this.options.column_width * 12 / 2,
                  Year_lower: this.options.column_width / 2,
                  Year_upper: this.options.column_width * 30 / 2
              };

              return {
                  upper_text: date_text[this.options.view_mode + '_upper'],
                  lower_text: date_text[this.options.view_mode + '_lower'],
                  upper_x: base_pos.x + x_pos[this.options.view_mode + '_upper'],
                  upper_y: base_pos.upper_y,
                  lower_x: base_pos.x + x_pos[this.options.view_mode + '_lower'],
                  lower_y: base_pos.lower_y,
                  is_weekend: is_weekend
              };
          }
      }, {
          key: 'make_bars',
          value: function make_bars() {
              var _this4 = this;

              this.bars = this.tasks.map(function (task) {
                  var bar = new Bar(_this4, task);
                  _this4.layers.bar.appendChild(bar.group);
                  return bar;
              });
          }
      }, {
          key: 'make_arrows',
          value: function make_arrows() {
              var _this5 = this;

              this.arrows = [];
              var _iteratorNormalCompletion7 = true;
              var _didIteratorError7 = false;
              var _iteratorError7 = undefined;

              try {
                  var _loop = function _loop() {
                      var task = _step7.value;

                      var arrows = Array.from(task.dependencies, function (_ref) {
                          var _ref2 = slicedToArray(_ref, 2),
                              task_id = _ref2[0],
                              type = _ref2[1];

                          var dependency = _this5.get_task(task_id);
                          if (!dependency) return;
                          var arrow = new Arrow(_this5, _this5.bars[dependency._index], // from_task
                          _this5.bars[task._index], // to_task
                          type);
                          _this5.layers.arrows.appendChild(arrow.element);
                          return arrow;
                      }).filter(Boolean); // filter falsy values
                      _this5.arrows = _this5.arrows.concat(arrows);
                  };

                  for (var _iterator7 = this.tasks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                      _loop();
                  }
              } catch (err) {
                  _didIteratorError7 = true;
                  _iteratorError7 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion7 && _iterator7.return) {
                          _iterator7.return();
                      }
                  } finally {
                      if (_didIteratorError7) {
                          throw _iteratorError7;
                      }
                  }
              }
          }
      }, {
          key: 'make_arrow',
          value: function make_arrow(from_task, to_task, type) {
              var arrow = new Arrow(this, this.get_bar(from_task.id), this.get_bar(to_task.id), type);
              this.layers.arrows.appendChild(arrow.element);
              this.arrows = [].concat(toConsumableArray(this.arrows), [arrow]);
          }
      }, {
          key: 'map_arrows_on_bars',
          value: function map_arrows_on_bars() {
              var _this6 = this;

              var _iteratorNormalCompletion8 = true;
              var _didIteratorError8 = false;
              var _iteratorError8 = undefined;

              try {
                  var _loop2 = function _loop2() {
                      var bar = _step8.value;

                      bar.arrows = _this6.arrows.filter(function (arrow) {
                          return arrow.from_task.task.id === bar.task.id || arrow.to_task.task.id === bar.task.id;
                      });
                  };

                  for (var _iterator8 = this.bars[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                      _loop2();
                  }
              } catch (err) {
                  _didIteratorError8 = true;
                  _iteratorError8 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion8 && _iterator8.return) {
                          _iterator8.return();
                      }
                  } finally {
                      if (_didIteratorError8) {
                          throw _iteratorError8;
                      }
                  }
              }
          }
      }, {
          key: 'map_arrows_on_bar',
          value: function map_arrows_on_bar(bar) {
              bar.arrows = this.arrows.filter(function (arrow) {
                  return arrow.from_task.task.id === bar.task.id || arrow.to_task.task.id === bar.task.id;
              });
          }
      }, {
          key: 'set_width',
          value: function set_width() {
              var cur_width = this.$svg.getBoundingClientRect().width;
              var actual_width = this.$svg.querySelector('.grid .grid-row').getAttribute('width');
              if (cur_width < actual_width) {
                  this.$svg.setAttribute('width', actual_width);
              }
          }
      }, {
          key: 'set_scroll_position',
          value: function set_scroll_position() {
              var parent_element = this.$svg.parentElement;
              if (!parent_element) return;

              var hours_before_first_task = date_utils.diff(this.get_oldest_starting_date(), this.gantt_start, 'hour');

              var scroll_pos = hours_before_first_task / this.options.step * this.options.column_width - this.options.column_width;

              setTimeout(function () {
                  return parent_element.scrollTo({ left: scroll_pos });
              });
          }
      }, {
          key: 'bind_grid_click',
          value: function bind_grid_click() {
              var _this7 = this;

              $.on(this.$svg, this.options.popup_trigger, '.grid-row, .grid-header', function () {
                  _this7.unselect_all();
                  _this7.hide_popup();
              });
          }
      }, {
          key: 'bind_bar_events',
          value: function bind_bar_events() {
              var _this8 = this;

              var is_dragging = false;
              var is_connecting = false;
              var connecting_type = null;
              var x_on_start = 0;
              var y_on_start = 0;
              var is_resizing_left = false;
              var is_resizing_right = false;
              var parent_bar_id = null;
              var bars = []; // instanceof Bar
              var connecting_bar = null;
              var new_position = null;
              this.bar_being_dragged = null;

              function action_in_progress() {
                  return is_dragging || is_resizing_left || is_resizing_right || is_connecting;
              }

              $.on(this.$svg, 'mousedown', '.handle-group .circle', function (e, element) {
                  is_connecting = !is_connecting;
                  var types = enums.dependency.types;

                  var bar_wrapper = $.closest('.bar-wrapper', element);
                  var task_id = bar_wrapper.getAttribute('data-id');
                  var bar = _this8.get_bar(task_id);
                  if (is_connecting) {
                      connecting_bar = bar;
                      connecting_type = element.classList.contains('left') ? types.START_TO_START : types.END_TO_START;
                      element.classList.add('selected');
                      _this8.$svg.querySelectorAll('.bar-wrapper').forEach(function (wrapper) {
                          var id = wrapper.getAttribute('data-id');
                          var can_add_dependency = _this8.can_add_dependency(connecting_bar.task, _this8.get_task(id));
                          wrapper.querySelectorAll('.circle').forEach(function (circle) {
                              var show_circle = can_add_dependency || circle.classList.contains('selected');
                              if (connecting_bar.task.id !== id) {
                                  show_circle &= !circle.classList.contains('right');
                              }
                              circle.classList.add(show_circle ? 'active' : 'disabled');
                          });
                      });
                  } else {
                      var _task = bar.task;
                      var _connecting_bar = connecting_bar,
                          connecting_task = _connecting_bar.task;

                      _this8.$svg.querySelectorAll('.handle-group .circle').forEach(function (circle) {
                          circle.classList.remove('disabled', 'active', 'selected');
                      });

                      if (_this8.can_add_dependency(connecting_task, _task)) {
                          _this8.add_dependency(connecting_task, _task, connecting_type);
                      }
                      connecting_bar = null;
                  }
              });

              $.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', function (e, element) {
                  if (is_connecting) return;
                  var bar_wrapper = $.closest('.bar-wrapper', element);

                  if (element.classList.contains('left')) {
                      is_resizing_left = true;
                  } else if (element.classList.contains('right')) {
                      is_resizing_right = true;
                  } else if (element.classList.contains('bar-wrapper')) {
                      is_dragging = true;
                  }

                  bar_wrapper.classList.add('active');

                  x_on_start = e.offsetX;
                  y_on_start = e.offsetY;

                  parent_bar_id = bar_wrapper.getAttribute('data-id');
                  var ids = [parent_bar_id].concat(toConsumableArray(_this8.get_all_dependent_tasks(parent_bar_id)));
                  bars = ids.map(function (id) {
                      return _this8.get_bar(id);
                  });

                  _this8.bar_being_dragged = parent_bar_id;

                  bars.forEach(function (bar) {
                      var $bar = bar.$bar;
                      $bar.ox = bar.x;
                      $bar.oy = bar.y;
                      $bar.owidth = $bar.getWidth();
                      $bar.finaldx = 0;
                  });
              });

              $.on(this.$svg, 'mousemove', function (e) {
                  if (!action_in_progress()) return;
                  var dx = e.offsetX - x_on_start;
                  var dy = e.offsetY - y_on_start;

                  if (_this8.options.is_draggable && is_dragging) {
                      var row = Math.floor((e.offsetY - _this8.options.header_height - 10) / (_this8.options.bar_height + _this8.options.padding));
                      if (row >= 0 && row < _this8.tasks.length) {
                          var _bar = _this8.get_bar(parent_bar_id);
                          var offset = row - _bar.task._index;

                          if (offset) {
                              new_position = _bar.task._index + offset;
                              _this8.tasks.splice(new_position, 0, _this8.tasks.splice(_bar.task._index, 1)[0]);

                              _this8.tasks.forEach(function (task, i) {
                                  if (task._index !== i) {
                                      task._index = i;
                                      var _bar2 = _this8.get_bar(task.id);
                                      _bar2.update_bar_position({ y: _bar2.compute_y() });
                                  }
                              });
                          }
                      }
                  }

                  bars.forEach(function (bar) {
                      var $bar = bar.$bar;
                      $bar.finaldx = dx;

                      if (is_resizing_left) {
                          if (parent_bar_id === bar.task.id) {
                              bar.update_bar_position({
                                  x: $bar.ox + $bar.finaldx,
                                  width: $bar.owidth - $bar.finaldx
                              });
                          } else {
                              bar.update_bar_position({
                                  x: $bar.ox + $bar.finaldx
                              });
                          }
                      } else if (is_resizing_right) {
                          if (parent_bar_id === bar.task.id) {
                              bar.update_bar_position({
                                  width: $bar.owidth + $bar.finaldx
                              });
                          }
                      } else if (is_dragging && _this8.options.is_draggable) {
                          bar.update_bar_position({
                              x: $bar.ox + $bar.finaldx
                          });
                      }
                  });
              });

              document.addEventListener('mouseup', function (e) {
                  if (is_dragging || is_resizing_left || is_resizing_right || is_connecting) {
                      bars.forEach(function (bar) {
                          return bar.group.classList.remove('active');
                      });
                  }

                  is_dragging = false;
                  is_resizing_left = false;
                  is_resizing_right = false;
              });

              $.on(this.$container, 'scroll', function (e) {
                  var scrollTop = e.currentTarget.scrollTop;

                  requestAnimationFrame(function () {
                      _this8.layers.date.setAttribute('transform', 'translate(0,' + scrollTop + ')');
                  });
              });

              $.on(this.$svg, 'mouseup', function (e) {
                  if (_this8.bar_being_dragged) {
                      _this8.bar_being_dragged = null;
                      if (new_position !== null) {
                          _this8.trigger_event('order_change', [parent_bar_id, new_position]);
                          new_position = null;
                          _this8.get_bar(parent_bar_id).set_action_completed();
                      }
                      bars.forEach(function (bar) {
                          var $bar = bar.$bar;
                          if (!$bar.finaldx) return;
                          bar.date_changed(is_resizing_right || is_resizing_left);
                          bar.set_action_completed();
                      });
                  }
              });

              this.bind_bar_progress();
          }
      }, {
          key: 'bind_bar_progress',
          value: function bind_bar_progress() {
              var _this9 = this;

              var x_on_start = 0;
              var y_on_start = 0;
              var is_resizing = null;
              var bar = null;
              var $bar_progress = null;
              var $bar = null;

              $.on(this.$svg, 'mousedown', '.handle.progress', function (e, handle) {
                  is_resizing = true;
                  x_on_start = e.offsetX;
                  y_on_start = e.offsetY;

                  var $bar_wrapper = $.closest('.bar-wrapper', handle);
                  var id = $bar_wrapper.getAttribute('data-id');
                  bar = _this9.get_bar(id);

                  $bar_progress = bar.$bar_progress;
                  $bar = bar.$bar;

                  $bar_progress.finaldx = 0;
                  $bar_progress.owidth = $bar_progress.getWidth();
                  $bar_progress.min_dx = -$bar_progress.getWidth();
                  $bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
              });

              $.on(this.$svg, 'mousemove', function (e) {
                  if (!is_resizing) return;
                  var dx = e.offsetX - x_on_start;
                  var dy = e.offsetY - y_on_start;

                  if (dx > $bar_progress.max_dx) {
                      dx = $bar_progress.max_dx;
                  }
                  if (dx < $bar_progress.min_dx) {
                      dx = $bar_progress.min_dx;
                  }

                  var $handle = bar.$handle_progress;
                  $.attr($bar_progress, 'width', $bar_progress.owidth + dx);
                  $.attr($handle, 'points', bar.get_progress_polygon_points());
                  $bar_progress.finaldx = dx;
              });

              $.on(this.$svg, 'mouseup', function () {
                  is_resizing = false;
                  if (!($bar_progress && $bar_progress.finaldx)) return;
                  bar.progress_changed();
                  bar.set_action_completed();
              });
          }
      }, {
          key: 'get_all_dependent_tasks',
          value: function get_all_dependent_tasks(task_id) {
              var _this10 = this;

              var out = [];
              var to_process = [task_id];
              while (to_process.length) {
                  var deps = to_process.reduce(function (acc, curr) {
                      acc = acc.concat(_this10.dependency_map[curr]);
                      return acc;
                  }, []);

                  out = out.concat(deps);
                  to_process = deps.filter(function (d) {
                      return !to_process.includes(d);
                  });
              }

              return out.filter(Boolean);
          }
      }, {
          key: 'get_snap_position',
          value: function get_snap_position(dx) {
              var odx = dx,
                  rem = void 0,
                  position = void 0;

              if (this.view_is('Week')) {
                  rem = dx % (this.options.column_width / 7);
                  position = odx - rem + (rem < this.options.column_width / 14 ? 0 : this.options.column_width / 7);
              } else if (this.view_is('Month')) {
                  rem = dx % (this.options.column_width / 30);
                  position = odx - rem + (rem < this.options.column_width / 60 ? 0 : this.options.column_width / 30);
              } else {
                  rem = dx % this.options.column_width;
                  position = odx - rem + (rem < this.options.column_width / 2 ? 0 : this.options.column_width);
              }
              return position;
          }
      }, {
          key: 'unselect_all',
          value: function unselect_all() {
              [].concat(toConsumableArray(this.$svg.querySelectorAll('.bar-wrapper'))).forEach(function (el) {
                  el.classList.remove('active');
              });
          }
      }, {
          key: 'view_is',
          value: function view_is(modes) {
              var _this11 = this;

              if (typeof modes === 'string') {
                  return this.options.view_mode === modes;
              }

              if (Array.isArray(modes)) {
                  return modes.some(function (mode) {
                      return _this11.options.view_mode === mode;
                  });
              }

              return false;
          }
      }, {
          key: 'get_task',
          value: function get_task(id) {
              return this.tasks.find(function (task) {
                  return task.id === id;
              });
          }
      }, {
          key: 'get_bar',
          value: function get_bar(id) {
              return this.bars.find(function (bar) {
                  return bar.task.id === id;
              });
          }
      }, {
          key: 'show_popup',
          value: function show_popup(options) {
              if (!this.popup) {
                  this.popup = new Popup(this.popup_wrapper, this.options.custom_popup_html, this.$svg);
              }
              this.popup.show(options);
          }
      }, {
          key: 'hide_popup',
          value: function hide_popup() {
              this.popup && this.popup.hide();
          }
      }, {
          key: 'trigger_event',
          value: function trigger_event(event, args) {
              if (this.options['on_' + event]) {
                  this.options['on_' + event].apply(null, args);
              }
          }

          /**
           * Gets the oldest starting date from the list of tasks
           *
           * @returns Date
           * @memberof Gantt
           */

      }, {
          key: 'get_oldest_starting_date',
          value: function get_oldest_starting_date() {
              return this.tasks.map(function (task) {
                  return task._start;
              }).reduce(function (prev_date, cur_date) {
                  return cur_date <= prev_date ? cur_date : prev_date;
              }, this.gantt_end);
          }

          /**
           * Clear all elements from the parent svg element
           *
           * @memberof Gantt
           */

      }, {
          key: 'clear',
          value: function clear() {
              this.$svg.innerHTML = '';
          }
      }, {
          key: 'can_add_dependency',
          value: function can_add_dependency(from_task, to_task) {
              var not_same_task = from_task.id !== to_task.id;
              var no_duplicate = !to_task.dependencies.has(from_task.id);
              var no_loop = !this.get_all_dependent_tasks(to_task.id).includes(from_task.id);
              return not_same_task && no_duplicate && no_loop;
          }
      }, {
          key: 'add_dependency',
          value: function add_dependency(task_from, task_to, type) {
              this.make_arrow(task_from, task_to, type);
              this.map_arrows_on_bar(this.get_bar(task_from.id));
              this.map_arrows_on_bar(this.get_bar(task_to.id));
              task_to.dependencies.set(task_from.id, type);
              this.setup_dependencies();
              this.get_bar(task_to.id).date_changed();
              this.trigger_event('dependency_change', [task_from, task_to, type]);
          }
      }, {
          key: 'delete_dependency',
          value: function delete_dependency(task_from, task_to, type) {
              task_to.dependencies.delete(task_from.id);
              this.map_arrows_on_bars();
              this.setup_dependencies();
              this.trigger_event('dependency_change', [task_from, task_to, type]);
          }
      }]);
      return Gantt;
  }();


  function generate_id(task) {
      return task.name + '_' + Math.random().toString(36).slice(2, 12);
  }

  return Gantt;

}));
