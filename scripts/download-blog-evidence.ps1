$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$EvidenceRoot = Join-Path $Root 'public\blog-evidence'
$Headers = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
  'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8'
}

function New-SafeName([string]$Value) {
  $safe = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $safe = $safe.Trim('-')
  if ($safe.Length -gt 80) { $safe = $safe.Substring(0, 80).Trim('-') }
  if ([string]::IsNullOrWhiteSpace($safe)) { return 'source' }
  return $safe
}

function Add-Source([System.Collections.ArrayList]$Items, [string]$Slug, [string]$Label, [string]$Url, [string]$Extension = '') {
  [void]$Items.Add([pscustomobject]@{
    Slug = $Slug
    Label = $Label
    Url = $Url
    Extension = $Extension
  })
}

$Items = [System.Collections.ArrayList]::new()

Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 01' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2001%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 02' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2002%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 03' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2003%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 04' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2004%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 05' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2005%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 06' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2006%20of%2006%20./at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Vault Zodiac Killer Part 07 Final' 'https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2007%20%28Final%29/at_download/file' '.pdf'
Add-Source $Items 'zodiac' 'FBI Zodiac public story' 'https://archives.fbi.gov/archives/news/stories/2007/march/zodiac_030207' '.html'

Add-Source $Items 'jack-the-ripper' 'FBI Vault Jack the Ripper Part 01 Final' 'https://vault.fbi.gov/jack-the-ripper/Jack%20the%20Ripper%20Part%2001%20%28Final%29/at_download/file' '.pdf'
Add-Source $Items 'jack-the-ripper' 'National Archives Ripper letter' 'https://www.nationalarchives.gov.uk/explore-the-collection/stories/hoax-letter-signed-by-jack-the-ripper/' '.html'
Add-Source $Items 'jack-the-ripper' 'National Archives image record HO 144 221' 'https://images.nationalarchives.gov.uk/asset/41074/' '.html'

Add-Source $Items 'cleveland-torso' 'Cleveland Police Museum Torso Murders' 'https://www.clevelandpolicemuseum.org/collections/torso-murders/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Police Museum Plaster Masks' 'https://www.clevelandpolicemuseum.org/torso-murders/criminal-identification-plaster-masks/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Police Museum Identifying Victims' 'https://www.clevelandpolicemuseum.org/torso-murders/torso-murders-identifying-the-victims/' '.html'
Add-Source $Items 'cleveland-torso' 'Encyclopedia of Cleveland History Torso Murders' 'https://case.edu/ech/articles/t/torso-murders' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Crime Scene Torso Murders' 'https://clemem-test.ulib.csuohio.edu/crime/index.html?tab=3' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Torso Murder Evidence' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/30/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Torso Murder Tub' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/52/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Shantyville Kingsbury Run' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/54/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Reconstructed Head' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/56/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Kingsbury Run Fire' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/59/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Victim Search' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/61/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Victim Remains' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/67/' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Torso Murders Briefing' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/69/rec/8' '.html'
Add-Source $Items 'cleveland-torso' 'Cleveland Memory Inspecting Remains' 'https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/72/' '.html'

Add-Source $Items 'servant-girl-annihilator' 'Travis County Archives Mysteries' 'https://traviscountyhistory.org/online-exhibits/mysteries-of-travis-county/' '.html'
Add-Source $Items 'servant-girl-annihilator' 'Servant Girl Murders archive' 'https://www.servantgirlmurders.com/' '.html'
Add-Source $Items 'servant-girl-annihilator' 'PBS History Detectives Servant Girl Murders' 'https://www.pbs.org/opb/historydetectives/investigation/texas-servant-girl-murders/index.html' '.html'

