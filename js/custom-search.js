// カスタム検索機能
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.querySelector('.search-form');
    const searchResult = document.querySelector('.search-result');
    const searchResultTitle = document.querySelector('.search-result--title');
    const searchResultList = document.querySelector('.search-result--list');
    
    if (!searchInput || !searchForm) {
        console.error('検索要素が見つかりません');
        return;
    }
    
    // 検索データを保持
    let searchData = [];
    
    // JSONデータを取得
    const jsonUrl = searchForm.getAttribute('data-json');
    if (jsonUrl) {
        fetch(jsonUrl)
            .then(response => response.json())
            .then(data => {
                searchData = data;
                console.log('検索データ読み込み完了:', searchData.length, '件');
            })
            .catch(error => {
                console.error('検索データの読み込みエラー:', error);
            });
    }
    
    // 検索実行関数
    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResultTitle.textContent = '';
            searchResultList.innerHTML = '';
            return;
        }
        
        const results = searchData.filter(item => {
            const searchText = (item.title + ' ' + item.content).toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        // 結果を表示
        searchResultTitle.textContent = results.length + '件の結果';
        searchResultList.innerHTML = '';
        
        results.slice(0, 20).forEach(item => {
            const article = document.createElement('article');
            article.className = 'article-list--compact';
            article.innerHTML = `
                <h3><a href="${item.permalink}">${item.title}</a></h3>
                <p>${item.content.substring(0, 150)}...</p>
            `;
            searchResultList.appendChild(article);
        });
    }
    
    // 入力イベント
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        performSearch(query);
    });
    
    // フォーム送信を防ぐ
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        performSearch(query);
    });
    
    // デバッグ: 入力フィールドの状態を確認
    console.log('検索入力フィールド:', searchInput);
    console.log('検索フォーム:', searchForm);
    
    // URLパラメータから検索クエリを取得
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    if (keyword) {
        searchInput.value = keyword;
        performSearch(keyword);
    }
});