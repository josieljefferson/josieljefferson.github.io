// ARQUIVO: generate_metadata.js
const fs = require('fs');
const path = require('path');

class MetadataGenerator {
    constructor() {
        this.metadata = {
            generated_at: new Date().toISOString(),
            timezone: 'America/Fortaleza',
            files: []
        };
    }

    scanFiles() {
        const extensions = ['.m3u', '.xml', '.xml.gz', '.json', '.html'];
        
        try {
            const files = fs.readdirSync('.');
            
            files.forEach(file => {
                if (fs.statSync(file).isFile() && 
                    extensions.some(ext => file.endsWith(ext))) {
                    
                    const stats = fs.statSync(file);
                    this.metadata.files.push({
                        name: file,
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        extension: path.extname(file)
                    });
                }
            });

            this.metadata.total_files = this.metadata.files.length;
            this.metadata.total_size = this.metadata.files.reduce(
                (sum, file) => sum + file.size, 0
            );

        } catch (error) {
            console.error('❌ Erro ao escanear arquivos:', error);
        }
    }

    generateJSON() {
        try {
            fs.writeFileSync(
                'files_metadata.json', 
                JSON.stringify(this.metadata, null, 2)
            );
            console.log('✅ Metadados gerados: files_metadata.json');
        } catch (error) {
            console.error('❌ Erro ao gerar JSON:', error);
        }
    }

    generateHTML() {
        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playlists - Metadados</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .file-list { border-collapse: collapse; width: 100%; }
        .file-list th, .file-list td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .file-list th { background-color: #f2f2f2; }
        .summary { background: #f9f9f9; padding: 15px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>📊 Metadados das Playlists</h1>
    <div class="summary">
        <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Total de arquivos:</strong> ${this.metadata.total_files || 0}</p>
        <p><strong>Tamanho total:</strong> ${this.formatBytes(this.metadata.total_size || 0)}</p>
    </div>
    
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
            ${this.metadata.files.map(file => `
                <tr>
                    <td>${file.name}</td>
                    <td>${this.formatBytes(file.size)}</td>
                    <td>${new Date(file.modified).toLocaleString('pt-BR')}</td>
                    <td>${file.extension}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
        `;

        try {
            fs.writeFileSync('index.html', html);
            console.log('✅ HTML gerado: index.html');
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

// Execução
const generator = new MetadataGenerator();
generator.scanFiles();
generator.generateJSON();
generator.generateHTML();