Add-Source $Items 'freeway-phantom' 'MPDC Freeway Phantom reward flier' 'https://mpdc.dc.gov/sites/default/files/dc/sites/mpdc/publication/attachments/freewayphantom_0.pdf' '.pdf'
Add-Source $Items 'freeway-phantom' 'MPDC Freeway Phantom homicide victims page' 'https://mpdc.dc.gov/publication/%E2%80%9Cfreeway-phantom%E2%80%9D-homicide-victims' '.html'
Add-Source $Items 'freeway-phantom' 'MPDC Freeway Phantom FOIA Records 1' 'https://mpdc.dc.gov/sites/default/files/dc/sites/mpdc/publication/attachments/Freeway%20Phantom%20FOIA%20RecordsUPDATED_1-62.pdf' '.pdf'
Add-Source $Items 'freeway-phantom' 'MPDC Freeway Phantom FOIA Records 2' 'https://mpdc.dc.gov/sites/default/files/dc/sites/mpdc/publication/attachments/Freeway%20Phantom%20FOIA%20RecordsUPDATED_63_116.pdf' '.pdf'
Add-Source $Items 'freeway-phantom' 'FBI Vault Freeway Phantom Part 01 Final' 'https://vault.fbi.gov/freeway-phantom/Freeway%20Phantom%20Part%2001%20%28Final%29/at_download/file' '.pdf'
Add-Source $Items 'freeway-phantom' 'MPDC Freeway Phantom FOIA Records landing page' 'https://mpdc.dc.gov/publication/freeway-phantom-foia-records' '.html'
Add-Source $Items 'freeway-phantom' 'MPDC Major Case Unsolved Homicides 1971 1990' 'https://mpdc.dc.gov/page/major-caseunsolved-homicides-1971-1990' '.html'
Add-Source $Items 'freeway-phantom' 'Freeway Phantom investigative archive' 'https://freeway-phantom.com/' '.html'
Add-Source $Items 'freeway-phantom' 'Freeway Phantom victim map' 'https://freeway-phantom.com/victim-map/' '.html'
Add-Source $Items 'freeway-phantom' 'Maryland State Police Diane Williams cold case' 'https://mdsp.maryland.gov/community-services/cold-cases/williams-diane?CCID=55' '.html'
Add-Source $Items 'freeway-phantom' 'Washington Post Freeway Phantom archive' 'https://www.washingtonpost.com/archive/politics/2006/06/26/freeway-phantom-slayings-haunt-police-families-span-classbankheadsix-young-dc-females-vanished-in-the-70sspan/08789f47-3d0e-4a88-ad24-cdbcc493698f/' '.html'

Add-Source $Items 'the-doodler' 'SFPD Doodler reward flier composite sketch' 'https://www.sanfranciscopolice.org/sites/default/files/2019-04/19-014%20Doodler%20Reward%20Flier.pdf' '.pdf'
Add-Source $Items 'the-doodler' 'SFPD Doodler 2023 crime bulletin' 'https://www.sanfranciscopolice.org/sites/default/files/2023-01/SFPDDoodlerCrimeBulletin-Jan2023-20230124.pdf' '.pdf'
Add-Source $Items 'the-doodler' 'SFPD Doodler cold case update' 'https://www.sanfranciscopolice.org/news/sfpd-provides-update-doodler-cold-case-investigation-19-014' '.html'
Add-Source $Items 'the-doodler' 'SFPD Doodler 2023 cold case update' 'https://www.sanfranciscopolice.org/news/doodler-cold-case-investigation-update-23-009' '.html'
Add-Source $Items 'the-doodler' 'CBS San Francisco Doodler sketch' 'https://www.cbsnews.com/sanfrancisco/news/doodler-serial-killer-suspect-sketch-age-progression-san-francisco-cold-case/' '.html'
Add-Source $Items 'the-doodler' 'San Francisco Chronicle Doodler chapter one' 'https://www.sfchronicle.com/projects/doodler-true-crime-podcast/chapter-one/' '.html'
Add-Source $Items 'the-doodler' 'San Francisco Chronicle Doodler chapter two' 'https://www.sfchronicle.com/projects/doodler-true-crime-podcast/chapter-two/' '.html'
Add-Source $Items 'the-doodler' 'ABC News Doodler possible sixth victim' 'https://abcnews.com/US/police-link-6th-victim-1970s-serial-killer-reward/story?id=82520045' '.html'
Add-Source $Items 'the-doodler' 'NBC Bay Area Doodler 250k reward' 'https://www.nbcbayarea.com/news/local/police-offer-reward-info-doodler-murders/4097457/' '.html'
Add-Source $Items 'the-doodler' 'San Francisco Standard Doodler East Bay lead' 'https://sfstandard.com/2026/06/16/the-doodler-sf-serial-killer-cold-case-east-bay/' '.html'
Add-Source $Items 'the-doodler' 'SF News SFPD Doodler reward 2026' 'https://www.thesfnews.com/sfpd-offers-reward-for-information-on-the-doodler-murders/102056' '.html'

