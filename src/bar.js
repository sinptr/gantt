import date_utils from './date_utils';
import Enums from './enums';
import { $, createSVG, animateSVG } from './svg_utils';
import moment from 'moment';

export default class Bar {
    constructor(gantt, task) {
        this.set_defaults(gantt, task);
        this.prepare();
        this.draw();
        this.bind();
    }

    get min_width() {
        const { gantt } = this;
        return gantt.view_is('Day') ? gantt.options.column_width - 1e-3 : 4;
    }

    set_defaults(gantt, task) {
        this.action_completed = false;
        this.gantt = gantt;
        this.task = task;
    }

    prepare() {
        this.prepare_values();
        this.prepare_helpers();
    }

    prepare_values() {
        this.invalid = this.task.invalid;
        this.height = this.gantt.options.bar_height;
        this.image_size = this.gantt.options.bar_height - 5;
        this.x = this.compute_x();
        this.y = this.compute_y();
        this.corner_radius = this.gantt.options.bar_corner_radius;
        this.duration =
            date_utils.diff(this.task._end, this.task._start, 'hour') /
            this.gantt.options.step;
        this.width = this.compute_width();
        this.progress_width =
            this.gantt.options.column_width *
                this.duration *
                (this.task.progress / 100) || 0;
        this.group = createSVG('g', {
            class: 'bar-wrapper ' + (this.task.custom_class || ''),
            'data-id': this.task.id,
            transform: `translate(${this.x}, ${this.y})`
        });
        this.bar_group = createSVG('g', {
            class: 'bar-group',
            append_to: this.group
        });
        this.handle_group = createSVG('g', {
            class: 'handle-group',
            append_to: this.group
        });
        this.color = this.isValidColor(this.task.color) ? this.task.color : '';
    }

    prepare_helpers() {
        SVGElement.prototype.getX = function() {
            return +this.getAttribute('x');
        };
        SVGElement.prototype.getY = function() {
            return +this.getAttribute('y');
        };
        SVGElement.prototype.getWidth = function() {
            return +this.getAttribute('width');
        };
        SVGElement.prototype.getHeight = function() {
            return +this.getAttribute('height');
        };
        SVGElement.prototype.getEndX = function() {
            return this.getX() + this.getWidth();
        };
    }

    isValidColor(color = '') {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
    }

    draw() {
        this.draw_bar();

        if (this.gantt.options.progress) {
            this.draw_progress_bar();
        }

        this.draw_label();

        if (this.task.thumbnail) {
            this.draw_thumbnail();
        }

        this.draw_dependency_handles();
        if (this.gantt.options.resizing) {
            this.draw_resize_handles();
        }
    }

    draw_bar() {
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
        if (this.color) {
            this.$bar.style.fill = this.color;
        }

        animateSVG(this.$bar, 'width', 0, this.width);

        if (this.invalid) {
            this.$bar.classList.add('bar-invalid');
        }
    }

