class SearchEngine {
    constructor() {
        this.searchData = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchForm = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        // 検索データの読み込み
        await this.loadSearchData();
        
        // DOM要素の取得
        this.initializeElements();
        
        // イベントリスナーの設定
        this.bindEvents();
        
        // URLパラメータから検索実行
        this.handleURLSearch();
        
        this.isInitialized = true;
        console.log('Search engine initialized');
    }

    async loadSearchData() {
        try {
            console.log('Loading search data from /index.json...');
            const response = await fetch('/index.json');
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.searchData = await response.json();
            console.log(`Successfully loaded ${this.searchData.length} articles for search`);
            console.log('First article:', this.searchData[0]);
        } catch (error) {
            console.error('Failed to load search data:', error);
            console.error('Error details:', error.message);
            this.searchData = [];
        }
    }

    initializeElements() {
        // ヘッダーの検索フォーム
        const headerForm = document.querySelector('.header-search .search-form');
        const headerInput = document.querySelector('.header-search .search-input');
        
        // 検索ページの要素
        const searchPageForm = document.querySelector('form.search-form');
        const searchPageInput = document.getElementById('search-input');
        const searchResults = document.querySelector('.search-result--list');
        const searchTitle = document.querySelector('.search-result--title');

        console.log('Found elements:');
        console.log('- Header form:', headerForm);
        console.log('- Header input:', headerInput);
        console.log('- Search page form:', searchPageForm);
        console.log('- Search page input:', searchPageInput);
        console.log('- Search results:', searchResults);
        console.log('- Search title:', searchTitle);

        // 優先順位: 検索ページ > ヘッダー
        if (searchPageForm && searchPageInput) {
            this.searchForm = searchPageForm;
            this.searchInput = searchPageInput;
            this.searchResults = searchResults;
            this.searchTitle = searchTitle;
            console.log('Using search page elements');
        } else if (headerForm && headerInput) {
            this.searchForm = headerForm;
            this.searchInput = headerInput;
            console.log('Using header elements');
        } else {
            console.log('No search elements found');
        }
    }

    bindEvents() {
        // ヘッダー検索フォームの処理
        const headerForm = document.querySelector('.header-search .search-form');
        if (headerForm) {
            headerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = document.querySelector('.header-search .search-input').value.trim();
                if (query) {
                    // 検索ページにリダイレクト
                    window.location.href = `/search/?keyword=${encodeURIComponent(query)}`;
                }
            });
        }

        // 検索ページの処理
        if (this.searchForm && this.searchInput && this.searchResults) {
            // フォーム送信イベント
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });

            // リアルタイム検索
            this.searchInput.addEventListener('input', 
                this.debounce(() => this.handleSearch(), 300)
            );
        }
    }

    handleURLSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('keyword');
        
        if (keyword && this.searchInput) {
            this.searchInput.value = keyword;
            this.handleSearch();
        }
    }

    handleSearch() {
        if (!this.searchInput || !this.searchData) return;

        const query = this.searchInput.value.trim().toLowerCase();
        
        if (!query) {
            this.clearResults();
            return;
        }

        const results = this.performSearch(query);
        this.displayResults(results, query);
        
        // URL更新（検索ページの場合のみ）
        if (this.searchResults && window.history.replaceState) {
            const newURL = new URL(window.location);
            newURL.searchParams.set('keyword', query);
            window.history.replaceState(null, '', newURL);
        }
    }

    performSearch(query) {
        const terms = query.split(/\s+/).filter(term => term.length > 0);
        
        return this.searchData
            .map(article => {
                let score = 0;
                const title = article.title.toLowerCase();
                const content = article.content.toLowerCase();
                const tags = (article.tags || []).join(' ').toLowerCase();
                const categories = (article.categories || []).join(' ').toLowerCase();

                terms.forEach(term => {
                    // タイトルマッチ（重要度: 高）
                    if (title.includes(term)) {
                        score += title.indexOf(term) === 0 ? 10 : 5;
                    }
                    
                    // タグマッチ（重要度: 中）
                    if (tags.includes(term)) {
                        score += 3;
                    }
                    
                    // カテゴリーマッチ（重要度: 中）
                    if (categories.includes(term)) {
                        score += 3;
                    }
                    
                    // コンテンツマッチ（重要度: 低）
                    const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
                    score += Math.min(contentMatches * 0.5, 3);
                });

                return { ...article, score };
            })
            .filter(article => article.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // 上位20件
    }

    displayResults(results, query) {
        if (!this.searchResults || !this.searchTitle) return;

        // タイトル更新
        this.searchTitle.textContent = 
            window.searchResultTitleTemplate ? 
            window.searchResultTitleTemplate.replace('%d', results.length) :
            `${results.length}件の検索結果`;

        // 結果表示
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <p>「${this.escapeHtml(query)}」に一致する記事が見つかりませんでした。</p>
                    <ul>
                        <li>キーワードを変更して再度検索してみてください</li>
                        <li>より一般的な単語を使用してみてください</li>
                        <li>スペースで区切って複数のキーワードで検索してみてください</li>
                    </ul>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results
                .map(article => this.createArticleHTML(article, query))
                .join('');
        }
    }

    createArticleHTML(article, query) {
        const date = new Date(article.date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const summary = this.createHighlightedSummary(article.content, query, 150);
        const highlightedTitle = this.highlightText(article.title, query);

        return `
            <article class="search-article">
                <div class="search-article-content">
                    <h3 class="search-article-title">
                        <a href="${article.permalink}">${highlightedTitle}</a>
                    </h3>
                    <div class="search-article-meta">
                        <time datetime="${article.date}">${date}</time>
                        ${article.categories && article.categories.length > 0 ? 
                            `<span class="search-categories">
                                ${article.categories.slice(0, 2).map(cat => 
                                    `<span class="category-tag">${cat}</span>`
                                ).join('')}
                            </span>` : ''
                        }
                    </div>
                    <div class="search-article-summary">${summary}</div>
                    ${article.tags && article.tags.length > 0 ? 
                        `<div class="search-tags">
                            ${article.tags.slice(0, 5).map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('')}
                        </div>` : ''
                    }
                </div>
            </article>
        `;
    }

    createHighlightedSummary(content, query, maxLength) {
        const terms = query.split(/\s+/).filter(term => term.length > 0);
        const lowerContent = content.toLowerCase();
        
        // 最初にマッチした位置を探す
        let bestStart = 0;
        let maxMatches = 0;
        
        for (let i = 0; i < lowerContent.length - maxLength; i += 50) {
            const snippet = lowerContent.substr(i, maxLength);
            let matches = 0;
            terms.forEach(term => {
                matches += (snippet.match(new RegExp(term, 'g')) || []).length;
            });
            
            if (matches > maxMatches) {
                maxMatches = matches;
                bestStart = i;
            }
        }
        
        let summary = content.substr(bestStart, maxLength);
        if (bestStart > 0) summary = '...' + summary;
        if (bestStart + maxLength < content.length) summary += '...';
        
        return this.highlightText(summary, query);
    }

    highlightText(text, query) {
        const terms = query.split(/\s+/).filter(term => term.length > 0);
        let highlightedText = this.escapeHtml(text);
        
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
        });
        
        return highlightedText;
    }

    clearResults() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
        if (this.searchTitle) {
            this.searchTitle.textContent = '';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SearchEngine();
    });
} else {
    new SearchEngine();
}