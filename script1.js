/**
 * 1 / viết hàm load các models trong thư viện
 * 2 / viết hàm xin quyền lấy hình ảnh từ webcam
 * 3 / viết hàm training khuôn mặt
 * 4 / bắt sự kiện playing của thẻ video
 */

const video = document.querySelector("#video")
async function loadModel() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceapi.nets.faceExpressionNet.loadFromUri('/models')
    await faceapi.nets.ageGenderNet.loadFromUri("/models")
    console.log("load model oke")
    const faceMatcher = LoadTrainingData()
    console.log({ faceMatcher })

}
async function LoadTrainingData() {
    const labels = ['bui xuan thang',"doan khanh","ho chi khanh", "Messi", 'ronaldo']
    const faceDescriptors = []
    for (const label of labels) {
        const descriptors = [] // Tạo một mảng descriptors cho mỗi nhãn (label)
        for (let k = 1; k <= 3; k++) {
            const image = await faceapi.fetchImage(`/labels/${label}/${k}.png`)
            const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            console.log(detection)
            /**
             * vì là detectAllFaces nên trả về mảng detection sẽ trả về [0] , 1 mảng chỉ có 1 phần tử , vì trong hình chỉ có 1 khuôn mặt 
             */
            descriptors.push(detection[0].descriptor) // Sử dụng mô tả đầu tiên trong mảng detection
        }
        // Tạo LabeledFaceDescriptors cho mỗi nhãn (label)
        faceDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptors))
        console.log(`training xong du lieu cua ${label}`)
    }
    return faceDescriptors
    
}
function getWebCam() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then((stream) => {
            video.srcObject = stream
        })
        .catch((err) => {
            alert("loi" + err)
        })
}
let faceMatcher
video.addEventListener("playing", async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    }
    const training = await LoadTrainingData()
    faceMatcher = new faceapi.FaceMatcher(training)
    console.log(training)
    console.log(faceMatcher)
    setInterval(async () => {
        const detection = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceExpressions()
           .withFaceDescriptors()
        console.log(detection[0])
        const resizeDetection = faceapi.resizeResults(detection, displaySize)
        console.log(resizeDetection)
        canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height)
      
        for (var i = 0; i < resizeDetection.length; i++) {
            var thisRect = resizeDetection[i].detection.box;
            var thisDrawBox = new faceapi.draw.DrawBox(thisRect,{
                label : faceMatcher.findBestMatch(resizeDetection[i].descriptor).label  +" / "+ Math.round( faceMatcher.findBestMatch(resizeDetection[i].descriptor).distance,3)    
            })
            console.log(faceMatcher)
            thisDrawBox.draw(canvas)
 
        }
    }, 1000)
})
loadModel().then(getWebCam)
