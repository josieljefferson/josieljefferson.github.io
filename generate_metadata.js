// ARQUIVO: generate_metadata.js
const fs = require('fs');
const path = require('path');

class MetadataGenerator {
    constructor() {
        this.metadata = {
            generated_at: new Date().toISOString(),
            timezone: 'America/Fortaleza',
            files: [],
            statistics: {
                total_files: 0,
                total_size: 0,
                by_type: {}
            }
        };
    }

    scanFiles() {
        try {
            const files = fs.readdirSync('.');
            const supportedExtensions = ['.m3u', '.xml', '.xml.gz', '.json', '.js', '.html', '.txt'];
            
            files.forEach(file => {
                try {
                    if (fs.statSync(file).isFile()) {
                        const ext = path.extname(file).toLowerCase();
                        
                        if (supportedExtensions.includes(ext) || 
                            file === 'metadata.json' || 
                            file === 'generate_metadata.js') {
                            
                            const stats = fs.statSync(file);
                            const fileInfo = {
                                name: file,
                                size: stats.size,
                                size_human: this.formatBytes(stats.size),
                                modified: stats.mtime.toISOString(),
                                modified_local: new Date(stats.mtime).toLocaleString('pt-BR'),
                                extension: ext
                            };
                            
                            this.metadata.files.push(fileInfo);
                            
                            // Estatísticas por tipo
                            if (!this.metadata.statistics.by_type[ext]) {
                                this.metadata.statistics.by_type[ext] = {
                                    count: 0,
                                    total_size: 0
                                };
                            }
                            this.metadata.statistics.by_type[ext].count++;
                            this.metadata.statistics.by_type[ext].total_size += stats.size;
                        }
                    }
                } catch (err) {
                    console.warn(`⚠️ Ignorando arquivo: ${file}`, err.message);
                }
            });

            // Calcular totais
            this.metadata.statistics.total_files = this.metadata.files.length;
            this.metadata.statistics.total_size = this.metadata.files.reduce(
                (sum, file) => sum + file.size, 0
            );
            this.metadata.statistics.total_size_human = this.formatBytes(this.metadata.statistics.total_size);

            console.log('✅ Scan concluído:', {
                files: this.metadata.statistics.total_files,
                size: this.metadata.statistics.total_size_human
            });

        } catch (error) {
            console.error('❌ Erro ao escanear arquivos:', error);
        }
    }

    generateJSON() {
        try {
            fs.writeFileSync(
                'metadata.json', 
                JSON.stringify(this.metadata, null, 2)
            );
            console.log('✅ metadata.json gerado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao gerar JSON:', error);
        }
    }

    generateHTML() {
        try {
            const playlists = this.metadata.files.filter(f => 
                f.extension === '.m3u' || f.extension === '.xml' || f.extension === '.xml.gz'
            );

            const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📻 Playlists IPTV</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        header { 
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white; 
            padding: 2rem; 
            text-align: center;
        }
        header h1 { 
            font-size: 2.5rem; 
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .summary { 
            background: #f8f9fa; 
            padding: 1.5rem; 
            border-bottom: 1px solid #dee2e6;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .stat-card {
            background: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #3498db;
        }
        .file-list { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 1rem;
        }
        .file-list th, .file-list td { 
            padding: 12px 15px; 
            text-align: left; 
            border-bottom: 1px solid #dee2e6;
        }
        .file-list th { 
            background: #34495e; 
            color: white; 
            font-weight: 600;
        }
        .file-list tr:hover { 
            background: #f8f9fa; 
        }
        .file-size { 
            font-family: monospace; 
            color: #666; 
        }
        .playlist-link { 
            color: #3498db; 
            text-decoration: none; 
            font-weight: 500;
        }
        .playlist-link:hover { 
            text-decoration: underline; 
        }
        .last-update {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            color: #666;
            font-style: italic;
        }
        @media (max-width: 768px) {
            .file-list { font-size: 0.9rem; }
            .file-list th, .file-list td { padding: 8px 10px; }
            header h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📻 Playlists IPTV</h1>
            <p>Arquivos gerados automaticamente via GitHub Actions</p>
        </header>
        
        <div class="summary">
            <h2>📊 Resumo</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${playlists.length}</div>
                    <div>Playlists</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.metadata.statistics.total_files}</div>
                    <div>Total de Arquivos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.metadata.statistics.total_size_human}</div>
                    <div>Tamanho Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${new Date().toLocaleDateString('pt-BR')}</div>
                    <div>Atualizado</div>
                </div>
            </div>
        </div>

        <div style="padding: 1.5rem;">
            <h2>📁 Playlists Disponíveis</h2>
            ${playlists.length > 0 ? `
            <table class="file-list">
                <thead>
                    <tr>
                        <th>Arquivo</th>
                        <th>Tamanho</th>
                        <th>Modificado</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    ${playlists.map(file => \`
                    <tr>
                        <td>
                            <a href="\${file.name}" class="playlist-link" download>
                                \${file.name}
                            </a>
                        </td>
                        <td class="file-size">\${file.size_human}</td>
                        <td>\${file.modified_local}</td>
                        <td>\${file.extension.toUpperCase()}</td>
                    </tr>
                    \`).join('')}
                </tbody>
            </table>
            ` : '<p style="text-align: center; padding: 2rem; color: #666;">Nenhuma playlist encontrada.</p>'}
        </div>

        <div class="last-update">
            Última atualização: ${new Date().toLocaleString('pt-BR')} (America/Fortaleza)
        </div>
    </div>
</body>
</html>`;

            fs.writeFileSync('index.html', html);
            console.log('✅ index.html gerado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao gerar HTML:', error);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Execução principal
try {
    const generator = new MetadataGenerator();
    generator.scanFiles();
    generator.generateJSON();
    generator.generateHTML();
    console.log('🎉 Geração de metadados concluída!');
} catch (error) {
    console.error('💥 Erro na geração de metadados:', error);
    process.exit(1);
}
