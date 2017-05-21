import React from 'react';
import PropTypes from 'react-proptypes';


export default class CursorPane extends React.Component {

    tweakPoint(point) {
        if (this.props.strokeWidth <= 3) {
            return [point[0] - 2, point[1] + 2];
        } else if (this.props.strokeWidth <= 6) {
            return [point[0] - 2, point[1] + 4];
        } else {
            return [point[0] - 2, point[1] + 6];
        }
    }

    componentDidMount() {
        const that = this;
        this.cursorLayer.addEventListener('mousemove', (ev) => {
            const point = that.tweakPoint([ev.offsetX, ev.offsetY]);
            that.context.events.pushPoint(point[0], point[1]);
        });
        this.cursorLayer.addEventListener('click', (ev) => {
            const point = [ev.offsetX - 2, ev.offsetY + 2];
            that.context.events.changeMode(point);
        });
    }

    render() {
        const cursorLayerStyle = {
            position: 'absolute',
            zIndex: 2000,
            width: this.props.width,
            height: this.props.height,
            borderStyle: 'none none solid none',
            borderColor: this.props.strokeColor,
        };

        return (
            <div ref={cursorLayer => this.cursorLayer = cursorLayer} style={cursorLayerStyle}></div>
        );
    }
}

CursorPane.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    strokeWidth: PropTypes.number,
    strokeColor: PropTypes.string,
};

CursorPane.contextTypes = {
    events: PropTypes.object,
};
