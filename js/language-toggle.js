// 簡易的な翻訳機能（UI要素のみ）
document.addEventListener('DOMContentLoaded', function() {
    // 翻訳辞書
    const translations = {
        'ja': {
            'Categories': 'カテゴリー',
            'Tags': 'タグ',
            'Archives': 'アーカイブ',
            'About': 'このサイトについて',
            'Search': '検索',
            'Dark Mode': 'ダークモード',
            'Reading Time': '読了時間',
            'min': '分',
            'Table of Contents': '目次',
            'Back to Top': 'トップへ戻る',
            'Language': '言語'
        },
        'en': {
            'カテゴリー': 'Categories',
            'タグ': 'Tags',
            'アーカイブ': 'Archives',
            'このサイトについて': 'About',
            '検索': 'Search',
            'ダークモード': 'Dark Mode',
            '読了時間': 'Reading Time',
            '分': 'min',
            '目次': 'Table of Contents',
            'トップへ戻る': 'Back to Top',
            '言語': 'Language'
        }
    };
    
    // 現在の言語を取得（localStorage から）
    let currentLang = localStorage.getItem('userLanguage') || 'ja';
    
    // 言語切り替えボタンを作成
    const languageToggle = document.createElement('div');
    languageToggle.className = 'language-toggle';
    languageToggle.innerHTML = `
        <button id="lang-toggle-btn" aria-label="Switch Language">
            ${currentLang === 'ja' ? 'EN' : '日本語'}
        </button>
    `;
    
    // スタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        .language-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        #lang-toggle-btn {
            background: var(--accent-color, #007bff);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        #lang-toggle-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 600px) {
            .language-toggle {
                top: 10px;
                right: 10px;
            }
            
            #lang-toggle-btn {
                padding: 6px 12px;
                font-size: 12px;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(languageToggle);
    
    // Google Translate API の代替として、基本的なUI要素のみ翻訳
    function translateUI(targetLang) {
        const dict = translations[targetLang];
        if (!dict) return;
        
        // テキストノードを走査して翻訳
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while(node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(node => {
            const text = node.nodeValue.trim();
            if (dict[text]) {
                node.nodeValue = node.nodeValue.replace(text, dict[text]);
            }
        });
        
        // ボタンテキストを更新
        document.getElementById('lang-toggle-btn').textContent = 
            targetLang === 'ja' ? 'EN' : '日本語';
    }
    
    // 言語切り替えボタンのクリックイベント
    document.getElementById('lang-toggle-btn').addEventListener('click', function() {
        currentLang = currentLang === 'ja' ? 'en' : 'ja';
        localStorage.setItem('userLanguage', currentLang);
        
        // UI要素を翻訳
        translateUI(currentLang);
        
        // Google Translate の通知（オプション）
        if (currentLang === 'en') {
            showTranslateNotification();
        }
    });
    
    // 初期翻訳を適用
    if (currentLang === 'en') {
        translateUI('en');
    }
    
    // Google Translate を提案する通知
    function showTranslateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        notification.innerHTML = `
            For full translation, you can use Chrome's built-in translate feature.
            <button onclick="this.parentElement.remove()" style="
                margin-left: 10px;
                background: none;
                border: 1px solid white;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                cursor: pointer;
            ">OK</button>
        `;
        
        const keyframes = `
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(100%); }
                to { transform: translateX(-50%) translateY(0); }
            }
        `;
        
        if (!document.querySelector('#translate-notification-style')) {
            const style = document.createElement('style');
            style.id = 'translate-notification-style';
            style.textContent = keyframes;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 5秒後に自動的に削除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
});