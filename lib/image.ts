export function compressImage(file: File, maxDimension = 1100, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error("Could not process image."))
        return
      }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read that image. Try another photo."))
    }
    img.src = url
  })
}
