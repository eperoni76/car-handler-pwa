# Script per rimuovere i file sensibili dalla cronologia Git
# Eseguire i comandi uno alla volta

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PULIZIA CRONOLOGIA GIT - GUIDA PASSO PASSO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ATTENZIONE: Questa operazione riscrive la cronologia Git!" -ForegroundColor Red
Write-Host "Tutti i collaboratori dovranno ri-clonare il repository dopo il push." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Vuoi vedere i comandi da eseguire? (si/no)"

if ($confirm -ne "si") {
    Write-Host "Script terminato." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 1: Verifica file nella cronologia" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Esegui questo comando per verificare:" -ForegroundColor White
Write-Host 'git log --all --oneline --source --full-history -- "src/environments/environment.ts"' -ForegroundColor Green
Write-Host ""
Write-Host "Premi INVIO per continuare..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 2: Rimozione dalla cronologia" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copia ed esegui questo comando:" -ForegroundColor White
Write-Host ""
Write-Host 'git filter-branch --force --index-filter "git rm --cached --ignore-unmatch src/environments/environment.ts src/environments/environment.prod.ts" --prune-empty --tag-name-filter cat -- --all' -ForegroundColor Green
Write-Host ""
Write-Host "Premi INVIO dopo averlo eseguito..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 3: Pulizia riferimenti" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Esegui questi comandi per pulire:" -ForegroundColor White
Write-Host ""
Write-Host "git for-each-ref --format=`"delete %(refname)`" refs/original | git update-ref --stdin" -ForegroundColor Green
Write-Host "git reflog expire --expire=now --all" -ForegroundColor Green
Write-Host "git gc --prune=now --aggressive" -ForegroundColor Green
Write-Host ""
Write-Host "Premi INVIO dopo averli eseguiti..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 4: Verifica finale" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifica che i file non siano più presenti:" -ForegroundColor White
Write-Host ""
Write-Host 'git log --all --full-history -- "src/environments/"' -ForegroundColor Green
Write-Host ""
Write-Host "Se non mostra risultati, la pulizia è riuscita!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Premi INVIO per vedere i passi successivi..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROSSIMI PASSI IMPORTANTI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RIGENERA LA CHIAVE API SU FIREBASE:" -ForegroundColor Red
Write-Host "   https://console.cloud.google.com/apis/credentials?project=car-handler-pwa" -ForegroundColor White
Write-Host ""
Write-Host "2. AGGIORNA IL FILE .env CON LA NUOVA CHIAVE" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. RIGENERA GLI ENVIRONMENT:" -ForegroundColor Yellow
Write-Host "   node generate-env.js" -ForegroundColor Green
Write-Host ""
Write-Host "4. AGGIUNGI LE MODIFICHE:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Green
Write-Host "   git commit -m `"security: removed sensitive files from history`"" -ForegroundColor Green
Write-Host ""
Write-Host "5. FORZA IL PUSH (ATTENZIONE!):" -ForegroundColor Red
Write-Host "   git push origin --force --all" -ForegroundColor Green
Write-Host "   git push origin --force --tags" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script completato!" -ForegroundColor Green
Write-Host "Consulta CLEANUP-GUIDE.md per maggiori dettagli" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
