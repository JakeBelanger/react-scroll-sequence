import React, { useRef, useEffect } from 'react';
import { useSpring, config } from 'react-spring'

import { drawImageCover, createLoadingQueue } from './utils'


const ScrollSequence = ({ children, images, priorityFrames, starts = "in", ends = "in", style, ...rest }) => {

    const loadingQueue = useRef((priorityFrames || []).concat(createLoadingQueue(images.length)))
    const loadedImages = useRef([])
    const canvasRef = useRef(null)
    const containerRef = useRef(null)


    const [{ spring }, api] = useSpring(() => ({
        spring: 0,
        config: config.slow,
        onChange: () => draw()
    }))


    const nearestLoadedImage = (target) => {
        const images = loadedImages.current
        if (images[target]) return images[target]
        for (let i = 1; i < images.length; i++) {
            if (images[target - i]) return images[target - i]
            if (images[target + i]) return images[target + i]
        }
    }

    function draw() {
        const val = ~~spring.get();
        const ctx = canvasRef.current.getContext('2d');
        const image = nearestLoadedImage(val);
        if (image?.width) {
            drawImageCover(ctx, image)
        }
    }


    const loadNextImage = () => {
        if (loadingQueue.current.length === 0) return // queue is empty, finished loading
        const e = loadingQueue.current.shift()

        // check if image has already been loaded
        if (loadedImages.current[e]) {
            return loadNextImage()
        }

        const onLoad = () => {
            img.removeEventListener('load', onLoad);
            loadedImages.current[e] = img
                
            if (e === 0) {
                draw()
            }
            loadNextImage();

            
        }

        // prepare the image
        const img = new Image();
        img.addEventListener('load', onLoad);
        img.src = images[e];

    }

    const getPercentScrolled = () => {
        const el = containerRef.current;
        const doc = document.documentElement;
        const clientOffsety = doc.scrollTop || window.pageYOffset;
        const elementHeight = el.clientHeight || el.offsetHeight;
        const clientHeight = doc.clientHeight;
        let target = el;
        let offsetY = 0;
        do {
            offsetY += target.offsetTop;
            target = target.offsetParent;
        } while (target && target !== window);

        let u = (clientOffsety - offsetY);
        let d = (elementHeight + clientHeight)

        if (starts === 'out') u += clientHeight;
        if (ends === 'in') d -= clientHeight;
        if (starts === 'in') d -= clientHeight;
        // start: out, ends: out
        // const value = ((clientOffsety + clientHeight) - offsetY) / (clientHeight + elementHeight) * 100;

        //start: in, ends: out
        // const value = (clientOffsety - offsetY) / (elementHeight) * 100;

        //start: out, ends: in
        // const value = ((clientOffsety + clientHeight) - offsetY) / (elementHeight) * 100;

        // Start: in, ends: in
        // (clientOffsety - offsetY) / (elementHeight - clientHeight)

        const value = u / d;
        return value > 1 ? 1 : value < 0 ? 0 : value;
    }


    

    useEffect(() => {
        // Start loading images
        loadNextImage()

        const handleScroll = (e) => {
            const percent = getPercentScrolled()
            api.start({ spring: percent * images.length })
        }

        // Handle resize
        function updateSize() {
            const w = canvasRef.current.parentElement.clientWidth;
            const h = canvasRef.current.parentElement.clientHeight;
            const canvas = canvasRef.current

            canvas.width = w
            canvas.height = h
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`

            draw()
        }
        window.addEventListener('resize', updateSize);
        window.addEventListener('scroll', handleScroll)
        updateSize();

        console.log(createLoadingQueue(20))
        return () => {
            window.removeEventListener('resize', updateSize);
        }
    }, [draw, loadNextImage])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative'
            }}
        >
            <div
                style={{
                    height: '100vh',
                    width: '100%',
                    position: "sticky", 
                    inset: '0'
                }}>
                <canvas ref={canvasRef}/>
                
            </div>
            <div style={{position: 'relative', ...style}} {...rest}>
                {children}
            </div>
        </div>);
};

export default ScrollSequence