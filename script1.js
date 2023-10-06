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
    const labels = ['bui xuan thang', 'Felipe', "Messi", 'ronaldo']
    const faceDescriptors = []
    for (const label of labels) {
        const descriptors = [] // Tạo một mảng descriptors cho mỗi nhãn (label)
        for (let k = 1; k <= 3; k++) {
            const image = await faceapi.fetchImage(`/labels/${label}/${k}.png`)
            const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
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
let   faceMatcher
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
            .withAgeAndGender().withFaceDescriptors()
        console.log(detection[0])
        const resizeDetection = faceapi.resizeResults(detection, displaySize)
        console.log(resizeDetection)
        canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height)
        const drawOptions = {
            label: 'Hello I am a box!',
            lineWidth: 2
        }
        for (var i = 0; i < resizeDetection.length; i++) {
            var thisRect = resizeDetection[i].detection.box;
            var thisDrawBox = new faceapi.draw.DrawBox(thisRect,{
                label : faceMatcher.findBestMatch(resizeDetection[i].descriptor)
            })
            console.log(faceMatcher)
            faceapi.draw.drawFaceLandmarks(canvas, resizeDetection[i])
            thisDrawBox.draw(canvas);

        }
    }, 300)

})
loadModel().then(getWebCam)
