const fs = require('fs');

let html = fs.readFileSync('chuc-nang-nhiem-vu.html', 'utf8');

const commentsHtml = `
            <!-- ===== COMMENTS SECTION ===== -->
            <div class="comments-section" id="commentsSection">
                <div class="comments-header">
                    <h3>Bình luận</h3>
                    <div class="comments-sort">
                        <select id="commentsSort">
                            <option value="likes">Tiêu biểu (nhiều like nhất)</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>
                </div>
                
                <div class="comments-input-area" id="commentsInputArea" style="display:none;">
                    <textarea id="commentInput" placeholder="Nhập bình luận của bạn..." rows="3"></textarea>
                    <div style="text-align: right; margin-top: 10px;">
                        <button id="postCommentBtn" class="post-comment-btn">Gửi bình luận</button>
                    </div>
                </div>
                <div class="comments-login-prompt" id="commentsLoginPrompt">
                    Vui lòng <a href="#" id="promptLoginBtn">đăng nhập</a> hoặc <a href="#" id="promptRegisterBtn">đăng ký</a> để có thể bình luận.
                </div>
                
                <div class="comments-list" id="commentsList">
                    <!-- Comments render here -->
                </div>
            </div>
`;

if (!html.includes('id="commentsSection"')) {
    html = html.replace('            </div>\n        </div>\n    </section>', '            </div>\n' + commentsHtml + '\n        </div>\n    </section>');
}

if (!html.includes('binh-luan.js')) {
    html = html.replace('<script src="xac-thuc.js"></script>', '<script src="binh-luan.js"></script>\n<script src="xac-thuc.js"></script>');
}

fs.writeFileSync('chuc-nang-nhiem-vu.html', html);
console.log("Patched chuc-nang-nhiem-vu.html");
