import { createSVG } from './svg_utils';
import Enums from './enums';

export default class Arrow {
    constructor(gantt, from_task, to_task, type) {
        this.gantt = gantt;
        this.from_task = from_task;
        this.to_task = to_task;
        this.type = type;

        this.calculate_path();
        this.draw();
        this.bind_events();
        this.setup_events();
    }

    bind_events() {
        this.handle_dblclick = this.handle_dblclick.bind(this);
        this.handle_mouseover = this.handle_mouseover.bind(this);
    }

    calculate_path() {
        const { dependency: { types } } = Enums;
        let start_x;
        let start_padding;
        let typeSign;
        const padding = 10;
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
        const start_y = this.from_task.y + this.from_task.$bar.getHeight() / 2;
        const end_x = this.to_task.x;
        const end_y = this.to_task.y + this.to_task.$bar.getHeight() / 2;

        const arrowPath = `
                m -5 -5
                l 5 5
                l -5 5`;

        if (start_x + start_padding >= end_x) {
            const from_is_below_to =
                this.from_task.task._index > this.to_task.task._index;
            let offset =
                this.to_task.$bar.getHeight() / 2 +
                this.gantt.options.padding / 2;
            const sign = from_is_below_to ? -1 : 1;
            offset *= sign;

            this.path = `
                M ${start_x} ${start_y}
                h ${start_padding}
                V ${end_y - offset}
                H ${end_x - start_padding * typeSign}
                V ${end_y}
                L ${end_x} ${end_y}
                ${arrowPath}`;
        } else {
            this.path = `
                M ${start_x} ${start_y}
                h ${start_padding}
                V ${end_y}
                L ${end_x} ${end_y}
                ${arrowPath}`;
        }
    }

    calculate_path_old() {
        let start_x =
            this.from_task.$bar.getX() + this.from_task.$bar.getWidth() / 2;

        const condition = () =>
            this.to_task.$bar.getX() < start_x + this.gantt.options.padding &&
            start_x > this.from_task.$bar.getX() + this.gantt.options.padding;

        while (condition()) {
            start_x -= 10;
        }

        const start_y =
            this.gantt.options.header_height +
            this.gantt.options.bar_height +
            (this.gantt.options.padding + this.gantt.options.bar_height) *
                this.from_task.task._index +
            this.gantt.options.padding;

        const end_x = this.to_task.$bar.getX() - this.gantt.options.padding / 2;
        const end_y =
            this.gantt.options.header_height +
            this.gantt.options.bar_height / 2 +
            (this.gantt.options.padding + this.gantt.options.bar_height) *
                this.to_task.task._index +
            this.gantt.options.padding;

        const from_is_below_to =
            this.from_task.task._index > this.to_task.task._index;
        const curve = this.gantt.options.arrow_curve;
        const clockwise = from_is_below_to ? 1 : 0;
        const curve_y = from_is_below_to ? -curve : curve;
        const offset = from_is_below_to
            ? end_y + this.gantt.options.arrow_curve
            : end_y - this.gantt.options.arrow_curve;

        this.path = `
            M ${start_x} ${start_y}
            V ${offset}
            a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}
            L ${end_x} ${end_y}
            m -5 -5
            l 5 5
            l -5 5`;

        if (
            this.to_task.$bar.getX() <
            this.from_task.$bar.getX() + this.gantt.options.padding
        ) {
            const down_1 = this.gantt.options.padding / 2 - curve;
            const down_2 =
                this.to_task.$bar.getY() +
                this.to_task.$bar.getHeight() / 2 -
                curve_y;
            const left = this.to_task.$bar.getX() - this.gantt.options.padding;

            this.path = `
                M ${start_x} ${start_y}
                v ${down_1}
                a ${curve} ${curve} 0 0 1 -${curve} ${curve}
                H ${left}
                a ${curve} ${curve} 0 0 ${clockwise} -${curve} ${curve_y}
                V ${down_2}
                a ${curve} ${curve} 0 0 ${clockwise} ${curve} ${curve_y}
                L ${end_x} ${end_y}
                m -5 -5
                l 5 5
                l -5 5`;
        }
    }

    draw() {
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

    update() {
        this.calculate_path();
        this.arrow.setAttribute('d', this.path);
        this.hover.setAttribute('d', this.path);
    }

    setup_events() {
        this.hover.addEventListener('dblclick', this.handle_dblclick);
        this.hover.addEventListener('mouseover', this.handle_mouseover);
    }

    remove_events() {
        this.hover.removeEventListener('dblclick', this.handle_dblclick);
        this.hover.removeEventListener('mouseover', this.handle_mouseover);
    }

    handle_mouseover() {
        // place hovered arrow in the end for proper highlight
        this.element.parentNode.appendChild(this.element);
    }

    handle_dblclick() {
        this.delete();
    }

    delete() {
        this.gantt.delete_dependency(
            this.from_task.task,
            this.to_task.task,
            this.type
        );
        this.element.remove();
        this.remove_events();
    }
}
