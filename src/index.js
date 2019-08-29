import date_utils from './date_utils';
import { $, createSVG } from './svg_utils';
import Bar from './bar';
import Arrow from './arrow';
import Popup from './popup';
import Enums from './enums';
import Calendar from './calendar';

import './gantt.scss';
import moment from 'moment';

export default class Gantt {
    constructor(wrapper, tasks, options) {
        this.setup_wrapper(wrapper);
        this.setup_options(options);
        this.setup_calendar();
        this.setup_tasks(tasks);
        // initialize with default view mode
        this.change_view_mode();
        this.bind_events();
    }

    setup_wrapper(element) {
        let svg_element, wrapper_element;

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
            throw new TypeError(
                'Frappé Gantt only supports usage of a string CSS selector,' +
                    " HTML DOM element or SVG DOM element for the 'element' parameter"
            );
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

        const parent_element = this.$svg.parentElement;
        parent_element.appendChild(this.$container);
        this.$container.appendChild(this.$svg);

        // popup wrapper
        this.popup_wrapper = document.createElement('div');
        this.popup_wrapper.classList.add('popup-wrapper');
        this.$container.appendChild(this.popup_wrapper);
    }

    setup_options(options) {
        const default_options = {
            header_height: 50,
            column_width: 30,
            step: 24,
            view_modes: [
                'Quarter Day',
                'Half Day',
                'Day',
                'Week',
                'Month',
                'Year'
            ],
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
            workStartHour: 0,
            workEndHour: 24,
            is_sortable: true
        };
        this.options = Object.assign({}, default_options, options);
    }

