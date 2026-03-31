$files_html = @('AttendanceHistory.html', 'HostelInformation.html', 'MessMenu.html', 'SemesterResults.html', 'StudentComplaints.html', 'StudentDashboard.html', 'WeeklyTimetable.html')
$files_png = @('AttendanceHistory.png', 'HostelInformation.png', 'MessMenu.png', 'SemesterResults.png', 'StudentComplaints.png', 'StudentDashboard.png', 'WeeklyTimetable.png')
$files_js = @('dl.js', 'download_all.js', 'download_stitch.js', 'download.js')

New-Item -ItemType Directory -Force -Path 'frontend\stitch_assets\html' | Out-Null
New-Item -ItemType Directory -Force -Path 'frontend\stitch_assets\images' | Out-Null
New-Item -ItemType Directory -Force -Path 'frontend\stitch_assets\scripts' | Out-Null
New-Item -ItemType Directory -Force -Path 'frontend\stitch_assets\misc' | Out-Null

foreach ($file in $files_html) { if (Test-Path $file) { Move-Item -Path $file -Destination 'frontend\stitch_assets\html' -Force } }
foreach ($file in $files_png) { if (Test-Path $file) { Move-Item -Path $file -Destination 'frontend\stitch_assets\images' -Force } }
foreach ($file in $files_js) { if (Test-Path $file) { Move-Item -Path $file -Destination 'frontend\stitch_assets\scripts' -Force } }
if (Test-Path 'test') { Move-Item -Path 'test' -Destination 'frontend\stitch_assets\misc' -Force }
