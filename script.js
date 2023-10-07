const videoCamera = document.querySelector("#video")

async function loadModels() {
  Promise.all([
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    await faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  ])
    .then(() => {
      console.log("load thanh cong cac models")
    })
}

function getWebCam() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
    .then(function (data) {
      videoCamera.srcObject = data
    })
    .catch((err) => {
      console.log("loi", err)
    })
}
async function trainingData() {
  const labels = ['bui xuan thang', 'doan khanh', 'ho chi khanh', 'Messi', 'ronaldo']
  const labeledFaceDescriptors = []
  for (const item of labels) {
    const faceDescriptors = []
    for (let k = 1; k <= 3; k++) {
      const image = await faceapi.fetchImage(`labels/${item}/${k}.png`)
      const detection = await faceapi.detectSingleFace(image)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor()
      if (detection) { // Check if a face was detected in the image
        faceDescriptors.push(detection.descriptor)
      }
    }
      const labeledFaceDescriptor = new faceapi.LabeledFaceDescriptors(item, faceDescriptors)
      labeledFaceDescriptors.push(labeledFaceDescriptor)
      console.log(`training xong data ${item}`) 
  }
  return labeledFaceDescriptors
}

getWebCam()
loadModels()
let datatraining 
videoCamera.addEventListener("playing", async () => {
  datatraining = await trainingData()
  const canvas = faceapi.createCanvasFromMedia(videoCamera)
  const faceMatcher = new faceapi.FaceMatcher(datatraining) // Fix this line

  document.body.append(canvas)
  const displaySize = {
    width: videoCamera.width,
    height: videoCamera.height
  }
  setInterval(async () => {
    const detection = await faceapi.detectSingleFace(videoCamera).withFaceLandmarks().withFaceExpressions().withFaceDescriptor()
      const resizeDetection = faceapi.resizeResults(detection, displaySize)
      canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height)
      console.log(resizeDetection)
      const drawBox = new faceapi.draw.DrawBox(resizeDetection.detection.box, faceMatcher.findBestMatch(resizeDetection.descriptor) )
      drawBox.draw(canvas)
      faceapi.draw.drawFaceLandmarks(canvas, resizeDetection)

      /**
       *     for(let k =0;k<resizeDetection.length;k++){
        const drawBox = new faceapi.draw.DrawBox(resizeDetection[k].detection.box, faceMatcher.findBestMatch(resizeDetection[k].descriptor) )
        drawBox.draw(canvas)
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetection[k])
        faceapi.draw.drawDetections(canvas, resizeDetection[k])
      }
       */
      
  }, 2000)

})