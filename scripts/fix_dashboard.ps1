$content = Get-Content 'x:\scholarship-portal\src\pages\DashboardPage.tsx' -Encoding UTF8
$before = $content[0..307]
$after = $content[584..($content.Length-1)]
$result = $before + $after
$result | Set-Content 'x:\scholarship-portal\src\pages\DashboardPage.tsx' -Encoding UTF8
