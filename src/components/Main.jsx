import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useDropzone } from 'react-dropzone'
import logoNextsix from '../images/logo.svg'

const Main = () => {
    const [image, setImage] = useState('')
    const [originalImage, setOriginalImage] = useState('')
    const [compressedImage, setCompressedImage] = useState('')
    const [compressedImageLink, setCompressedImageLink] = useState('')
    const [rotate, setRotate] = useState(0)
    const [container, setContainer] = useState({
        height: 0,
        width: 0
    })
    const [imageSize, setImageSize] = useState({
        height: 0,
        width: 0
    })
    const [maxSize, setMaxSize] = useState({
        height: 0,
        width: 0
    })

    const [isWatermark, setIsWatermark] = useState(false)
    const [loading, setLoading] = useState(false)

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: files => {
            setLoading(true)
            const imageContainer = document.getElementById('image_container')
            if (imageContainer) {
                setContainer({
                    height: imageContainer.clientHeight,
                    width: imageContainer.clientWidth
                })
            }
            const reader = new FileReader()

            reader.onload = () => {
                setImage(reader.result)
                setOriginalImage(files[0])
                setCompressedImage('')
                setCompressedImageLink('')
                setRotate(0)

                // SET IMAGE SIZE
                const img = new Image()
                img.src = reader.result
                img.onload = () => {
                    setLoading(false)
                    if (img.width >= img.height) {
                        setMaxSize({
                            height: `${ (img.height / img.width) * imageContainer.clientWidth }px`,
                            width: `${ imageContainer.clientWidth }px`
                        })
                        setImageSize({
                            height: `${ (img.height / img.width) * imageContainer.clientWidth }px`,
                            width: `${ imageContainer.clientWidth }px`
                        })
                    } else {
                        setMaxSize({
                            height: `${ imageContainer.clientHeight }px`,
                            width: `${ imageContainer.clientHeight / (img.height / img.width) }px`
                        })
                        setImageSize({
                            height: `${ imageContainer.clientHeight }px`,
                            width: `${ imageContainer.clientHeight / (img.height / img.width) }px`
                        })
                    }
                }
            }

            reader.readAsDataURL(files[0])
        }
    });
  
    const handleRotate = (e, direction) => {
        e.preventDefault()
        let currentRotation = 0

        if (direction === 'right') {
            setRotate(rotate + 90)
            currentRotation = (rotate + 90)
        } else if (direction === 'left') {
            setRotate(rotate - 90)
            currentRotation = (rotate - 90)
        }

        // SET IMAGE SIZE
        const img = new Image()
        img.src = image

        // CHECK IMAGE ORIENTATION
        if (img.width >= img.height) {
            if ((rotate / 90) % 2 === 0) {
                // POTRAIT ORIENTATION
                setMaxSize({
                    height: `${ container.height / (img.width / img.height) }px`,
                    width: container.height
                })
                setImageSize({
                    height: container.height,
                    width: `${ container.height / (img.width / img.height) }px`
                })
            } else {
                // LANDSCAPE ORIENTATION
                setMaxSize({
                    height: `${ (img.height / img.width) * container.width }px`,
                    width: `${ container.width }px`
                })
                setImageSize({
                    height: `${ (img.height / img.width) * container.width }px`,
                    width: `${ container.width }px`
                })
            }
        } else {
            if ((rotate / 90) % 2 === 0) {
                // LANDSCAPE ORIENTATION
                setMaxSize({
                    height: `${ container.width }px`,
                    width: `${ (img.height / img.width) * container.width }px`
                })
                setImageSize({
                    height: `${ (img.width / img.height) * container.width }px`,
                    width: `${ container.width }px`
                })
            } else {
                // POTRAIT ORIENTATION
                setMaxSize({
                    height: `${  container.height }px`,
                    width: `${ (img.width / img.height) * container.width }px`
                })
                setImageSize({
                    height: `${ container.height }px`,
                    width: `${ container.height / (img.height / img.width) }px`
                })
            }
        }

        if (isWatermark) handleWatermark(currentRotation)
    }

    const convertSize = (bytes) => {
        if (!+bytes) return '0 bytes'
    
        const k = 1000
        const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`
    }

    const handleReset = () => {
        if (!compressedImage) {
            setImage('')
        }

        setCompressedImageLink('')
        setCompressedImage('')
        setIsWatermark(false)
        document.getElementById('showWatermarkInput').checked = false
    }

    const showWatermark = (e) => {
        let currIsWatermark

        if (e.target.checked) {
            setIsWatermark(true)
            currIsWatermark = true
        } else {
            setIsWatermark(false)
            currIsWatermark = false
        }

        if (currIsWatermark) {
            handleWatermark(rotate)
        }
    }

    const handleWatermark = (currentRotation) => {
        
        const img = new Image()
        const lgNsx = new Image()
        img.src = image
        lgNsx.src = logoNextsix

        lgNsx.onload = (e) => {
            const canvas = document.getElementById("canvas")
            
            const ctx = canvas.getContext('2d')
            const image = {
                height: 0,
                width: 0
            }

            if (img.width >= img.height) {
                image.width = 1024
                image.height = (img.height / img.width) * 1024

                if ((currentRotation / 90) % 2 === 0) {
                    canvas.width = 1024
                    canvas.height = (img.height / img.width) * 1024
                } else {
                    canvas.width = (img.height / img.width) * 1024
                    canvas.height = 1024
                }
            } else {
                image.height = 1024
                image.width = 1024 / (img.height / img.width)

                if ((currentRotation / 90) % 2 === 0) {
                    canvas.height = 1024
                    canvas.width = 1024 / (img.height / img.width)
                } else {
                    canvas.height = 1024 / (img.height / img.width)
                    canvas.width = 1024
                }
            }

            ctx.translate(canvas.width/2, canvas.height/2)
            ctx.rotate(currentRotation * (Math.PI / 180))
            ctx.drawImage(img, -image.width / 2, -image.height / 2, image.width, image.height)
            
            ctx.font = "500 26px Arial"
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)"
            ctx.textAlign = 'center'

            ctx.rotate(-currentRotation * (Math.PI / 180))
            ctx.drawImage(lgNsx, -80, 30, 160, ((lgNsx.height / lgNsx.width) * 160))
            ctx.fillText ('JASON FORD', 0, 105)
            ctx.fillText ('0102345678', 0, 140)
        }
    }

    const saveImage = () => {
        setLoading(true)
        const img = new Image()
        const lgNsx = new Image()
        img.src = image
        lgNsx.src = logoNextsix

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        }

        lgNsx.onload = (e) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const image = {
                height: 0,
                width: 0
            }

            if (img.width >= img.height) {
                image.width = 1024
                image.height = (img.height / img.width) * 1024

                if ((rotate / 90) % 2 === 0) {
                    canvas.width = 1024
                    canvas.height = (img.height / img.width) * 1024
                } else {
                    canvas.width = (img.height / img.width) * 1024
                    canvas.height = 1024
                }
            } else {
                image.height = 1024
                image.width = 1024 / (img.height / img.width)

                if ((rotate / 90) % 2 === 0) {
                    canvas.height = 1024
                    canvas.width = 1024 / (img.height / img.width)
                } else {
                    canvas.height = 1024 / (img.height / img.width)
                    canvas.width = 1024
                }
            }

            ctx.translate(canvas.width/2, canvas.height/2)
            ctx.rotate(rotate * (Math.PI / 180))
            ctx.drawImage(img, -image.width / 2, -image.height / 2, image.width, image.height)
            
            ctx.font = "500 26px Arial"
            ctx.fillStyle = "rgba(255, 255, 255, 0.65)"
            ctx.textAlign = 'center'

            if (isWatermark) {
                ctx.rotate(-rotate * (Math.PI / 180))
                ctx.drawImage(lgNsx, -80, 30, 160, ((lgNsx.height / lgNsx.width) * 160))
                ctx.fillText ('JASON FORD', 0, 105)
                ctx.fillText ('0102345678', 0, 140)
            }

            canvas.toBlob((blob) => {
                const tempImage = blob

                if (options.maxSizeMB >= tempImage/1024) {
                    alert('Image is too small, cant be compressed')
                    return 0
                }
        
                imageCompression(tempImage, options).then((output) => {
                    // const downloadLink = URL.createObjectURL(output)

                    var reader = new FileReader();
                    reader.readAsDataURL(output); 
                    reader.onloadend = function() {
                        setCompressedImageLink(reader.result)
                    }
                    setCompressedImage(output)
                    setLoading(false)
                })
            })
        }
    }

    return (
        <div className="container mx-auto flex lg:flex-row flex-col-reverse lg:py-14 lg:px-0 p-4 h-screen">
            <div className="lg:w-1/3 lg:h-full h-1/2">
                <div className="lg:w-4/5 h-full flex flex-col">
                    <div className="flex flex-col gap-4">
                        <div className='flex w-full gap-4'>
                            <button disabled={ !image || compressedImage } onClick={ (e) => handleRotate(e, 'left') } className="border w-full flex items-center justify-center rounded-xl px-6 py-4 bg-white disabled:bg-gray-50 shadow hover:scale-[1.02] disabled:hover:scale-100 hover:bg-gray-100 transition">
                                <p className="text-sm text-gray-600">Rotate Left </p>
                            </button>
                            <button disabled={ !image || compressedImage } onClick={ (e) => handleRotate(e, 'right') } className="border w-full flex items-center justify-center rounded-xl px-6 py-4 bg-white disabled:bg-gray-50 shadow hover:scale-[1.02] disabled:hover:scale-100 hover:bg-gray-100 transition">
                                <p className="text-sm text-gray-600">Rotate Right</p>
                            </button>
                        </div>
                        <div>
                            <label>
                                <input onChange={ showWatermark } disabled={ !image || compressedImage } className='peer hidden' type="checkbox" id='showWatermarkInput'/>
                                <div className='border w-full flex items-center justify-center rounded-xl px-6 py-4 bg-white peer-checked:bg-orange-100 peer-disabled:bg-gray-50 peer-disabled:cursor-default cursor-pointer shadow hover:scale-[1.02] peer-disabled:hover:scale-100 hover:bg-gray-100 transition'>
                                    <p className="text-sm text-gray-600">{ isWatermark ? 'Remove' : 'Add' } Watermark</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-auto w-full">
                        <div className={ 'justify-between items-center ' + (!compressedImage ? 'hidden' : 'flex') }>
                            <p className="text-xs text-gray-400">Optimised Image Size</p>
                            <p className="text-lg font-medium text-gray-600">{ convertSize(compressedImage.size) }</p>
                        </div>
                        <div className={ 'justify-between items-center mt-1 '+ (!image ? 'hidden' : 'flex') }>
                            <p className="text-[10px] text-gray-300">Original Image Size</p>
                            <p className={ 'text-sm font-semibold text-gray-300 ' + (compressedImage ? 'line-through' : '') }>{ convertSize(originalImage.size) }</p>
                        </div>

                        <div className="lg:mt-10 mt-4 w-full">
                            <button disabled={ !image || compressedImage } onClick={ saveImage } className="w-full flex justify-center items-center bg-orange-500 p-4 rounded-full text-white disabled:bg-orange-100 disabled:text-gray-400 shadow hover:scale-[1.02] disabled:hover:scale-100 hover:bg-orange-600 transition">
                                <p className="text-sm">Submit</p>
                            </button>
                        </div>
                        <button onClick={ handleReset } className='w-full mt-4 text-gray-400 hover:text-gray-500 transform hover:scale-[1.03] transition text-sm focus-visible:outline-none'>Reset</button>
                    </div>
                </div>
            </div>

            <div className="lg:w-2/3 lg:h-full h-1/2 lg:mb-0 mb-10">
                <div className={ 'w-full relative lg:max-w-[90vh] h-full max-h-[92vw] rounded-xl overflow-hidden lg:p-8 p-4 flex items-center justify-center ' + (image ? '' : 'border') }>
                    <div className='absolute w-full h-full' style={{ backgroundImage: `url(${ image })`, filter: 'blur(1000px)', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}></div>
                    <div className='w-full h-full relative z-10'>
                        <div id='image_container' className='w-full h-full flex items-center justify-center relative'>
                            { 
                                (!image && !compressedImageLink && !loading) &&
                                <div className='absolute w-full h-full top-0 left-0 z-10'>
                                    <div {...getRootProps({className: 'dropzone'})} className='w-full h-full cursor-pointer flex flex-col justify-center items-center border border-dashed rounded-xl'>
                                        <input {...getInputProps()} />
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-20 h-20 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <p className='font-semibold lg:text-5xl mt-10 text-gray-400'>Upload your Image</p>
                                        <p className='text-xs text-gray-400 mt-4'>Supported file types: JPEG, PNG</p>
                                    </div>
                                </div>
                                
                            }

                            { loading && <div className='absolute z-10 w-full h-full bg-black bg-opacity-40 rounded-xl flex items-center justify-center text-center text-2xl text-gray-50 font-semibold'>Loading...</div> }

                            <div id='image_wrapper' style={{ height: imageSize.height, width: imageSize.width }} className='relative z-0'>
                                { (image && !compressedImageLink) &&
                                    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
                                        {   !isWatermark &&
                                            <img
                                                style={{
                                                    transform: `rotate(${ rotate }deg)`,
                                                    maxHeight: maxSize.height,
                                                    maxWidth: maxSize.width
                                                }}
                                                src={ image }
                                                alt='Uploaded'
                                                className='object-contain shadow bg-white'
                                            /> 
                                        }
                                        
                                        { isWatermark && <canvas id="canvas" style={{ maxHeight: container.height, maxWidth: container.width }}></canvas> }
                                    </div>
                                }

                                { compressedImageLink && <img src={ compressedImageLink } alt="" className='object-contain shadow bg-white'/>}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
 
export default Main;