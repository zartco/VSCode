$word = New-Object -ComObject Word.Application
$word.Visible = $false
$files = Get-ChildItem -Filter *.txt
foreach ($file in $files) {
    $doc = $word.Documents.Open($file.FullName)
    $pdfPath = $file.FullName -replace '\.txt$', '.pdf'
    # wdFormatPDF = 17
    $doc.SaveAs([ref] $pdfPath, [ref] 17)
    $doc.Close()
    Write-Host "Converted $($file.Name) to PDF"
}
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
