Add-Type -AssemblyName System.Drawing

$src = 'D:\mockup cafe greco\assets\img\greca-favicon.jpeg'
$pngOut = 'D:\mockup cafe greco\assets\img\greca-favicon.png'
$icoOut = 'D:\mockup cafe greco\favicon.ico'

# Load JPEG exactly as-is (no resizing, no cropping, no transparency)
$img = [System.Drawing.Image]::FromFile((Resolve-Path $src))
Write-Host "Source: $($img.Width)x$($img.Height), format=$($img.RawFormat)"

# Save as PNG (lossless, exact pixel preservation)
$pngEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' }
$pngParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$pngParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]100)
$img.Save($pngOut, $pngEncoder, $pngParams)
Write-Host "Wrote PNG: $pngOut"

# Build a true ICO file at the project root for legacy browsers.
# ICO header + one BMP/PNG image entry (we embed PNG bytes — modern & most browsers accept PNG-in-ICO).
$icoSize = 64
$bmp = New-Object System.Drawing.Bitmap $icoSize, $icoSize
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($img, 0, 0, $icoSize, $icoSize)
$g.Dispose()

$pngStream = New-Object System.IO.MemoryStream
$bmp.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngStream.ToArray()
$pngStream.Dispose()
$bmp.Dispose()

# ICONDIR (6) + ICONDIRENTRY (16) + PNG data
$ico = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ico
$bw.Write([uint16]0)         # reserved
$bw.Write([uint16]1)         # type ICO
$bw.Write([uint16]1)         # count
$bw.Write([byte]$icoSize)    # width
$bw.Write([byte]$icoSize)    # height
$bw.Write([byte]0)           # color count
$bw.Write([byte]0)           # reserved
$bw.Write([uint16]1)         # planes
$bw.Write([uint16]32)        # bpp
$bw.Write([uint32]$pngBytes.Length)
$bw.Write([uint32]22)        # offset to image data
$bw.Write($pngBytes)
$bw.Flush()
[System.IO.File]::WriteAllBytes($icoOut, $ico.ToArray())
$ico.Dispose()
$img.Dispose()
Write-Host "Wrote ICO: $icoOut"

Get-ChildItem 'D:\mockup cafe greco' -Recurse -File | Where-Object { $_.Name -match 'favicon|greca-favicon' } | Select-Object FullName, Length | Format-Table -AutoSize