Add-Source $Items 'texarkana-phantom' 'FBI Vault Texarkana Phantom Part 01' 'https://vault.fbi.gov/texarkana-phantom-moonlight-murders/Texarkana%20Phantom%20Moonlight%20Murders%20Part%2001/at_download/file' '.pdf'
Add-Source $Items 'texarkana-phantom' 'FBI Vault Texarkana Phantom Part 02 Final' 'https://vault.fbi.gov/texarkana-phantom-moonlight-murders/Texarkana%20Phantom%20Moonlight%20Murders%20Part%2002%20%28Final%29/at_download/file' '.pdf'

Add-Source $Items 'west-mesa' 'Albuquerque West Mesa homicide investigation' 'https://www.cabq.gov/police/contact-the-police/west-mesa-homicide-investigation' '.html'
Add-Source $Items 'west-mesa' 'APD ArcGIS West Mesa Bone Collector' 'https://storymaps.arcgis.com/stories/614b3008f52142fea25c880014852287' '.html'

Add-Source $Items 'bible-john' 'Solve the Case Bible John' 'https://www.solvethecase.org/case/1969-2/bible-john' '.html'
Add-Source $Items 'monster-of-florence' 'Corriere Fiorentino Monster of Florence chronology' 'https://corrierefiorentino.corriere.it/cronaca/cards/mostro-di-firenze-la-storia-i-delitti-e-i-misteri-irrisolti-tutto-quello-che-sappiamo-fino-ad-oggi/la-cronologia-dei-delitti.shtml' '.html'
Add-Source $Items 'eastbound-strangler' 'A and E Eastbound Strangler overview' 'https://www.aetv.com/articles/who-is-eastbound-strangler' '.html'
Add-Source $Items 'eastbound-strangler' 'MuckRock Eastbound Strangler OPRA request' 'https://www.muckrock.com/foi/atlantic-county-6758/request-re-eastbound-strangler-atlantic-county-prosecutors-office-149801/' '.html'
Add-Source $Items 'jeff-davis-8' 'KATC Jennings 8 coverage' 'https://www.katc.com/news/jeff-davis-parish/investigators-hope-continued-coverage-of-jennings-8-can-lead-to-solving-murders' '.html'
Add-Source $Items 'chicago-strangler' 'City of Chicago murders data portal' 'https://data.cityofchicago.org/Public-Safety/Murders-since-2001/ndfz-ruip/about' '.html'
Add-Source $Items 'chillicothe-six' 'Chillicothe Police missing persons' 'https://chillicothepolice.com/?page_id=5022' '.html'
Add-Source $Items 'chillicothe-six' 'Charley Project Charlotte Trego' 'https://charleyproject.org/case/charlotte-eliza-trego' '.html'
Add-Source $Items 'chillicothe-six' 'Uncovered Charlotte Trego NamUs summary' 'https://uncovered.com/cases/charlotte-trego' '.html'
Add-Source $Items 'chillicothe-six' 'Scioto Post missing Chillicothe women' 'https://www.sciotopost.com/pnjstoryfile_name-532/' '.html'
Add-Source $Items 'gilgo-beach-unresolved' 'Suffolk County DA Gilgo case' 'https://www.suffolkcountyda.org/gilgo/' '.html'
Add-Source $Items 'gilgo-beach-unresolved' 'Gilgo Case public archive' 'https://www.gilgocase.com/' '.html'

New-Item -ItemType Directory -Path $EvidenceRoot -Force | Out-Null

foreach ($item in $Items) {
  $caseDir = Join-Path $EvidenceRoot $item.Slug
  New-Item -ItemType Directory -Path $caseDir -Force | Out-Null

  $fileName = "$(New-SafeName $item.Label)$($item.Extension)"
  $target = Join-Path $caseDir $fileName
  $tempTarget = "$target.download"

  Write-Host "Downloading $($item.Label)"
  try {
    Invoke-WebRequest -Uri $item.Url -OutFile $tempTarget -UseBasicParsing -MaximumRedirection 8 -Headers $Headers -TimeoutSec 25
    if ($item.Extension -eq '.pdf') {
      $headerBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $tempTarget))
      $header = [System.Text.Encoding]::ASCII.GetString($headerBytes, 0, [Math]::Min(4, $headerBytes.Length))
      if ($header -ne '%PDF') {
        throw "Downloaded file is not a PDF"
      }
    }
    Move-Item -LiteralPath $tempTarget -Destination $target -Force
  } catch {
    Write-Warning "Failed: $($item.Url) -- $($_.Exception.Message)"
    if (Test-Path -LiteralPath $tempTarget) {
      Remove-Item -LiteralPath $tempTarget -Force
    }
  }
}
