
const video = document.querySelector("#video")


async function loadModel() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceapi.nets.faceExpressionNet.loadFromUri('/models')
    await faceapi.nets.ageGenderNet.loadFromUri("/models")
    console.log("load model xong")
}


async function LoadTrainingData() {
    const labels = ['bui xuan thang', "Messi", 'ronaldo']
    const faceDescriptors = []
    for (const label of labels) {
        const descriptors = []
        for (let k = 1; k <= 3; k++) {
            const image = await faceapi.fetchImage(`/labels/${label}/${k}.png`)
            const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
            descriptors.push(detection[0].descriptor) 
        }
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
const labels = ['bui xuan thang', "Messi", 'ronaldo']
video.addEventListener("playing", async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    }
    const training = await LoadTrainingData()
    faceMatcher = new faceapi.FaceMatcher(training)
    setInterval(async () => {
        const detection = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceExpressions()
           .withFaceDescriptors()
        const resizeDetection = faceapi.resizeResults(detection, displaySize)
        console.log(resizeDetection)
        canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height)
        for (var i = 0; i < resizeDetection.length; i++) {
            var thisRect = resizeDetection[i].detection.box;
            var thisDrawBox = new faceapi.draw.DrawBox(thisRect,{
                label : faceMatcher.findBestMatch(resizeDetection[i].descriptor).label  
                +" / "+ faceMatcher.findBestMatch(resizeDetection[i].descriptor).distance.toFixed(2) 
            })
            thisDrawBox.draw(canvas)
            faceapi.draw.drawFaceLandmarks(canvas, resizeDetection)
        }
    }, 100)
})


loadModel().then(getWebCam)
