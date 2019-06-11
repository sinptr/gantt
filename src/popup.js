export default class Popup {
    constructor(parent, custom_html, chart) {
        this.parent = parent;
        this.custom_html = custom_html;
        this.chart = chart;
        this.make();
    }

    make() {
        this.parent.innerHTML = `
            <div class="title"></div>
            <div class="subtitle"></div>
            <div class="pointer"></div>
        `;

        this.hide();

        this.title = this.parent.querySelector('.title');
        this.subtitle = this.parent.querySelector('.subtitle');
        this.pointer = this.parent.querySelector('.pointer');
    }

    show(options) {
        if (!options.target_element) {
            throw new Error('target_element is required to show popup');
        }
        if (!options.position) {
            options.position = 'left';
        }
        const target_element = options.target_element;

        if (this.custom_html) {
            let html = this.custom_html(options.task);
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
        const chart_position = this.chart.getBoundingClientRect();
        const target_position = target_element.getBoundingClientRect();
        const relative_position = {
            top: target_position.top - chart_position.top,
            right: target_position.right - chart_position.right,
            bottom: target_position.bottom - chart_position.bottom,
            left: target_position.left - chart_position.left
        };

        if (options.position === 'left') {
            this.parent.style.left =
                relative_position.left + (target_position.width + 20) + 'px';
            this.parent.style.top = relative_position.top - 7 + 'px';

            this.pointer.style.transform = 'rotateZ(90deg)';
            this.pointer.style.left = '-7px';
            this.pointer.style.top = '2px';
        }

        // show
        this.parent.style.opacity = '1';
        this.parent.style.visibility = 'visible';
    }

    hide() {
        this.parent.style.opacity = '0';
        this.parent.style.visibility = 'hidden';
    }
}
