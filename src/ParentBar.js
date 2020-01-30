import date_utils from './date_utils';
import moment from 'moment';
import { $, createSVG } from './svg_utils';

export default class ParentBar {
    constructor(gantt, task) {
        this.set_defaults(gantt, task);
        this.prepare();
        this.draw();
        this.bind();
    }

    get min_width() {
        const { gantt } = this;
        return gantt.view_is('Day') ? gantt.options.column_width - 1e-3 : 20;
    }

    set_defaults(gantt, task) {
        this.action_completed = false;
        this.gantt = gantt;
        this.children = gantt.childTasksMap.get(task.id);

        const [start, end] = this.compute_start_end_date();
        task._start = start;
        task._end = end;
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
            class: 'parent-bar__wrapper ' + (this.task.custom_class || ''),
            'data-id': this.task.id,
            transform: `translate(${this.x}, ${this.y})`
        });
        this.bar_group = createSVG('g', {
            class: 'parent-bar__group',
            append_to: this.group
        });
        this.color = this.task.color || '';
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

    draw() {
        this.draw_bar();
        this.draw_label();
    }

    getPolygonPoints() {
        const polygonPoints = [
            [0, 0],
            [this.width, 0],
            [this.width, this.height],
            [this.width - 10, this.height / 3],
            [10, this.height / 3],
            [0, this.height]
        ];

        return polygonPoints.map(point => point.join(' ')).join(',');
    }

    draw_bar() {
        this.$bar = createSVG('polygon', {
            points: this.getPolygonPoints(0),
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            class: 'bar',
            append_to: this.bar_group
        });
        if (this.color) {
            this.$bar.style.fill = this.color;
        }

        if (this.invalid) {
            this.$bar.classList.add('bar-invalid');
        }
    }

    draw_label() {
        const padding = 5;
        const x_coord = padding;

        createSVG('text', {
            x: x_coord,
            y: this.height / 2,
            innerHTML: this.task.name,
            class: 'bar-label big',
            append_to: this.bar_group
        });
        // labels get BBox in the next tick
        requestAnimationFrame(() => this.update_label_position());
    }

    bind() {
        this.setup_click_event();
        const { gantt, children } = this;

        this.gantt.$svg.addEventListener('child_task_update', () => {
            const bars = [];
            children.forEach(({ id }) => {
                bars.push(gantt.get_bar(id));
            });
            const [start, end] = bars.reduce(
                ([s, e], bar) => {
                    return [Math.min(s, bar.x), Math.max(e, bar.x + bar.width)];
                },
                [Infinity, -Infinity]
            );
            this.update_bar_position({ x: start, width: end - start });
        });
    }

    setup_click_event() {
        $.on(this.bar_group, 'focus ' + this.gantt.options.popup_trigger, e => {
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
        const subTasksInfo = `<ul class="parent-task__info">${this.children
            .map(
                ({ name, _start, _end }) =>
                    `<li class="sub-task__info">
                        <span class="sub-task__name">${name}</span>
                        <span>
                            (${moment(_start).format('DD.MM')} 
                            - 
                            ${moment(_end).format('DD.MM')})
                        </span>
                    </li>`
            )
            .join('')}</ul>`;

        const [start, end] = this.compute_start_end_date();

        const taskDates = `<span>${moment(start).format('DD.MM')} - ${moment(
            end
        ).format('DD.MM')}</span>`;

        const subtitle = `${subTasksInfo}${taskDates}`;

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
            this.x = x;
        }
        if (y) {
            this.y = y;
        }
        this.group.setAttribute('transform', `translate(${this.x}, ${this.y})`);
        if (width) {
            const { min_width } = this;
            this.width = Math.max(min_width, width);
            this.update_attr(bar, 'points', this.getPolygonPoints());
        }
        this.update_label_position();
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

    compute_start_end_date() {
        return this.gantt.getTasksEdgeDates(this.children);
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
        element.setAttribute(attr, value);
        return element;
    }

    update_label_position() {
        const label = this.group.querySelector('.bar-label');

        let padding = 5;
        const labelWidth = label.getBBox().width;

        if (labelWidth > this.width - 40) {
            label.setAttribute('x', String(this.width + padding));
            label.setAttribute('y', String(this.height / 2));
        } else {
            label.setAttribute('x', String(this.width / 2 - labelWidth / 2));
            label.setAttribute('y', String(this.height / 2 + padding));
        }
    }
}