    setup_tasks(tasks) {
        tasks = JSON.parse(JSON.stringify(tasks));
        // prepare tasks
        this.tasks = tasks.map((task, i) => {
            // convert to Date objects
            task._start = this.calendar.placeDateInWorkingRange(
                moment(task.start).startOf('day'),
                true
            );
            task._end = this.calendar.placeDateInWorkingRange(
                moment(task.end).endOf('day')
            );
            task.duration = this.calendar.computeTaskDuration(
                task._start,
                task._end
            );

            // make task invalid if duration too large
            if (date_utils.diff(task._end, task._start, 'year') > 10) {
                task.end = null;
            }

            // cache index
            task._index = i;

            // invalid dates
            if (!task.start && !task.end) {
                const today = date_utils.today();
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
            const task_end_values = date_utils.get_date_values(task._end);
            if (task_end_values.slice(3).every(d => d === 0)) {
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

    setup_dependencies() {
        const dependencyMap = new Map();
        this.tasks.forEach(({ id, dependencies }) => {
            dependencies.forEach((type, taskId) => {
                const map = dependencyMap.get(taskId) || new Map();
                map.set(id, type);
                dependencyMap.set(taskId, map);
            });
        });
        this.dependency_map = dependencyMap;
    }

    refresh(tasks) {
        this.setup_tasks(tasks);
        this.change_view_mode();
    }

    change_view_mode(mode = this.options.view_mode) {
        this.update_view_scale(mode);
        this.setup_dates();
        this.render();
        // fire viewmode_change event
        this.trigger_event('view_change', [mode]);
    }

    update_view_scale(view_mode) {
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

    setup_dates() {
        this.setup_gantt_dates();
        this.setup_date_values();
    }

    setup_calendar() {
        const {
            calendar,
            workStartHour,
            workEndHour,
            date_format
        } = this.options;
        this.calendar = new Calendar(calendar, date_format, [
            workStartHour,
            workEndHour
        ]);
    }

    setup_gantt_dates() {
        this.gantt_start = null;
        this.gantt_end = null;
        for (let task of this.tasks) {
            // set global start and end date
            if (!this.gantt_start || task._start < this.gantt_start) {
                this.gantt_start = task._start;
            }
            if (!this.gantt_end || task._end > this.gantt_end) {
                this.gantt_end = task._end;
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
        } else if (this.view_is('Week')) {
            this.gantt_start = moment(this.gantt_start)
                .add(-1, 'day')
                .toDate();
            this.gantt_end = moment(this.gantt_end)
                .add(1, 'year')
                .startOf('week')
                .toDate();
        } else if (this.view_is('Year')) {
            this.gantt_start = moment(this.gantt_start)
                .startOf('year')
                .add(-1, 'year')
                .toDate();
            this.gantt_end = moment(this.gantt_end)
                .startOf('year')
                .add(16, 'year')
                .toDate();
        } else {
            this.gantt_start = date_utils.add(this.gantt_start, -1, 'day');
            this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
        }
    }

    setup_date_values() {
        this.dates = [];
        let cur_date = null;

        while (cur_date === null || cur_date < this.gantt_end) {
            if (!cur_date) {
                cur_date = date_utils.clone(this.gantt_start);
            } else {
                if (this.view_is('Year')) {
                    cur_date = date_utils.add(cur_date, 1, 'year');
                } else if (this.view_is('Month')) {
                    cur_date = date_utils.add(cur_date, 1, 'month');
                } else {
                    cur_date = date_utils.add(
                        cur_date,
                        this.options.step,
                        'hour'
                    );
                }
            }
            this.dates.push(cur_date);
        }
    }

    bind_events() {
        this.bind_grid_click();
        this.bind_resize();
        this.bind_scroll();
        if (!this.options.read_only) {
            this.bind_bar_events();
        }
    }

    bind_scroll() {
        $.on(this.$container, 'scroll', e => {
            const { scrollTop } = e.currentTarget;
            this.layers.date.setAttribute(
                'transform',
                `translate(0,${scrollTop})`
            );
        });
    }

    // TODO: finish chart resize
    bind_resize() {
        let frame = null;
        this.$svg.addEventListener('wheel', e => {
            // TODO: delete false then finish
            if (e.ctrlKey && this.options.view_mode === 'Day' && false) {
                e.preventDefault();
                this.options.column_width -= e.deltaY * 0.05;
                if (this.options.column_width < 16) {
                    this.options.column_width = 16;
                }
                if (frame) {
                    cancelAnimationFrame(frame);
                    frame = null;
                }
                frame = requestAnimationFrame(() => {
                    this.bars.forEach(bar => {
                        bar.update_bar_position({
                            x: bar.compute_x(),
                            width: bar.compute_width()
                        });
                    });
                    this.layers.date
                        .querySelectorAll('.lower-text')
                        .forEach((date, i) => {
                            date.setAttribute(
                                'x',
                                i * this.options.column_width +
                                    this.options.column_width / 2
                            );
                        });
                });
            }
        });
    }

    render() {
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

    setup_layers() {
        this.layers = {};
        const layers = ['grid', 'arrows', 'progress', 'bar', 'details', 'date'];
        // make group layers
        for (let layer of layers) {
            this.layers[layer] = createSVG('g', {
                class: layer,
                append_to: this.$svg
            });
        }
    }

    make_grid() {
        this.make_grid_background();
        this.make_grid_rows();
        this.make_grid_header();
        this.make_grid_ticks();
        this.make_grid_highlights();
    }

    make_grid_background() {
        const grid_width = this.dates.length * this.options.column_width;
        const grid_height =
            this.options.header_height +
            (this.options.bar_height + this.options.padding) *
                (this.tasks.length + 1);

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

    make_grid_rows() {
        const rows_layer = createSVG('g', { append_to: this.layers.grid });
        const lines_layer = createSVG('g', { append_to: this.layers.grid });

        const row_width = this.dates.length * this.options.column_width;
        const row_height = this.options.bar_height + this.options.padding;

        let row_y = this.options.header_height + this.options.padding / 2;

        for (let i = 0; i < this.tasks.length + 1; i++) {
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

    make_grid_header() {
        const header_width = this.dates.length * this.options.column_width;
        const header_height = this.options.header_height + 10;
        createSVG('rect', {
            x: 0,
            y: 0,
            width: header_width,
            height: header_height,
            class: 'grid-header',
            append_to: this.layers.date // this.layers.grid
        });
    }

    make_grid_ticks() {
        let tick_x = 0;
        let tick_y = this.options.header_height + this.options.padding / 2;
        let tick_height =
            (this.options.bar_height + this.options.padding) *
            (this.tasks.length + 1);

        for (let date of this.dates) {
            let tick_class = 'tick';
            // thick tick for monday
            if (this.view_is('Day') && date.getDate() === 1) {
                tick_class += ' thick';
            }
            // thick tick for first week
            if (
                this.view_is('Week') &&
                date.getDate() >= 1 &&
                date.getDate() < 8
            ) {
                tick_class += ' thick';
            }
            // thick ticks for quarters
            if (this.view_is('Month') && (date.getMonth() + 1) % 3 === 0) {
                tick_class += ' thick';
            }

            createSVG('path', {
                d: `M ${tick_x} ${tick_y} v ${tick_height}`,
                class: tick_class,
                append_to: this.layers.grid
            });

            if (this.view_is('Month')) {
                tick_x +=
                    date_utils.get_days_in_month(date) *
                    this.options.column_width /
                    30;
            } else {
                tick_x += this.options.column_width;
            }
        }
    }

    make_grid_highlights() {
        // highlight today's date
        if (this.view_is('Day')) {
            const x = 0;
            const y = 0;

            const width = this.options.column_width;
            const height =
                (this.options.bar_height + this.options.padding) *
                    this.tasks.length +
                this.options.header_height +
                this.options.padding / 2;

            createSVG('rect', {
                x,
                y,
                width,
                height,
                class: 'today-highlight',
                append_to: this.layers.grid
            });
        }
    }

    make_dates() {
        for (let date of this.get_dates_to_draw()) {
            createSVG('text', {
                x: date.lower_x,
                y: date.lower_y,
                innerHTML: date.lower_text,
                class: ['lower-text', date.is_weekend ? 'weekend' : ''].join(
                    ' '
                ),
                append_to: this.layers.date
            });

            if (date.upper_text) {
                const $upper_text = createSVG('text', {
                    x: date.upper_x,
                    y: date.upper_y,
                    innerHTML: date.upper_text,
                    class: 'upper-text',
                    append_to: this.layers.date
                });

                // remove out-of-bound dates
                if (
                    $upper_text.getBBox().x2 > this.layers.grid.getBBox().width
                ) {
                    $upper_text.remove();
                }
            }
        }
    }

    get_dates_to_draw() {
        let last_date = null;
        return this.dates.map((date, i) => {
            const d = this.get_date_info(date, last_date, i);
            last_date = date;
            return d;
        });
    }

    get_date_info(date, last_date, i) {
        if (!last_date) {
            last_date = date_utils.add(date, 1, 'year');
        }

        const is_weekend =
            this.calendar.isHoliday(date) && this.options.view_mode === 'Day';

        const date_text = {
            'Quarter Day_lower': date_utils.format(
                date,
                'HH',
                this.options.language
            ),
            'Half Day_lower': date_utils.format(
                date,
                'HH',
                this.options.language
            ),
            Day_lower:
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D', this.options.language)
                    : '',
            Week_lower:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : date_utils.format(date, 'D', this.options.language),
            Month_lower: date_utils.format(date, 'MMMM', this.options.language),
            Year_lower: date_utils.format(date, 'YYYY', this.options.language),
            'Quarter Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : '',
            'Half Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date.getMonth() !== last_date.getMonth()
                      ? date_utils.format(date, 'D MMM', this.options.language)
                      : date_utils.format(date, 'D', this.options.language)
                    : '',
            Day_upper:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Week_upper:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Month_upper:
                date.getFullYear() !== last_date.getFullYear()
                    ? date_utils.format(date, 'YYYY', this.options.language)
                    : ''
        };

        const base_pos = {
            x: i * this.options.column_width,
            lower_y: this.options.header_height,
            upper_y: this.options.header_height - 25
        };

        const x_pos = {
            'Quarter Day_lower': this.options.column_width * 4 / 2,
            'Quarter Day_upper': 0,
            'Half Day_lower': this.options.column_width * 2 / 2,
            'Half Day_upper': 0,
            Day_lower: this.options.column_width / 2,
            Day_upper: this.options.column_width * 30 / 2,
            Week_lower: i === 0 ? -10 : 0, // hide first value
            Week_upper: this.options.column_width * 4 / 2,
            Month_lower: this.options.column_width / 2,
            Month_upper: this.options.column_width * 12 / 2,
            Year_lower: this.options.column_width / 2,
            Year_upper: this.options.column_width * 30 / 2
        };

        return {
            upper_text: date_text[`${this.options.view_mode}_upper`],
            lower_text: date_text[`${this.options.view_mode}_lower`],
            upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
            upper_y: base_pos.upper_y,
            lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
            lower_y: base_pos.lower_y,
            is_weekend
        };
    }

    make_bars() {
        this.bars = this.tasks.map(task => {
            const bar = new Bar(this, task);
            this.layers.bar.appendChild(bar.group);
            return bar;
        });
    }

    make_arrows() {
        this.arrows = [];
        for (let task of this.tasks) {
            const arrows = Array.from(task.dependencies, ([task_id, type]) => {
                const dependency = this.get_task(task_id);
                if (!dependency) return;
                const arrow = new Arrow(
                    this,
                    this.bars[dependency._index], // from_task
                    this.bars[task._index], // to_task
                    type
                );
                this.layers.arrows.appendChild(arrow.element);
                return arrow;
            }).filter(Boolean); // filter falsy values
            this.arrows = this.arrows.concat(arrows);
        }
    }

    make_arrow(from_task, to_task, type) {
        const arrow = new Arrow(
            this,
            this.get_bar(from_task.id),
            this.get_bar(to_task.id),
            type
        );
        this.layers.arrows.appendChild(arrow.element);
        this.arrows = [...this.arrows, arrow];
    }

    map_arrows_on_bars() {
        for (let bar of this.bars) {
            bar.arrows = this.arrows.filter(arrow => {
                return (
                    arrow.from_task.task.id === bar.task.id ||
                    arrow.to_task.task.id === bar.task.id
                );
            });
        }
    }

    map_arrows_on_bar(bar) {
        bar.arrows = this.arrows.filter(arrow => {
            return (
                arrow.from_task.task.id === bar.task.id ||
                arrow.to_task.task.id === bar.task.id
            );
        });
    }

    set_width() {
        const cur_width = this.$svg.getBoundingClientRect().width;
        const actual_width = this.$svg
            .querySelector('.grid .grid-row')
            .getAttribute('width');
        if (cur_width < actual_width) {
            this.$svg.setAttribute('width', actual_width);
        }
    }

    set_scroll_position() {
        const parent_element = this.$svg.parentElement;
        if (!parent_element) return;

        const hours_before_first_task = date_utils.diff(
            this.get_oldest_starting_date(),
            this.gantt_start,
            'hour'
        );

        const scroll_pos =
            hours_before_first_task /
                this.options.step *
                this.options.column_width -
            this.options.column_width;

        setTimeout(() => parent_element.scrollTo({ left: scroll_pos }));
    }

    bind_grid_click() {
        $.on(
            this.$svg,
            this.options.popup_trigger,
            '.grid-row, .grid-header',
            () => {
                this.unselect_all();
                this.hide_popup();
            }
        );
    }

    bind_bar_events() {
        let is_dragging = false;
        let is_connecting = false;
        let connecting_type = null;
        let x_on_start = 0;
        let y_on_start = 0;
        let is_resizing_left = false;
        let is_resizing_right = false;
        let parent_bar_id = null;
        let bars = []; // instanceof Bar
        let connecting_bar = null;
        let new_position = null;
        this.bar_being_dragged = null;

        function action_in_progress() {
            return (
                is_dragging ||
                is_resizing_left ||
                is_resizing_right ||
                is_connecting
            );
        }

        $.on(this.$svg, 'mousedown', '.handle-group .circle', (e, element) => {
            is_connecting = !is_connecting;
            this.hide_popup();
            const { dependency: { types } } = Enums;
            const bar_wrapper = $.closest('.bar-wrapper', element);
            const task_id = bar_wrapper.getAttribute('data-id');
            const bar = this.get_bar(task_id);
            if (is_connecting) {
                connecting_bar = bar;
                connecting_type = element.classList.contains('left')
                    ? types.START_TO_START
                    : types.END_TO_START;
                element.classList.add('selected');
                this.$svg.querySelectorAll('.bar-wrapper').forEach(wrapper => {
                    const id = wrapper.getAttribute('data-id');
                    const can_add_dependency = this.can_add_dependency(
                        connecting_bar.task,
                        this.get_task(id)
                    );
                    wrapper.querySelectorAll('.circle').forEach(circle => {
                        let show_circle =
                            can_add_dependency ||
                            circle.classList.contains('selected');
                        if (connecting_bar.task.id !== id) {
                            show_circle &= !circle.classList.contains('right');
                        }
                        circle.classList.add(
                            show_circle ? 'active' : 'disabled'
                        );
                    });
                });
            } else {
                const { task } = bar;
                const { task: connecting_task } = connecting_bar;
                this.$svg
                    .querySelectorAll('.handle-group .circle')
                    .forEach(circle => {
                        circle.classList.remove(
                            'disabled',
                            'active',
                            'selected'
                        );
                    });

                if (this.can_add_dependency(connecting_task, task)) {
                    this.add_dependency(connecting_task, task, connecting_type);
                }
                connecting_bar = null;
            }
        });

        $.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
            if (is_connecting) return;
            const bar_wrapper = $.closest('.bar-wrapper', element);

            if (element.classList.contains('left')) {
                is_resizing_left = true;
            } else if (element.classList.contains('right')) {
                is_resizing_right = true;
            } else if (element.classList.contains('bar-wrapper')) {
                is_dragging = true;
            }

            bar_wrapper.classList.add('active');

            [x_on_start, y_on_start] = getOffset(e);

            parent_bar_id = bar_wrapper.getAttribute('data-id');

            ///
            let ids = [parent_bar_id];
            const allowType = is_resizing_left
                ? Enums.dependency.types.START_TO_START
                : Enums.dependency.types.END_TO_START;
            if (this.dependency_map.has(parent_bar_id)) {
                if (is_resizing_left || is_resizing_right) {
                    this.dependency_map
                        .get(parent_bar_id)
                        .forEach((type, childTaskId) => {
                            if (type === allowType) {
                                ids = [
                                    ...ids,
                                    ...this.get_all_dependent_tasks(
                                        childTaskId
                                    ),
                                    childTaskId
                                ];
                            }
                        });
                } else {
                    ids = [
                        ...ids,
                        ...this.get_all_dependent_tasks(parent_bar_id)
                    ];
                }
            }
            ///
            ids = [...new Set(ids).values()];
            bars = ids.map(id => this.get_bar(id));

            this.bar_being_dragged = parent_bar_id;

            bars.forEach(bar => {
                const $bar = bar.$bar;
                $bar.ox = bar.x;
                $bar.oy = bar.y;
                $bar.owidth = $bar.getWidth();
                $bar.finaldx = 0;
            });
        });

        $.on(this.$svg, 'mousemove', e => {
            if (!action_in_progress()) return;
            this.hide_popup();

            const [offsetX, offsetY] = getOffset(e);
            const dx = offsetX - x_on_start;
            const dy = offsetY - y_on_start;

            if (
                this.options.is_draggable &&
                this.options.is_sortable &&
                is_dragging
            ) {
                const row = Math.floor(
                    (e.offsetY - this.options.header_height - 10) /
                        (this.options.bar_height + this.options.padding)
                );
                if (row >= 0 && row < this.tasks.length) {
                    const bar = this.get_bar(parent_bar_id);
                    const offset = row - bar.task._index;

                    if (offset) {
                        new_position = bar.task._index + offset;
                        this.tasks.splice(
                            new_position,
                            0,
                            this.tasks.splice(bar.task._index, 1)[0]
                        );

                        this.tasks.forEach((task, i) => {
                            if (task._index !== i) {
                                task._index = i;
                                const bar = this.get_bar(task.id);
                                bar.update_bar_position({ y: bar.compute_y() });
                            }
                        });
                    }
                }
            }

            bars.forEach(bar => {
                const $bar = bar.$bar;
                $bar.finaldx = this.get_snap_position(dx);

                if (is_resizing_left) {
                    if (parent_bar_id === bar.task.id) {
                        if ($bar.finaldx < $bar.owidth) {
                            bar.update_bar_position({
                                x: $bar.ox + $bar.finaldx,
                                width: $bar.owidth - $bar.finaldx
                            });
                        }
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
                    } else {
                        bar.update_bar_position({
                            x: $bar.ox + $bar.finaldx
                        });
                    }
                } else if (is_dragging && this.options.is_draggable) {
                    bar.update_bar_position({
                        x: $bar.ox + $bar.finaldx
                    });
                }
            });
        });

        document.addEventListener('mouseup', e => {
            if (
                is_dragging ||
                is_resizing_left ||
                is_resizing_right ||
                is_connecting
            ) {
                bars.forEach(bar => bar.group.classList.remove('active'));
            }

            is_dragging = false;
            is_resizing_left = false;
            is_resizing_right = false;
        });

        $.on(this.$svg, 'mouseup', e => {
            if (this.bar_being_dragged) {
                this.bar_being_dragged = null;
                if (new_position !== null) {
                    this.trigger_event('order_change', [
                        parent_bar_id,
                        new_position
                    ]);
                    new_position = null;
                    this.get_bar(parent_bar_id).set_action_completed();
                }
                bars.forEach(bar => {
                    if (bar.task.id === parent_bar_id) {
                        bar.date_changed(is_resizing_right || is_resizing_left);
                    } else {
                        bar.date_changed();
                    }
                    if (bar.$bar.finaldx) {
                        bar.set_action_completed();
                    }
                });
            }
        });

        this.bind_bar_progress();
    }

    bind_bar_progress() {
        let x_on_start = 0;
        let y_on_start = 0;
        let is_resizing = null;
        let bar = null;
        let $bar_progress = null;
        let $bar = null;

        $.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
            is_resizing = true;

            [x_on_start, y_on_start] = getOffset(e);

            const $bar_wrapper = $.closest('.bar-wrapper', handle);
            const id = $bar_wrapper.getAttribute('data-id');
            bar = this.get_bar(id);

            $bar_progress = bar.$bar_progress;
            $bar = bar.$bar;

            $bar_progress.finaldx = 0;
            $bar_progress.owidth = $bar_progress.getWidth();
            $bar_progress.min_dx = -$bar_progress.getWidth();
            $bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
        });

        $.on(this.$svg, 'mousemove', e => {
            if (!is_resizing) return;

            const [offsetX, offsetY] = getOffset(e);
            let dx = offsetX - x_on_start;
            let dy = offsetY - y_on_start;

            if (dx > $bar_progress.max_dx) {
                dx = $bar_progress.max_dx;
            }
            if (dx < $bar_progress.min_dx) {
                dx = $bar_progress.min_dx;
            }

            const $handle = bar.$handle_progress;
            $.attr($bar_progress, 'width', $bar_progress.owidth + dx);
            $.attr($handle, 'points', bar.get_progress_polygon_points());
            $bar_progress.finaldx = dx;
        });

        $.on(this.$svg, 'mouseup', () => {
            is_resizing = false;
            if (!($bar_progress && $bar_progress.finaldx)) return;
            bar.progress_changed();
            bar.set_action_completed();
        });
    }

    get_all_dependent_tasks(task_id) {
        const tasksToProcess = new Set([task_id]);
        const dependentTasks = new Set();
        const { dependency_map: dependencyMap } = this;
        while (tasksToProcess.size > 0) {
            [...tasksToProcess.values()].forEach(id => {
                tasksToProcess.delete(id);
                dependentTasks.add(id);
                if (dependencyMap.has(id)) {
                    dependencyMap.get(id).forEach((_, key) => {
                        tasksToProcess.add(key);
                    });
                }
            });
        }
        dependentTasks.delete(task_id);

        return dependentTasks;
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.view_is('Year')) {
            const days_in_year = 365;
            rem = dx % (this.options.column_width / days_in_year);
            position =
                odx -
                rem +
                (rem < this.options.column_width / (days_in_year * 2)
                    ? 0
                    : this.options.column_width / days_in_year);
        } else if (this.view_is('Week')) {
            rem = dx % (this.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 14
                    ? 0
                    : this.options.column_width / 7);
        } else if (this.view_is('Month')) {
            rem = dx % (this.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 60
                    ? 0
                    : this.options.column_width / 30);
        } else {
            rem = dx % this.options.column_width;
            position =
                odx -
                rem +
                (rem < this.options.column_width / 2
                    ? 0
                    : this.options.column_width);
        }
        return position;
    }

    unselect_all() {
        [...this.$svg.querySelectorAll('.bar-wrapper')].forEach(el => {
            el.classList.remove('active');
        });
    }

    view_is(modes) {
        if (typeof modes === 'string') {
            return this.options.view_mode === modes;
        }

        if (Array.isArray(modes)) {
            return modes.some(mode => this.options.view_mode === mode);
        }

        return false;
    }

    get_task(id) {
        return this.tasks.find(task => {
            return task.id === id;
        });
    }

    get_bar(id) {
        return this.bars.find(bar => {
            return bar.task.id === id;
        });
    }

    show_popup(options) {
        if (!this.popup) {
            this.popup = new Popup(
                this.popup_wrapper,
                this.options.custom_popup_html,
                this.$svg
            );
        }
        this.popup.show(options);
    }

    hide_popup() {
        this.popup && this.popup.hide();
    }

    trigger_event(event, args) {
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
    get_oldest_starting_date() {
        return this.tasks
            .map(task => task._start)
            .reduce(
                (prev_date, cur_date) =>
                    cur_date <= prev_date ? cur_date : prev_date,
                this.gantt_end
            );
    }

    /**
     * Clear all elements from the parent svg element
     *
     * @memberof Gantt
     */
    clear() {
        this.$svg.innerHTML = '';
    }

    can_add_dependency(from_task, to_task) {
        const not_same_task = from_task.id !== to_task.id;
        const no_duplicate = !to_task.dependencies.has(from_task.id);
        const no_loop = !this.get_all_dependent_tasks(to_task.id).has(
            from_task.id
        );
        return not_same_task && no_duplicate && no_loop;
    }

    add_dependency(task_from, task_to, type) {
        this.make_arrow(task_from, task_to, type);
        this.map_arrows_on_bar(this.get_bar(task_from.id));
        this.map_arrows_on_bar(this.get_bar(task_to.id));
        task_to.dependencies.set(task_from.id, type);
        this.setup_dependencies();
        const bar = this.get_bar(task_to.id);
        bar.update_bar_position({ x: bar.compute_x() });
        bar.date_changed();
        this.get_all_dependent_tasks(task_to.id).forEach(id => {
            const depBar = this.get_bar(id);
            depBar.update_bar_position({ x: depBar.compute_x() });
            depBar.date_changed();
        });
        this.trigger_event('dependency_change', [task_from, task_to, type]);
    }

    delete_dependency(task_from, task_to, type) {
        task_to.dependencies.delete(task_from.id);
        this.map_arrows_on_bars();
        this.setup_dependencies();
        this.trigger_event('dependency_change', [task_from, task_to, type]);
    }

    getTasks() {
        return this.tasks.map(
            ({
                id,
                name,
                _start: start,
                _end: end,
                duration,
                dependencies
            }) => ({
                id,
                name,
                start,
                end,
                duration,
                dependencies: [...dependencies]
            })
        );
    }
}

function generate_id(task) {
    return (
        task.name +
        '_' +
        Math.random()
            .toString(36)
            .slice(2, 12)
    );
}

function getOffset({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    const offsetX = clientX - left;
    const offsetY = clientY - top;
    return [offsetX, offsetY];
}
