import * as React from 'react'

import {MODE, ModeType, ResizeType} from './Constants'
import {EventStream, StrokeColorType, StrokeWidthType} from './EventStream'
import {EventStore, ImageDataType, MoveDataType, PointDataType} from './EventStore'
import {CursorPane} from './CursorPane'
import {CanvasPane} from './CanvasPane'


type Props = {
    events: EventStream,
    eventStore: EventStore,
    width: number,
    height: number,
    style: {
        backgroundColor: string
    }
}

type State = {
    eventStore: EventStore,
    mode: ModeType,
    layer: number,
    strokeWidth: number,
    strokeColor: string
}

export class Whiteboard extends React.Component<Props, State> {

    static defaultProps = {
        events: new EventStream(),
        eventStore: new EventStore(),
        width: 400,
        height: 400,
        style: {
            backgroundColor: 'none'
        }
    }
    props: Props
    state: State

    canvas?: CanvasPane

    constructor(props: Props) {
        super(props)

        this.state = {
            eventStore: props.eventStore,
            mode: MODE.HAND,
            layer: 0,
            strokeWidth: 5,
            strokeColor: 'black'
        }

        this.canvas = null
    }

    getSvgElement(): SVGSVGElement | undefined {
        if (this.canvas) {
            return this.canvas.getSvgElement()
        }
    }

    componentDidMount() {
        this.setupEventHandler()
    }

    setupEventHandler() {
        this.props.events.on('selectLayer', this.selectLayer.bind(this))
        this.props.events.on('addLayer', this.addLayer.bind(this))

        this.props.events.on('start', this.startDrawing.bind(this))
        this.props.events.on('stop', this.stopDrawing.bind(this))

        this.props.events.on('set', (event: StrokeWidthType | StrokeColorType) => {
            if (event.key === 'strokeWidth') {
                this.changeStrokeWidth(event.value)
            }
            if (event.key === 'strokeColor') {
                this.changeStrokeColor(event.value)
            }
        })

        this.props.events.on('push', this.pushPoint.bind(this))

        this.props.events.on('paste', this.pasteImage.bind(this))
        this.props.events.on('startDragging', this.startDragging.bind(this))
        this.props.events.on('stopDragging', this.stopDragging.bind(this))
        this.props.events.on('drag', this.dragImage.bind(this))
        this.props.events.on('startResizing', this.startResizing.bind(this))
        this.props.events.on('stopResizing', this.stopResizing.bind(this))
        this.props.events.on('resize', this.resizeImage.bind(this))

        this.props.events.on('undo', this.undo.bind(this))
        this.props.events.on('redo', this.redo.bind(this))
        this.props.events.on('clear', this.clear.bind(this))
    }

    selectLayer(layer: number) {
        this.state.eventStore.selectLayer(layer)
        this.setState({
            layer: layer,
            eventStore: this.state.eventStore
        })
    }

    addLayer() {
        this.state.eventStore.addLayer()
        this.setState({eventStore: this.state.eventStore})
    }

    startDrawing(point: PointDataType) {
        this.state.eventStore.startDrawing(this.state.strokeWidth, this.state.strokeColor, point)
        this.setState({
            mode: MODE.DRAW_LINE,
            eventStore: this.state.eventStore
        })
    }

    stopDrawing() {
        this.state.eventStore.stopDrawing()
        this.setState({
            mode: MODE.HAND,
            eventStore: this.state.eventStore
        })
    }

    changeStrokeWidth(width: number) {
        this.state.eventStore.stopDrawing()
        this.setState({
            strokeWidth: width,
            eventStore: this.state.eventStore
        })
    }

    changeStrokeColor(color: string) {
        this.state.eventStore.stopDrawing()
        this.setState({
            strokeColor: color,
            eventStore: this.state.eventStore
        })
    }

    pushPoint(point: PointDataType) {
        this.state.eventStore.pushPoint(this.state.strokeWidth, this.state.strokeColor, point)
        this.setState({eventStore: this.state.eventStore})
    }

    pasteImage(image: ImageDataType) {
        this.state.eventStore.pasteImage(image)
        this.setState({eventStore: this.state.eventStore})
    }

    startDragging() {
        this.setState({mode: MODE.DRAG_IMAGE})
    }

    stopDragging() {
        this.setState({mode: MODE.HAND})
    }

    dragImage(move: MoveDataType) {
        if (this.state.mode !== MODE.DRAG_IMAGE) {
            return
        }

        this.state.eventStore.dragImage(move)
        this.setState({eventStore: this.state.eventStore})
    }

    startResizing(resizeType: ResizeType) {
        this.setState({mode: resizeType})
    }

    stopResizing() {
        this.setState({mode: MODE.HAND})
    }

    resizeImage(move: MoveDataType) {
        if (this.state.mode === MODE.NW_RESIZE_IMAGE) {
            this.state.eventStore.nwResizeImage(move)
            this.setState({eventStore: this.state.eventStore})
        } else if (this.state.mode === MODE.NE_RESIZE_IMAGE) {
            this.state.eventStore.neResizeImage(move)
            this.setState({
                eventStore: this.state.eventStore
            })
        } else if (this.state.mode === MODE.SE_RESIZE_IMAGE) {
            this.state.eventStore.seResizeImage(move)
            this.setState({
                eventStore: this.state.eventStore
            })
        } else if (this.state.mode === MODE.SW_RESIZE_IMAGE) {
            this.state.eventStore.swResizeImage(move)
            this.setState({eventStore: this.state.eventStore})
        }
    }

    undo() {
        this.state.eventStore.undo()
        this.setState({eventStore: this.state.eventStore})
    }

    redo() {
        this.state.eventStore.redo()
        this.setState({eventStore: this.state.eventStore})
    }

    clear() {
        this.state.eventStore.clear()
        this.setState({eventStore: this.state.eventStore})
    }

    render() {
        const wrapperStyle = {
            position: 'relative' as 'relative',
            width: this.props.width,
            height: this.props.height
        }

        const props = Object.assign({}, this.props, this.state)

        return (
            <div style={wrapperStyle}>
                <CursorPane {...props}/>
                <CanvasPane ref={canvas => this.canvas = canvas} {...props}/>
            </div>
        )
    }
}
