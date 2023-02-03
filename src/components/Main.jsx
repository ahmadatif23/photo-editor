import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { toBlob } from 'html-to-image';
import { useEffect } from 'react'

const Main = () => {
    const imageWrapper = document.getElementById('image_wrapper')
    // const imageContainer = document.getElementById('image_container')

    const [image, setImage] = useState('')
    // const [originalImage, setOriginalImage] = useState('')
    const [compressedImage, setCompressedImage] = useState('')
    const [compressedImageLink, setCompressedImageLink] = useState('')
    const [watermark, setWatermark] = useState('')
    const [rotate, setRotate] = useState(0)
    const [isWatermark, setIsWatermark] = useState(false)
    const [wrapper, setWrapper] = useState({
        height: 0,
        width: 0
    })
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

    useEffect(() => {
        if (image || compressedImageLink) {
            if  ((rotate / 90) % 2 === 0) {
                setWrapper({
                    height: imageWrapper.clientHeight,
                    width: imageWrapper.clientWidth
                })
            } else {
                setWrapper({
                    height: imageWrapper.clientWidth,
                    width: imageWrapper.clientHeight
                })
            }

            toBlob(document.getElementById('image_wrapper'))
                .then(function (blob) {
                    // setOriginalImage(blob)
                });
        }

    }, [image, imageSize, compressedImageLink, rotate, isWatermark, imageWrapper])

    // SET THE CONTAINER SIZE BEFORE ADDING THE IMAGE
    const handleClick = () => {
        const imageContainer = document.getElementById('image_container')
        if (imageContainer) {
            setContainer({
                height: imageContainer.clientHeight,
                width: imageContainer.clientWidth
            })
        }
    }

    const handleImage = (e) => {
        if (e.target.files.length !== 0) {
            const reader = new FileReader()

            reader.onload = () => {
                setImage(reader.result)
                setIsWatermark(false)
                // setOriginalImage(e.target.files[0])
                setCompressedImage('')
                setCompressedImageLink('')
                setRotate(0)

                // SET IMAGE SIZE
                const img = new Image()
                img.src = reader.result
                img.onload = () => {
                    if (img.width >= img.height) {
                        setMaxSize({
                            height: `${ (img.height / img.width) * container.width }px`,
                            width: `${ container.width }px`
                        })
                        setImageSize({
                            height: `${ (img.height / img.width) * container.width }px`,
                            width: `${ container.width }px`
                        })
                        setWrapper({
                            height: `${ (img.height / img.width) * container.width }px`,
                            width: `${ container.width }px`
                        })
                    } else {
                        setMaxSize({
                            height: `${ container.height }px`,
                            width: `${ container.height / (img.height / img.width) }px`
                        })
                        setImageSize({
                            height: `${ container.height }px`,
                            width: `${ container.height / (img.height / img.width) }px`
                        })
                    }
                    
                }
            }

            reader.readAsDataURL(e.target.files[0])
        }
    }

    const handleRotate = (e, direction) => {
        e.preventDefault()

        if (direction === 'right') {
            setRotate(rotate + 90)
        } else if (direction === 'left') {
            setRotate(rotate - 90)
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
                setWrapper({
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
    }

    const handleCompress = (e) => {
        e.preventDefault()

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        }

        toBlob(document.getElementById('image_wrapper'))
            .then(function (blob) {
                const tempImage = blob

                if (options.maxSizeMB >= tempImage/1024) {
                    alert('Image is too small, cant be compressed')
                    return 0
                }
        
                imageCompression(tempImage, options).then((output) => {
                    const downloadLink = URL.createObjectURL(output)

                    var reader = new FileReader();
                    reader.readAsDataURL(blob); 
                    reader.onloadend = function() {
                        // var base64data = reader.result;                
                    }
        
                    setIsWatermark(false)
                    setCompressedImage(output)
                    setCompressedImageLink(downloadLink)
                })
            });
    }

    const showWatermark = () => {
        setIsWatermark(!isWatermark)
    }

    const handleWatermark = (e) => {
        setWatermark(e.currentTarget.value)
    }

    const convertSize = (bytes) => {
        if (!+bytes) return '0 bytes'
    
        const k = 1000
        const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`
    }

    const handleReset = () => {
        if (compressedImage) {
            setCompressedImageLink('')
            setCompressedImage('')
            setIsWatermark(false)
        } else {
            setCompressedImageLink('')
            setCompressedImage('')
            setIsWatermark(false)
            setImage('')
            document.getElementById('uploadImage').value = ''
        }
    }

    return (
        <div className="container mx-auto flex lg:flex-row flex-col-reverse lg:py-14 lg:px-0 p-4 h-screen">
            <div className="lg:w-1/3 lg:h-full h-1/2">
                <div className="lg:w-4/5 h-full flex flex-col">
                    <div className="flex flex-col gap-4">
                        <div className='flex w-full gap-4'>
                            <button disabled={ !image } onClick={ (e) => handleRotate(e, 'left') } className="border w-full flex items-center justify-center rounded-xl px-6 py-4 bg-white disabled:bg-gray-50 shadow">
                                <p className="text-sm text-gray-600">Rotate Left </p>
                            </button>
                            <button disabled={ !image } onClick={ (e) => handleRotate(e, 'right') } className="border w-full flex items-center justify-center rounded-xl px-6 py-4 bg-white disabled:bg-gray-50 shadow">
                                <p className="text-sm text-gray-600">Rotate Right</p>
                            </button>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <button disabled={ !image } onClick={ showWatermark } className="border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 flex-col shadow">
                                <p className="text-sm text-gray-600">Add Watermark</p>
                            </button>
                            {
                                isWatermark &&
                                <div className='border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 shadow'>
                                    <input autoFocus onInput={ handleWatermark } type="text" value={watermark} placeholder='Please type your watermark' className='placeholder:text-xs border-b focus-within:outline-none text-sm text-gray-600 p-0.5 w-full'/>
                                </div>
                            }
                        </div>

                        <button disabled={ !image || compressedImage } onClick={ handleCompress } className="border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 shadow">
                            <p className="text-sm text-gray-600">Compress Image</p>
                        </button>
                    </div>

                    <div className="mt-auto">
                        <div className={ 'justify-between items-center ' + (!compressedImage ? 'hidden' : 'flex') }>
                            <p className="text-xs text-gray-400">Optimised Image Size</p>
                            <p className="text-lg font-medium text-gray-600">{ convertSize(compressedImage.size) }</p>
                        </div>
                        <div className={ 'justify-between items-center mt-1 '+ (!image ? 'hidden' : 'flex') }>
                            <p className="text-[10px] text-gray-300">Original Image Size</p>
                            {/* <p className={ 'text-sm font-semibold text-gray-300 ' + (compressedImage ? 'line-through' : '') }>{ convertSize(originalImage.size) }</p> */}
                        </div>
                        <div className="lg:mt-10 mt-4 w-full">
                            <label htmlFor="uploadImage" className="w-full flex justify-center items-center cursor-pointer bg-orange-500 p-4 rounded-full text-white">Upload Image</label>
                        </div>
                        <button onClick={ handleReset } className='w-full mt-4 text-gray-400 hover:text-gray-500 transform hover:scale-[1.03] transition text-sm focus-visible:outline-none'>Reset</button>
                        {/* <div className="mt-10 w-full">
                            <button onClick={ saveImage } className="w-full bg-slate-800 p-4 rounded-full text-white">Download Image</button>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="lg:w-2/3 lg:h-full h-1/2 lg:mb-0 mb-10">
                <div className={ 'w-full relative lg:max-w-[90vh] h-full max-h-[92vw] rounded-xl overflow-hidden lg:p-8 p-4 flex items-center justify-center ' + (image ? '' : 'border') }>
                    <div className='absolute w-full h-full' style={{ backgroundImage: `url(${ image })`, filter: 'blur(1000px)', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}></div>
                    <div className='w-full h-full relative z-10'>
                        <div id='image_container' className='w-full h-full flex items-center justify-center relative'>
                            { 
                                (!image && !compressedImageLink) &&
                                <div className='absolute w-full h-full top-0 left-0'>
                                    <label className='w-full h-full cursor-pointer flex flex-col justify-center items-center border border-dashed rounded-xl' htmlFor="uploadImage">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-20 h-20 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        <p className='font-semibold lg:text-5xl mt-10 text-gray-400'>Upload your Image</p>
                                        <p className='text-xs text-gray-400 mt-4'>Supported file types: JPEG, PNG</p>
                                    </label>
                                </div>
                            }

                            <div id='image_wrapper' style={{ height: imageSize.height, width: imageSize.width }} className='relative'>
                                { (image && !compressedImageLink) &&
                                    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
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
                                    </div>
                                }

                                { compressedImageLink && <img src={ compressedImageLink } alt="" className='object-contain shadow bg-white'/>}
                                {/* { compressedImageLink && <img style={{ maxHeight: `${ container.height }px`, maxWidth: `${ container.height }px` }} src={ compressedImageLink } alt="" className='object-contain shadow bg-white'/>} */}

                                { (watermark && isWatermark) && <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-10'>
                                    {/* <div style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.70) 0%, rgba(255,255,255,0) 25%)' }} className='flex flex-col h-full w-full items-center justify-center p-2'> */}
                                    <div className='flex flex-col items-center justify-center p-2'>
                                        <div className='text-white font-bold uppercase text-xl opacity-60 tracking-widest'>WONG WEI</div>
                                        <div className='text-white font-bold uppercase text-xl opacity-60 tracking-widest'>0102233445</div>
                                        <div className='text-white font-bold uppercase text-xl opacity-60 tracking-widest'>NEXTSIX</div>
                                    </div>
                                    {/* <div style={{ height: `${ wrapper.height }px`, width: `${ wrapper.width }px`, background: 'linear-gradient(0deg, rgba(0,0,0,0.70) 0%, rgba(255,255,255,0) 25%)' }} className='flex p-2'>
                                        <div className='text-white py-1 px-2 mt-auto'>{ watermark }</div>
                                    </div> */}
                                </div> }
                            </div>
                        </div>
                        
                        <input onClick={ handleClick } onChange={ handleImage } className='hidden' type="file" id='uploadImage'/>
                    </div>

                </div>
            </div>
        </div>
    );
}
 
export default Main;