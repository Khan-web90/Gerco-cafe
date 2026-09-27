Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
$client.DefaultRequestHeaders.Referrer = New-Object Uri('https://www.instagram.com/')
$client.DefaultRequestHeaders.Add('sec-ch-ua', '"Chromium";v="124", "Google Chrome";v="124", ";Not A Brand";v="99"')
$client.DefaultRequestHeaders.Add('sec-ch-ua-mobile', '?0')
$client.DefaultRequestHeaders.Add('sec-ch-ua-platform', '"Windows"')
$client.Timeout = [TimeSpan]::FromSeconds(20)

$urls = @(
    'https://scontent.cdninstagram.com/v/t51.82787-19/702277914_18024417182657628_7979776406200664444_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=105&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=h9RG6gxsVjEQ7kNvwHRE6Xj&_nc_oc=Adr6AHGRtMhyY-66gwvXvTiaFXsJKbe-ytShexduji-r5nCZPzzDXSFD9HYmwZrJPH4&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7ba8c&oh=00_AQJXNC_rAcv22uN79wsnnhmxZXdVmrtc60qFIpDr8R9NwA&oe=6ABEA538'
)

foreach ($u in $urls) {
    try {
        Write-Host "Trying: $($u.Substring(0, [Math]::Min(80, $u.Length)))..."
        $bytes = $client.GetByteArrayAsync($u).GetAwaiter().GetResult()
        $dst = 'D:\mockup cafe greco\assets\img\greca-instagram-profile.jpg'
        [System.IO.File]::WriteAllBytes($dst, $bytes)
        Get-Item $dst | Select-Object Name, Length | Format-List
        Write-Host "Success — got $($bytes.Length) bytes from Instagram CDN"
        break
    } catch {
        Write-Host "Failed: $($_.Exception.Message)"
    }
}
