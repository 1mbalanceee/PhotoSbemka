Add-Type -AssemblyName System.Drawing

# Folder containing images
$imagesDir = "c:\Users\PC\Downloads\FotoSbemka\images"
$files = Get-ChildItem -Path $imagesDir -Filter "*.*" -File

# Setup JPEG quality encoder parameters
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 75) # 75% quality (balanced for web)

$totalOriginal = 0
$totalCompressed = 0

Write-Host "Starting batch image optimization..."

foreach ($file in $files) {
    # Match both .jpg and .JPG extensions
    if ($file.Extension -notmatch "\.jpe?g$") {
        continue
    }

    $filePath = $file.FullName
    $originalSize = $file.Length
    $totalOriginal += $originalSize

    Write-Host "Processing $($file.Name) (size: $([Math]::Round($originalSize / 1MB, 2)) MB)..."

    try {
        # Load the image
        $srcImage = [System.Drawing.Image]::FromFile($filePath)
        
        # Calculate new dimensions (max 1600px width/height)
        $maxWidth = 1600
        $maxHeight = 1600
        $newWidth = $srcImage.Width
        $newHeight = $srcImage.Height

        if ($newWidth -gt $maxWidth -or $newHeight -gt $maxHeight) {
            $ratioX = $maxWidth / $newWidth
            $ratioY = $maxHeight / $newHeight
            $ratio = [Math]::Min($ratioX, $ratioY)

            # Explicitly cast to [int] to avoid double-precision type mismatch in Bitmap constructor
            $newWidth = [int][Math]::Round($newWidth * $ratio)
            $newHeight = [int][Math]::Round($newHeight * $ratio)
        }

        # Create new bitmap with integer dimensions
        $newBitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
        
        # Set high quality rendering options
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        # Draw the original image onto the new canvas
        $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)
        
        # Release resource
        $graphics.Dispose()
        $srcImage.Dispose()

        # Save temporarily
        $tempPath = $filePath + ".tmp"
        $newBitmap.Save($tempPath, $jpegCodec, $encoderParams)
        $newBitmap.Dispose()

        # Replace original file with optimized one
        Remove-Item -Force $filePath
        Rename-Item -Path $tempPath -NewName $file.Name

        $compressedSize = (Get-Item $filePath).Length
        $totalCompressed += $compressedSize

        Write-Host "  -> Optimized! New size: $([Math]::Round($compressedSize / 1KB, 2)) KB (Saved $([Math]::Round((($originalSize - $compressedSize) / $originalSize) * 100))%)"
    } catch {
        Write-Host "  Error processing $($file.Name): $_"
    }
}

$originalMB = [Math]::Round($totalOriginal / 1MB, 2)
$compressedMB = [Math]::Round($totalCompressed / 1MB, 2)
$savedMB = [Math]::Round(($totalOriginal - $totalCompressed) / 1MB, 2)
$savedPercent = [Math]::Round((($totalOriginal - $totalCompressed) / $totalOriginal) * 100, 2)

Write-Host "`nFinished image optimization!"
Write-Host "Total original size: $originalMB MB"
Write-Host "Total optimized size: $compressedMB MB"
Write-Host "Saved: $savedMB MB ($savedPercent%)"
