export var mrctx: IMediaRecorderContext = {
    audioContext: undefined,
    analyser: undefined,
    mediaRecorder: undefined,
    btnStart: undefined,
    main_controls: undefined,
    w: undefined,
    h: undefined,
    center2D: {
        x: undefined,
        y: undefined,
    },
    context: undefined,
    imageData: undefined,
    data: undefined,
    mouseActive: false,
    mouseDown: false,
    mousePos: { x: 0, y: 0 },
    fov: 250,
    speed: 0.25,
    particles: [],
    particlesSky: [],
    particleDistanceTop: 10,
    canvas: document.querySelector('.visualizer') as HTMLCanvasElement,
    record_btn: document.getElementById('record-btn') as HTMLDivElement,
    stop_record_btn: document.getElementById('stop-record-btn') as HTMLDivElement,
    video: document.querySelector('video') as HTMLVideoElement,
    videoIndex: 1,
}
