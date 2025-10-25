#!/bin/bash

# Script para limpar execuções antigas do GitHub Actions
set -e

echo "🔍 Iniciando verificação de execuções com mais de 1 hora..."
now=$(date -u +%s)
per_page=100
page=1
deleted=0
skipped=0

while true; do
    echo "📄 Buscando página $page de execuções..."
    
    # Usa gh API com tratamento de erro melhorado
    runs=$(gh api \
        -H "Accept: application/vnd.github.v3+json" \
        "/repos/$GITHUB_REPOSITORY/actions/runs?per_page=$per_page&page=$page" \
        --jq '.workflow_runs[] | select(.created_at != null) | {id, created_at, status, head_branch}' || true)
    
    if [ -z "$runs" ]; then
        echo "✅ Nenhuma execução encontrada na página $page. Fim da paginação."
        break
    fi

    # Processa cada execução
    echo "$runs" | jq -c '.' | while read -r run; do
        id=$(echo "$run" | jq -r '.id')
        created_at=$(echo "$run" | jq -r '.created_at')
        branch=$(echo "$run" | jq -r '.head_branch')
        
        # Pula execuções da branch main mais recentes (últimas 2 horas)
        if [[ "$branch" == "main" ]]; then
            if date -u -d "$created_at" >/dev/null 2>&1; then
                run_date=$(date -u -d "$created_at" +%s)
            else
                run_date=$(date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2>/dev/null || echo "0")
            fi
            
            diff_hours=$(( (now - run_date) / 3600 ))
            
            if [ "$diff_hours" -ge 1 ]; then
                echo "🗑️ Deletando execução ID: $id (Branch: $branch, Criada há $diff_hours horas)"
                if gh api \
                    --method DELETE \
                    -H "Accept: application/vnd.github.v3+json" \
                    "/repos/$GITHUB_REPOSITORY/actions/runs/$id" \
                    >/dev/null 2>&1; then
                    deleted=$((deleted + 1))
                else
                    echo "⚠️ Falha ao deletar execução ID: $id"
                fi
            else
                skipped=$((skipped + 1))
                echo "✅ Mantendo execução ID: $id (Apenas $diff_hours horas)"
            fi
        else
            echo "🔁 Pulando execução ID: $id (Branch: $branch)"
            skipped=$((skipped + 1))
        fi
    done
    
    page=$((page + 1))
    
    # Limite de segurança para evitar loop infinito
    if [ $page -gt 10 ]; then
        echo "⚠️ Limite de páginas atingido (10 páginas)"
        break
    fi
done

echo "🏁 Processo concluído."
echo "📊 Estatísticas:"
echo "   - Execuções deletadas: $deleted"
echo "   - Execuções mantidas: $skipped"