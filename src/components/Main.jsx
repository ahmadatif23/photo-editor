import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useEffect } from 'react'

const Main = () => {
    const imageWrapper = document.getElementById('image_wrapper')
    const imageContainer = document.getElementById('image_container')

    const [details , setDetails] = useState('')
    const [image, setImage] = useState('')
    const [originalImage, setOriginalImage] = useState('')
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


    useEffect(() => {
        if (image || compressedImageLink) {
            if  ((rotate / 90) % 2 == 0) {
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
        }

        if (imageContainer) {
            setContainer({
                height: imageContainer.clientHeight,
                width: imageContainer.clientWidth
            })
        }
    }, [image, compressedImageLink, rotate, isWatermark])

    const handleImage = (e) => {
        if (e.target.files.length !== 0) {
            const reader = new FileReader()

            reader.onload = () => {
                setImage(reader.result)
                setIsWatermark(false)
                setOriginalImage(e.target.files[0])
                setCompressedImage('')
                setCompressedImageLink('')
                setRotate(0)
            }

            reader.readAsDataURL(e.target.files[0])
        }
    }

    const handleRotate = (e) => {
        e.preventDefault()

        setRotate(rotate + 90)
    }

    const handleCompress = (e) => {
        e.preventDefault()

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true
        }

        if (options.maxSizeMB >= originalImage/1024) {
            alert('Image is too small, cant be compressed')
            return 0
        }

        let output

        imageCompression(originalImage, options).then((x) => {
            output = x
            const downloadLink = URL.createObjectURL(output)

            setIsWatermark(false)
            setCompressedImage(output)
            setCompressedImageLink(downloadLink)
        })
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

    const saveImage = () => {}

    return (
        <div className="container mx-auto flex py-14 h-screen">
            <div className="w-1/3 h-full">
                <div className="w-4/5 h-full flex flex-col">
                    <div className="flex flex-col gap-4">
                        <button disabled={ !image } onClick={ handleRotate } className="border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 shadow">
                            <p className="text-sm text-gray-600">Rotate Image</p>
                        </button>

                        <div className='flex flex-col gap-1'>
                            <button disabled={ !image } onClick={ showWatermark } className="border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 flex-col shadow">
                                <p className="text-sm text-gray-600">Add Watermark</p>
                            </button>
                            {
                                isWatermark &&
                                <div className='border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 shadow'>
                                    <input onInput={ handleWatermark } type="text" value={watermark} placeholder='Please type your watermark' className='placeholder:text-xs border-b focus-within:outline-none text-sm text-gray-600 p-0.5 w-full'/>
                                </div>
                            }
                        </div>

                        <button disabled={ !image || compressedImage } onClick={ handleCompress } className="border rounded-xl px-6 py-4 flex bg-white disabled:bg-gray-50 shadow">
                            <p className="text-sm text-gray-600">Compress Image</p>
                        </button>
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-400">Optimised Image Size</p>
                            <p className="text-lg font-medium text-gray-600">{ convertSize(compressedImage.size) }</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] text-gray-300">Original Image Size</p>
                            <p className={ compressedImage ? 'text-sm line-through font-semibold text-gray-300' : 'text-sm font-semibold text-gray-300' }>{ convertSize(originalImage.size) }</p>
                        </div>
                        <div className="mt-10 w-full">
                            <label htmlFor="uploadImage" className="w-full flex justify-center items-center cursor-pointer bg-slate-800 p-4 rounded-full text-white">Upload Image</label>
                        </div>
                        {/* <div className="mt-10 w-full">
                            <button onClick={ saveImage } className="w-full bg-slate-800 p-4 rounded-full text-white">Download Image</button>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="w-2/3">
                <div className="w-full max-w-[90vh] h-full border rounded-xl overflow-hidden p-10 flex items-center justify-center">
                    <div className='w-full h-full'>
                        <div id='image_container' className='w-full h-full flex items-center justify-center'>
                            { 
                                (!image && !compressedImageLink) &&
                                <label className='w-full h-full cursor-pointer flex flex-col justify-center items-center border border-dashed rounded-xl' htmlFor="uploadImage">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-20 h-20 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>

                                    <p className='font-semibold lg:text-5xl mt-10 text-gray-400'>Upload your Image</p>
                                    <p className='text-xs text-gray-400 mt-4'>Supported file types: JPEG, PNG</p>
                                </label>
                            }

                            <div id='image_wrapper' className='relative'>
                                { (image && !compressedImageLink) && <img style={{ transform: `rotate(${ rotate }deg)`, maxHeight: `${ container.height }px` }} onLoad={ e => setDetails(e.currentTarget) } src={ image } alt="" className='object-contain'/> }
                                { compressedImageLink && <img style={{ transform: `rotate(${ rotate }deg)` }} onLoad={ e => setDetails(e.currentTarget) } src={ compressedImageLink } alt="" className='object-contain'/>}

                                { (watermark && isWatermark) && <div className='absolute bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2'>
                                    <div style={{ height: `${ wrapper.height }px`, width: `${ wrapper.width }px` }} className='flex bg-gradient-to-b from-transparent to-[#000000a6] p-2'>
                                        <div className='text-white py-1 px-2 mt-auto'>{ watermark }</div>
                                    </div>
                                </div> }
                            </div>
                        </div>
                        
                        <input onChange={ handleImage } className='hidden' type="file" id='uploadImage'/>
                    </div>

                </div>
            </div>
        </div>
    );
}
 
export default Main;