    draw_progress_bar() {
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

    draw_label() {
        let x_coord, y_coord;
        let padding = 5;

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
        requestAnimationFrame(() => this.update_label_position());
    }

    draw_thumbnail() {
        let x_offset = 10,
            y_offset = 2;
        let defs, clipPath;

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

    draw_dependency_handles() {
        if (this.invalid) return;

        const bar = this.$bar;
        const handle_width = 8;
        const bar_too_small = this.width < handle_width * 2 + 2;
        let circle_left = bar.getX() - 10;
        let circle_right = bar.getEndX() + 10;

        if (bar_too_small) {
            circle_left -= handle_width;
            circle_right += handle_width;
        }

        createSVG('circle', {
            cx: circle_left,
            cy: bar.getY() + this.height / 2,
            r: this.height / 6,
            class: 'circle left',
            append_to: this.handle_group
        });

        createSVG('circle', {
            cx: circle_right,
            cy: bar.getY() + this.height / 2,
            r: this.height / 6,
            class: 'circle right',
            append_to: this.handle_group
        });
    }

    draw_resize_handles() {
        if (this.invalid) return;

        const bar = this.$bar;
        const handle_width = 8;
        const bar_too_small = this.width < handle_width * 2 + 2;
        let x_right = bar.getX() + bar.getWidth();
        let x_left = bar.getX();
        x_right += bar_too_small ? 1 : -(handle_width + 1);
        x_left += bar_too_small ? -(handle_width + 1) : 1;

        createSVG('rect', {
            x: x_right,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle right',
            append_to: this.handle_group
        });

        createSVG('rect', {
            x: x_left,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle left',
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

    get_progress_polygon_points() {
        const bar_progress = this.$bar_progress;
        return (
            (bar_progress && [
                bar_progress.getEndX() - 5,
                bar_progress.getY() + bar_progress.getHeight(),
                bar_progress.getEndX() + 5,
                bar_progress.getY() + bar_progress.getHeight(),
                bar_progress.getEndX(),
                bar_progress.getY() + bar_progress.getHeight() - 8.66
            ]) ||
            []
        );
    }

    bind() {
        this.setup_click_event();
    }

    setup_click_event() {
        $.on(this.bar_group, 'focus ' + this.gantt.options.popup_trigger, e => {
            if (this.action_completed) {
                // just finished a move action, wait for a few seconds
                return;
            }

            if (e.type === 'click') {
                this.gantt.trigger_event('click', [this.task]);
                this.show_popup();
            }

            this.gantt.unselect_all();
            this.group.classList.toggle('active');
        });
    }

    show_popup() {
        if (this.gantt.bar_being_dragged) return;

        const start_date = date_utils.format(
            this.task._start,
            'MMM D',
            this.gantt.options.language
        );
        const end_date = date_utils.format(
            this.task._end,
            'MMM D',
            this.gantt.options.language
        );
        const subtitle = start_date + ' - ' + end_date;

        this.gantt.show_popup({
            target_element: this.$bar,
            title: this.task.name,
            subtitle: subtitle,
            task: this.task
        });
    }

    update_bar_position({ x = null, y = null, width = null }) {
        const bar = this.$bar;
        if (x) {
            // get all x values of parent task
            const xs = Array.from(this.task.dependencies, ([dep, type]) => {
                const bar = this.gantt.get_bar(dep);
                return bar.x;
            });
            // child task must not go before parent
            this.x = Math.max(...xs, x);
            if (this.x !== x) {
                width = 0;
            }
        }
        if (y) {
            this.y = y;
        }
        this.group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
        if (width) {
            const { min_width } = this;
            this.update_attr(bar, 'width', Math.max(width, min_width));
        }
        this.update_label_position();

        this.update_handle_position();

        this.update_progressbar_position();
        this.update_arrow_position();
    }

    update_label_position_on_horizontal_scroll({ x, sx }) {
        const container = document.querySelector('.gantt-container');
        const label = this.group.querySelector('.bar-label');
        const img = this.group.querySelector('.bar-img') || '';
        const img_mask = this.bar_group.querySelector('.img_mask') || '';

        let barWidthLimit = this.$bar.getX() + this.$bar.getWidth();
        let newLabelX = label.getX() + x;
        let newImgX = (img && img.getX() + x) || 0;
        let imgWidth = (img && img.getBBox().width + 7) || 7;
        let labelEndX = newLabelX + label.getBBox().width + 7;
        let viewportCentral = sx + container.clientWidth / 2;

        if (label.classList.contains('big')) return;

        if (labelEndX < barWidthLimit && x > 0 && labelEndX < viewportCentral) {
            label.setAttribute('x', newLabelX);
            if (img) {
                img.setAttribute('x', newImgX);
                img_mask.setAttribute('x', newImgX);
            }
        } else if (
            newLabelX - imgWidth > this.$bar.getX() &&
            x < 0 &&
            labelEndX > viewportCentral
        ) {
            label.setAttribute('x', newLabelX);
            if (img) {
                img.setAttribute('x', newImgX);
                img_mask.setAttribute('x', newImgX);
            }
        }
    }

    compute_width() {
        const width =
            date_utils.diff(this.task._end, this.task._start, 'hour') /
            this.gantt.options.step *
            this.gantt.options.column_width;
        return Math.max(width, this.min_width);
    }

    date_changed(resizing = false) {
        let { new_start_date, new_end_date } = this.compute_start_end_date();
        const { calendar } = this.gantt;
        if (resizing) {
            this.task.duration = calendar.computeTaskDuration(
                calendar.placeDateInWorkingRange(new_start_date, true),
                calendar.placeDateInWorkingRange(new_end_date)
            );
            new_end_date = calendar.placeDateInWorkingRange(new_end_date);
        }
        new_start_date = calendar.placeDateInWorkingRange(new_start_date, true);
        if (!resizing) {
            new_end_date = calendar.computeTaskEndDate(
                new_start_date,
                this.task.duration
            );
        }

        const changed =
            +new_start_date !== +this.task._start ||
            +new_end_date !== +this.task._end;

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
            this.gantt.trigger_event('date_change', [
                this.task,
                new_start_date,
                new_end_date
            ]);
        }
    }

    progress_changed() {
        const new_progress = this.compute_progress();
        this.task.progress = new_progress;
        this.gantt.trigger_event('progress_change', [this.task, new_progress]);
    }

    set_action_completed() {
        this.action_completed = true;
        setTimeout(() => (this.action_completed = false), 1000);
    }

    compute_start_end_date() {
        const bar = this.$bar;
        const x_in_units = this.x / this.gantt.options.column_width;
        const new_start_date = moment(this.gantt.gantt_start)
            .add(x_in_units * this.gantt.options.step, 'hours')
            .toDate();
        const width_in_units = bar.getWidth() / this.gantt.options.column_width;
        const new_end_date = moment(new_start_date)
            .add(width_in_units * this.gantt.options.step, 'hours')
            .toDate();

        return { new_start_date, new_end_date };
    }

    compute_progress() {
        const progress =
            this.$bar_progress.getWidth() / this.$bar.getWidth() * 100;
        return parseInt(progress, 10);
    }

    compute_x() {
        const { step, column_width } = this.gantt.options;
        const task_start = this.task._start;
        const gantt_start = this.gantt.gantt_start;

        const diff = date_utils.diff(task_start, gantt_start, 'hour');
        let x = diff / step * column_width;

        if (this.gantt.view_is('Month')) {
            const diff = date_utils.diff(task_start, gantt_start, 'day');
            x = diff * column_width / 30;
        }
        return x;
    }

    compute_y() {
        return (
            this.gantt.options.header_height +
            this.gantt.options.padding +
            this.task._index * (this.height + this.gantt.options.padding)
        );
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.gantt.view_is('Week')) {
            rem = dx % (this.gantt.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 14
                    ? 0
                    : this.gantt.options.column_width / 7);
        } else if (this.gantt.view_is('Month')) {
            rem = dx % (this.gantt.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 60
                    ? 0
                    : this.gantt.options.column_width / 30);
        } else {
            rem = dx % this.gantt.options.column_width;
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 2
                    ? 0
                    : this.gantt.options.column_width);
        }
        return position;
    }

    update_attr(element, attr, value) {
        value = +value;
        if (!isNaN(value)) {
            element.setAttribute(attr, value);
        }
        return element;
    }

    update_progressbar_position() {
        this.$bar_progress &&
            this.$bar_progress.setAttribute(
                'width',
                this.$bar.getWidth() * (this.task.progress / 100)
            );
    }

    update_label_position() {
        const img_mask = this.bar_group.querySelector('.img_mask') || '';
        const bar = this.$bar,
            label = this.group.querySelector('.bar-label'),
            img = this.group.querySelector('.bar-img');

        let padding = 5;
        let x_offset_label_img = this.image_size + 10;

        if (label.getBBox().width > bar.getWidth()) {
            label.classList.add('big');
            if (img) {
                img.setAttribute('x', bar.getX() + bar.getWidth() + padding);
                img_mask.setAttribute(
                    'x',
                    bar.getX() + bar.getWidth() + padding
                );
                label.setAttribute(
                    'x',
                    bar.getX() + bar.getWidth() + x_offset_label_img
                );
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

    update_handle_position() {
        const bar = this.$bar;
        const handle_width = 8;
        const bar_too_small = bar.getWidth() < handle_width * 2 + 2;
        let x_right = bar.getX() + bar.getWidth();
        let x_left = bar.getX();
        x_right += bar_too_small ? 1 : -(handle_width + 1);
        x_left += bar_too_small ? -(handle_width + 1) : 1;

        let circle_left = bar.getX() - 10;
        let circle_right = bar.getEndX() + 10;

        if (bar_too_small) {
            circle_left -= handle_width;
            circle_right += handle_width;
        }

        if (this.gantt.options.resizing) {
            this.handle_group
                .querySelector('.handle.left')
                .setAttribute('x', x_left);
            this.handle_group
                .querySelector('.handle.right')
                .setAttribute('x', x_right);
        }

        this.handle_group
            .querySelector('.circle.left')
            .setAttribute('cx', String(circle_left));
        this.handle_group
            .querySelector('.circle.right')
            .setAttribute('cx', String(circle_right));

        const handle = this.group.querySelector('.handle.progress');
        handle &&
            handle.setAttribute('points', this.get_progress_polygon_points());
    }

    update_arrow_position() {
        this.arrows = this.arrows || [];
        for (let arrow of this.arrows) {
            arrow.update();
        }
    }
}

function isFunction(functionToCheck) {
    var getType = {};
    return (
        functionToCheck &&
        getType.toString.call(functionToCheck) === '[object Function]'
    );
}
