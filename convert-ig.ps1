Add-Type -AssemblyName System.Drawing

$src = 'D:\mockup cafe greco\assets\img\greca-instagram-profile.jpg'
$pngOut = 'D:\mockup cafe greco\assets\img\greca-instagram-profile.png'

if (-not (Test-Path $src)) { Write-Host "Source missing"; exit 1 }

# Load JPEG exactly as-is (no resizing, no cropping, no transparency)
$img = [System.Drawing.Image]::FromFile((Resolve-Path $src))
Write-Host "Source: $($img.Width)x$($img.Height)"

# Save as PNG (lossless, exact pixel preservation)
$pngEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' }
$pngParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$pngParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]100)
$img.Save($pngOut, $pngEncoder, $pngParams)
$img.Dispose()
Write-Host "PNG written: $pngOut"

# Also rebuild favicon.ico from this source
$icoOut = 'D:\mockup cafe greco\favicon.ico'
$img2 = [System.Drawing.Image]::FromFile((Resolve-Path $src))
$icoSize = 64
$bmp = New-Object System.Drawing.Bitmap $icoSize, $icoSize
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img2, 0, 0, $icoSize, $icoSize)
$g.Dispose()
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()
$bmp.Dispose()
$img2.Dispose()

$ico = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ico
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]1)
$bw.Write([byte]$icoSize); $bw.Write([byte]$icoSize)
$bw.Write([byte]0); $bw.Write([byte]0)
$bw.Write([uint16]1); $bw.Write([uint16]32)
$bw.Write([uint32]$pngBytes.Length); $bw.Write([uint32]22)
$bw.Write($pngBytes); $bw.Flush()
[System.IO.File]::WriteAllBytes($icoOut, $ico.ToArray())
$ico.Dispose()
Write-Host "favicon.ico rebuilt: $icoOut"

Get-ChildItem 'D:\mockup cafe greco\assets\img' -File | Select-Object Name, Length | Format-Table -AutoSize
