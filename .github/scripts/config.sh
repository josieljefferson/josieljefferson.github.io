#!/bin/bash

# Configurações centralizadas para os workflows

# Fusos horários
export TZ_BRT="America/Fortaleza"
export TZ_UTC="UTC"

# Horários de execução (formato cron)
export SCHEDULE_PLAYLISTS="0 3 * * *"      # 00:00 BRT
export SCHEDULE_CLEANUP_FILES="0 15 * * *" # 12:00 BRT  
export SCHEDULE_CLEANUP_RUNS="1 */8 * * *" # A cada 8 horas
export SCHEDULE_DEPLOY="25 10 * * *"       # 07:25 BRT

# Configurações de limpeza
export DELETE_RUNS_OLDER_THAN_HOURS=1
export KEEP_LAST_RUNS=5

# Arquivos protegidos (nunca deletar)
PROTECTED_FILES=(
    "README.md" "deploy.py" "playlists.py" "playlists2.py" 
    "Playlist.py" "downloads_files.py" "generate_metadata.js"
    "files_metadata.json" ".gitignore" ".github" "index.html"
    "script.js" "style.css" "config.sh" "cleanup_runs.sh"
)

# Padrões de arquivos para limpeza
CLEANUP_PATTERNS=(
    "coroa_vidaloka-*.mp4"
    "majormarra-*.mp4"
    "marinahelenabr-*.jpg"
    "*-*-*.jpg" "*-*-*.mp4" "*-*-*.png"
    "temp_*" "*.tmp" "*.log"
)
