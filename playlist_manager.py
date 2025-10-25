# ARQUIVO: playlist_manager.py
import requests
import os
import time
import hashlib
from datetime import datetime
import json

class PlaylistManager:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.cache_dir = ".playlist_cache"
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def get_cache_key(self, url):
        return hashlib.md5(url.encode()).hexdigest()
    
    def download_playlist(self, url, filename, max_retries=3):
        """Baixa uma playlist com retry e cache"""
        cache_key = self.get_cache_key(url)
        cache_file = os.path.join(self.cache_dir, cache_key)
        
        # Verificar cache (1 hora)
        if os.path.exists(cache_file):
            mod_time = os.path.getmtime(cache_file)
            if time.time() - mod_time < 3600:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                self._save_playlist(content, filename)
                return True
        
        # Download com retry
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Salvar no cache
                with open(cache_file, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                
                self._save_playlist(response.text, filename)
                return True
                
            except Exception as e:
                print(f"Tentativa {attempt + 1} falhou para {url}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Backoff exponencial
        
        return False
    
    def _save_playlist(self, content, filename):
        """Salva o conteúdo da playlist com timestamp"""
        timestamp = datetime.now().strftime("# Atualizado em %d/%m/%Y - %H:%M:%S BRT\n")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(timestamp)
            f.write(content)
        
        print(f"✅ Playlist salva: {filename}")

def main():
    manager = PlaylistManager()
    
    # Lista de playlists para baixar
    playlists = [
        # Adicione suas URLs aqui
        # ("URL", "nome_arquivo.m3u")
    ]
    
    success_count = 0
    for url, filename in playlists:
        if manager.download_playlist(url, filename):
            success_count += 1
    
    print(f"🎯 Download concluído: {success_count}/{len(playlists)} playlists baixadas com sucesso")

if __name__ == "__main__":
    main()