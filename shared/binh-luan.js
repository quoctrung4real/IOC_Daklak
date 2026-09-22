document.addEventListener('DOMContentLoaded', () => {
    const PAGE_ID = document.body.getAttribute('data-page-id') || 'default-page';

    const commentsSort = document.getElementById('commentsSort');
    const commentsInputArea = document.getElementById('commentsInputArea');
    const commentsLoginPrompt = document.getElementById('commentsLoginPrompt');
    const commentInput = document.getElementById('commentInput');
    const postCommentBtn = document.getElementById('postCommentBtn');
    const commentsList = document.getElementById('commentsList');

    const promptLoginBtn = document.getElementById('promptLoginBtn');
    const promptRegisterBtn = document.getElementById('promptRegisterBtn');

    let allComments = [];

    // =========================================================
    // API BASE
    // =========================================================

    const API_BASE =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === ''
            ? `http://${window.location.hostname || 'localhost'}:5100`
            : 'https://ioc-daklak.onrender.com';


    // =========================================================
    // AUTH
    // =========================================================

    function getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    function getTokenType() {
        return localStorage.getItem('tokenType') || 'Bearer';
    }

    function getAuthHeaders(includeJson = false) {
        const token = getAccessToken();

        const headers = {};

        if (includeJson) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `${getTokenType()} ${token}`;
        }

        return headers;
    }

    function isLoggedIn() {
        const currentUser = localStorage.getItem('currentUser');
        const accessToken = getAccessToken();

        return !!currentUser && !!accessToken;
    }


    // =========================================================
    // CHECK LOGIN STATE
    // =========================================================

    function checkLoginState() {
        if (isLoggedIn()) {
            if (commentsInputArea) {
                commentsInputArea.style.display = 'block';
            }

            if (commentsLoginPrompt) {
                commentsLoginPrompt.style.display = 'none';
            }
        } else {
            if (commentsInputArea) {
                commentsInputArea.style.display = 'none';
            }

            if (commentsLoginPrompt) {
                commentsLoginPrompt.style.display = 'block';
            }
        }
    }

    window.addEventListener('userLoginStateChanged', checkLoginState);

    checkLoginState();


    // =========================================================
    // LOGIN / REGISTER PROMPT
    // =========================================================

    if (promptLoginBtn) {
        promptLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const userBtn = document.getElementById('userBtn');
            const tabLogin = document.getElementById('tabLogin');

            if (userBtn) {
                userBtn.click();
            }

            if (tabLogin) {
                tabLogin.click();
            }
        });
    }

    if (promptRegisterBtn) {
        promptRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const userBtn = document.getElementById('userBtn');
            const tabRegister = document.getElementById('tabRegister');

            if (userBtn) {
                userBtn.click();
            }

            if (tabRegister) {
                tabRegister.click();
            }
        });
    }


    // =========================================================
    // LOAD COMMENTS
    // =========================================================

    async function fetchComments() {
        try {
            const url =
                `${API_BASE}/api/binh-luan` +
                `?pageId=${encodeURIComponent(PAGE_ID)}` +
                `&t=${new Date().getTime()}`;

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            allComments = await res.json();

            if (!Array.isArray(allComments)) {
                allComments = [];
            }

            renderComments();

        } catch (err) {
            console.error('Lỗi khi tải bình luận:', err);

            if (commentsList) {
                commentsList.innerHTML =
                    '<p class="no-comments">Không thể tải bình luận.</p>';
            }
        }
    }


    // =========================================================
    // RENDER COMMENTS
    // =========================================================

    function renderComments() {
        if (!commentsList) {
            return;
        }

        const sortMode = commentsSort ? commentsSort.value : 'newest';

        let sorted = [...allComments];

        if (sortMode === 'likes') {
            sorted.sort((a, b) => (b.Likes || 0) - (a.Likes || 0));

        } else if (sortMode === 'newest') {
            sorted.sort(
                (a, b) =>
                    new Date(b.CreatedAt) - new Date(a.CreatedAt)
            );

        } else if (sortMode === 'oldest') {
            sorted.sort(
                (a, b) =>
                    new Date(a.CreatedAt) - new Date(b.CreatedAt)
            );
        }

        commentsList.innerHTML = '';

        if (sorted.length === 0) {
            commentsList.innerHTML =
                '<p class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';

            return;
        }

        const currentUser = localStorage.getItem('currentUser');

        sorted.forEach(c => {

            const isOwnComment =
                currentUser &&
                c.Username === currentUser;

            const deleteBtnHtml = isOwnComment
                ? `
                    <button
                        class="delete-comment-btn"
                        data-id="${c.Id}"
                        style="
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            color: #dc2626;
                            border: none;
                            background: transparent;
                            cursor: pointer;
                            font-size: 14px;
                        "
                        title="Xoá bình luận"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `
                : '';

            const div = document.createElement('div');

            div.className = 'comment-item';


            // =====================================================
            // AVATAR
            // =====================================================

            const avatarHtml = c.AvatarUrl
                ? `
                    <img
                        src="${API_BASE}${c.AvatarUrl}"
                        alt="${c.Username || 'User'}"
                        style="
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            object-fit: cover;
                        "
                    >
                `
                : `
                    <i class="fa-solid fa-user"></i>
                `;


            // =====================================================
            // LIKE / DISLIKE STATE
            // =====================================================

            const isLiked =
                currentUser &&
                Array.isArray(c.LikedBy) &&
                c.LikedBy.includes(currentUser);

            const isDisliked =
                currentUser &&
                Array.isArray(c.DislikedBy) &&
                c.DislikedBy.includes(currentUser);

            const likeStyle =
                isLiked
                    ? 'color: #1a56db; font-weight: bold;'
                    : '';

            const likeIcon =
                isLiked
                    ? 'fa-solid'
                    : 'fa-regular';

            const dislikeStyle =
                isDisliked
                    ? 'margin-left: 10px; color: #1a56db; font-weight: bold;'
                    : 'margin-left: 10px;';

            const dislikeIcon =
                isDisliked
                    ? 'fa-solid'
                    : 'fa-regular';


            // =====================================================
            // COMMENT HTML
            // =====================================================

            div.innerHTML = `
                <div class="comment-avatar">
                    ${avatarHtml}
                </div>

                <div
                    class="comment-content-box"
                    style="position: relative;"
                >
                    ${deleteBtnHtml}

                    <div class="comment-meta">
                        <span class="comment-author">
                            ${c.Username || ''}
                        </span>

                        <span class="comment-date">
                            ${c.CreatedAt || ''}
                        </span>
                    </div>

                    <div class="comment-text">
                        ${(c.Content || '').replace(/\n/g, '<br>')}
                    </div>

                    <div class="comment-actions">

                        <button
                            class="like-btn"
                            data-id="${c.Id}"
                            style="${likeStyle}"
                        >
                            <i class="${likeIcon} fa-thumbs-up"></i>
                            Hữu ích
                            (
                            <span class="like-count">
                                ${c.Likes || 0}
                            </span>
                            )
                        </button>

                        <button
                            class="dislike-btn"
                            data-id="${c.Id}"
                            style="${dislikeStyle}"
                        >
                            <i class="${dislikeIcon} fa-thumbs-down"></i>
                            Không hữu ích
                            (
                            <span class="dislike-count">
                                ${c.Dislikes || 0}
                            </span>
                            )
                        </button>

                    </div>
                </div>
            `;

            commentsList.appendChild(div);
        });


        // =========================================================
        // DISLIKE
        // =========================================================

        document
            .querySelectorAll('.dislike-btn')
            .forEach(btn => {

                btn.addEventListener('click', async (e) => {

                    if (!isLoggedIn()) {
                        alert(
                            'Vui lòng đăng nhập để thực hiện chức năng này.'
                        );
                        return;
                    }

                    const token = getAccessToken();

                    if (!token) {
                        alert(
                            'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
                        );
                        return;
                    }

                    const id =
                        e.currentTarget.getAttribute('data-id');

                    try {

                        const res = await fetch(
                            `${API_BASE}/api/binh-luan/${encodeURIComponent(id)}/dislike`,
                            {
                                method: 'POST',
                                headers: getAuthHeaders()
                            }
                        );


                        // JWT hết hạn / không hợp lệ
                        if (res.status === 401) {
                            alert(
                                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                            );
                            return;
                        }


                        const data = await res.json();


                        if (data.success) {
                            await fetchComments();

                        } else {
                            alert(
                                data.message ||
                                'Không thể thực hiện thao tác.'
                            );
                        }

                    } catch (err) {

                        console.error(
                            'Lỗi khi dislike bình luận:',
                            err
                        );

                    }

                });

            });


        // =========================================================
        // LIKE
        // =========================================================

        document
            .querySelectorAll('.like-btn')
            .forEach(btn => {

                btn.addEventListener('click', async (e) => {

                    if (!isLoggedIn()) {
                        alert(
                            'Vui lòng đăng nhập để thực hiện chức năng này.'
                        );
                        return;
                    }

                    const token = getAccessToken();

                    if (!token) {
                        alert(
                            'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
                        );
                        return;
                    }

                    const id =
                        e.currentTarget.getAttribute('data-id');

                    try {

                        const res = await fetch(
                            `${API_BASE}/api/binh-luan/${encodeURIComponent(id)}/like`,
                            {
                                method: 'POST',
                                headers: getAuthHeaders()
                            }
                        );


                        // JWT hết hạn / không hợp lệ
                        if (res.status === 401) {
                            alert(
                                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                            );
                            return;
                        }


                        const data = await res.json();


                        if (data.success) {
                            await fetchComments();

                        } else {
                            alert(
                                data.message ||
                                'Không thể thực hiện thao tác.'
                            );
                        }

                    } catch (err) {

                        console.error(
                            'Lỗi khi like bình luận:',
                            err
                        );

                    }

                });

            });


        // =========================================================
        // DELETE COMMENT
        // =========================================================

        document
            .querySelectorAll('.delete-comment-btn')
            .forEach(btn => {

                btn.addEventListener('click', async (e) => {

                    if (!isLoggedIn()) {
                        alert(
                            'Vui lòng đăng nhập để thực hiện chức năng này.'
                        );
                        return;
                    }

                    if (
                        !confirm(
                            'Bạn có chắc chắn muốn xoá bình luận này?'
                        )
                    ) {
                        return;
                    }

                    const id =
                        e.currentTarget.getAttribute('data-id');

                    try {

                        const res = await fetch(
                            `${API_BASE}/api/binh-luan/${encodeURIComponent(id)}`,
                            {
                                method: 'DELETE',
                                headers: getAuthHeaders()
                            }
                        );


                        if (res.status === 401) {
                            alert(
                                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                            );
                            return;
                        }


                        const data = await res.json();


                        if (data.success) {

                            await fetchComments();

                        } else {

                            alert(
                                data.message ||
                                'Có lỗi xảy ra.'
                            );

                        }

                    } catch (err) {

                        console.error(
                            'Lỗi khi xoá bình luận:',
                            err
                        );

                        alert(
                            'Lỗi khi xoá bình luận.'
                        );

                    }

                });

            });

    }


    // =========================================================
    // SORT
    // =========================================================

    if (commentsSort) {
        commentsSort.addEventListener(
            'change',
            renderComments
        );
    }


    // =========================================================
    // ENTER TO SEND COMMENT
    // =========================================================

    if (commentInput && postCommentBtn) {

        commentInput.addEventListener(
            'keydown',
            (e) => {

                if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                ) {

                    e.preventDefault();

                    postCommentBtn.click();
                }

            }
        );

    }


    // =========================================================
    // POST COMMENT
    // =========================================================

    if (postCommentBtn && commentInput) {

        postCommentBtn.addEventListener(
            'click',
            async () => {

                const text =
                    commentInput.value.trim();

                if (!text) {
                    return;
                }


                if (!isLoggedIn()) {

                    alert(
                        'Vui lòng đăng nhập để bình luận.'
                    );

                    return;
                }


                const token =
                    getAccessToken();

                if (!token) {

                    alert(
                        'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
                    );

                    return;
                }


                try {

                    const res = await fetch(
                        `${API_BASE}/api/binh-luan`,
                        {
                            method: 'POST',

                            headers:
                                getAuthHeaders(true),

                            body: JSON.stringify({
                                PageId: PAGE_ID,
                                Content: text
                            })
                        }
                    );


                    if (res.status === 401) {

                        alert(
                            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                        );

                        return;
                    }


                    const data =
                        await res.json();


                    if (data.success) {

                        commentInput.value = '';


                        // =================================================
                        // Backend trả về camelCase
                        // Frontend sử dụng PascalCase
                        // =================================================

                        if (data.comment) {

                            const newComment = {

                                Id:
                                    data.comment.id,

                                PageId:
                                    data.comment.pageId,

                                Username:
                                    data.comment.username,

                                Content:
                                    data.comment.content,

                                Likes:
                                    data.comment.likes || 0,

                                Dislikes:
                                    data.comment.dislikes || 0,

                                CreatedAt:
                                    data.comment.createdAt,

                                AvatarUrl:
                                    data.comment.avatarUrl || "",

                                LikedBy:
                                    data.comment.likedBy || [],

                                DislikedBy:
                                    data.comment.dislikedBy || []

                            };


                            allComments.push(
                                newComment
                            );

                            renderComments();

                        } else {

                            await fetchComments();

                        }

                    } else {

                        alert(
                            data.message ||
                            'Không thể đăng bình luận.'
                        );

                    }

                } catch (err) {

                    console.error(
                        'Lỗi khi đăng bình luận:',
                        err
                    );

                    alert(
                        'Lỗi khi đăng bình luận.'
                    );

                }

            }
        );

    }


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    fetchComments();

});